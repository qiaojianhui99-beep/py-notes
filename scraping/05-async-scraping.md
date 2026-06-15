# 异步爬虫

异步爬虫利用异步 I/O 实现高并发数据采集，适合大规模爬取任务。

## 异步基础

### 为什么需要异步

```python
import time
import requests

# 同步爬取（串行）
urls = ['https://example.com/page1', 'https://example.com/page2', 
        'https://example.com/page3']

start = time.time()
for url in urls:
    response = requests.get(url)
    print(f"获取 {url}: {len(response.content)} 字节")

print(f"总耗时: {time.time() - start:.2f} 秒")
# 假设每个请求 1 秒，总共需要 3 秒

# 异步爬取（并行）
# 3 个请求同时发出，总共只需 1 秒左右
```

**同步 vs 异步：**
- **同步**：一个接一个地请求，等待每个响应完成
- **异步**：同时发出多个请求，充分利用等待时间

## aiohttp 基础

### 安装

```bash
pip install aiohttp
pip install aiofiles  # 异步文件操作
```

### 基本使用

```python
import asyncio
import aiohttp

async def fetch(url):
    """异步获取单个 URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

# 运行
asyncio.run(fetch('https://example.com'))
```

### 并发请求

```python
import asyncio
import aiohttp
import time

async def fetch(session, url):
    """使用共享 session 获取 URL"""
    async with session.get(url) as response:
        return await response.text()

async def fetch_all(urls):
    """并发获取多个 URL"""
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

# 使用
urls = [
    'https://example.com/page1',
    'https://example.com/page2',
    'https://example.com/page3',
]

start = time.time()
results = asyncio.run(fetch_all(urls))
print(f"获取 {len(results)} 个页面，耗时 {time.time() - start:.2f} 秒")
```

## 完整的异步爬虫

### 基础架构

```python
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import time

class AsyncSpider:
    def __init__(self, urls, max_concurrent=10):
        self.urls = urls
        self.max_concurrent = max_concurrent
        self.results = []
    
    async def fetch(self, session, url):
        """获取单个页面"""
        try:
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    html = await response.text()
                    return {'url': url, 'html': html, 'status': 'success'}
                else:
                    return {'url': url, 'status': 'error', 'code': response.status}
        except Exception as e:
            return {'url': url, 'status': 'error', 'error': str(e)}
    
    async def parse(self, result):
        """解析页面"""
        if result['status'] == 'success':
            soup = BeautifulSoup(result['html'], 'html.parser')
            # 提取数据
            title = soup.find('title')
            return {
                'url': result['url'],
                'title': title.text if title else None,
            }
        return None
    
    async def worker(self, session, url):
        """工作单元：获取 + 解析"""
        result = await self.fetch(session, url)
        parsed = await self.parse(result)
        if parsed:
            self.results.append(parsed)
    
    async def run(self):
        """运行爬虫"""
        connector = aiohttp.TCPConnector(limit=self.max_concurrent)
        async with aiohttp.ClientSession(connector=connector) as session:
            tasks = [self.worker(session, url) for url in self.urls]
            await asyncio.gather(*tasks)
        return self.results

# 使用
urls = ['https://example.com/page' + str(i) for i in range(1, 11)]
spider = AsyncSpider(urls, max_concurrent=5)
results = asyncio.run(spider.run())
print(f"爬取完成，获得 {len(results)} 条数据")
```

### 限制并发数

```python
import asyncio
import aiohttp

class RateLimitedSpider:
    def __init__(self, urls, max_concurrent=5):
        self.urls = urls
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.results = []
    
    async def fetch(self, session, url):
        """带并发限制的请求"""
        async with self.semaphore:  # 限制同时运行的协程数量
            print(f"正在获取: {url}")
            async with session.get(url) as response:
                html = await response.text()
                print(f"完成: {url}")
                return html
    
    async def run(self):
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch(session, url) for url in self.urls]
            self.results = await asyncio.gather(*tasks)
        return self.results

# 使用
urls = [f'https://httpbin.org/delay/{i%3}' for i in range(10)]
spider = RateLimitedSpider(urls, max_concurrent=3)
results = asyncio.run(spider.run())
```

