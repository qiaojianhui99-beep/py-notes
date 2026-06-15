# 数据分析实战案例

通过实际案例学习完整的数据分析流程，从数据获取到结论输出。

## 案例一：电商销售数据分析

### 数据准备

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 设置中文字体
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 生成模拟电商数据
np.random.seed(42)
dates = pd.date_range('2024-01-01', periods=365, freq='D')
n_records = 5000

data = {
    'order_id': range(1, n_records + 1),
    'date': np.random.choice(dates, n_records),
    'category': np.random.choice(['电子产品', '服装', '食品', '家居', '图书'], n_records),
    'product_name': [f'商品{i}' for i in np.random.randint(1, 200, n_records)],
    'quantity': np.random.randint(1, 10, n_records),
    'unit_price': np.random.uniform(10, 500, n_records).round(2),
    'customer_id': np.random.randint(1, 1000, n_records),
    'city': np.random.choice(['北京', '上海', '广州', '深圳', '杭州'], n_records),
    'payment_method': np.random.choice(['支付宝', '微信', '信用卡', '现金'], n_records)
}

df = pd.DataFrame(data)
df['total_amount'] = df['quantity'] * df['unit_price']
df['date'] = pd.to_datetime(df['date'])

print(df.head())
print(f"\n数据规模: {df.shape}")
```

### 数据探索

```python
# 基础统计信息
print("数据概览:")
print(df.info())
print("\n描述性统计:")
print(df.describe())

# 缺失值检查
print("\n缺失值:")
print(df.isnull().sum())

# 数据分布
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 类别分布
df['category'].value_counts().plot(kind='bar', ax=axes[0, 0], color='skyblue')
axes[0, 0].set_title('商品类别分布')
axes[0, 0].set_xlabel('类别')
axes[0, 0].set_ylabel('订单数')

# 城市分布
df['city'].value_counts().plot(kind='pie', ax=axes[0, 1], autopct='%1.1f%%')
axes[0, 1].set_title('城市订单分布')

# 订单金额分布
axes[1, 0].hist(df['total_amount'], bins=50, edgecolor='black')
axes[1, 0].set_title('订单金额分布')
axes[1, 0].set_xlabel('金额')
axes[1, 0].set_ylabel('频数')

# 支付方式
df['payment_method'].value_counts().plot(kind='barh', ax=axes[1, 1], color='lightgreen')
axes[1, 1].set_title('支付方式分布')
axes[1, 1].set_xlabel('订单数')

plt.tight_layout()
plt.show()
```

### 销售分析

```python
# 1. 总体销售指标
total_sales = df['total_amount'].sum()
total_orders = len(df)
avg_order_value = df['total_amount'].mean()
total_customers = df['customer_id'].nunique()

print("=" * 50)
print("总体销售指标")
print("=" * 50)
print(f"总销售额: ¥{total_sales:,.2f}")
print(f"总订单数: {total_orders:,}")
print(f"平均订单金额: ¥{avg_order_value:,.2f}")
print(f"客户总数: {total_customers:,}")
print(f"人均订单数: {total_orders / total_customers:.2f}")

# 2. 时间趋势分析
daily_sales = df.groupby('date').agg({
    'total_amount': 'sum',
    'order_id': 'count'
}).rename(columns={'order_id': 'orders'})

fig, axes = plt.subplots(2, 1, figsize=(14, 10))

# 日销售额趋势
axes[0].plot(daily_sales.index, daily_sales['total_amount'], linewidth=1)
axes[0].set_title('日销售额趋势', fontsize=14, fontweight='bold')
axes[0].set_xlabel('日期')
axes[0].set_ylabel('销售额（元）')
axes[0].grid(True, alpha=0.3)

# 添加7日移动平均线
daily_sales['ma7'] = daily_sales['total_amount'].rolling(window=7).mean()
axes[0].plot(daily_sales.index, daily_sales['ma7'], 
             color='red', linewidth=2, label='7日均线')
axes[0].legend()

# 日订单数趋势
axes[1].bar(daily_sales.index, daily_sales['orders'], alpha=0.6)
axes[1].set_title('日订单数趋势', fontsize=14, fontweight='bold')
axes[1].set_xlabel('日期')
axes[1].set_ylabel('订单数')
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# 3. 月度对比
df['month'] = df['date'].dt.to_period('M')
monthly_sales = df.groupby('month').agg({
    'total_amount': 'sum',
    'order_id': 'count',
    'customer_id': 'nunique'
}).rename(columns={'order_id': 'orders', 'customer_id': 'customers'})

