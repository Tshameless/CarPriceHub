"""
批量更新爬虫 - 定期更新现有车型价格
"""
import scrapy
import psycopg2
from datetime import datetime, timedelta
from carprice_crawler.items import CarPriceItem
from carprice_crawler.spiders.base_spider import BaseCarSpider


class BatchUpdateSpider(BaseCarSpider):
    """批量更新爬虫 - 更新数据库中的车型价格"""
    
    name = 'batch_update'
    
    def __init__(self, days=7, *args, **kwargs):
        """
        Args:
            days: 更新多少天前的数据,默认7天
        """
        super(BatchUpdateSpider, self).__init__(*args, **kwargs)
        self.days = int(days)
        self.database_url = None
    
    def start_requests(self):
        """从数据库读取需要更新的车型"""
        from scrapy.utils.project import get_project_settings
        settings = get_project_settings()
        self.database_url = settings.get('DATABASE_URL')
        
        try:
            conn = psycopg2.connect(self.database_url)
            cur = conn.cursor()
            
            # 查询需要更新的车型 (updated_at 超过指定天数)
            query = """
                SELECT id, brand, model, year, source_url, updated_at
                FROM cars
                WHERE updated_at < %s
                ORDER BY updated_at ASC
                LIMIT 100
            """
            
            cutoff_date = datetime.now() - timedelta(days=self.days)
            cur.execute(query, (cutoff_date,))
            
            cars = cur.fetchall()
            self.logger.info(f"Found {len(cars)} cars to update")
            
            cur.close()
            conn.close()
            
            for car in cars:
                car_id, brand, model, year, source_url, updated_at = car
                
                if source_url and source_url.startswith('http'):
                    yield scrapy.Request(
                        url=source_url,
                        callback=self.parse_car_update,
                        meta={
                            'car_id': car_id,
                            'brand': brand,
                            'model': model,
                            'year': year
                        },
                        errback=self.errback_handler,
                        dont_filter=True
                    )
                else:
                    self.logger.warning(f"Invalid source_url for car {car_id}: {source_url}")
        
        except Exception as e:
            self.logger.error(f"Database error: {e}")
            raise
    
    def parse_car_update(self, response):
        """解析更新的价格信息"""
        item = CarPriceItem()
        
        item['brand'] = response.meta.get('brand')
        item['model'] = response.meta.get('model')
        item['year'] = response.meta.get('year')
        item['source_url'] = response.url
        item['car_id'] = response.meta.get('car_id')
        
        # 根据来源网站选择不同的解析逻辑
        if 'autohome.com.cn' in response.url:
            item = self.parse_autohome_price(response, item)
        elif 'dongchedi.com' in response.url:
            item = self.parse_dongchedi_price(response, item)
        elif 'yiche.com' in response.url:
            item = self.parse_yiche_price(response, item)
        else:
            self.logger.warning(f"Unknown source: {response.url}")
            return
        
        yield item
    
    def parse_autohome_price(self, response, item):
        """解析汽车之家价格更新"""
        official_price = response.css('span.font-22::text').get()
        if not official_price:
            official_price = response.css('div.price span::text').get()
        item['official_price'] = self.parse_price(official_price)
        
        dealer_price = response.css('td.price::text').get()
        item['dealer_price'] = self.parse_price(dealer_price)
        
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        
        return item
    
    def parse_dongchedi_price(self, response, item):
        """解析懂车帝价格更新"""
        price_text = response.css('span.price::text').get()
        item['official_price'] = self.parse_price(price_text)
        
        dealer_price = response.css('span.dealer-price::text').get()
        item['dealer_price'] = self.parse_price(dealer_price)
        
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        
        return item
    
    def parse_yiche_price(self, response, item):
        """解析易车价格更新"""
        official_price = response.css('span.guide-price::text').get()
        item['official_price'] = self.parse_price(official_price)
        
        dealer_price = response.css('span.dealer-price::text').get()
        item['dealer_price'] = self.parse_price(dealer_price)
        
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        
        return item
    
    def errback_handler(self, failure):
        """错误处理"""
        self.logger.error(repr(failure))