## 高级特性

### 请求重试

```python
import asyncio
import aiohttp
from aiohttp import ClientError

async def fetch_with_retry(session, url, max_retries=3):
    """带重试机制的请求"""
    for attempt in range(max_retries):
        try:
            async with session.get(url, timeout=10) as response:
                if response.status == 200:
                    return await response.text()
                elif response.status in [500, 502, 503, 504]:
                    # 服务器错误，重试
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)  # 指数退避
                        continue
                return None
        except (ClientError, asyncio.TimeoutError) as e:
            if attempt < max_retries - 1:
                print(f"重试 {url} (尝试 {attempt + 1}/{max_retries})")
                await asyncio.sleep(2 ** attempt)
                continue
            else:
                print(f"失败 {url}: {e}")
                return None
    return None
```

### 请求头和 Cookie

```python
import asyncio
import aiohttp

async def fetch_with_headers(url):
    """带自定义请求头"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    }
    
    cookies = {
        'session_id': 'your_session_id',
    }
    
    async with aiohttp.ClientSession(headers=headers, cookies=cookies) as session:
        async with session.get(url) as response:
            return await response.text()

# 使用
result = asyncio.run(fetch_with_headers('https://example.com'))
```

### 代理支持

```python
import asyncio
import aiohttp

async def fetch_with_proxy(url, proxy):
    """使用代理"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url, proxy=proxy) as response:
            return await response.text()

# 使用
proxy = 'http://proxy-server:8080'
result = asyncio.run(fetch_with_proxy('https://example.com', proxy))
```

### POST 请求

```python
import asyncio
import aiohttp

async def post_data(url, data):
    """POST 请求"""
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=data) as response:
            return await response.json()

# 使用
data = {'username': 'user', 'password': 'pass'}
result = asyncio.run(post_data('https://api.example.com/login', data))
```

### 文件下载

```python
import asyncio
import aiohttp
import aiofiles

async def download_file(session, url, filename):
    """异步下载文件"""
    async with session.get(url) as response:
        async with aiofiles.open(filename, 'wb') as f:
            async for chunk in response.content.iter_chunked(1024):
                await f.write(chunk)
    print(f"下载完成: {filename}")

async def download_all(urls):
    """批量下载文件"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for i, url in enumerate(urls):
            filename = f'file_{i}.jpg'
            tasks.append(download_file(session, url, filename))
        await asyncio.gather(*tasks)

# 使用
urls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
]
asyncio.run(download_all(urls))
```

## 实战案例

### 案例一：新闻网站爬虫

```python
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import json

class NewsSpider:
    def __init__(self, base_url, pages=5):
        self.base_url = base_url
        self.pages = pages
        self.articles = []
    
    async def fetch_page(self, session, page):
        """获取列表页"""
        url = f"{self.base_url}/news?page={page}"
        try:
            async with session.get(url) as response:
                return await response.text()
        except Exception as e:
            print(f"获取页面 {page} 失败: {e}")
            return None
    
    async def parse_list(self, html):
        """解析列表页，提取文章链接"""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        for item in soup.select('div.article-item a'):
            link = item.get('href')
            if link:
                links.append(link)
        return links
    
    async def fetch_article(self, session, url):
        """获取文章详情"""
        try:
            async with session.get(url) as response:
                html = await response.text()
                return self.parse_article(html, url)
        except Exception as e:
            print(f"获取文章失败 {url}: {e}")
            return None
    
    def parse_article(self, html, url):
        """解析文章详情"""
        soup = BeautifulSoup(html, 'html.parser')
        
        title = soup.find('h1', class_='title')
        author = soup.find('span', class_='author')
        date = soup.find('span', class_='date')
        content = soup.find('div', class_='content')
        
        return {
            'url': url,
            'title': title.text.strip() if title else None,
            'author': author.text.strip() if author else None,
            'date': date.text.strip() if date else None,
            'content': content.text.strip() if content else None,
        }
    
    async def run(self):
        """运行爬虫"""
        async with aiohttp.ClientSession() as session:
            # 第一步：获取所有列表页
            list_tasks = [self.fetch_page(session, page) 
                         for page in range(1, self.pages + 1)]
            list_pages = await asyncio.gather(*list_tasks)
            
            # 第二步：解析所有文章链接
            all_links = []
            for html in list_pages:
                if html:
                    links = await self.parse_list(html)
                    all_links.extend(links)
            
            print(f"找到 {len(all_links)} 篇文章")
            
            # 第三步：获取所有文章详情（限制并发）
            semaphore = asyncio.Semaphore(10)  # 最多10个并发
            
            async def fetch_with_limit(url):
                async with semaphore:
                    return await self.fetch_article(session, url)
            
            article_tasks = [fetch_with_limit(link) for link in all_links]
            self.articles = await asyncio.gather(*article_tasks)
            
            # 过滤失败的结果
            self.articles = [a for a in self.articles if a is not None]
            
            return self.articles
    
    def save(self, filename='news.json'):
        """保存结果"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.articles, f, ensure_ascii=False, indent=2)
        print(f"保存 {len(self.articles)} 篇文章到 {filename}")

# 使用
async def main():
    spider = NewsSpider('https://news.example.com', pages=5)
    await spider.run()
    spider.save()

asyncio.run(main())
```

