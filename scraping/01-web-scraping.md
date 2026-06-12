# Python 爬虫开发

使用 Python 进行网络数据抓取，从基础到进阶的完整爬虫教程。

## Requests 库

### 基础请求

```python
import requests

# GET 请求
response = requests.get('https://api.github.com')
print(response.status_code)
print(response.text)
print(response.json())

# POST 请求
data = {'username': 'alice', 'password': 'secret'}
response = requests.post('https://example.com/login', data=data)

# 请求头
headers = {'User-Agent': 'Mozilla/5.0'}
response = requests.get('https://example.com', headers=headers)

# 参数
params = {'q': 'python', 'page': 1}
response = requests.get('https://example.com/search', params=params)

# 超时
response = requests.get('https://example.com', timeout=5)

# 代理
proxies = {'http': 'http://10.10.1.10:3128'}
response = requests.get('https://example.com', proxies=proxies)
```

### Session

```python
session = requests.Session()
session.headers.update({'User-Agent': 'MyBot'})

# 保持 Cookie
session.post('https://example.com/login', data={'username': 'alice'})
response = session.get('https://example.com/profile')
```

## BeautifulSoup 解析

```bash
pip install beautifulsoup4 lxml
```

```python
from bs4 import BeautifulSoup
import requests

response = requests.get('https://example.com')
soup = BeautifulSoup(response.text, 'lxml')

# 查找元素
soup.find('title')                  # 第一个 <title>
soup.find('div', class_='content')  # class="content"
soup.find('a', id='link1')          # id="link1"

# 查找所有
soup.find_all('a')                  # 所有 <a>
soup.find_all('div', class_='item') # 所有 class="item"

# CSS 选择器
soup.select('div.content')          # class="content"
soup.select('#main')                # id="main"
soup.select('div > p')              # 子元素

# 提取内容
tag = soup.find('h1')
tag.text                            # 文本内容
tag.get('href')                     # 属性值
tag['class']                        # class 属性
```

## 实战：抓取新闻

```python
import requests
from bs4 import BeautifulSoup

def scrape_news():
    url = 'https://news.example.com'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')
    
    articles = []
    for item in soup.find_all('div', class_='article'):
        title = item.find('h2').text.strip()
        link = item.find('a')['href']
        date = item.find('span', class_='date').text
        
        articles.append({
            'title': title,
            'link': link,
            'date': date
        })
    
    return articles

news = scrape_news()
for article in news:
    print(f"{article['title']} - {article['date']}")
```

## Scrapy 框架

```bash
pip install scrapy
```

### 创建项目

```bash
scrapy startproject myspider
cd myspider
scrapy genspider news example.com
```

### Spider

```python
import scrapy

class NewsSpider(scrapy.Spider):
    name = 'news'
    start_urls = ['https://news.example.com']
    
    def parse(self, response):
        for article in response.css('div.article'):
            yield {
                'title': article.css('h2::text').get(),
                'link': article.css('a::attr(href)').get(),
                'date': article.css('span.date::text').get(),
            }
        
        # 翻页
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)
```

运行：

```bash
scrapy crawl news -o output.json
```

## 异步爬虫

```bash
pip install aiohttp
```

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as response:
        return await response.text()

async def main():
    urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
    ]
    
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

results = asyncio.run(main())
```

## 处理动态网页

### Selenium

```bash
pip install selenium
```

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 初始化
driver = webdriver.Chrome()
driver.get('https://example.com')

# 等待元素加载
wait = WebDriverWait(driver, 10)
element = wait.until(EC.presence_of_element_located((By.ID, 'content')))

# 查找元素
driver.find_element(By.ID, 'username').send_keys('alice')
driver.find_element(By.ID, 'submit').click()

# 执行 JS
driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')

# 获取内容
html = driver.page_source
driver.quit()
```

## 反爬虫对策

### 1. User-Agent

```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### 2. 请求延迟

```python
import time

for url in urls:
    response = requests.get(url)
    time.sleep(2)  # 延迟 2 秒
```

### 3. IP 代理池

```python
proxies = [
    {'http': 'http://10.10.1.10:3128'},
    {'http': 'http://10.10.1.11:3128'},
]

import random
proxy = random.choice(proxies)
response = requests.get(url, proxies=proxy)
```

### 4. 处理 Cookie

```python
session = requests.Session()
response = session.get('https://example.com')
cookies = session.cookies
```

## 数据存储

### CSV

```python
import csv

with open('data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=['title', 'link', 'date'])
    writer.writeheader()
    for item in data:
        writer.writerow(item)
```

### JSON

```python
import json

with open('data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
```

### 数据库

```python
import sqlite3

conn = sqlite3.connect('data.db')
cursor = conn.cursor()

cursor.execute('''CREATE TABLE IF NOT EXISTS articles
                  (title TEXT, link TEXT, date TEXT)''')

for item in data:
    cursor.execute('INSERT INTO articles VALUES (?, ?, ?)',
                   (item['title'], item['link'], item['date']))

conn.commit()
conn.close()
```

## 完整示例：抓取豆瓣电影

```python
import requests
from bs4 import BeautifulSoup
import time
import json

class DoubanSpider:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def get_movies(self, page=0):
        url = f'https://movie.douban.com/top250?start={page * 25}'
        response = requests.get(url, headers=self.headers)
        soup = BeautifulSoup(response.text, 'lxml')
        
        movies = []
        for item in soup.find_all('div', class_='item'):
            title = item.find('span', class_='title').text
            rating = item.find('span', class_='rating_num').text
            quote = item.find('span', class_='inq')
            quote_text = quote.text if quote else ''
            
            movies.append({
                'title': title,
                'rating': rating,
                'quote': quote_text
            })
        
        return movies
    
    def run(self, pages=10):
        all_movies = []
        for page in range(pages):
            print(f'Scraping page {page + 1}...')
            movies = self.get_movies(page)
            all_movies.extend(movies)
            time.sleep(2)  # 延迟
        
        return all_movies

# 使用
spider = DoubanSpider()
movies = spider.run(pages=3)

with open('douban_top250.json', 'w', encoding='utf-8') as f:
    json.dump(movies, f, ensure_ascii=False, indent=2)
```

::: tip 最佳实践
1. 遵守 robots.txt
2. 设置合理的请求延迟
3. 使用随机 User-Agent
4. 处理异常和重试
5. 不要频繁爬取同一网站
6. 尊重网站服务条款
:::

::: warning 法律风险
1. 遵守网站服务条款
2. 不要爬取个人隐私信息
3. 商业使用需获得授权
4. 注意版权问题
:::

## 下一步

- **[数据分析基础](01-numpy-pandas.md)** - 处理爬取的数据
- **[异步编程](../advanced/09-asyncio-basics.md)** - 提升爬虫性能
