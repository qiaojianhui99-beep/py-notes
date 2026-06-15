# Scrapy 爬虫框架

Scrapy 是 Python 最强大的爬虫框架，提供完整的爬虫开发解决方案。

## 安装与创建项目

### 安装 Scrapy

```bash
# 使用 pip 安装
pip install scrapy

# 或使用 conda
conda install -c conda-forge scrapy

# 验证安装
scrapy version
```

### 创建项目

```bash
# 创建新项目
scrapy startproject myspider

# 项目结构
myspider/
├── scrapy.cfg          # 项目配置文件
└── myspider/           # 项目模块
    ├── __init__.py
    ├── items.py        # 数据模型
    ├── middlewares.py  # 中间件
    ├── pipelines.py    # 数据处理管道
    ├── settings.py     # 项目设置
    └── spiders/        # 爬虫目录
        └── __init__.py

# 进入项目目录
cd myspider

# 创建爬虫
scrapy genspider example example.com
```

## 第一个爬虫

### 基础爬虫

```python
# myspider/spiders/quotes_spider.py
import scrapy

class QuotesSpider(scrapy.Spider):
    name = 'quotes'  # 爬虫名称（唯一标识）
    allowed_domains = ['quotes.toscrape.com']
    start_urls = ['https://quotes.toscrape.com/']
    
    def parse(self, response):
        """解析响应"""
        # 提取所有引言
        for quote in response.css('div.quote'):
            yield {
                'text': quote.css('span.text::text').get(),
                'author': quote.css('small.author::text').get(),
                'tags': quote.css('div.tags a.tag::text').getall(),
            }
        
        # 跟踪下一页
        next_page = response.css('li.next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

### 运行爬虫

```bash
# 运行爬虫
scrapy crawl quotes

# 保存到文件
scrapy crawl quotes -o quotes.json
scrapy crawl quotes -o quotes.csv
scrapy crawl quotes -o quotes.xml

# 使用 feed 导出（推荐）
scrapy crawl quotes -O quotes.json  # 覆盖
scrapy crawl quotes -o quotes.jsonl # 追加（JSON Lines）
```

## 选择器

### CSS 选择器

```python
class ExampleSpider(scrapy.Spider):
    name = 'example'
    start_urls = ['https://example.com']
    
    def parse(self, response):
        # 提取文本
        title = response.css('h1::text').get()
        titles = response.css('h2::text').getall()
        
        # 提取属性
        links = response.css('a::attr(href)').getall()
        images = response.css('img::attr(src)').getall()
        
        # 嵌套选择
        for item in response.css('div.item'):
            name = item.css('h3::text').get()
            price = item.css('span.price::text').get()
            yield {'name': name, 'price': price}
        
        # 带过滤
        active_links = response.css('a.active::attr(href)').getall()
```

### XPath 选择器

```python
def parse(self, response):
    # 基础 XPath
    title = response.xpath('//h1/text()').get()
    titles = response.xpath('//h2/text()').getall()
    
    # 属性选择
    links = response.xpath('//a/@href').getall()
    
    # 条件选择
    specific_div = response.xpath('//div[@class="content"]//p/text()').getall()
    
    # 复杂选择
    for row in response.xpath('//table//tr'):
        cells = row.xpath('./td/text()').getall()
        yield {'data': cells}
    
    # contains 函数
    elements = response.xpath('//div[contains(@class, "item")]')
```

## Items 数据模型

### 定义 Item

```python
# items.py
import scrapy

class QuoteItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()
    url = scrapy.Field()
    crawled_at = scrapy.Field()

class BookItem(scrapy.Item):
    title = scrapy.Field()
    price = scrapy.Field()
    stock = scrapy.Field()
    rating = scrapy.Field()
    description = scrapy.Field()
    image_urls = scrapy.Field()  # 图片 URL 列表
    images = scrapy.Field()       # 下载后的图片信息
```

### 使用 Item

```python
# spiders/quotes_spider.py
from myspider.items import QuoteItem
from datetime import datetime

class QuotesSpider(scrapy.Spider):
    name = 'quotes'
    start_urls = ['https://quotes.toscrape.com/']
    
    def parse(self, response):
        for quote in response.css('div.quote'):
            item = QuoteItem()
            item['text'] = quote.css('span.text::text').get()
            item['author'] = quote.css('small.author::text').get()
            item['tags'] = quote.css('div.tags a.tag::text').getall()
            item['url'] = response.url
            item['crawled_at'] = datetime.now()
            yield item
```

## Pipelines 数据处理

### 基础 Pipeline

```python
# pipelines.py
import json
from datetime import datetime