### 案例二：电商商品爬虫

```python
import asyncio
import aiohttp
from bs4 import BeautifulSoup
import csv

class ProductSpider:
    def __init__(self, category_url, max_pages=10):
        self.category_url = category_url
        self.max_pages = max_pages
        self.products = []
    
    async def fetch_category(self, session, page):
        """获取分类页面"""
        url = f"{self.category_url}?page={page}"
        async with session.get(url) as response:
            return await response.text()
    
    async def parse_products(self, html):
        """解析商品列表"""
        soup = BeautifulSoup(html, 'html.parser')
        products = []
        
        for item in soup.select('div.product'):
            product = {
                'name': item.select_one('.name').text.strip(),
                'price': item.select_one('.price').text.strip(),
                'url': item.select_one('a')['href'],
                'image': item.select_one('img')['src'],
            }
            products.append(product)
        
        return products
    
    async def fetch_detail(self, session, product):
        """获取商品详情"""
        try:
            async with session.get(product['url']) as response:
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')
                
                # 补充详细信息
                description = soup.select_one('.description')
                product['description'] = description.text.strip() if description else None
                
                rating = soup.select_one('.rating')
                product['rating'] = rating.text.strip() if rating else None
                
                stock = soup.select_one('.stock')
                product['stock'] = stock.text.strip() if stock else None
                
                return product
        except Exception as e:
            print(f"获取详情失败 {product['url']}: {e}")
            return product
    
    async def run(self):
        """运行爬虫"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        connector = aiohttp.TCPConnector(limit=20)
        async with aiohttp.ClientSession(
            headers=headers, 
            connector=connector
        ) as session:
            # 第一阶段：获取所有分类页
            print("正在获取商品列表...")
            category_tasks = [
                self.fetch_category(session, page) 
                for page in range(1, self.max_pages + 1)
            ]
            category_pages = await asyncio.gather(*category_tasks)
            
            # 解析商品基本信息
            all_products = []
            for html in category_pages:
                products = await self.parse_products(html)
                all_products.extend(products)
            
            print(f"找到 {len(all_products)} 个商品")
            
            # 第二阶段：获取商品详情（分批处理）
            print("正在获取商品详情...")
            batch_size = 50
            for i in range(0, len(all_products), batch_size):
                batch = all_products[i:i + batch_size]
                detail_tasks = [
                    self.fetch_detail(session, product) 
                    for product in batch
                ]
                detailed = await asyncio.gather(*detail_tasks)
                self.products.extend(detailed)
                print(f"已完成 {len(self.products)}/{len(all_products)}")
            
            return self.products
    
    def save_csv(self, filename='products.csv'):
        """保存为 CSV"""
        if not self.products:
            return
        
        with open(filename, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=self.products[0].keys())
            writer.writeheader()
            writer.writerows(self.products)
        
        print(f"保存 {len(self.products)} 个商品到 {filename}")

# 使用
async def main():
    spider = ProductSpider('https://shop.example.com/category/electronics', max_pages=5)
    await spider.run()
    spider.save_csv()

asyncio.run(main())
```

