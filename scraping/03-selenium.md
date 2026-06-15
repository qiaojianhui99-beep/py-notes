# Selenium 动态网页爬取

Selenium 是自动化测试工具，也是爬取动态网页（JavaScript 渲染）的利器。

## 安装与配置

### 安装 Selenium

```bash
# 安装 Selenium
pip install selenium

# 安装 WebDriver Manager（自动管理驱动）
pip install webdriver-manager
```

### 浏览器驱动

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# 方法1：自动管理驱动（推荐）
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

# 方法2：手动指定驱动路径
# driver = webdriver.Chrome(executable_path='/path/to/chromedriver')

# 其他浏览器
# driver = webdriver.Firefox()
# driver = webdriver.Edge()
# driver = webdriver.Safari()
```

## 基础操作

### 页面导航

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# 初始化浏览器
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

try:
    # 访问网页
    driver.get('https://www.example.com')
    
    # 获取当前 URL
    current_url = driver.current_url
    print(f"当前 URL: {current_url}")
    
    # 获取标题
    title = driver.title
    print(f"页面标题: {title}")
    
    # 获取页面源码
    page_source = driver.page_source
    
    # 前进/后退
    driver.back()
    driver.forward()
    
    # 刷新页面
    driver.refresh()
    
finally:
    # 关闭浏览器
    driver.quit()
```

### 元素定位

```python
from selenium.webdriver.common.by import By

# 单个元素
element = driver.find_element(By.ID, 'element_id')
element = driver.find_element(By.NAME, 'element_name')
element = driver.find_element(By.CLASS_NAME, 'class_name')
element = driver.find_element(By.TAG_NAME, 'div')
element = driver.find_element(By.LINK_TEXT, '链接文本')
element = driver.find_element(By.PARTIAL_LINK_TEXT, '部分文本')
element = driver.find_element(By.CSS_SELECTOR, 'div.class > p')
element = driver.find_element(By.XPATH, '//div[@id="content"]//p')

# 多个元素
elements = driver.find_elements(By.CLASS_NAME, 'item')
elements = driver.find_elements(By.TAG_NAME, 'a')
elements = driver.find_elements(By.CSS_SELECTOR, 'div.list > div.item')
```

### 元素交互

```python
from selenium.webdriver.common.keys import Keys

# 点击
element.click()

# 输入文本
input_box = driver.find_element(By.NAME, 'q')
input_box.send_keys('Selenium Python')

# 清空输入
input_box.clear()

# 提交表单
input_box.submit()

# 模拟键盘
input_box.send_keys(Keys.RETURN)  # 回车
input_box.send_keys(Keys.CONTROL, 'a')  # Ctrl+A
input_box.send_keys(Keys.BACKSPACE)  # 退格

# 获取文本
text = element.text

# 获取属性
value = element.get_attribute('value')
href = element.get_attribute('href')

# 判断状态
is_displayed = element.is_displayed()
is_enabled = element.is_enabled()
is_selected = element.is_selected()
```

## 等待机制

### 显式等待

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

driver.get('https://example.com')

# 等待元素出现（最多10秒）
element = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, 'myElement'))
)

# 等待元素可点击
element = WebDriverWait(driver, 10).until(
    EC.element_to_be_clickable((By.ID, 'button'))
)

# 等待元素可见
element = WebDriverWait(driver, 10).until(
    EC.visibility_of_element_located((By.CLASS_NAME, 'content'))
)

# 等待标题包含特定文本
WebDriverWait(driver, 10).until(
    EC.title_contains('Expected Title')
)

# 等待 URL 变化
WebDriverWait(driver, 10).until(
    EC.url_to_be('https://expected-url.com')
)

# 等待 frame 可用并切换
WebDriverWait(driver, 10).until(
    EC.frame_to_be_available_and_switch_to_it((By.ID, 'iframe'))
)
```

### 隐式等待

```python
# 全局隐式等待（不推荐与显式等待混用）
driver.implicitly_wait(10)  # 10秒

# 之后所有元素查找都会等待最多10秒
element = driver.find_element(By.ID, 'element')
```

### 自定义等待

```python
import time

# 简单延时
time.sleep(2)

# 自定义等待条件
def element_has_text(locator, text):
    def _predicate(driver):
        element = driver.find_element(*locator)
        return text in element.text
    return _predicate

WebDriverWait(driver, 10).until(
    element_has_text((By.ID, 'result'), 'Success')
)
```

## 高级操作

### 下拉框处理

```python
from selenium.webdriver.support.ui import Select

# 定位下拉框
select_element = driver.find_element(By.ID, 'dropdown')
select = Select(select_element)