print("\n月度销售对比:")
print(monthly_sales)

plt.figure(figsize=(14, 6))
monthly_sales['total_amount'].plot(kind='bar', color='steelblue')
plt.title('月度销售额', fontsize=14, fontweight='bold')
plt.xlabel('月份')
plt.ylabel('销售额（元）')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()
```

### 类别分析

```python
# 类别销售分析
category_analysis = df.groupby('category').agg({
    'total_amount': ['sum', 'mean', 'count'],
    'quantity': 'sum'
}).round(2)

category_analysis.columns = ['总销售额', '平均订单金额', '订单数', '销售量']
category_analysis = category_analysis.sort_values('总销售额', ascending=False)

print("\n类别销售分析:")
print(category_analysis)

# 可视化
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 各类别销售额
category_analysis['总销售额'].plot(kind='bar', ax=axes[0, 0], color='coral')
axes[0, 0].set_title('各类别销售额', fontweight='bold')
axes[0, 0].set_xlabel('类别')
axes[0, 0].set_ylabel('销售额（元）')
axes[0, 0].tick_params(axis='x', rotation=45)

# 各类别订单数
category_analysis['订单数'].plot(kind='bar', ax=axes[0, 1], color='lightblue')
axes[0, 1].set_title('各类别订单数', fontweight='bold')
axes[0, 1].set_xlabel('类别')
axes[0, 1].set_ylabel('订单数')
axes[0, 1].tick_params(axis='x', rotation=45)

# 各类别平均订单金额
category_analysis['平均订单金额'].plot(kind='bar', ax=axes[1, 0], color='lightgreen')
axes[1, 0].set_title('各类别平均订单金额', fontweight='bold')
axes[1, 0].set_xlabel('类别')
axes[1, 0].set_ylabel('金额（元）')
axes[1, 0].tick_params(axis='x', rotation=45)

# 各类别销售量
category_analysis['销售量'].plot(kind='bar', ax=axes[1, 1], color='plum')
axes[1, 1].set_title('各类别销售量', fontweight='bold')
axes[1, 1].set_xlabel('类别')
axes[1, 1].set_ylabel('数量')
axes[1, 1].tick_params(axis='x', rotation=45)

plt.tight_layout()
plt.show()
```

### 客户分析

```python
# RFM 分析（Recency, Frequency, Monetary）
analysis_date = df['date'].max()

rfm = df.groupby('customer_id').agg({
    'date': lambda x: (analysis_date - x.max()).days,  # Recency
    'order_id': 'count',  # Frequency
    'total_amount': 'sum'  # Monetary
}).rename(columns={
    'date': 'recency',
    'order_id': 'frequency',
    'total_amount': 'monetary'
})

print("\nRFM 分析:")
print(rfm.describe())

