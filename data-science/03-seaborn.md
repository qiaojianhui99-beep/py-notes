# Seaborn 高级可视化

Seaborn 基于 Matplotlib 构建，提供更高级的统计图表和更美观的默认样式。

## 基础配置

```python
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

# 设置样式
sns.set_theme()  # 使用 Seaborn 默认主题
# 或指定具体样式
sns.set_style("whitegrid")  # whitegrid, darkgrid, white, dark, ticks

# 设置调色板
sns.set_palette("husl")  # husl, Set2, Paired, etc.

# 设置上下文（字体大小）
sns.set_context("notebook")  # paper, notebook, talk, poster
```

## 分布图

### 直方图与密度图

```python
# 加载示例数据
tips = sns.load_dataset('tips')

# 直方图
plt.figure(figsize=(10, 6))
sns.histplot(data=tips, x='total_bill', bins=30, kde=True)
plt.title('账单总额分布')
plt.show()

# 密度图（KDE）
plt.figure(figsize=(10, 6))
sns.kdeplot(data=tips, x='total_bill', fill=True, alpha=0.5)
plt.title('账单总额密度图')
plt.show()

# 多组对比
plt.figure(figsize=(10, 6))
sns.kdeplot(data=tips, x='total_bill', hue='time', fill=True, alpha=0.5)
plt.title('不同时段账单分布对比')
plt.show()
```

### 分布图组合

```python
# displot：直方图 + KDE
sns.displot(data=tips, x='total_bill', kde=True, height=6, aspect=1.5)
plt.show()

# 分组分布
sns.displot(data=tips, x='total_bill', hue='sex', kind='kde', 
            height=6, aspect=1.5)
plt.show()

# 堆叠直方图
sns.displot(data=tips, x='total_bill', hue='time', multiple='stack',
            height=6, aspect=1.5)
plt.show()
```

### 联合分布图

```python
# 散点图 + 边缘分布
sns.jointplot(data=tips, x='total_bill', y='tip', height=8)
plt.show()

# 六边形密度图
sns.jointplot(data=tips, x='total_bill', y='tip', kind='hex', height=8)
plt.show()

# KDE 密度图
sns.jointplot(data=tips, x='total_bill', y='tip', kind='kde', height=8)
plt.show()

# 回归图
sns.jointplot(data=tips, x='total_bill', y='tip', kind='reg', height=8)
plt.show()
```

## 分类图

### 条形图与计数图

```python
# 条形图
plt.figure(figsize=(10, 6))
sns.barplot(data=tips, x='day', y='total_bill', hue='sex')
plt.title('不同日期的平均账单')
plt.show()

# 计数图
plt.figure(figsize=(10, 6))
sns.countplot(data=tips, x='day', hue='sex')
plt.title('不同日期的用餐人数')
plt.show()
```

### 箱线图与小提琴图

```python
# 箱线图
plt.figure(figsize=(10, 6))
sns.boxplot(data=tips, x='day', y='total_bill', hue='time')
plt.title('不同日期账单分布')
plt.show()

# 小提琴图（箱线图 + 密度图）
plt.figure(figsize=(10, 6))
sns.violinplot(data=tips, x='day', y='total_bill', hue='sex', split=True)
plt.title('小提琴图')
plt.show()

# 箱线图 + 散点
plt.figure(figsize=(10, 6))
sns.boxplot(data=tips, x='day', y='total_bill', color='lightblue')
sns.swarmplot(data=tips, x='day', y='total_bill', color='black', alpha=0.5)
plt.title('箱线图 + 散点')
plt.show()
```

### 点图与条形图

```python
# 点图（显示置信区间）
plt.figure(figsize=(10, 6))
sns.pointplot(data=tips, x='day', y='total_bill', hue='sex')
plt.title('点图（带置信区间）')
plt.show()

# 分类散点图
plt.figure(figsize=(10, 6))
sns.stripplot(data=tips, x='day', y='total_bill', hue='sex', dodge=True)
plt.title('分类散点图')
plt.show()

# 蜂群图（避免重叠）
plt.figure(figsize=(10, 6))
sns.swarmplot(data=tips, x='day', y='total_bill', hue='sex', dodge=True)
plt.title('蜂群图')
plt.show()
```

## 关系图

### 散点图

