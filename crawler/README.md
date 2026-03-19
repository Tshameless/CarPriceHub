# 车价通爬虫模块

汽车价格数据爬虫,基于 Scrapy 框架开发,支持多数据源抓取。

## 📁 目录结构

```
crawler/
├── scrapy.cfg                    # Scrapy 配置文件
├── requirements.txt              # Python 依赖
├── .env.example                  # 环境变量示例
├── run_spider.py                 # 运行脚本
├── carprice_crawler/
│   ├── __init__.py
│   ├── settings.py               # 爬虫设置
│   ├── items.py                  # 数据结构定义
│   ├── middlewares.py            # 中间件
│   ├── pipelines.py              # 数据管道
│   └── spiders/
│       ├── __init__.py
│       ├── base_spider.py        # 基础爬虫类
│       ├── autohome_spider.py    # 汽车之家爬虫
│       ├── dongchedi_spider.py   # 懂车帝爬虫
│       ├── yiche_spider.py       # 易车网爬虫
│       └── batch_spider.py       # 批量更新爬虫
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd crawler
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件,配置数据库连接
# DATABASE_URL=postgresql://postgres:password@localhost:5432/carpricehub
```

### 3. 运行爬虫

#### 方式 1: 使用运行脚本 (推荐)

```bash
# 运行汽车之家爬虫
python run_spider.py autohome

# 运行懂车帝爬虫
python run_spider.py dongchedi

# 运行易车爬虫
python run_spider.py yiche

# 运行所有爬虫
python run_spider.py all

# 指定品牌爬取
python run_spider.py autohome --brand 比亚迪

# 批量更新 (更新7天前的数据)
python run_spider.py batch_update --days 7
```

#### 方式 2: 使用 Scrapy 命令

```bash
cd crawler

# 运行指定爬虫
scrapy crawl autohome
scrapy crawl dongchedi
scrapy crawl yiche

# 指定品牌
scrapy crawl autohome -a brand=比亚迪

# 输出到 JSON 文件
scrapy crawl autohome -o output.json

# 输出到 CSV 文件
scrapy crawl autohome -o output.csv
```

## 📊 支持的数据源

### 1. 汽车之家 (autohome.com.cn)

- **爬虫名称**: `autohome`
- **数据内容**: 车型基本信息、官方指导价、经销商价格
- **特点**: 数据最全面,更新及时

```bash
python run_spider.py autohome
```

### 2. 懂车帝 (dongchedi.com)

- **爬虫名称**: `dongchedi`
- **数据内容**: 车型信息、价格、配置参数
- **特点**: 字节跳动旗下,数据质量高

```bash
python run_spider.py dongchedi
```

### 3. 易车网 (yiche.com)

- **爬虫名称**: `yiche`
- **数据内容**: 车型价格、金融政策、置换补贴
- **特点**: 金融政策信息详细

```bash
python run_spider.py yiche
```

### 4. 批量更新爬虫

- **爬虫名称**: `batch_update`
- **功能**: 更新数据库中已有的车型价格
- **参数**: `--days` 指定更新多少天前的数据

```bash
# 更新7天前的数据
python run_spider.py batch_update --days 7

# 更新30天前的数据
python run_spider.py batch_update --days 30
```

## 🔧 配置说明

### settings.py 主要配置

```python
# 并发请求数
CONCURRENT_REQUESTS = 8

# 下载延迟 (秒)
DOWNLOAD_DELAY = 2

# User-Agent
USER_AGENT = "Mozilla/5.0 ..."

# 数据库连接
DATABASE_URL = "postgresql://..."

# AutoThrottle (自动限速)
AUTOTHROTTLE_ENABLED = True
```

### .env 环境变量

```bash
# 数据库连接 (必需)
DATABASE_URL=postgresql://postgres:password@localhost:5432/carpricehub

# 代理配置 (可选)
PROXY_ENABLED=false
PROXY_LIST=http://proxy1:port,http://proxy2:port
```

## 📦 数据结构

### CarPriceItem