# 选择选项
select.select_by_index(1)  # 按索引
select.select_by_value('value')  # 按值
select.select_by_visible_text('显示文本')  # 按文本

# 获取选项
all_options = select.options
selected_option = select.first_selected_option

# 取消选择（多选框）
select.deselect_all()
select.deselect_by_index(1)
```

### 弹窗处理

```python
# Alert 警告框
alert = driver.switch_to.alert
alert_text = alert.text
alert.accept()  # 确定
alert.dismiss()  # 取消

# Confirm 确认框
confirm = driver.switch_to.alert
confirm.accept()  # 确定
confirm.dismiss()  # 取消

# Prompt 输入框
prompt = driver.switch_to.alert
prompt.send_keys('输入内容')
prompt.accept()
```

### iframe 切换

```python
# 切换到 iframe
driver.switch_to.frame('iframe_name')  # 按名称
driver.switch_to.frame(0)  # 按索引
driver.switch_to.frame(iframe_element)  # 按元素

# 切回主文档
driver.switch_to.default_content()

# 切到父 frame
driver.switch_to.parent_frame()
```

### 窗口/标签页切换

```python
# 获取当前窗口句柄
current_window = driver.current_window_handle

# 获取所有窗口句柄
all_windows = driver.window_handles

# 打开新标签页
driver.execute_script("window.open('https://example.com')")

# 切换到新窗口
driver.switch_to.window(all_windows[1])

# 切回原窗口
driver.switch_to.window(current_window)

# 关闭当前窗口
driver.close()
```

### 执行 JavaScript

```python
# 执行 JS 代码
driver.execute_script("alert('Hello World')")

# 滚动页面
driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")

# 滚动到元素
element = driver.find_element(By.ID, 'bottom')
driver.execute_script("arguments[0].scrollIntoView();", element)

# 修改元素属性
driver.execute_script("arguments[0].setAttribute('value', 'new value')", element)

# 获取返回值
result = driver.execute_script("return document.title")
```

### 鼠标操作

```python
from selenium.webdriver.common.action_chains import ActionChains

# 创建 ActionChains 对象
actions = ActionChains(driver)

# 鼠标悬停
element = driver.find_element(By.ID, 'hover')
actions.move_to_element(element).perform()

# 拖拽
source = driver.find_element(By.ID, 'draggable')
target = driver.find_element(By.ID, 'droppable')
actions.drag_and_drop(source, target).perform()

# 右键点击
actions.context_click(element).perform()

# 双击
actions.double_click(element).perform()

# 链式操作
actions.move_to_element(element).click().perform()
```

### 截图

```python
# 截取整个页面
driver.save_screenshot('screenshot.png')

# 截取特定元素
element = driver.find_element(By.ID, 'content')
element.screenshot('element.png')

# 获取 base64 编码
screenshot_base64 = driver.get_screenshot_as_base64()
```

## 无头模式

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Chrome 无头模式
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--window-size=1920,1080')

driver = webdriver.Chrome(options=chrome_options)

# Firefox 无头模式
from selenium.webdriver.firefox.options import Options as FirefoxOptions
firefox_options = FirefoxOptions()
firefox_options.add_argument('--headless')
driver = webdriver.Firefox(options=firefox_options)
```

## 反检测配置

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

options = Options()

# 禁用自动化控制提示
options.add_experimental_option('excludeSwitches', ['enable-automation'])
options.add_experimental_option('useAutomationExtension', False)

# 禁用 Blink 特性
options.add_argument('--disable-blink-features=AutomationControlled')

# 设置 User-Agent
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

# 禁用图片加载（加速）
prefs = {'profile.managed_default_content_settings.images': 2}
options.add_experimental_option('prefs', prefs)

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# 修改 webdriver 属性
driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
    'source': '''
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        })
    '''
})
```

## 实战案例

### 自动登录

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def auto_login(username, password):
    driver = webdriver.Chrome()
    
    try:
        # 访问登录页面
        driver.get('https://example.com/login')
        
        # 等待页面加载
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, 'username'))
        )
        
        # 输入用户名和密码
        driver.find_element(By.ID, 'username').send_keys(username)
        driver.find_element(By.ID, 'password').send_keys(password)
        
        # 点击登录按钮
        driver.find_element(By.ID, 'login-button').click()
        
        # 等待登录成功
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'user-profile'))
        )
        
        print("登录成功！")
        
        # 获取 cookies
        cookies = driver.get_cookies()
        print("Cookies:", cookies)
        
        time.sleep(3)
        
    finally:
        driver.quit()

auto_login('your_username', 'your_password')
```

### 无限滚动加载