```python
# 基础散点图
plt.figure(figsize=(10, 6))
sns.scatterplot(data=tips, x='total_bill', y='tip', 
                hue='time', size='size', style='sex')
plt.title('多维度散点图')
plt.show()

# 回归散点图
plt.figure(figsize=(10, 6))
sns.regplot(data=tips, x='total_bill', y='tip')
plt.title('回归散点图')
plt.show()

# 多项式回归
plt.figure(figsize=(10, 6))
sns.regplot(data=tips, x='total_bill', y='tip', order=2)
plt.title('二次回归')
plt.show()
```

### 折线图

```python
# 生成时间序列数据
flights = sns.load_dataset('flights')

plt.figure(figsize=(12, 6))
sns.lineplot(data=flights, x='year', y='passengers', hue='month')
plt.title('航班乘客数量趋势')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.show()

# 带置信区间的折线图
fmri = sns.load_dataset('fmri')
plt.figure(figsize=(12, 6))
sns.lineplot(data=fmri, x='timepoint', y='signal', hue='event')
plt.title('FMRI 信号（带置信区间）')
plt.show()
```

## 矩阵图

### 热力图

```python
# 相关性矩阵热力图
flights_pivot = flights.pivot(index='month', columns='year', values='passengers')

plt.figure(figsize=(12, 8))
sns.heatmap(flights_pivot, annot=True, fmt='d', cmap='YlGnBu', 
            cbar_kws={'label': '乘客数'})
plt.title('航班乘客数热力图')
plt.show()

# 相关系数矩阵
iris = sns.load_dataset('iris')
corr = iris.corr(numeric_only=True)

plt.figure(figsize=(8, 6))
sns.heatmap(corr, annot=True, fmt='.2f', cmap='coolwarm', 
            square=True, linewidths=1, cbar_kws={'shrink': 0.8})
plt.title('鸢尾花数据集相关系数')
plt.show()
```

### 聚类热力图

```python
# 层次聚类热力图
iris_features = iris.iloc[:, :-1]

sns.clustermap(iris_features.T, cmap='viridis', 
               figsize=(10, 8), standard_scale=1)
plt.show()

# 带分组的聚类
species_colors = iris['species'].map({'setosa': 'red', 
                                       'versicolor': 'green', 
                                       'virginica': 'blue'})
sns.clustermap(iris_features.T, cmap='viridis', 
               col_colors=species_colors,
               figsize=(10, 8), standard_scale=1)
plt.show()
```

## 多变量图

### 配对图

```python
# 配对散点图矩阵
sns.pairplot(iris, hue='species', height=2.5)
plt.show()

# 自定义对角线图表类型
sns.pairplot(iris, hue='species', diag_kind='kde', height=2.5)
plt.show()

# 指定特定列
sns.pairplot(iris, vars=['sepal_length', 'sepal_width'], 
             hue='species', height=3)
plt.show()
```

### 分面图

```python
# FacetGrid：按类别分面
g = sns.FacetGrid(tips, col='time', row='sex', height=4)
g.map(sns.histplot, 'total_bill')
plt.show()

# 分面散点图
g = sns.FacetGrid(tips, col='day', hue='sex', height=4)
g.map(sns.scatterplot, 'total_bill', 'tip', alpha=0.7)
g.add_legend()
plt.show()

# 分面小提琴图
g = sns.FacetGrid(tips, col='time', col_wrap=2, height=4)
g.map(sns.violinplot, 'day', 'total_bill')
plt.show()
```

### PairGrid 自定义

```python
# 完全自定义配对图
g = sns.PairGrid(iris, hue='species', height=2.5)
g.map_upper(sns.scatterplot)
g.map_lower(sns.kdeplot)
g.map_diag(sns.histplot, kde=True)
g.add_legend()
plt.show()
```

## 颜色主题

### 调色板

```python
# 查看调色板
palettes = ['deep', 'muted', 'bright', 'pastel', 'dark', 'colorblind']

fig, axes = plt.subplots(len(palettes), 1, figsize=(10, 12))
for i, palette in enumerate(palettes):
    sns.palplot(sns.color_palette(palette), ax=axes[i])
    axes[i].set_title(palette)
plt.tight_layout()
plt.show()

# 连续色板
fig, axes = plt.subplots(3, 1, figsize=(10, 6))
sns.heatmap([[1, 2, 3, 4, 5]], cmap='viridis', ax=axes[0], cbar=False)
sns.heatmap([[1, 2, 3, 4, 5]], cmap='coolwarm', ax=axes[1], cbar=False)
sns.heatmap([[1, 2, 3, 4, 5]], cmap='YlGnBu', ax=axes[2], cbar=False)
axes[0].set_title('viridis')
axes[1].set_title('coolwarm')
axes[2].set_title('YlGnBu')
plt.tight_layout()
plt.show()
```

