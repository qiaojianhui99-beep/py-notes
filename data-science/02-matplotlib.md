# Matplotlib 数据可视化

Matplotlib 是 Python 最流行的数据可视化库，提供丰富的图表类型和定制选项。

## 基础绘图

### 折线图

```python
import matplotlib.pyplot as plt
import numpy as np

# 基础折线图
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.title('正弦函数')
plt.grid(True)
plt.show()

# 多条线
y1 = np.sin(x)
y2 = np.cos(x)

plt.plot(x, y1, label='sin(x)', color='blue', linestyle='-', linewidth=2)
plt.plot(x, y2, label='cos(x)', color='red', linestyle='--', linewidth=2)
plt.legend()
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.title('三角函数')
plt.show()
```

### 散点图

```python
# 基础散点图
x = np.random.randn(100)
y = np.random.randn(100)
colors = np.random.rand(100)
sizes = 1000 * np.random.rand(100)

plt.scatter(x, y, c=colors, s=sizes, alpha=0.5, cmap='viridis')
plt.colorbar()  # 显示颜色条
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.title('散点图示例')
plt.show()
```

### 柱状图

```python
# 基础柱状图
categories = ['A', 'B', 'C', 'D', 'E']
values = [23, 45, 56, 78, 32]

plt.bar(categories, values, color='skyblue', edgecolor='navy')
plt.xlabel('类别')
plt.ylabel('数值')
plt.title('柱状图')
plt.show()

# 分组柱状图
x = np.arange(len(categories))
values1 = [23, 45, 56, 78, 32]
values2 = [34, 55, 43, 65, 48]
width = 0.35

plt.bar(x - width/2, values1, width, label='组1', color='skyblue')
plt.bar(x + width/2, values2, width, label='组2', color='lightcoral')
plt.xlabel('类别')
plt.ylabel('数值')
plt.title('分组柱状图')
plt.xticks(x, categories)
plt.legend()
plt.show()

# 水平柱状图
plt.barh(categories, values, color='lightgreen', edgecolor='darkgreen')
plt.xlabel('数值')
plt.ylabel('类别')
plt.title('水平柱状图')
plt.show()
```

### 饼图

```python
# 基础饼图
sizes = [30, 25, 20, 15, 10]
labels = ['A', 'B', 'C', 'D', 'E']
colors = ['gold', 'lightcoral', 'lightskyblue', 'lightgreen', 'plum']
explode = (0.1, 0, 0, 0, 0)  # 突出第一块

plt.pie(sizes, explode=explode, labels=labels, colors=colors,
        autopct='%1.1f%%', shadow=True, startangle=90)
plt.axis('equal')  # 确保饼图是圆形
plt.title('饼图示例')
plt.show()
```

### 直方图

```python
# 数据分布直方图
data = np.random.randn(1000)

plt.hist(data, bins=30, color='skyblue', edgecolor='black', alpha=0.7)
plt.xlabel('值')
plt.ylabel('频数')
plt.title('正态分布直方图')
plt.grid(True, alpha=0.3)
plt.show()

# 多组数据对比
data1 = np.random.normal(0, 1, 1000)
data2 = np.random.normal(2, 1.5, 1000)

plt.hist(data1, bins=30, alpha=0.5, label='数据1', color='blue')
plt.hist(data2, bins=30, alpha=0.5, label='数据2', color='red')
plt.legend()
plt.xlabel('值')
plt.ylabel('频数')
plt.title('多组数据分布对比')
plt.show()
```

## 子图布局

### 基础子图

```python
# 2x2 子图布局
fig, axs = plt.subplots(2, 2, figsize=(10, 8))

# 子图1：折线图
x = np.linspace(0, 10, 100)
axs[0, 0].plot(x, np.sin(x))
axs[0, 0].set_title('正弦函数')
axs[0, 0].grid(True)

# 子图2：散点图
axs[0, 1].scatter(np.random.randn(50), np.random.randn(50))
axs[0, 1].set_title('散点图')
axs[0, 1].grid(True)

# 子图3：柱状图
axs[1, 0].bar(['A', 'B', 'C'], [10, 20, 15])
axs[1, 0].set_title('柱状图')

# 子图4：直方图
axs[1, 1].hist(np.random.randn(1000), bins=30)
axs[1, 1].set_title('直方图')

plt.tight_layout()  # 自动调整子图间距
plt.show()
```

