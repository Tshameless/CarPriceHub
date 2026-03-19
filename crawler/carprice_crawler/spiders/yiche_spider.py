"""
易车网爬虫 - 抓取车型价格信息
网址: https://www.yiche.com
"""
import scrapy
from urllib.parse import urljoin
from carprice_crawler.items import CarPriceItem
from carprice_crawler.spiders.base_spider import BaseCarSpider


class YicheSpider(BaseCarSpider):
    """易车网爬虫"""
    
    name = 'yiche'
    allowed_domains = ['yiche.com', 'car.yiche.com']
    
    # 起始URL
    start_urls = [
        'https://car.yiche.com/',  # 车型库首页
        'https://price.yiche.com/',  # 价格首页
    ]
    
    def __init__(self, brand=None, *args, **kwargs):
        super(YicheSpider, self).__init__(*args, **kwargs)
        self.brand = brand
    
    def parse(self, response):
        """
        解析品牌列表页面
        """
        # 提取品牌链接
        brand_links = response.css('div.brand-list a::attr(href)').getall()
        
        if not brand_links:
            brand_links = response.css('li.brand-item a::attr(href)').getall()
        
        for link in brand_links:
            full_url = urljoin(response.url, link)
            yield scrapy.Request(
                url=full_url,
                callback=self.parse_brand_page,
                errback=self.errback_handler
            )
    
    def parse_brand_page(self, response):
        """
        解析品牌页面
        """
        # 提取品牌名称
        brand_name = response.css('h1.brand-name::text').get()
        if not brand_name:
            brand_name = response.css('div.brand-title::text').get()
        brand_name = brand_name.strip() if brand_name else 'Unknown'
        
        # 如果指定了品牌
        if self.brand and brand_name != self.brand:
            self.logger.info(f"Skipping brand: {brand_name}")
            return
        
        self.logger.info(f"Processing brand: {brand_name}")
        
        # 提取车型列表
        car_items = response.css('div.car-item')
        if not car_items:
            car_items = response.css('li.car-list-item')
        
        for car_item in car_items:
            car_name = car_item.css('a::attr(title)').get()
            if not car_name:
                car_name = car_item.css('a::text').get()
            
            car_link = car_item.css('a::attr(href)').get()
            
            if car_name and car_link:
                full_url = urljoin(response.url, car_link)
                yield scrapy.Request(
                    url=full_url,
                    callback=self.parse_car_detail,
                    meta={'brand': brand_name, 'model': car_name.strip()},
                    errback=self.errback_handler
                )
    
    def parse_car_detail(self, response):
        """
        解析车型详情页
        """
        item = CarPriceItem()
        
        item['brand'] = response.meta.get('brand', 'Unknown')
        item['model'] = response.meta.get('model', 'Unknown')
        item['source_url'] = response.url
        
        # 提取价格信息
        # 官方指导价
        official_price = response.css('span.guide-price::text').get()
        if not official_price:
            official_price = response.css('div.price-item span::text').get()
        item['official_price'] = self.parse_price(official_price)
        
        # 经销商价格
        dealer_price = response.css('span.dealer-price::text').get()
        if not dealer_price:
            dealer_price = response.css('div.discount-price span::text').get()
        item['dealer_price'] = self.parse_price(dealer_price)
        
        # 计算优惠
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        else:
            item['direct_discount'] = None
        
        # 提取年份
        year_text = response.css('span.model-year::text').get()
        if year_text:
            try:
                item['year'] = int(year_text.replace('款', '').strip())
            except:
                item['year'] = 2024
        else:
            item['year'] = 2024
        
        # 提取配置信息
        specs = response.css('div.car-spec-item')
        for spec in specs:
            label = spec.css('span.label::text').get()
            value = spec.css('span.value::text').get()
            
            if label and value:
                label = label.strip()
                value = value.strip()
                
                if '能源' in label or '动力' in label:
                    if '纯电' in value:
                        item['energy_type'] = '纯电'
                    elif '混动' in value or '插电' in value:
                        item['energy_type'] = '混动'
                    else:
                        item['energy_type'] = '燃油'
                
                elif '级别' in label:
                    if 'SUV' in value:
                        item['body_type'] = 'SUV'
                    elif 'MPV' in value:
                        item['body_type'] = 'MPV'
                    else:
                        item['body_type'] = '轿车'
                
                elif '续航' in label:
                    try:
                        item['range_km'] = int(value.replace('km', '').strip())
                    except:
                        pass
                
                elif '油耗' in label:
                    try:
                        item['fuel_consumption'] = float(value.replace('L', '').strip())
                    except:
                        pass
        
        # 金融政策
        loan_items = response.css('div.loan-item')
        for loan_item in loan_items:
            loan_label = loan_item.css('span.label::text').get()
            loan_value = loan_item.css('span.value::text').get()
            
            if loan_label and loan_value:
                loan_label = loan_label.strip()
                
                if '首付' in loan_label:
                    item['down_payment_percent'] = self.parse_percent(loan_value)
                elif '利率' in loan_label:
                    item['annual_interest_rate'] = self.parse_percent(loan_value)
                elif '期数' in loan_label:
                    try:
                        item['loan_months'] = int(loan_value.replace('期', '').strip())
                    except:
                        pass
        
        # 置换补贴
        subsidy = response.css('span.replacement-subsidy::text').get()
        if subsidy:
            try:
                item['replacement_subsidy'] = int(subsidy.replace('元', '').replace(',', '').strip())
            except:
                pass
        
        # 设置默认值
        item.setdefault('energy_type', '燃油')
        item.setdefault('body_type', '轿车')
        item.setdefault('down_payment_percent', 20.0)
        item.setdefault('annual_interest_rate', 3.0)
        item.setdefault('loan_months', 36)
        item.setdefault('battery_capacity', None)
        item.setdefault('fuel_consumption', None)
        item.setdefault('loan_subsidy', None)
        item.setdefault('special_offer', None)
        item.setdefault('offer_expiry', None)
        
        yield item
    
    def errback_handler(self, failure):
        """错误处理"""
        self.logger.error(repr(failure))