### 自定义调色板

```python
# 自定义颜色
custom_palette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
sns.set_palette(custom_palette)

plt.figure(figsize=(10, 6))
sns.barplot(data=tips, x='day', y='total_bill', hue='time')
plt.show()

# 渐变色板
cmap = sns.diverging_palette(250, 10, as_cmap=True)
plt.figure(figsize=(10, 6))
sns.heatmap(flights_pivot, cmap=cmap, center=flights_pivot.mean().mean())
plt.show()
```

## 统计图表

### 回归图

```python
# 简单线性回归
plt.figure(figsize=(10, 6))
sns.lmplot(data=tips, x='total_bill', y='tip', height=6, aspect=1.5)
plt.show()

# 分组回归
sns.lmplot(data=tips, x='total_bill', y='tip', hue='sex', height=6, aspect=1.5)
plt.show()

# 分面回归
sns.lmplot(data=tips, x='total_bill', y='tip', col='day', col_wrap=2, height=4)
plt.show()

# Logistic 回归
titanic = sns.load_dataset('titanic')
sns.lmplot(data=titanic, x='age', y='survived', logistic=True, 
           height=6, aspect=1.5)
plt.show()
```

### 残差图

```python
# 残差图
plt.figure(figsize=(10, 6))
sns.residplot(data=tips, x='total_bill', y='tip', lowess=True)
plt.title('残差图')
plt.show()
```

## 实战案例

### 综合数据分析仪表板

```python
# 创建综合分析图表
fig = plt.figure(figsize=(16, 12))
gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

# 1. 分布直方图
ax1 = fig.add_subplot(gs[0, 0])
sns.histplot(data=tips, x='total_bill', kde=True, ax=ax1)
ax1.set_title('账单分布', fontweight='bold')

# 2. 箱线图
ax2 = fig.add_subplot(gs[0, 1])
sns.boxplot(data=tips, x='day', y='total_bill', ax=ax2)
ax2.set_title('每日账单箱线图', fontweight='bold')

# 3. 小提琴图
ax3 = fig.add_subplot(gs[0, 2])
sns.violinplot(data=tips, x='time', y='total_bill', hue='sex', ax=ax3)
ax3.set_title('小提琴图对比', fontweight='bold')

# 4. 散点图
ax4 = fig.add_subplot(gs[1, :2])
sns.scatterplot(data=tips, x='total_bill', y='tip', 
                hue='time', size='size', ax=ax4)
ax4.set_title('账单与小费关系', fontweight='bold')

# 5. 热力图
ax5 = fig.add_subplot(gs[1, 2])
pivot = tips.pivot_table(values='total_bill', index='day', 
                         columns='time', aggfunc='mean')
sns.heatmap(pivot, annot=True, fmt='.1f', cmap='YlOrRd', ax=ax5)
ax5.set_title('平均账单热力图', fontweight='bold')

# 6. 计数图
ax6 = fig.add_subplot(gs[2, 0])
sns.countplot(data=tips, x='day', hue='sex', ax=ax6)
ax6.set_title('每日用餐人数', fontweight='bold')

# 7. 点图
ax7 = fig.add_subplot(gs[2, 1])
sns.pointplot(data=tips, x='day', y='tip', hue='time', ax=ax7)
ax7.set_title('小费趋势（带置信区间）', fontweight='bold')

# 8. 条形图
ax8 = fig.add_subplot(gs[2, 2])
sns.barplot(data=tips, x='sex', y='total_bill', hue='smoker', ax=ax8)
ax8.set_title('性别与吸烟对账单影响', fontweight='bold')

plt.suptitle('餐厅数据综合分析', fontsize=16, fontweight='bold')
plt.show()
```

### 探索性数据分析