### 不规则子图布局

```python
# GridSpec 自定义布局
from matplotlib.gridspec import GridSpec

fig = plt.figure(figsize=(10, 8))
gs = GridSpec(3, 3, figure=fig)

# 大图占据前两行
ax1 = fig.add_subplot(gs[0:2, :])
ax1.plot(np.random.randn(100).cumsum())
ax1.set_title('主图')

# 下方三个小图
ax2 = fig.add_subplot(gs[2, 0])
ax2.hist(np.random.randn(100), bins=20)

ax3 = fig.add_subplot(gs[2, 1])
ax3.scatter(np.random.randn(50), np.random.randn(50))

ax4 = fig.add_subplot(gs[2, 2])
ax4.bar(['A', 'B', 'C'], [10, 20, 15])

plt.tight_layout()
plt.show()
```

## 样式定制

### 颜色和线型

```python
# 线型和标记
x = np.linspace(0, 10, 20)

plt.figure(figsize=(10, 6))
plt.plot(x, x, 'r-', label='实线')        # 红色实线
plt.plot(x, x+1, 'g--', label='虚线')     # 绿色虚线
plt.plot(x, x+2, 'b-.', label='点划线')   # 蓝色点划线
plt.plot(x, x+3, 'c:', label='点线')      # 青色点线
plt.plot(x, x+4, 'mo-', label='圆圈标记') # 洋红色带圆圈
plt.plot(x, x+5, 'ks-', label='方块标记') # 黑色带方块
plt.plot(x, x+6, 'y^-', label='三角标记') # 黄色带三角

plt.legend()
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.title('线型和标记样式')
plt.grid(True, alpha=0.3)
plt.show()
```

### 主题样式

```python
# 使用内置样式
print(plt.style.available)  # 查看所有可用样式

# 应用样式
plt.style.use('seaborn-v0_8-darkgrid')
# 或其他样式: 'ggplot', 'fivethirtyeight', 'bmh', 'dark_background'

x = np.linspace(0, 10, 100)
plt.figure(figsize=(10, 6))
plt.plot(x, np.sin(x), label='sin(x)')
plt.plot(x, np.cos(x), label='cos(x)')
plt.legend()
plt.title('使用样式主题')
plt.show()

# 恢复默认样式
plt.style.use('default')
```

### 字体和标签

```python
# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']  # 黑体
plt.rcParams['axes.unicode_minus'] = False    # 解决负号显示问题

# 或者使用参数
fig, ax = plt.subplots(figsize=(10, 6))
x = np.linspace(0, 10, 100)
ax.plot(x, np.sin(x))

ax.set_xlabel('时间', fontsize=14, fontweight='bold')
ax.set_ylabel('振幅', fontsize=14, fontweight='bold')
ax.set_title('正弦波形图', fontsize=16, fontweight='bold', pad=20)

# 添加文本注释
ax.text(5, 0.5, '峰值区域', fontsize=12, 
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

# 添加箭头注释
ax.annotate('最大值', xy=(np.pi/2, 1), xytext=(np.pi/2, 1.3),
            arrowprops=dict(arrowstyle='->', color='red'),
            fontsize=12, color='red')

plt.show()
```

## 高级图表

### 箱线图

```python
# 箱线图
data = [np.random.normal(0, std, 100) for std in range(1, 4)]

plt.figure(figsize=(10, 6))
plt.boxplot(data, labels=['组1', '组2', '组3'], 
            showmeans=True, meanline=True)
plt.ylabel('数值')
plt.title('箱线图')
plt.grid(True, alpha=0.3)
plt.show()
```

### 热力图