class JsonPipeline:
    """保存到 JSON 文件"""
    
    def open_spider(self, spider):
        self.file = open('items.json', 'w', encoding='utf-8')
        self.file.write('[')
        self.first_item = True
    
    def close_spider(self, spider):
        self.file.write(']')
        self.file.close()
    
    def process_item(self, item, spider):
        if not self.first_item:
            self.file.write(',\n')
        else:
            self.first_item = False
        
        line = json.dumps(dict(item), ensure_ascii=False, indent=2)
        self.file.write(line)
        return item

class DataCleaningPipeline:
    """数据清洗"""
    
    def process_item(self, item, spider):
        # 去除空格
        if 'text' in item:
            item['text'] = item['text'].strip()
        if 'author' in item:
            item['author'] = item['author'].strip()
        
        # 价格转换
        if 'price' in item:
            price_str = item['price'].replace('£', '').replace('$', '')
            item['price'] = float(price_str)
        
        return item

class DuplicatesPipeline:
    """去重"""
    
    def __init__(self):
        self.ids_seen = set()
    
    def process_item(self, item, spider):
        if item.get('id') in self.ids_seen:
            raise DropItem(f"Duplicate item found: {item['id']}")
        else:
            self.ids_seen.add(item['id'])
            return item
```

### 数据库 Pipeline

```python
# pipelines.py
import pymysql
from scrapy.exceptions import DropItem

class MySQLPipeline:
    """保存到 MySQL"""
    
    def __init__(self, host, database, user, password):
        self.host = host
        self.database = database
        self.user = user
        self.password = password
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            host=crawler.settings.get('MYSQL_HOST', 'localhost'),
            database=crawler.settings.get('MYSQL_DATABASE'),
            user=crawler.settings.get('MYSQL_USER'),
            password=crawler.settings.get('MYSQL_PASSWORD')
        )
    
    def open_spider(self, spider):
        self.conn = pymysql.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
            charset='utf8mb4'
        )
        self.cursor = self.conn.cursor()
    
    def close_spider(self, spider):
        self.conn.commit()
        self.conn.close()
    
    def process_item(self, item, spider):
        sql = """
        INSERT INTO quotes (text, author, tags, url, crawled_at)
        VALUES (%s, %s, %s, %s, %s)
        """
        self.cursor.execute(sql, (
            item['text'],
            item['author'],
            ','.join(item['tags']),
            item['url'],
            item['crawled_at']
        ))
        return item

class MongoPipeline:
    """保存到 MongoDB"""
    
    def __init__(self, mongo_uri, mongo_db):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE')
        )
    
    def open_spider(self, spider):
        from pymongo import MongoClient
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
    
    def close_spider(self, spider):
        self.client.close()
    
    def process_item(self, item, spider):
        collection = self.db[spider.name]
        collection.insert_one(dict(item))
        return item
```

### 图片下载 Pipeline

```python
# pipelines.py
from scrapy.pipelines.images import ImagesPipeline
from scrapy.exceptions import DropItem
import scrapy

class MyImagesPipeline(ImagesPipeline):
    """下载图片"""
    
    def get_media_requests(self, item, info):
        for image_url in item.get('image_urls', []):
            yield scrapy.Request(image_url)
    
    def item_completed(self, results, item, info):
        image_paths = [x['path'] for ok, x in results if ok]
        if not image_paths:
            raise DropItem("Item contains no images")
        item['image_paths'] = image_paths
        return item

# settings.py 配置
IMAGES_STORE = 'images'  # 图片保存路径
IMAGES_URLS_FIELD = 'image_urls'
IMAGES_RESULT_FIELD = 'images'
IMAGES_MIN_HEIGHT = 100
IMAGES_MIN_WIDTH = 100
```

## Middlewares 中间件

### 下载中间件

```python
# middlewares.py
from scrapy import signals
from scrapy.http import HtmlResponse
import random

class UserAgentMiddleware:
    """随机 User-Agent"""
    
    def __init__(self):
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        ]
    
    def process_request(self, request, spider):
        request.headers['User-Agent'] = random.choice(self.user_agents)

class ProxyMiddleware:
    """代理中间件"""
    
    def __init__(self, proxy_pool):
        self.proxy_pool = proxy_pool
    
    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            proxy_pool=crawler.settings.get('PROXY_POOL', [])
        )
    
    def process_request(self, request, spider):
        if self.proxy_pool:
            proxy = random.choice(self.proxy_pool)
            request.meta['proxy'] = proxy