```python
# 加载数据
penguins = sns.load_dataset('penguins')

# 整体分布
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

sns.histplot(data=penguins, x='bill_length_mm', hue='species', 
             kde=True, ax=axes[0, 0])
axes[0, 0].set_title('喙长度分布')

sns.histplot(data=penguins, x='bill_depth_mm', hue='species', 
             kde=True, ax=axes[0, 1])
axes[0, 1].set_title('喙深度分布')

sns.histplot(data=penguins, x='flipper_length_mm', hue='species', 
             kde=True, ax=axes[1, 0])
axes[1, 0].set_title('鳍长度分布')

sns.histplot(data=penguins, x='body_mass_g', hue='species', 
             kde=True, ax=axes[1, 1])
axes[1, 1].set_title('体重分布')

plt.tight_layout()
plt.show()

# 配对关系图
sns.pairplot(penguins, hue='species', height=2.5, 
             diag_kind='kde', plot_kws={'alpha': 0.6})
plt.show()

# 相关性分析
numeric_cols = penguins.select_dtypes(include=[np.number]).columns
corr_matrix = penguins[numeric_cols].corr()

plt.figure(figsize=(8, 6))
sns.heatmap(corr_matrix, annot=True, fmt='.2f', 
            cmap='coolwarm', square=True, linewidths=1)
plt.title('企鹅数据相关性矩阵', fontsize=14, fontweight='bold')
plt.show()
```

## 样式定制

### 主题和上下文

```python
# 不同主题对比
themes = ['darkgrid', 'whitegrid', 'dark', 'white', 'ticks']

fig, axes = plt.subplots(len(themes), 1, figsize=(10, 15))
for i, theme in enumerate(themes):
    sns.set_style(theme)
    sns.lineplot(data=flights, x='year', y='passengers', ax=axes[i])
    axes[i].set_title(f'Theme: {theme}', fontweight='bold')

plt.tight_layout()
sns.set_style('whitegrid')  # 恢复默认
plt.show()

# 上下文对比（字体大小）
contexts = ['paper', 'notebook', 'talk', 'poster']

fig, axes = plt.subplots(2, 2, figsize=(14, 10))
for i, context in enumerate(contexts):
    sns.set_context(context)
    row, col = i // 2, i % 2
    sns.barplot(data=tips, x='day', y='total_bill', ax=axes[row, col])
    axes[row, col].set_title(f'Context: {context}', fontweight='bold')

plt.tight_layout()
sns.set_context('notebook')  # 恢复默认
plt.show()
```

## 常见问题

### 图例位置调整

```python
# 图例移到外部
plt.figure(figsize=(10, 6))
sns.scatterplot(data=tips, x='total_bill', y='tip', hue='day', size='size')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.show()
```

### 中文字体设置

```python
# 配合 Matplotlib 设置中文
import matplotlib as mpl
mpl.rcParams['font.sans-serif'] = ['SimHei']
mpl.rcParams['axes.unicode_minus'] = False

plt.figure(figsize=(10, 6))
sns.barplot(data=tips, x='day', y='total_bill')
plt.xlabel('日期')
plt.ylabel('账单金额')
plt.title('每日账单分析')
plt.show()
```

## 易错点

::: warning 常见错误
1. **data 参数** - Seaborn 推荐使用 `data=df` 格式，而非直接传递数组
2. **hue 分组** - `hue` 参数用于分组，需确保列名存在
3. **调色板设置** - 使用 `sns.set_palette()` 而非 `plt.set_palette()`
4. **FacetGrid 顺序** - 先创建 FacetGrid，再 map 绘图函数
5. **热力图注释** - `annot=True` 显示数值，`fmt` 控制格式
6. **图例重叠** - 使用 `bbox_to_anchor` 移动图例到合适位置
7. **主题不生效** - 需在绘图前调用 `sns.set_theme()` 或 `sns.set_style()`
:::

## 自我检验

1. Seaborn 和 Matplotlib 的关系是什么？
2. 如何创建一个带有边缘分布的散点图？
3. 小提琴图相比箱线图有什么优势？
4. 如何使用 FacetGrid 创建分面图？
5. 如何自定义 Seaborn 的调色板？
6. pairplot 图表适合用于什么场景？
7. 热力图的 annot 和 fmt 参数分别有什么作用？

## 练习题

1. 使用 tips 数据集创建一个配对散点图，按 time 分组
2. 绘制一个小提琴图，展示不同日期的账单分布，按性别分割
3. 创建一个热力图，展示 flights 数据集的月度-年度乘客数
4. 使用 FacetGrid 创建分面直方图，按 day 和 time 分面
5. 绘制一个回归散点图，展示 total_bill 和 tip 的关系，按 time 分组
6. 创建一个包含 4 种不同类型图表的综合分析仪表板

## 参考资源

- [Seaborn 官方文档](https://seaborn.pydata.org/)
- [Seaborn 图表画廊](https://seaborn.pydata.org/examples/index.html)
- [Seaborn 教程](https://seaborn.pydata.org/tutorial.html)