### 案例三：图片批量下载

```python
import asyncio
import aiohttp
import aiofiles
from pathlib import Path
from urllib.parse import urlparse
import hashlib

class ImageDownloader:
    def __init__(self, urls, save_dir='images'):
        self.urls = urls
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
        self.success_count = 0
        self.fail_count = 0
    
    def get_filename(self, url):
        """生成文件名"""
        # 使用 URL 哈希作为文件名
        url_hash = hashlib.md5(url.encode()).hexdigest()
        ext = Path(urlparse(url).path).suffix or '.jpg'
        return self.save_dir / f"{url_hash}{ext}"
    
    async def download_image(self, session, url):
        """下载单张图片"""
        filename = self.get_filename(url)
        
        # 跳过已存在的文件
        if filename.exists():
            print(f"跳过（已存在）: {filename.name}")
            return True
        
        try:
            async with session.get(url, timeout=30) as response:
                if response.status == 200:
                    content = await response.read()
                    
                    # 异步写入文件
                    async with aiofiles.open(filename, 'wb') as f:
                        await f.write(content)
                    
                    print(f"下载成功: {filename.name} ({len(content)} 字节)")
                    self.success_count += 1
                    return True
                else:
                    print(f"下载失败: {url} (状态码 {response.status})")
                    self.fail_count += 1
                    return False
        
        except asyncio.TimeoutError:
            print(f"超时: {url}")
            self.fail_count += 1
            return False
        except Exception as e:
            print(f"错误: {url} - {e}")
            self.fail_count += 1
            return False
    
    async def run(self, max_concurrent=10):
        """批量下载"""
        connector = aiohttp.TCPConnector(limit=max_concurrent)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        ) as session:
            tasks = [
                self.download_image(session, url) 
                for url in self.urls
            ]
            await asyncio.gather(*tasks)
        
        print(f"\n下载完成！")
        print(f"成功: {self.success_count}")
        print(f"失败: {self.fail_count}")
        print(f"总计: {len(self.urls)}")

# 使用
async def main():
    # 图片 URL 列表
    urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        # ... 更多 URL
    ]
    
    downloader = ImageDownloader(urls, save_dir='downloads')
    await downloader.run(max_concurrent=20)

asyncio.run(main())
```

## 性能优化

### 连接池配置

```python
import aiohttp

# 优化连接池
connector = aiohttp.TCPConnector(
    limit=100,              # 总连接数限制
    limit_per_host=30,      # 每个主机的连接数限制
    ttl_dns_cache=300,      # DNS 缓存时间（秒）
    keepalive_timeout=30,   # 保持连接时间
    force_close=False,      # 是否强制关闭连接
)

async with aiohttp.ClientSession(connector=connector) as session:
    # 使用 session
    pass
```

### 超时设置

```python
import aiohttp

# 详细的超时设置
timeout = aiohttp.ClientTimeout(
    total=60,           # 总超时
    connect=10,         # 连接超时
    sock_read=10,       # 读取超时
    sock_connect=10,    # socket 连接超时
)

async with aiohttp.ClientSession(timeout=timeout) as session:
    async with session.get(url) as response:
        pass
```

### 内存优化

```python
import asyncio
import aiohttp

async def fetch_streaming(session, url):
    """流式读取大文件"""
    async with session.get(url) as response:
        # 分块读取，避免一次性加载到内存
        chunks = []
        async for chunk in response.content.iter_chunked(8192):
            chunks.append(chunk)
        return b''.join(chunks)
```

### 进度监控