class RetryMiddleware:
    """重试中间件"""
    
    def process_response(self, request, response, spider):
        if response.status in [403, 429, 503]:
            spider.logger.warning(f'Got {response.status}, retrying...')
            return request
        return response
    
    def process_exception(self, request, exception, spider):
        spider.logger.error(f'Exception: {exception}')
        return request
```

### Spider 中间件

```python
class SpiderMiddleware:
    """Spider 中间件示例"""
    
    def process_spider_input(self, response, spider):
        """处理进入 spider 的响应"""
        return None
    
    def process_spider_output(self, response, result, spider):
        """处理 spider 的输出"""
        for item in result:
            yield item
    
    def process_spider_exception(self, response, exception, spider):
        """处理 spider 异常"""
        pass
```

## 高级特性

### 请求与响应

```python
class AdvancedSpider(scrapy.Spider):
    name = 'advanced'
    
    def start_requests(self):
        urls = ['https://example.com/page1', 'https://example.com/page2']
        for url in urls:
            yield scrapy.Request(
                url=url,
                callback=self.parse,
                headers={'Custom-Header': 'value'},
                cookies={'session': 'xxx'},
                meta={'page': 1},
                dont_filter=True,  # 不过滤重复请求
                priority=10,  # 优先级
            )
    
    def parse(self, response):
        # 获取 meta 数据
        page = response.meta.get('page')
        
        # POST 请求
        yield scrapy.FormRequest(
            url='https://example.com/login',
            formdata={'username': 'user', 'password': 'pass'},
            callback=self.after_login
        )
    
    def after_login(self, response):
        # 处理登录后的响应
        pass
```

### 链接提取器

```python
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule

class MyCrawlSpider(CrawlSpider):
    name = 'mycrawl'
    allowed_domains = ['example.com']
    start_urls = ['https://example.com']
    
    rules = (
        # 提取所有链接并跟踪
        Rule(LinkExtractor(allow=r'/page/\d+'), callback='parse_item', follow=True),
        # 只提取分类页面
        Rule(LinkExtractor(allow=r'/category/'), callback='parse_category'),
        # 排除特定链接
        Rule(LinkExtractor(deny=r'/admin/'), callback='parse_item'),
    )
    
    def parse_item(self, response):
        yield {'url': response.url}
    
    def parse_category(self, response):
        yield {'category': response.url}
```

### 信号处理

```python
# signals.py
from scrapy import signals

class SignalHandler:
    
    @classmethod
    def from_crawler(cls, crawler):
        obj = cls()
        crawler.signals.connect(obj.spider_opened, signal=signals.spider_opened)
        crawler.signals.connect(obj.spider_closed, signal=signals.spider_closed)
        crawler.signals.connect(obj.item_scraped, signal=signals.item_scraped)
        return obj
    
    def spider_opened(self, spider):
        spider.logger.info('Spider opened: %s' % spider.name)
    
    def spider_closed(self, spider):
        spider.logger.info('Spider closed: %s' % spider.name)
    
    def item_scraped(self, item, response, spider):
        spider.logger.info('Item scraped: %s' % item)
```

## 设置配置

### settings.py

```python
# settings.py

# 基础设置
BOT_NAME = 'myspider'
SPIDER_MODULES = ['myspider.spiders']
NEWSPIDER_MODULE = 'myspider.spiders'

# 遵守 robots.txt
ROBOTSTXT_OBEY = True

# 并发设置
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 8
DOWNLOAD_DELAY = 2  # 下载延迟（秒）

# User-Agent
USER_AGENT = 'myspider (+http://www.yourdomain.com)'

# Cookies
COOKIES_ENABLED = True

# 自动限速
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# 中间件
DOWNLOADER_MIDDLEWARES = {
    'myspider.middlewares.UserAgentMiddleware': 400,
    'myspider.middlewares.ProxyMiddleware': 410,
}

SPIDER_MIDDLEWARES = {
    'myspider.middlewares.SpiderMiddleware': 543,
}

# Pipelines（数字越小优先级越高）
ITEM_PIPELINES = {
    'myspider.pipelines.DataCleaningPipeline': 100,
    'myspider.pipelines.DuplicatesPipeline': 200,
    'myspider.pipelines.MySQLPipeline': 300,
}

# 日志级别
LOG_LEVEL = 'INFO'
LOG_FILE = 'scrapy.log'

# 缓存（开发时使用）
HTTPCACHE_ENABLED = True
HTTPCACHE_EXPIRATION_SECS = 3600
HTTPCACHE_DIR = 'httpcache'

# 数据库配置
MYSQL_HOST = 'localhost'
MYSQL_DATABASE = 'scrapy_db'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'password'

MONGO_URI = 'mongodb://localhost:27017'
MONGO_DATABASE = 'scrapy_db'

