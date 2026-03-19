"""
Base spider with common functionality for all car price spiders.
"""
import scrapy
from urllib.parse import urljoin


class BaseCarSpider(scrapy.Spider):
    """基础爬虫类,提供通用功能"""
    
    custom_settings = {
        'CONCURRENT_REQUESTS': 4,
        'DOWNLOAD_DELAY': 2,
    }
    
    def parse_price(self, price_text):
        """
        解析价格文本
        支持格式: "12.98万", "12.98-15.98万", "12.98 万元"
        """
        if not price_text:
            return None
        
        # 移除空格和单位
        price_text = price_text.strip().replace(' ', '').replace('万元', '').replace('万', '')
        
        # 处理价格区间 (取平均值)
        if '-' in price_text:
            try:
                parts = price_text.split('-')
                return (float(parts[0]) + float(parts[1])) / 2
            except:
                return None
        
        try:
            return float(price_text)
        except ValueError:
            return None
    
    def parse_percent(self, percent_text):
        """
        解析百分比文本
        支持格式: "20%", "20 %", "0.2"
        """
        if not percent_text:
            return None
        
        percent_text = str(percent_text).strip().replace(' ', '').replace('%', '')
        
        try:
            value = float(percent_text)
            # 如果值大于1,认为是百分比形式 (如 20),否则是小数形式 (如 0.2)
            if value > 1:
                return value
            else:
                return value * 100
        except ValueError:
            return None
    
    def extract_with_css(self, response, selector, default=''):
        """使用 CSS 选择器提取文本"""
        try:
            result = response.css(selector).get()
            return result.strip() if result else default
        except:
            return default
    
    def extract_with_xpath(self, response, selector, default=''):
        """使用 XPath 提取文本"""
        try:
            result = response.xpath(selector).get()
            return result.strip() if result else default
        except:
            return default
    
    def safe_extract_list(self, response, selector):
        """安全提取列表,避免空值"""
        try:
            return [item.strip() for item in response.css(selector).getall() if item.strip()]
        except:
            return []