```python
# 热力图
data = np.random.rand(10, 10)

plt.figure(figsize=(8, 6))
plt.imshow(data, cmap='hot', interpolation='nearest')
plt.colorbar(label='数值')
plt.title('热力图')
plt.xlabel('X轴')
plt.ylabel('Y轴')
plt.show()
```

### 等高线图

```python
# 等高线图
x = np.linspace(-3, 3, 100)
y = np.linspace(-3, 3, 100)
X, Y = np.meshgrid(x, y)
Z = np.sqrt(X**2 + Y**2)

plt.figure(figsize=(10, 8))
contour = plt.contour(X, Y, Z, levels=10, cmap='viridis')
plt.clabel(contour, inline=True, fontsize=10)
plt.colorbar(label='高度')
plt.title('等高线图')
plt.xlabel('X')
plt.ylabel('Y')
plt.show()

# 填充等高线
plt.figure(figsize=(10, 8))
plt.contourf(X, Y, Z, levels=20, cmap='viridis')
plt.colorbar(label='高度')
plt.title('填充等高线图')
plt.show()
```

### 3D 图表

```python
from mpl_toolkits.mplot3d import Axes3D

# 3D 散点图
fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')

x = np.random.randn(100)
y = np.random.randn(100)
z = np.random.randn(100)
colors = np.random.rand(100)

ax.scatter(x, y, z, c=colors, cmap='viridis', s=50)
ax.set_xlabel('X轴')
ax.set_ylabel('Y轴')
ax.set_zlabel('Z轴')
ax.set_title('3D 散点图')
plt.show()

# 3D 曲面图
fig = plt.figure(figsize=(12, 8))
ax = fig.add_subplot(111, projection='3d')

x = np.linspace(-5, 5, 50)
y = np.linspace(-5, 5, 50)
X, Y = np.meshgrid(x, y)
Z = np.sin(np.sqrt(X**2 + Y**2))

surf = ax.plot_surface(X, Y, Z, cmap='viridis', alpha=0.8)
fig.colorbar(surf, shrink=0.5, aspect=5)
ax.set_xlabel('X轴')
ax.set_ylabel('Y轴')
ax.set_zlabel('Z轴')
ax.set_title('3D 曲面图')
plt.show()
```

## 保存图表

```python
# 保存为不同格式
fig, ax = plt.subplots(figsize=(10, 6))
x = np.linspace(0, 10, 100)
ax.plot(x, np.sin(x))
ax.set_title('示例图表')

# 保存为 PNG（默认 DPI=100）
plt.savefig('plot.png', dpi=300, bbox_inches='tight')

# 保存为 PDF（矢量图）
plt.savefig('plot.pdf', bbox_inches='tight')

# 保存为 SVG
plt.savefig('plot.svg', bbox_inches='tight')

# 保存为 JPG
plt.savefig('plot.jpg', dpi=300, bbox_inches='tight', quality=95)

plt.close()  # 关闭图形，释放内存
```

## 实战案例

### 股票数据可视化

```python
import pandas as pd
import matplotlib.dates as mdates

# 模拟股票数据
dates = pd.date_range('2024-01-01', periods=100)
prices = 100 + np.cumsum(np.random.randn(100))
volume = np.random.randint(1000, 5000, 100)

fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8), 
                                gridspec_kw={'height_ratios': [3, 1]})

# 价格走势
ax1.plot(dates, prices, color='blue', linewidth=1.5)
ax1.fill_between(dates, prices, alpha=0.3)
ax1.set_ylabel('价格', fontsize=12)
ax1.set_title('股票价格与成交量', fontsize=14, fontweight='bold')
ax1.grid(True, alpha=0.3)
ax1.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))

# 成交量
ax2.bar(dates, volume, width=1, color='gray', alpha=0.5)
ax2.set_ylabel('成交量', fontsize=12)
ax2.set_xlabel('日期', fontsize=12)
ax2.grid(True, alpha=0.3)
ax2.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))

plt.tight_layout()
plt.show()
```

### 数据分布分析

