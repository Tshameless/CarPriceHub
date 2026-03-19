"""
懂车帝爬虫 - 抓取车型价格信息
网址: https://www.dongchedi.com
"""
import scrapy
import json
from urllib.parse import urljoin
from carprice_crawler.items import CarPriceItem
from carprice_crawler.spiders.base_spider import BaseCarSpider


class DongchediSpider(BaseCarSpider):
    """懂车帝爬虫"""
    
    name = 'dongchedi'
    allowed_domains = ['dongchedi.com']
    
    # 起始URL - 车型库
    start_urls = [
        'https://www.dongchedi.com/car_library',  # 车型库
        'https://www.dongchedi.com/salesrank',    # 销量排行
    ]
    
    def __init__(self, brand=None, *args, **kwargs):
        super(DongchediSpider, self).__init__(*args, **kwargs)
        self.brand = brand
    
    def parse(self, response):
        """
        解析入口页面
        """
        # 提取热门车型或品牌列表
        # 懂车帝使用动态加载,这里提供基本框架
        car_links = response.css('a.car-item::attr(href)').getall()
        
        if not car_links:
            # 尝试其他选择器
            car_links = response.css('div.car-card a::attr(href)').getall()
        
        for link in car_links:
            full_url = urljoin(response.url, link)
            yield scrapy.Request(
                url=full_url,
                callback=self.parse_car_detail,
                errback=self.errback_handler
            )
    
    def parse_car_detail(self, response):
        """
        解析车型详情页
        """
        item = CarPriceItem()
        
        # 提取基本信息
        item['brand'] = response.css('div.brand-name::text').get()
        item['model'] = response.css('h1.model-name::text').get()
        item['source_url'] = response.url
        
        # 提取价格
        price_text = response.css('span.price::text').get()
        item['official_price'] = self.parse_price(price_text)
        
        # 经销商价格
        dealer_price = response.css('span.dealer-price::text').get()
        item['dealer_price'] = self.parse_price(dealer_price)
        
        # 计算优惠
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        else:
            item['direct_discount'] = None
        
        # 提取配置信息
        config_items = response.css('div.config-item')
        for config in config_items:
            label = config.css('span.label::text').get()
            value = config.css('span.value::text').get()
            
            if label and value:
                label = label.strip()
                value = value.strip()
                
                if '能源' in label:
                    item['energy_type'] = value
                elif '车身' in label:
                    item['body_type'] = value
                elif '续航' in label:
                    try:
                        item['range_km'] = int(value.replace('km', '').strip())
                    except:
                        pass
        
        # 默认值
        item['year'] = 2024
        item['down_payment_percent'] = 20.0
        item['annual_interest_rate'] = 3.0
        item['loan_months'] = 36
        item['battery_capacity'] = None
        item['fuel_consumption'] = None
        item['loan_subsidy'] = None
        item['replacement_subsidy'] = None
        item['special_offer'] = None
        item['offer_expiry'] = None
        
        yield item
    
    def errback_handler(self, failure):
        """错误处理"""
        self.logger.error(repr(failure))


class DongchediAPISpider(BaseCarSpider):
    """懂车帝 API 爬虫 (处理动态加载)"""
    
    name = 'dongchedi_api'
    allowed_domains = ['dongchedi.com']
    
    # API 端点示例 (需要根据实际API调整)
    api_url = 'https://m.dongchedi.com/motor/pc/car/series/car_list'
    
    def start_requests(self):
        """构造API请求"""
        # 这里提供API爬取的示例框架
        # 实际使用时需要分析懂车帝的API接口
        
        params = {
            'series_id': '12345',  # 车系ID
            'city_name': '北京'
        }
        
        yield scrapy.Request(
            url=self.api_url,
            callback=self.parse_api_response,
            errback=self.errback_handler
        )
    
    def parse_api_response(self, response):
        """解析API响应"""
        try:
            data = json.loads(response.text)
            
            # 根据实际API结构解析
            if 'data' in data:
                for car_data in data['data']:
                    item = CarPriceItem()
                    
                    item['brand'] = car_data.get('brand_name')
                    item['model'] = car_data.get('model_name')
                    item['official_price'] = car_data.get('price')
                    item['energy_type'] = car_data.get('energy_type')
                    item['body_type'] = car_data.get('body_type')
                    item['source_url'] = response.url
                    
                    yield item
        except Exception as e:
            self.logger.error(f"Failed to parse API response: {e}")
    
    def errback_handler(self, failure):
        """错误处理"""
        self.logger.error(repr(failure))
