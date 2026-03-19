#!/usr/bin/env python
"""
运行爬虫的便捷脚本
"""
import os
import sys
import argparse
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings


def run_spider(spider_name, brand=None, days=7):
    """运行指定的爬虫"""
    
    # 加载项目设置
    settings = get_project_settings()
    
    # 创建爬虫进程
    process = CrawlerProcess(settings)
    
    # 根据爬虫类型运行
    if spider_name == 'autohome':
        process.crawl('autohome', brand=brand)
    elif spider_name == 'dongchedi':
        process.crawl('dongchedi', brand=brand)
    elif spider_name == 'yiche':
        process.crawl('yiche', brand=brand)
    elif spider_name == 'batch_update':
        process.crawl('batch_update', days=days)
    elif spider_name == 'all':
        # 运行所有爬虫
        process.crawl('autohome', brand=brand)
        process.crawl('dongchedi', brand=brand)
        process.crawl('yiche', brand=brand)
    else:
        print(f"Unknown spider: {spider_name}")
        return
    
    # 启动爬虫
    process.start()


def main():
    parser = argparse.ArgumentParser(description='运行车价爬虫')
    
    parser.add_argument(
        'spider',
        choices=['autohome', 'dongchedi', 'yiche', 'batch_update', 'all'],
        help='要运行的爬虫名称'
    )
    
    parser.add_argument(
        '--brand',
        type=str,
        help='指定要爬取的品牌 (可选)'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        default=7,
        help='批量更新爬虫: 更新多少天前的数据 (默认: 7天)'
    )
    
    args = parser.parse_args()
    
    print(f"运行爬虫: {args.spider}")
    if args.brand:
        print(f"品牌: {args.brand}")
    if args.spider == 'batch_update':
        print(f"更新天数: {args.days}")
    
    run_spider(args.spider, brand=args.brand, days=args.days)


if __name__ == '__main__':
    main()