# RFM 评分（分为5个等级）
rfm['R_score'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1])
rfm['F_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1, 2, 3, 4, 5])
rfm['M_score'] = pd.qcut(rfm['monetary'], 5, labels=[1, 2, 3, 4, 5])

rfm['RFM_score'] = (rfm['R_score'].astype(str) + 
                    rfm['F_score'].astype(str) + 
                    rfm['M_score'].astype(str))

# 客户分层
def segment_customer(row):
    r, f, m = int(row['R_score']), int(row['F_score']), int(row['M_score'])
    if r >= 4 and f >= 4 and m >= 4:
        return '重要价值客户'
    elif r >= 4 and f >= 3:
        return '重要保持客户'
    elif r >= 3 and f >= 3 and m >= 3:
        return '重要发展客户'
    elif r <= 2:
        return '流失客户'
    else:
        return '一般客户'

rfm['segment'] = rfm.apply(segment_customer, axis=1)

segment_counts = rfm['segment'].value_counts()
print("\n客户分层:")
print(segment_counts)

# 可视化客户分层
plt.figure(figsize=(10, 6))
segment_counts.plot(kind='bar', color='steelblue')
plt.title('客户分层分布', fontsize=14, fontweight='bold')
plt.xlabel('客户类型')
plt.ylabel('客户数')
plt.xticks(rotation=45)
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()

# 各层客户贡献
segment_contribution = df.merge(rfm[['segment']], 
                                 left_on='customer_id', 
                                 right_index=True)
segment_sales = segment_contribution.groupby('segment')['total_amount'].sum().sort_values(ascending=False)

plt.figure(figsize=(10, 6))
segment_sales.plot(kind='pie', autopct='%1.1f%%')
plt.title('各层客户销售额占比', fontsize=14, fontweight='bold')
plt.ylabel('')
plt.show()
```

### 地域分析

```python
# 城市销售分析
city_analysis = df.groupby('city').agg({
    'total_amount': 'sum',
    'order_id': 'count',
    'customer_id': 'nunique'
}).rename(columns={
    'order_id': 'orders',
    'customer_id': 'customers'
}).sort_values('total_amount', ascending=False)

city_analysis['avg_order'] = city_analysis['total_amount'] / city_analysis['orders']

print("\n城市销售分析:")
print(city_analysis)

# 可视化
fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# 城市销售额
city_analysis['total_amount'].plot(kind='barh', ax=axes[0, 0], color='skyblue')
axes[0, 0].set_title('各城市销售额', fontweight='bold')
axes[0, 0].set_xlabel('销售额（元）')

# 城市订单数
city_analysis['orders'].plot(kind='barh', ax=axes[0, 1], color='lightcoral')
axes[0, 1].set_title('各城市订单数', fontweight='bold')
axes[0, 1].set_xlabel('订单数')

# 城市客户数
city_analysis['customers'].plot(kind='barh', ax=axes[1, 0], color='lightgreen')
axes[1, 0].set_title('各城市客户数', fontweight='bold')
axes[1, 0].set_xlabel('客户数')

# 城市平均订单金额
city_analysis['avg_order'].plot(kind='barh', ax=axes[1, 1], color='plum')
axes[1, 1].set_title('各城市平均订单金额', fontweight='bold')
axes[1, 1].set_xlabel('金额（元）')

plt.tight_layout()
plt.show()
```

### 生成分析报告

```python
def generate_report(df):
    """生成完整的分析报告"""
    print("=" * 70)
    print("电商销售数据分析报告")
    print("=" * 70)
    
    # 1. 总体概况
    print("\n【一、总体概况】")
    print(f"分析时间段: {df['date'].min().date()} 至 {df['date'].max().date()}")
    print(f"总销售额: ¥{df['total_amount'].sum():,.2f}")
    print(f"总订单数: {len(df):,}")
    print(f"总客户数: {df['customer_id'].nunique():,}")
    print(f"平均订单金额: ¥{df['total_amount'].mean():,.2f}")
    print(f"最大单笔订单: ¥{df['total_amount'].max():,.2f}")
    
    # 2. 类别表现
    print("\n【二、类别表现】")
    category_sales = df.groupby('category')['total_amount'].sum().sort_values(ascending=False)
    print("销售额排名:")
    for i, (cat, sales) in enumerate(category_sales.items(), 1):
        pct = sales / category_sales.sum() * 100
        print(f"  {i}. {cat}: ¥{sales:,.2f} ({pct:.1f}%)")
    
    # 3. 时间趋势
    print("\n【三、时间趋势】")
    monthly = df.groupby(df['date'].dt.to_period('M'))['total_amount'].sum()
    print(f"月均销售额: ¥{monthly.mean():,.2f}")
    print(f"最高月份: {monthly.idxmax()} (¥{monthly.max():,.2f})")
    print(f"最低月份: {monthly.idxmin()} (¥{monthly.min():,.2f})")
    
    # 4. 客户洞察
    print("\n【四、客户洞察】")
    customer_orders = df.groupby('customer_id')['order_id'].count()
    print(f"人均订单数: {customer_orders.mean():.2f}")
    print(f"复购率: {(customer_orders > 1).sum() / len(customer_orders) * 100:.1f}%")
    top_customers = df.groupby('customer_id')['total_amount'].sum().nlargest(10)
    print(f"Top 10 客户贡献: ¥{top_customers.sum():,.2f} ({top_customers.sum() / df['total_amount'].sum() * 100:.1f}%)")
    
    # 5. 地域分布
    print("\n【五、地域分布】")
    city_sales = df.groupby('city')['total_amount'].sum().sort_values(ascending=False)
    print("城市销售额排名:")
    for i, (city, sales) in enumerate(city_sales.items(), 1):
        pct = sales / city_sales.sum() * 100
        print(f"  {i}. {city}: ¥{sales:,.2f} ({pct:.1f}%)")
    
    # 6. 建议
    print("\n【六、优化建议】")
    print("1. 重点发展销售额最高的品类，增加库存和促销力度")
    print("2. 针对流失客户进行召回营销")
    print("3. 提升复购率，开展会员积分和优惠活动")
    print("4. 关注低销售城市，分析原因并制定策略")
    print("5. 优化支付流程，提升用户体验")
    
    print("\n" + "=" * 70)

generate_report(df)
```

## 案例二：学生成绩分析

### 数据准备

```python
# 生成模拟学生成绩数据
np.random.seed(42)
n_students = 200

students = pd.DataFrame({
    'student_id': range(1, n_students + 1),
    'name': [f'学生{i}' for i in range(1, n_students + 1)],
    'gender': np.random.choice(['男', '女'], n_students),
    'class': np.random.choice(['A班', 'B班', 'C班', 'D班'], n_students),
    'math': np.random.normal(75, 15, n_students).clip(0, 100).round(1),
    'chinese': np.random.normal(80, 12, n_students).clip(0, 100).round(1),
    'english': np.random.normal(70, 18, n_students).clip(0, 100).round(1),
    'physics': np.random.normal(72, 16, n_students).clip(0, 100).round(1),
    'chemistry': np.random.normal(78, 14, n_students).clip(0, 100).round(1)
})

# 计算总分和平均分
score_cols = ['math', 'chinese', 'english', 'physics', 'chemistry']
students['total'] = students[score_cols].sum(axis=1)
students['average'] = students[score_cols].mean(axis=1).round(1)

print(students.head(10))
```

### 成绩统计分析

```python
# 整体统计
print("=" * 50)
print("各科成绩统计")
print("=" * 50)
print(students[score_cols].describe().round(2))

# 可视化成绩分布
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
axes = axes.flatten()

for i, subject in enumerate(score_cols):
    axes[i].hist(students[subject], bins=20, edgecolor='black', alpha=0.7)
    axes[i].axvline(students[subject].mean(), color='red', 
                    linestyle='--', label=f'均值: {students[subject].mean():.1f}')
    axes[i].set_title(f'{subject} 分数分布', fontweight='bold')
    axes[i].set_xlabel('分数')
    axes[i].set_ylabel('人数')
    axes[i].legend()
    axes[i].grid(True, alpha=0.3)

# 总分分布
axes[5].hist(students['total'], bins=20, edgecolor='black', 
             alpha=0.7, color='coral')
axes[5].axvline(students['total'].mean(), color='red', 
                linestyle='--', label=f'均值: {students["total"].mean():.1f}')
axes[5].set_title('总分分布', fontweight='bold')
axes[5].set_xlabel('总分')
axes[5].set_ylabel('人数')
axes[5].legend()
axes[5].grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
```

### 班级对比分析

```python
# 班级平均分对比
class_avg = students.groupby('class')[score_cols + ['total', 'average']].mean().round(1)

print("\n班级平均分对比:")
print(class_avg)

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 各科平均分对比
class_avg[score_cols].plot(kind='bar', ax=axes[0], width=0.8)
axes[0].set_title('各班各科平均分对比', fontsize=12, fontweight='bold')
axes[0].set_xlabel('班级')
axes[0].set_ylabel('平均分')
axes[0].legend(title='科目')
axes[0].grid(True, alpha=0.3)
axes[0].tick_params(axis='x', rotation=0)

# 总分对比
class_avg['total'].plot(kind='bar', ax=axes[1], color='steelblue')
axes[1].set_title('各班总分对比', fontsize=12, fontweight='bold')
axes[1].set_xlabel('班级')
axes[1].set_ylabel('平均总分')
axes[1].grid(True, alpha=0.3)
axes[1].tick_params(axis='x', rotation=0)

plt.tight_layout()
plt.show()
```

### 相关性分析

```python
# 各科成绩相关性
corr_matrix = students[score_cols].corr()

print("\n各科成绩相关系数:")
print(corr_matrix.round(2))

# 热力图
plt.figure(figsize=(10, 8))
sns.heatmap(corr_matrix, annot=True, fmt='.2f', cmap='coolwarm',
            square=True, linewidths=1, cbar_kws={'shrink': 0.8})
plt.title('各科成绩相关性热力图', fontsize=14, fontweight='bold')
plt.show()

# 散点图矩阵
sns.pairplot(students[score_cols], height=2, diag_kind='kde')
plt.suptitle('各科成绩散点图矩阵', y=1.02, fontsize=14, fontweight='bold')
plt.show()
```

### 学生分级

```python
# 根据总分分级
def grade_student(total):
    if total >= 450:
        return '优秀'
    elif total >= 400:
        return '良好'
    elif total >= 350:
        return '中等'
    elif total >= 300:
        return '及格'
    else:
        return '不及格'

students['grade'] = students['total'].apply(grade_student)

# 统计各等级人数
grade_counts = students['grade'].value_counts()
print("\n学生等级分布:")
print(grade_counts)

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 等级分布柱状图
grade_counts.plot(kind='bar', ax=axes[0], color='skyblue')
axes[0].set_title('学生等级分布', fontsize=12, fontweight='bold')
axes[0].set_xlabel('等级')
axes[0].set_ylabel('人数')
axes[0].tick_params(axis='x', rotation=0)
axes[0].grid(True, alpha=0.3)

# 等级占比饼图
grade_counts.plot(kind='pie', ax=axes[1], autopct='%1.1f%%')
axes[1].set_title('学生等级占比', fontsize=12, fontweight='bold')
axes[1].set_ylabel('')

plt.tight_layout()
plt.show()
```

### 生成成绩报告

```python
def generate_score_report(df):
    """生成成绩分析报告"""
    print("=" * 70)
    print("学生成绩分析报告")
    print("=" * 70)
    
    print(f"\n学生总数: {len(df)}")
    print(f"班级数: {df['class'].nunique()}")
    
    print("\n【各科平均分】")
    for subject in score_cols:
        print(f"{subject}: {df[subject].mean():.1f}")
    
    print(f"\n【总分统计】")
    print(f"平均总分: {df['total'].mean():.1f}")
    print(f"最高总分: {df['total'].max():.1f}")
    print(f"最低总分: {df['total'].min():.1f}")
    
    print(f"\n【等级分布】")
    for grade, count in df['grade'].value_counts().items():
        pct = count / len(df) * 100
        print(f"{grade}: {count}人 ({pct:.1f}%)")
    
    print(f"\n【班级表现】")
    class_total = df.groupby('class')['total'].mean().sort_values(ascending=False)
    for i, (cls, avg) in enumerate(class_total.items(), 1):
        print(f"{i}. {cls}: {avg:.1f}")
    
    print("\n" + "=" * 70)

generate_score_report(students)
```

## 易错点

::: warning 常见错误
1. **数据类型** - 确保日期、数值类型正确
2. **时间索引** - 时间序列分析需设置正确的索引
3. **分组聚合** - 注意聚合函数的选择
4. **可视化标签** - 添加清晰的标题和标签
5. **统计意义** - 考虑样本量和统计显著性
6. **业务理解** - 结合实际业务场景解读数据
7. **报告质量** - 提供可操作的建议而非仅描述数据
:::

## 自我检验

1. 数据分析的一般流程是什么？
2. RFM 模型中的三个维度分别代表什么？
3. 如何进行客户分层？
4. 相关性分析有什么用途？
5. 如何从数据中提取业务洞察？
6. 数据可视化应该遵循哪些原则？
7. 如何撰写一份好的数据分析报告？

## 练习题

1. 分析不同支付方式的客户特征差异
2. 找出销售额下降的时间段并分析原因
3. 识别高价值但流失风险高的客户
4. 分析不同城市的客户购买偏好
5. 预测下个月的销售趋势
6. 找出成绩进步最快和退步最快的学生
7. 分析性别对各科成绩的影响

## 参考资源

- [Pandas 数据分析教程](https://pandas.pydata.org/docs/user_guide/index.html)
- [数据分析思维与方法](https://www.datacamp.com/tutorial/data-analysis-python)
