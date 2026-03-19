"""
Define item pipelines for storing data.
"""
import json
import psycopg2
from datetime import datetime
from itemadapter import ItemAdapter


class CarPricePipeline:
    """价格数据清洗和验证 Pipeline"""
    
    def process_item(self, item, spider):
        # 清理字符串字段
        for field in ['brand', 'model', 'energy_type', 'body_type']:
            if field in item and item[field]:
                item[field] = item[field].strip()
        
        # 转换价格字段 (字符串 -> 浮点数)
        for price_field in ['official_price', 'dealer_price', 'direct_discount']:
            if price_field in item and item[price_field]:
                try:
                    # 移除可能的单位和空格
                    price_str = str(item[price_field]).replace('万', '').replace('元', '').strip()
                    item[price_field] = float(price_str)
                except (ValueError, AttributeError):
                    spider.logger.warning(f"Invalid {price_field}: {item[price_field]}")
                    item[price_field] = None
        
        # 转换百分比字段
        for percent_field in ['down_payment_percent', 'annual_interest_rate']:
            if percent_field in item and item[percent_field]:
                try:
                    value = str(item[percent_field]).replace('%', '').strip()
                    item[percent_field] = float(value)
                except (ValueError, AttributeError):
                    spider.logger.warning(f"Invalid {percent_field}: {item[percent_field]}")
                    item[percent_field] = None
        
        # 转换整数字段
        for int_field in ['year', 'loan_months']:
            if int_field in item and item[int_field]:
                try:
                    item[int_field] = int(item[int_field])
                except (ValueError, TypeError):
                    spider.logger.warning(f"Invalid {int_field}: {item[int_field]}")
                    item[int_field] = None
        
        # 添加爬取时间
        item['crawl_time'] = datetime.now().isoformat()
        
        return item


class DatabasePipeline:
    """数据库存储 Pipeline"""
    
    def __init__(self, database_url):
        self.database_url = database_url
        self.conn = None
        self.cur = None
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            database_url=crawler.settings.get('DATABASE_URL')
        )
    
    def open_spider(self, spider):
        try:
            self.conn = psycopg2.connect(self.database_url)
            self.cur = self.conn.cursor()
            spider.logger.info("Database connection established")
        except Exception as e:
            spider.logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close_spider(self, spider):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
            spider.logger.info("Database connection closed")
    
    def process_item(self, item, spider):
        try:
            # 检查车型是否已存在
            self.cur.execute(
                "SELECT id FROM cars WHERE brand = %s AND model = %s AND year = %s",
                (item.get('brand'), item.get('model'), item.get('year'))
            )
            existing = self.cur.fetchone()
            
            if existing:
                # 更新现有记录
                car_id = existing[0]
                self.update_car(car_id, item, spider)
            else:
                # 插入新记录
                car_id = self.insert_car(item, spider)
            
            # 记录价格历史
            self.insert_price_history(car_id, item, spider)
            
            self.conn.commit()
            spider.logger.info(f"Saved car: {item.get('brand')} {item.get('model')}")
            
        except Exception as e:
            self.conn.rollback()
            spider.logger.error(f"Failed to save item: {e}")
        
        return item
    
    def insert_car(self, item, spider):
        """插入新车型"""
        sql = """
            INSERT INTO cars (
                brand, model, year, official_price, dealer_price, direct_discount,
                energy_type, body_type, battery_capacity, range_km, fuel_consumption,
                down_payment_percent, annual_interest_rate, loan_months, loan_subsidy,
                replacement_subsidy, special_offer, offer_expiry, source_url, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW()
            ) RETURNING id
        """
        
        self.cur.execute(sql, (
            item.get('brand'),
            item.get('model'),
            item.get('year'),
            item.get('official_price'),
            item.get('dealer_price'),
            item.get('direct_discount'),
            item.get('energy_type'),
            item.get('body_type'),
            item.get('battery_capacity'),
            item.get('range_km'),
            item.get('fuel_consumption'),
            item.get('down_payment_percent'),
            item.get('annual_interest_rate'),
            item.get('loan_months'),
            item.get('loan_subsidy'),
            item.get('replacement_subsidy'),
            item.get('special_offer'),
            item.get('offer_expiry'),
            item.get('source_url')
        ))
        
        return self.cur.fetchone()[0]
    
    def update_car(self, car_id, item, spider):
        """更新现有车型"""
        sql = """
            UPDATE cars SET
                official_price = %s,
                dealer_price = %s,
                direct_discount = %s,
                battery_capacity = %s,
                range_km = %s,
                fuel_consumption = %s,
                down_payment_percent = %s,
                annual_interest_rate = %s,
                loan_months = %s,
                loan_subsidy = %s,
                replacement_subsidy = %s,
                special_offer = %s,
                offer_expiry = %s,
                source_url = %s,
                updated_at = NOW()
            WHERE id = %s
        """
        
        self.cur.execute(sql, (
            item.get('official_price'),
            item.get('dealer_price'),
            item.get('direct_discount'),
            item.get('battery_capacity'),
            item.get('range_km'),
            item.get('fuel_consumption'),
            item.get('down_payment_percent'),
            item.get('annual_interest_rate'),
            item.get('loan_months'),
            item.get('loan_subsidy'),
            item.get('replacement_subsidy'),
            item.get('special_offer'),
            item.get('offer_expiry'),
            item.get('source_url'),
            car_id
        ))
    
    def insert_price_history(self, car_id, item, spider):
        """插入价格历史记录"""
        # 记录官方价历史
        if item.get('official_price'):
            self.cur.execute(
                """
                INSERT INTO price_history (car_id, price, price_type, recorded_at, source)
                VALUES (%s, %s, 'official', NOW(), %s)
                """,
                (car_id, item['official_price'], item.get('source_url', 'crawler'))
            )
        
        # 记录经销商价历史
        if item.get('dealer_price'):
            self.cur.execute(
                """
                INSERT INTO price_history (car_id, price, price_type, recorded_at, source)
                VALUES (%s, %s, 'dealer', NOW(), %s)
                """,
                (car_id, item['dealer_price'], item.get('source_url', 'crawler'))
            )


class JsonExportPipeline:
    """导出到 JSON 文件的 Pipeline"""
    
    def __init__(self):
        self.file = None
        self.items = []
    
    def open_spider(self, spider):
        self.file = open('car_prices.json', 'w', encoding='utf-8')
    
    def close_spider(self, spider):
        json.dump(self.items, self.file, ensure_ascii=False, indent=2)
        self.file.close()
    
    def process_item(self, item, spider):
        self.items.append(dict(item))
        return item
