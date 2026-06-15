# 反爬虫策略与应对

了解常见的反爬虫手段及其应对方法，进行合理合法的数据采集。

## 常见反爬虫手段

### 1. User-Agent 检测

**检测方式**：服务器检查请求头中的 User-Agent 字段

**应对方法**：

```python
import requests
import random

# 随机 User-Agent
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
]

headers = {'User-Agent': random.choice(user_agents)}
response = requests.get('https://example.com', headers=headers)

# 使用 fake-useragent 库
from fake_useragent import UserAgent

ua = UserAgent()
headers = {'User-Agent': ua.random}
```

### 2. IP 封禁

**检测方式**：限制单个 IP 的请求频率

**应对方法**：

```python
import requests
import time

# 使用代理
proxies = {
    'http': 'http://proxy-server:port',
    'https': 'https://proxy-server:port'
}
response = requests.get('https://example.com', proxies=proxies)

# 代理池
proxy_pool = [
    'http://proxy1:port',
    'http://proxy2:port',
    'http://proxy3:port',
]

for url in urls:
    proxy = random.choice(proxy_pool)
    proxies = {'http': proxy, 'https': proxy}
    response = requests.get(url, proxies=proxies)
    time.sleep(random.uniform(1, 3))
```

### 3. Cookie/Session 验证

**检测方式**：要求保持会话状态

**应对方法**：

```python
import requests

# 使用 Session
session = requests.Session()

# 登录获取 cookie
login_data = {'username': 'user', 'password': 'pass'}
session.post('https://example.com/login', data=login_data)

# 后续请求自动携带 cookie
response = session.get('https://example.com/data')
```

### 4. JavaScript 渲染

**检测方式**：页面内容由 JavaScript 动态生成

**应对方法**：

```python
# 使用 Selenium
from selenium import webdriver

driver = webdriver.Chrome()
driver.get('https://example.com')
html = driver.page_source
driver.quit()

# 使用 Playwright（更快）
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('https://example.com')
    content = page.content()
    browser.close()
```

### 5. 验证码

**类型**：图片验证码、滑块验证码、点选验证码

**应对方法**：

```python
# 简单图片验证码（OCR识别）
import pytesseract
from PIL import Image

image = Image.open('captcha.png')
code = pytesseract.image_to_string(image)

# 复杂验证码
# 1. 使用打码平台（需付费）
# 2. 训练机器学习模型
# 3. 人工处理
# 4. 寻找绕过验证码的方式（如 API）
```

### 6. 频率限制

**检测方式**：限制请求频率

**应对方法**：

```python
import time
import random

# 固定延时
for url in urls:
    response = requests.get(url)
    time.sleep(2)  # 延时2秒

# 随机延时
for url in urls:
    response = requests.get(url)
    time.sleep(random.uniform(1, 3))
```

### 7. JavaScript 反爬

**检测方式**：检测 webdriver 属性

**应对方法**：

```python
from selenium import webdriver

options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-automation'])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument('--disable-blink-features=AutomationControlled')

driver = webdriver.Chrome(options=options)

# 修改 navigator.webdriver
driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
    'source': '''
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        })
    '''
})
```

## 最佳实践

### 1. 遵守 robots.txt

```python
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url('https://example.com/robots.txt')
rp.read()

# 检查是否允许爬取
if rp.can_fetch('*', 'https://example.com/page'):
    # 可以爬取
    pass
else:
    # 禁止爬取
    pass
```

### 2. 控制请求频率

```python
import time
from datetime import datetime, timedelta

class RateLimiter:
    def __init__(self, max_requests, time_window):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
    
    def wait_if_needed(self):
        now = datetime.now()
        # 清除过期记录
        self.requests = [t for t in self.requests 
                        if now - t < timedelta(seconds=self.time_window)]
        
        if len(self.requests) >= self.max_requests:
            sleep_time = self.time_window - (now - self.requests[0]).total_seconds()
            if sleep_time > 0:
                time.sleep(sleep_time)
        
        self.requests.append(now)

# 使用：每10秒最多5个请求
limiter = RateLimiter(max_requests=5, time_window=10)

for url in urls:
    limiter.wait_if_needed()
    response = requests.get(url)
```

### 3. 异常处理与重试

```python
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# 使用
response = requests_retry_session().get('https://example.com')
```

### 4. 使用缓存

```python
import requests_cache

# 安装缓存
requests_cache.install_cache('http_cache', expire_after=3600)

# 之后的请求会自动缓存
response = requests.get('https://example.com')

# 清除缓存
requests_cache.clear()
```

## 法律与道德

::: danger 重要提示
1. **遵守法律法规** - 不爬取违法内容，不侵犯隐私
2. **尊重 robots.txt** - 遵守网站的爬虫协议
3. **合理频率** - 不对服务器造成负担
4. **版权意识** - 尊重数据版权，注明来源
5. **商业使用** - 商业用途需获得授权
6. **个人信息保护** - 不爬取和传播个人隐私信息
:::

## 易错点

::: warning 常见错误
1. **过度爬取** - 频率过高导致 IP 被封
2. **忽视 robots.txt** - 违反网站规则
3. **数据泄露** - 代理或日志泄露敏感信息
4. **版权侵犯** - 未经授权商业使用数据
5. **不当存储** - 明文存储敏感信息
:::

## 参考资源

- [robots.txt 协议](https://www.robotstxt.org/)
- [反爬虫技术总结](https://github.com/topics/anti-scraping)