```python
from selenium import webdriver
import time

driver = webdriver.Chrome()
driver.get('https://example.com/infinite-scroll')

# 获取初始高度
last_height = driver.execute_script("return document.body.scrollHeight")

while True:
    # 滚动到底部
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    
    # 等待加载
    time.sleep(2)
    
    # 计算新高度
    new_height = driver.execute_script("return document.body.scrollHeight")
    
    # 判断是否到底
    if new_height == last_height:
        break
    
    last_height = new_height

# 提取数据
items = driver.find_elements(By.CLASS_NAME, 'item')
print(f"加载了 {len(items)} 个项目")

driver.quit()
```

### 爬取动态表格

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd

def scrape_dynamic_table(url):
    driver = webdriver.Chrome()
    driver.get(url)
    
    # 等待表格加载
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, 'table'))
    )
    
    # 提取表头
    headers = []
    for th in driver.find_elements(By.CSS_SELECTOR, 'table thead th'):
        headers.append(th.text)
    
    # 提取数据行
    rows_data = []
    rows = driver.find_elements(By.CSS_SELECTOR, 'table tbody tr')
    
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, 'td')
        row_data = [col.text for col in cols]
        rows_data.append(row_data)
    
    driver.quit()
    
    # 创建 DataFrame
    df = pd.DataFrame(rows_data, columns=headers)
    return df

# 使用
df = scrape_dynamic_table('https://example.com/table')
print(df.head())
df.to_csv('table_data.csv', index=False)
```

### 处理验证码

```python
# 注意：自动识别验证码可能违反网站服务条款

from selenium import webdriver
from PIL import Image
import time

driver = webdriver.Chrome()
driver.get('https://example.com/captcha')

# 截图
driver.save_screenshot('page.png')

# 定位验证码元素
captcha = driver.find_element(By.ID, 'captcha')

# 获取验证码位置和大小
location = captcha.location
size = captcha.size

# 裁剪验证码图片
image = Image.open('page.png')
left = location['x']
top = location['y']
right = location['x'] + size['width']
bottom = location['y'] + size['height']

captcha_img = image.crop((left, top, right, bottom))
captcha_img.save('captcha.png')

# 这里可以使用 OCR 识别验证码
# import pytesseract
# captcha_text = pytesseract.image_to_string(captcha_img)

# 输入验证码
# driver.find_element(By.ID, 'captcha-input').send_keys(captcha_text)

driver.quit()
```

## 性能优化

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()

# 无头模式
options.add_argument('--headless')

# 禁用图片
prefs = {'profile.managed_default_content_settings.images': 2}
options.add_experimental_option('prefs', prefs)

# 禁用 CSS
prefs['profile.managed_default_content_settings.stylesheets'] = 2
options.add_experimental_option('prefs', prefs)

# 禁用 JavaScript（谨慎使用）
# options.add_experimental_option('prefs', {'profile.managed_default_content_settings.javascript': 2})

# 禁用扩展
options.add_argument('--disable-extensions')

# 禁用日志
options.add_argument('--log-level=3')

# 设置页面加载策略
options.page_load_strategy = 'eager'  # normal, eager, none

driver = webdriver.Chrome(options=options)
```

## 易错点

::: warning 常见错误
1. **未等待元素加载** - 使用显式等待而非 time.sleep()
2. **忘记关闭浏览器** - 使用 try-finally 或 with 语句
3. **元素过时异常** - 重新定位元素
4. **frame 未切换** - 操作 iframe 内元素前需切换
5. **窗口句柄错误** - 切换窗口时使用正确的句柄
6. **Driver 版本不匹配** - 使用 webdriver-manager 自动管理
7. **反爬检测** - 配置反检测参数
:::

## 自我检验

1. Selenium 的主要应用场景是什么？
2. 如何等待动态加载的元素？
3. 显式等待和隐式等待有什么区别？
4. 如何处理 iframe 中的元素？
5. 如何执行 JavaScript 代码？
6. 无头模式有什么优势？
7. 如何提高 Selenium 的爬取效率？

## 练习题

1. 使用 Selenium 自动搜索并提取百度搜索结果
2. 爬取需要登录的网站数据
3. 处理无限滚动加载的页面
4. 自动填写并提交表单
5. 处理弹出窗口和 iframe
6. 截取网页完整截图
7. 结合 BeautifulSoup 解析动态网页

## 参考资源

- [Selenium 官方文档](https://www.selenium.dev/documentation/)
- [Selenium Python 文档](https://selenium-python.readthedocs.io/)
- [WebDriver Manager](https://github.com/SergeyPirogov/webdriver_manager)