```python
import asyncio
import aiohttp
from tqdm import tqdm

class ProgressSpider:
    def __init__(self, urls):
        self.urls = urls
        self.pbar = None
    
    async def fetch(self, session, url):
        async with session.get(url) as response:
            result = await response.text()
            self.pbar.update(1)  # 更新进度条
            return result
    
    async def run(self):
        self.pbar = tqdm(total=len(self.urls), desc="爬取进度")
        
        async with aiohttp.ClientSession() as session:
            tasks = [self.fetch(session, url) for url in self.urls]
            results = await asyncio.gather(*tasks)
        
        self.pbar.close()
        return results

# 使用
urls = [f'https://example.com/page{i}' for i in range(100)]
spider = ProgressSpider(urls)
results = asyncio.run(spider.run())
```

## 异常处理

### 全面的异常处理

```python
import asyncio
import aiohttp
from aiohttp import ClientError, ServerTimeoutError

async def robust_fetch(session, url, max_retries=3):
    """健壮的请求函数"""
    for attempt in range(max_retries):
        try:
            async with session.get(url, timeout=10) as response:
                # 检查状态码
                if response.status == 200:
                    return await response.text()
                elif response.status == 404:
                    print(f"页面不存在: {url}")
                    return None
                elif response.status in [500, 502, 503, 504]:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    else:
                        print(f"服务器错误: {url}")
                        return None
                else:
                    print(f"未知状态码 {response.status}: {url}")
                    return None
        
        except ServerTimeoutError:
            print(f"超时 (尝试 {attempt + 1}/{max_retries}): {url}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            return None
        
        except ClientError as e:
            print(f"客户端错误: {url} - {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
                continue
            return None
        
        except asyncio.CancelledError:
            print(f"任务被取消: {url}")
            raise
        
        except Exception as e:
            print(f"未知错误: {url} - {e}")
            return None
    
    return None
```

## 与 Scrapy 集成

### 在 Scrapy 中使用 aiohttp

```python
# middlewares.py
import aiohttp
from scrapy import signals
from scrapy.http import HtmlResponse

class AiohttpDownloaderMiddleware:
    """使用 aiohttp 作为下载器"""
    
    def __init__(self):
        self.session = None
    
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls()
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        crawler.signals.connect(middleware.spider_closed, signal=signals.spider_closed)
        return middleware
    
    async def spider_opened(self, spider):
        self.session = aiohttp.ClientSession()
    
    async def spider_closed(self, spider):
        await self.session.close()
    
    async def process_request(self, request, spider):
        async with self.session.get(request.url) as response:
            body = await response.text()
            return HtmlResponse(
                url=str(response.url),
                body=body.encode('utf-8'),
                encoding='utf-8',
                request=request
            )
```

## 易错点

::: warning 常见错误
1. **忘记使用 await** - 协程必须用 await 调用
2. **在非 async 函数中使用 await** - 只能在 async 函数内使用
3. **不限制并发数** - 可能导致被封或耗尽资源
4. **不处理异常** - 一个请求失败会影响整个 gather
5. **内存溢出** - 一次性加载大量数据到内存
6. **Session 未复用** - 每次请求创建 Session 很慢
7. **不设置超时** - 请求hang住导致程序卡死
8. **文件操作未异步** - 使用同步 I/O 阻塞事件循环
:::

## 自我检验

1. 异步爬虫和同步爬虫的主要区别是什么？
2. 如何限制异步爬虫的并发数？
3. `asyncio.gather()` 的作用是什么？
4. 为什么要使用 Session 而不是每次创建新连接？
5. 如何实现请求重试机制？
6. 异步下载文件时应该注意什么？
7. 如何监控异步爬虫的进度？

## 练习题

1. 实现一个异步爬虫，并发获取 100 个网页
2. 添加进度条显示爬取进度
3. 实现请求失败自动重试（最多3次）
4. 限制并发数为 10，避免被封
5. 批量下载图片，并显示下载进度
6. 实现一个异步爬虫框架，支持自定义解析器
7. 将异步爬虫结果保存到数据库（使用 aiomysql）

## 参考资源

- [aiohttp 官方文档](https://docs.aiohttp.org/)
- [asyncio 文档](https://docs.python.org/3/library/asyncio.html)
- [aiofiles 文档](https://github.com/Tinche/aiofiles)
- [Python 异步编程指南](https://realpython.com/async-io-python/)