# 代理池
PROXY_POOL = [
    'http://proxy1:port',
    'http://proxy2:port',
]
```

## 实战案例

### 爬取新闻网站

```python
# spiders/news_spider.py
import scrapy
from myspider.items import NewsItem
from datetime import datetime

class NewsSpider(scrapy.Spider):
    name = 'news'
    allowed_domains = ['news.example.com']
    start_urls = ['https://news.example.com/']
    
    def parse(self, response):
        """首页：提取文章链接"""
        for article in response.css('div.article-list a'):
            url = article.css('::attr(href)').get()
            yield response.follow(url, self.parse_article)
        
        # 翻页
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
    
    def parse_article(self, response):
        """文章页：提取详细信息"""
        item = NewsItem()
        item['title'] = response.css('h1.title::text').get()
        item['author'] = response.css('span.author::text').get()
        item['date'] = response.css('span.date::text').get()
        item['content'] = '\n'.join(response.css('div.content p::text').getall())
        item['tags'] = response.css('a.tag::text').getall()
        item['url'] = response.url
        item['crawled_at'] = datetime.now()
        yield item
```

### 爬取电商商品

```python
# spiders/shop_spider.py
import scrapy
from myspider.items import ProductItem

class ShopSpider(scrapy.Spider):
    name = 'shop'
    start_urls = ['https://shop.example.com/products']
    
    def parse(self, response):
        """商品列表页"""
        for product in response.css('div.product'):
            url = product.css('a::attr(href)').get()
            yield response.follow(url, self.parse_product)
        
        # 分页
        for page in response.css('div.pagination a::attr(href)').getall():
            yield response.follow(page, self.parse)
    
    def parse_product(self, response):
        """商品详情页"""
        item = ProductItem()
        item['name'] = response.css('h1.product-name::text').get()
        item['price'] = response.css('span.price::text').get()
        item['stock'] = response.css('span.stock::text').get()
        item['rating'] = response.css('div.rating::attr(data-rating)').get()
        item['description'] = response.css('div.description::text').get()
        item['image_urls'] = response.css('div.images img::attr(src)').getall()
        item['category'] = response.css('a.breadcrumb::text').getall()
        item['reviews_count'] = response.css('span.reviews-count::text').get()
        yield item
```

## 调试技巧

### Scrapy Shell

```bash
# 进入交互式 shell
scrapy shell 'https://example.com'

# 常用命令
>>> response.css('title::text').get()
>>> response.xpath('//title/text()').get()
>>> fetch('https://another-url.com')
>>> view(response)  # 在浏览器中打开
```

### 日志调试

```python
class MySpider(scrapy.Spider):
    name = 'myspider'
    
    def parse(self, response):
        self.logger.info('Parsing: %s', response.url)
        self.logger.debug('Response status: %d', response.status)
        self.logger.warning('Warning message')
        self.logger.error('Error occurred')
```

## 易错点

::: warning 常见错误
1. **忘记启用 Pipeline** - 在 settings.py 中配置 ITEM_PIPELINES
2. **重复请求被过滤** - 使用 `dont_filter=True` 或配置 DUPEFILTER_CLASS
3. **编码问题** - 确保正确处理中文编码
4. **同步/异步混用** - Pipeline 中不要使用 asyncio
5. **内存泄漏** - 及时关闭数据库连接
6. **robots.txt 限制** - 设置 ROBOTSTXT_OBEY = False（需谨慎）
7. **并发过高被封** - 合理设置 DOWNLOAD_DELAY 和 CONCURRENT_REQUESTS
:::

## 自我检验

1. Scrapy 的核心组件有哪些？
2. Spider、Item、Pipeline 的作用分别是什么？
3. 如何在 Scrapy 中处理分页？
4. 下载中间件和 Spider 中间件有什么区别？
5. 如何在 Scrapy 中使用代理？
6. 如何保存爬取的数据到数据库？
7. 如何调试 Scrapy 爬虫？

## 练习题

1. 创建一个 Scrapy 项目，爬取豆瓣电影 Top 250
2. 实现一个数据清洗 Pipeline，去除空格和重复数据
3. 使用 CrawlSpider 爬取整个网站
4. 实现一个随机 User-Agent 中间件
5. 将爬取的数据保存到 MySQL 数据库
6. 实现一个图片下载 Pipeline
7. 使用信号监听爬虫的开始和结束事件

## 参考资源

- [Scrapy 官方文档](https://docs.scrapy.org/)
- [Scrapy 中文文档](https://scrapy-chs.readthedocs.io/)
- [Scrapy 教程](https://docs.scrapy.org/en/latest/intro/tutorial.html)