```python
{
    'brand': '比亚迪',              # 品牌
    'model': '秦PLUS DM-i',         # 车型
    'year': 2024,                   # 年份
    'official_price': 12.98,        # 官方指导价 (万元)
    'dealer_price': 11.98,          # 经销商价格 (万元)
    'direct_discount': 1.0,         # 直接优惠 (万元)
    'energy_type': '混动',          # 能源类型
    'body_type': '轿车',            # 车身类型
    'battery_capacity': 18.3,       # 电池容量 (kWh)
    'range_km': 120,                # 纯电续航 (km)
    'fuel_consumption': 3.8,        # 油耗 (L/100km)
    'down_payment_percent': 20.0,   # 首付比例 (%)
    'annual_interest_rate': 3.0,    # 年利率 (%)
    'loan_months': 36,              # 贷款期限 (月)
    'loan_subsidy': 5000,           # 贴息金额 (元)
    'replacement_subsidy': 8000,    # 置换补贴 (元)
    'special_offer': '限时优惠',    # 特殊优惠
    'offer_expiry': '2024-12-31',   # 优惠截止日期
    'source_url': 'https://...',    # 数据来源
    'crawl_time': '2024-01-01T12:00:00'  # 爬取时间
}
```

## 🛠️ 开发指南

### 创建新爬虫

1. 在 `spiders/` 目录创建新文件

```python
# spiders/new_spider.py
from carprice_crawler.spiders.base_spider import BaseCarSpider
from carprice_crawler.items import CarPriceItem

class NewSpider(BaseCarSpider):
    name = 'new_spider'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com/cars']
    
    def parse(self, response):
        # 解析逻辑
        pass
```

2. 注册爬虫到 `spiders/__init__.py`

3. 运行测试

```bash
scrapy crawl new_spider
```

### 自定义 Pipeline

在 `pipelines.py` 中添加新的 Pipeline 类:

```python
class CustomPipeline:
    def process_item(self, item, spider):
        # 处理逻辑
        return item
```

在 `settings.py` 中启用:

```python
ITEM_PIPELINES = {
    'carprice_crawler.pipelines.CustomPipeline': 500,
}
```

## ⏰ 定时任务

### Windows 任务计划

创建 `scheduled_crawl.ps1`:

```powershell
# 每天凌晨2点运行批量更新
cd C:\path\to\crawler
python run_spider.py batch_update --days 7
```

### Linux Crontab

```bash
# 编辑 crontab
crontab -e

# 每天凌晨2点运行
0 2 * * * cd /path/to/crawler && python run_spider.py batch_update --days 7 >> /var/log/carprice_crawler.log 2>&1
```

## 📝 注意事项

1. **遵守 robots.txt**: 虽然已设置 `ROBOTSTXT_OBEY = False`,但请合理设置爬取频率,避免对目标网站造成压力

2. **数据去重**: Pipeline 会自动检查重复车型并更新,而不是重复插入

3. **错误处理**: 所有爬虫都有 errback 处理,失败的请求会被记录到日志

4. **性能优化**: 
   - 使用 AutoThrottle 自动限速
   - 启用 HTTP 缓存避免重复请求
   - 合理设置并发数和延迟

5. **反爬措施**:
   - 随机 User-Agent
   - 支持代理池 (需配置)
   - 智能延迟

## 🐛 故障排查

### 问题1: 无法连接数据库

```bash
# 检查数据库连接
psql postgresql://postgres:password@localhost:5432/carpricehub

# 检查 .env 文件配置
cat .env
```

### 问题2: 爬虫没有抓到数据

```bash
# 检查日志
tail -f crawler.log

# 调试模式运行
scrapy crawl autohome --loglevel=DEBUG
```

### 问题3: 数据重复

Pipeline 会自动处理重复,检查数据库中的数据:

```sql
-- 查看重复数据
SELECT brand, model, year, COUNT(*) 
FROM cars 
GROUP BY brand, model, year 
HAVING COUNT(*) > 1;
```

## 📈 性能监控

查看爬虫统计:

```bash
# 运行后查看统计
scrapy crawl autohome --loglevel=INFO | grep "item_scraped_count"
```

## 📄 License

MIT License
