"""
Define the data structures for car price information.
"""
import scrapy


class CarPriceItem(scrapy.Item):
    """汽车价格信息数据结构"""
    
    # 基本信息
    brand = scrapy.Field()          # 品牌: "比亚迪"
    model = scrapy.Field()          # 车型: "秦PLUS DM-i"
    year = scrapy.Field()           # 年份: 2024
    
    # 价格信息
    official_price = scrapy.Field()     # 官方指导价 (万元)
    dealer_price = scrapy.Field()       # 经销商优惠价 (万元)
    direct_discount = scrapy.Field()    # 直接优惠金额 (万元)
    
    # 能源与车身
    energy_type = scrapy.Field()    # 能源类型: "混动", "纯电", "燃油"
    body_type = scrapy.Field()      # 车身类型: "轿车", "SUV", "MPV"
    
    # 核心配置
    battery_capacity = scrapy.Field()   # 电池容量 (kWh) - 新能源车
    range_km = scrapy.Field()           # 纯电续航 (km) - 新能源车
    fuel_consumption = scrapy.Field()   # 油耗 (L/100km) - 燃油/混动
    
    # 金融政策
    down_payment_percent = scrapy.Field()   # 首付比例 (%)
    annual_interest_rate = scrapy.Field()   # 年利率 (%)
    loan_months = scrapy.Field()            # 贷款期限 (月)
    loan_subsidy = scrapy.Field()           # 贴息金额 (元)
    
    # 置换补贴
    replacement_subsidy = scrapy.Field()  # 置换补贴 (元)
    
    # 优惠活动
    special_offer = scrapy.Field()        # 特殊优惠描述
    offer_expiry = scrapy.Field()         # 优惠截止日期
    
    # 元数据
    source_url = scrapy.Field()          # 数据来源 URL
    crawl_time = scrapy.Field()          # 爬取时间


class PriceHistoryItem(scrapy.Item):
    """价格历史数据结构"""
    
    car_id = scrapy.Field()          # 车型 ID (数据库中)
    price = scrapy.Field()           # 价格 (万元)
    price_type = scrapy.Field()      # 价格类型: "official", "dealer"
    recorded_at = scrapy.Field()     # 记录时间
    source = scrapy.Field()          # 数据来源


class DealerInfoItem(scrapy.Item):
    """经销商信息数据结构"""
    
    name = scrapy.Field()            # 经销商名称
    brand = scrapy.Field()           # 主营品牌
    city = scrapy.Field()            # 所在城市
    address = scrapy.Field()         # 详细地址
    phone = scrapy.Field()           # 联系电话
    rating = scrapy.Field()          # 评分
    source_url = scrapy.Field()      # 数据来源