```python
# 多维度数据分析
np.random.seed(42)
data = {
    'A': np.random.normal(100, 15, 1000),
    'B': np.random.normal(120, 20, 1000),
    'C': np.random.normal(90, 10, 1000),
    'D': np.random.normal(110, 25, 1000)
}

fig, axs = plt.subplots(2, 2, figsize=(12, 10))

# 直方图
for i, (key, values) in enumerate(data.items()):
    row = i // 2
    col = i % 2
    axs[row, col].hist(values, bins=30, alpha=0.7, edgecolor='black')
    axs[row, col].set_title(f'组 {key} 分布', fontweight='bold')
    axs[row, col].set_xlabel('值')
    axs[row, col].set_ylabel('频数')
    axs[row, col].axvline(np.mean(values), color='red', 
                          linestyle='--', label=f'均值: {np.mean(values):.1f}')
    axs[row, col].legend()
    axs[row, col].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 箱线图对比
plt.figure(figsize=(10, 6))
plt.boxplot(data.values(), labels=data.keys(), showmeans=True)
plt.ylabel('数值')
plt.title('各组数据分布对比', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.show()
```

## 常见问题

### 中文显示乱码

```python
# 方法1：设置字体
plt.rcParams['font.sans-serif'] = ['SimHei']  # Windows
# plt.rcParams['font.sans-serif'] = ['Arial Unicode MS']  # macOS
plt.rcParams['axes.unicode_minus'] = False

# 方法2：使用字体管理器
from matplotlib.font_manager import FontProperties
font = FontProperties(fname='/path/to/font.ttf')
plt.title('中文标题', fontproperties=font)
```

### 图表重叠

```python
# 使用 tight_layout 自动调整
plt.tight_layout()

# 或手动调整
plt.subplots_adjust(left=0.1, right=0.9, top=0.9, bottom=0.1, 
                    hspace=0.3, wspace=0.3)
```

### 内存占用

```python
# 及时关闭图形
plt.close()       # 关闭当前图形
plt.close('all')  # 关闭所有图形

# 在循环中绘图
for i in range(100):
    plt.figure()
    plt.plot([1, 2, 3])
    plt.savefig(f'plot_{i}.png')
    plt.close()  # 重要！避免内存泄漏
```

## 易错点

::: warning 常见错误
1. **忘记调用 `plt.show()`** - 不显示图表（Jupyter 中可自动显示）
2. **多次绘图叠加** - 未使用 `plt.figure()` 或 `plt.clf()` 清除画布
3. **中文乱码** - 未设置中文字体
4. **坐标轴范围不当** - 使用 `plt.xlim()` 和 `plt.ylim()` 调整
5. **图例位置遮挡数据** - 使用 `plt.legend(loc='best')` 自动调整
6. **子图布局混乱** - 使用 `plt.tight_layout()` 优化
7. **保存图片时被裁剪** - 使用 `bbox_inches='tight'` 参数
:::

## 自我检验

1. 如何创建包含 4 个子图的 2×2 布局？
2. 如何在同一图表中绘制多条不同颜色和线型的曲线？
3. 如何设置图表标题、坐标轴标签和图例？
4. 如何保存高分辨率的 PNG 图片？
5. 如何解决 Matplotlib 中文显示乱码问题？
6. 3D 图表需要导入哪个模块？
7. 如何创建带有颜色映射的散点图？

## 练习题

1. 绘制一个包含正弦和余弦函数的折线图，添加图例和网格
2. 使用随机数据创建一个散点图，点的大小和颜色根据数据值变化
3. 创建 2×2 子图布局，分别展示折线图、散点图、柱状图和直方图
4. 绘制一个饼图，展示不同类别的占比，突出显示最大的部分
5. 使用热力图可视化一个 10×10 的随机矩阵
6. 创建一个 3D 曲面图，展示 `z = sin(sqrt(x^2 + y^2))` 函数

## 参考资源

- [Matplotlib 官方文档](https://matplotlib.org/stable/contents.html)
- [Matplotlib 图表画廊](https://matplotlib.org/stable/gallery/index.html)
- [Matplotlib 教程](https://matplotlib.org/stable/tutorials/index.html)
