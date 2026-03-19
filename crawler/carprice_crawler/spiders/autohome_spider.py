"""
汽车之家爬虫 - 抓取车型价格信息
网址: https://www.autohome.com.cn
"""
import scrapy
from urllib.parse import urljoin, quote
from carprice_crawler.items import CarPriceItem
from carprice_crawler.spiders.base_spider import BaseCarSpider


class AutohomeSpider(BaseCarSpider):
    """汽车之家爬虫"""
    
    name = 'autohome'
    allowed_domains = ['autohome.com.cn', 'car.autohome.com.cn']
    
    # 起始URL - 主流品牌列表
    start_urls = [
        'https://www.autohome.com.cn/car/',  # 车型库首页
        'https://www.autohome.com.cn/grade/carhtml/%5BA-Z%5D.html',  # 按首字母分类
    ]
    
    def __init__(self, brand=None, *args, **kwargs):
        super(AutohomeSpider, self).__init__(*args, **kwargs)
        self.brand = brand  # 可以指定品牌爬取
    
    def parse(self, response):
        """
        解析品牌列表页面,提取品牌链接
        """
        # 方式1: 从车型库首页提取品牌
        if 'car/' in response.url:
            # 提取热门品牌
            brands = response.css('div.cartab-title a::attr(href)').getall()
            for brand_url in brands:
                full_url = urljoin(response.url, brand_url)
                yield scrapy.Request(
                    url=full_url,
                    callback=self.parse_brand_page,
                    errback=self.errback_handler
                )
        
        # 方式2: 从字母分类页面提取
        else:
            # 提取品牌链接
            brand_links = response.css('dl dt a::attr(href)').getall()
            for link in brand_links:
                full_url = urljoin(response.url, link)
                yield scrapy.Request(
                    url=full_url,
                    callback=self.parse_brand_page,
                    errback=self.errback_handler
                )
    
    def parse_brand_page(self, response):
        """
        解析品牌页面,提取车型列表
        """
        # 提取品牌名称
        brand_name = response.css('div.cartab-title a::text').get()
        if not brand_name:
            brand_name = response.css('h1::text').get()
        brand_name = brand_name.strip() if brand_name else 'Unknown'
        
        # 如果指定了品牌,只爬取该品牌
        if self.brand and brand_name != self.brand:
            self.logger.info(f"Skipping brand: {brand_name}")
            return
        
        self.logger.info(f"Processing brand: {brand_name}")
        
        # 提取车型列表 (不同页面结构)
        car_items = response.css('li.interval01-list')
        if not car_items:
            car_items = response.css('div.list-cont-main dl')
        
        for car_item in car_items:
            # 提取车型基本信息
            car_name = car_item.css('a::text').get()
            car_link = car_item.css('a::attr(href)').get()
            
            if not car_name or not car_link:
                continue
            
            full_url = urljoin(response.url, car_link)
            
            # 发送请求到车型详情页
            yield scrapy.Request(
                url=full_url,
                callback=self.parse_car_detail,
                meta={'brand': brand_name, 'model': car_name.strip()},
                errback=self.errback_handler
            )
    
    def parse_car_detail(self, response):
        """
        解析车型详情页面,提取价格和配置信息
        """
        item = CarPriceItem()
        
        # 基本信息从 meta 获取
        item['brand'] = response.meta.get('brand', 'Unknown')
        item['model'] = response.meta.get('model', 'Unknown')
        item['source_url'] = response.url
        
        # 提取年份
        year_text = response.css('div.cartab-title span::text').get()
        if year_text:
            try:
                item['year'] = int(year_text.strip())
            except:
                item['year'] = 2024
        else:
            item['year'] = 2024
        
        # 提取官方指导价
        official_price = response.css('span.font-22::text').get()
        if not official_price:
            official_price = response.css('div.price span::text').get()
        item['official_price'] = self.parse_price(official_price)
        
        # 提取经销商价格 (从价格配置表)
        dealer_price_range = response.css('td.price::text').get()
        item['dealer_price'] = self.parse_price(dealer_price_range)
        
        # 计算直接优惠
        if item['official_price'] and item['dealer_price']:
            item['direct_discount'] = item['official_price'] - item['dealer_price']
        else:
            item['direct_discount'] = None
        
        # 提取能源类型
        energy_text = response.css('div.car-infor li:nth-child(1)::text').get()
        if energy_text:
            if '纯电' in energy_text:
                item['energy_type'] = '纯电'
            elif '混动' in energy_text or '插电' in energy_text:
                item['energy_type'] = '混动'
            else:
                item['energy_type'] = '燃油'
        else:
            # 从车型名称推断
            model_name = item['model']
            if 'EV' in model_name or '纯电' in model_name:
                item['energy_type'] = '纯电'
            elif 'DM' in model_name or '混动' in model_name or '插混' in model_name:
                item['energy_type'] = '混动'
            else:
                item['energy_type'] = '燃油'
        
        # 提取车身类型
        body_type = response.css('div.car-infor li:nth-child(2)::text').get()
        if body_type:
            body_type = body_type.strip()
            if 'SUV' in body_type:
                item['body_type'] = 'SUV'
            elif 'MPV' in body_type:
                item['body_type'] = 'MPV'
            else:
                item['body_type'] = '轿车'
        else:
            item['body_type'] = '轿车'
        
        # 提取续航里程 (新能源车)
        if item['energy_type'] in ['纯电', '混动']:
            range_text = response.css('div.car-infor li:contains("续航")::text').get()
            if range_text:
                try:
                    item['range_km'] = int(range_text.replace('km', '').replace('KM', '').strip())
                except:
                    item['range_km'] = None
        
        # 提取油耗 (燃油车/混动)
        if item['energy_type'] in ['燃油', '混动']:
            fuel_text = response.css('div.car-infor li:contains("油耗")::text').get()
            if fuel_text:
                try:
                    item['fuel_consumption'] = float(fuel_text.replace('L/100km', '').strip())
                except:
                    item['fuel_consumption'] = None
        
        # 金融政策信息 (从经销商页面或配置页面获取)
        # 这里先设置为默认值,后续可以爬取经销商页面补充
        item['down_payment_percent'] = 20.0  # 默认首付20%
        item['annual_interest_rate'] = 3.0   # 默认年利率3%
        item['loan_months'] = 36             # 默认36期
        item['loan_subsidy'] = None
        item['replacement_subsidy'] = None
        item['special_offer'] = None
        item['offer_expiry'] = None
        
        # 其他字段
        item['battery_capacity'] = None
        
        yield item
    
    def errback_handler(self, failure):
        """错误处理"""
        self.logger.error(repr(failure))
