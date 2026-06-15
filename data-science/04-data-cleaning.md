# 数据清洗与预处理

数据清洗是数据分析的重要环节，通常占据数据科学工作的 60-80% 时间。

## 缺失值处理

### 识别缺失值

```python
import pandas as pd
import numpy as np

# 创建包含缺失值的数据
df = pd.DataFrame({
    'A': [1, 2, np.nan, 4, 5],
    'B': [np.nan, 2, 3, np.nan, 5],
    'C': [1, 2, 3, 4, 5],
    'D': ['a', None, 'c', 'd', 'e']
})

# 检查缺失值
print(df.isnull())        # 返回布尔矩阵
print(df.isnull().sum())  # 每列缺失值数量
print(df.isnull().sum().sum())  # 总缺失值数量

# 可视化缺失值
import seaborn as sns
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 6))
sns.heatmap(df.isnull(), cbar=False, cmap='viridis')
plt.title('缺失值分布')
plt.show()

# 缺失值比例
missing_ratio = df.isnull().sum() / len(df) * 100
print(f"缺失值比例:\n{missing_ratio}")
```

### 删除缺失值

```python
# 删除任何包含缺失值的行
df_clean1 = df.dropna()

# 删除所有值都是缺失的行
df_clean2 = df.dropna(how='all')

# 删除包含缺失值的列
df_clean3 = df.dropna(axis=1)

# 至少保留 n 个非缺失值
df_clean4 = df.dropna(thresh=3)  # 至少3个非NA值

# 特定列包含缺失值时删除
df_clean5 = df.dropna(subset=['A', 'B'])

print(f"原始数据: {len(df)} 行")
print(f"删除后: {len(df_clean1)} 行")
```

### 填充缺失值

```python
# 用常数填充
df_filled1 = df.fillna(0)

# 用均值填充（仅数值列）
df_filled2 = df.fillna(df.mean(numeric_only=True))

# 用中位数填充
df_filled3 = df.fillna(df.median(numeric_only=True))

# 用众数填充
df_filled4 = df.fillna(df.mode().iloc[0])

# 前向填充（用前一个值）
df_filled5 = df.fillna(method='ffill')

# 后向填充（用后一个值）
df_filled6 = df.fillna(method='bfill')

# 按列指定不同的填充值
df_filled7 = df.fillna({
    'A': df['A'].mean(),
    'B': df['B'].median(),
    'D': 'unknown'
})

# 线性插值
df_filled8 = df.interpolate(method='linear')
```

### 高级插值

```python
# 时间序列插值
dates = pd.date_range('2024-01-01', periods=10, freq='D')
ts = pd.Series([1, np.nan, np.nan, 4, np.nan, 6, 7, np.nan, 9, 10], index=dates)

# 线性插值
ts_linear = ts.interpolate(method='linear')

# 时间加权插值
ts_time = ts.interpolate(method='time')

# 多项式插值
ts_poly = ts.interpolate(method='polynomial', order=2)

# 样条插值
ts_spline = ts.interpolate(method='spline', order=3)

print("原始:", ts.tolist())
print("线性:", ts_linear.tolist())
```

## 重复值处理

### 识别重复值

```python
df = pd.DataFrame({
    'A': [1, 2, 2, 3, 3],
    'B': ['a', 'b', 'b', 'c', 'd'],
    'C': [10, 20, 20, 30, 30]
})

# 检查完全重复的行
print(df.duplicated())  # 返回布尔序列
print(df.duplicated().sum())  # 重复行数量

# 查看重复的行
print(df[df.duplicated()])

# 检查特定列的重复
print(df.duplicated(subset=['A']))

# 保留第一个还是最后一个
print(df.duplicated(keep='first'))   # 保留第一个（默认）
print(df.duplicated(keep='last'))    # 保留最后一个
print(df.duplicated(keep=False))     # 标记所有重复
```

### 删除重复值

```python
# 删除完全重复的行
df_unique1 = df.drop_duplicates()

# 基于特定列删除重复
df_unique2 = df.drop_duplicates(subset=['A'])

# 保留最后一个重复值
df_unique3 = df.drop_duplicates(keep='last')

# 删除所有重复值（一个都不保留）
df_unique4 = df[~df.duplicated(keep=False)]

print(f"原始行数: {len(df)}")
print(f"去重后: {len(df_unique1)}")
```

## 异常值检测

### 统计方法

```python
import numpy as np

# 生成测试数据
np.random.seed(42)
data = np.random.normal(100, 15, 1000)
data = np.append(data, [200, 210, -50, -60])  # 添加异常值

df = pd.DataFrame({'value': data})

# Z-score 方法（3σ原则）
from scipy import stats

z_scores = np.abs(stats.zscore(df['value']))
outliers_z = df[z_scores > 3]
print(f"Z-score 检测到 {len(outliers_z)} 个异常值")

# IQR 方法（四分位距）
Q1 = df['value'].quantile(0.25)
Q3 = df['value'].quantile(0.75)
IQR = Q3 - Q1

lower_bound = Q1 - 1.5 * IQR
upper_bound = Q3 + 1.5 * IQR

outliers_iqr = df[(df['value'] < lower_bound) | (df['value'] > upper_bound)]
print(f"IQR 检测到 {len(outliers_iqr)} 个异常值")

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# 箱线图
axes[0].boxplot(df['value'])
axes[0].set_title('箱线图（显示异常值）')
axes[0].set_ylabel('数值')

# 直方图
axes[1].hist(df['value'], bins=50, edgecolor='black')
axes[1].axvline(lower_bound, color='red', linestyle='--', label='下界')
axes[1].axvline(upper_bound, color='red', linestyle='--', label='上界')
axes[1].set_title('分布直方图')
axes[1].legend()

plt.tight_layout()
plt.show()
```

### 处理异常值

```python
# 方法1：删除异常值
df_clean = df[(df['value'] >= lower_bound) & (df['value'] <= upper_bound)]

# 方法2：截断（Winsorization）
df_winsor = df.copy()
df_winsor.loc[df_winsor['value'] < lower_bound, 'value'] = lower_bound
df_winsor.loc[df_winsor['value'] > upper_bound, 'value'] = upper_bound

# 方法3：用边界值替换
df_cap = df.copy()
df_cap['value'] = df_cap['value'].clip(lower=lower_bound, upper=upper_bound)

# 方法4：对数变换（减少异常值影响）
df_log = df.copy()
df_log['value_log'] = np.log1p(df_log['value'].clip(lower=0))

print(f"原始数据: {len(df)} 行")
print(f"删除异常值后: {len(df_clean)} 行")
```

## 数据类型转换

### 基础类型转换

```python
df = pd.DataFrame({
    'A': ['1', '2', '3', '4', '5'],
    'B': ['1.1', '2.2', '3.3', '4.4', '5.5'],
    'C': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
    'D': ['True', 'False', 'True', 'False', 'True']
})

print(df.dtypes)

# 转换为数值
df['A'] = pd.to_numeric(df['A'])
df['B'] = df['B'].astype(float)

# 转换为日期
df['C'] = pd.to_datetime(df['C'])

# 转换为布尔
df['D'] = df['D'].map({'True': True, 'False': False})

print("\n转换后:")
print(df.dtypes)
```

### 错误处理

```python
# 包含无效值的数据
df = pd.DataFrame({
    'A': ['1', '2', 'invalid', '4', '5'],
    'B': ['1.1', 'abc', '3.3', '4.4', '5.5']
})

# 转换时处理错误
df['A'] = pd.to_numeric(df['A'], errors='coerce')  # 无效值变为 NaN
df['B'] = pd.to_numeric(df['B'], errors='coerce')

print(df)
print(f"\n转换后缺失值: {df.isnull().sum().sum()}")

# 替代方案：忽略错误
df['A'] = pd.to_numeric(df['A'], errors='ignore')  # 保持原样
```

### 分类类型

```python
# 转换为分类类型（节省内存）
df = pd.DataFrame({
    'color': ['red', 'blue', 'red', 'green', 'blue', 'red'] * 1000
})

print(f"原始内存: {df.memory_usage(deep=True).sum()} bytes")

df['color'] = df['color'].astype('category')

print(f"分类后内存: {df.memory_usage(deep=True).sum()} bytes")

# 有序分类
df['size'] = pd.Categorical(['S', 'M', 'L', 'M', 'S', 'L'] * 1000,
                            categories=['S', 'M', 'L'],
                            ordered=True)

print(df['size'].head())
print(df['size'] > 'S')  # 支持比较
```

## 字符串清洗

### 基础清洗

```python
df = pd.DataFrame({
    'name': ['  Alice  ', 'Bob', '  Charlie', 'David  ', 'Eve'],
    'email': ['alice@example.com', 'bob@EXAMPLE.COM', 'charlie@Example.com', 
              'invalid_email', 'eve@example.com']
})

# 去除空格
df['name'] = df['name'].str.strip()

# 大小写转换
df['name_upper'] = df['name'].str.upper()
df['name_lower'] = df['name'].str.lower()
df['name_title'] = df['name'].str.title()

# 统一邮箱格式
df['email'] = df['email'].str.lower()

print(df)
```

### 字符串操作

```python
df = pd.DataFrame({
    'text': ['Hello World', 'Python Programming', 'Data Science', 
             'Machine Learning', 'Artificial Intelligence']
})

# 替换
df['text_clean'] = df['text'].str.replace(' ', '_')

# 分割
df['words'] = df['text'].str.split(' ')
df['first_word'] = df['text'].str.split(' ').str[0]

# 提取
df['length'] = df['text'].str.len()
df['has_data'] = df['text'].str.contains('Data')

# 正则表达式提取
df = pd.DataFrame({
    'text': ['价格：100元', '价格：200元', '价格：150元']
})
df['price'] = df['text'].str.extract(r'(\d+)').astype(int)

print(df)
```

### 格式验证

```python
import re

df = pd.DataFrame({
    'email': ['alice@example.com', 'invalid', 'bob@test.com', 'charlie@'],
    'phone': ['13812345678', '12345', '13987654321', '139-8765-4321']
})

# 邮箱验证
email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
df['valid_email'] = df['email'].str.match(email_pattern)

# 手机号验证（中国）
phone_pattern = r'^1[3-9]\d{9}$'
df['valid_phone'] = df['phone'].str.match(phone_pattern)

print(df)
print(f"\n有效邮箱数: {df['valid_email'].sum()}")
print(f"有效手机数: {df['valid_phone'].sum()}")
```

## 数据标准化与归一化

### Min-Max 归一化

```python
from sklearn.preprocessing import MinMaxScaler

df = pd.DataFrame({
    'A': [1, 2, 3, 4, 5],
    'B': [10, 20, 30, 40, 50],
    'C': [100, 200, 300, 400, 500]
})

# Min-Max 缩放到 [0, 1]
scaler = MinMaxScaler()
df_scaled = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)

print("原始数据:")
print(df)
print("\n归一化后:")
print(df_scaled)

# 缩放到 [0, 100]
scaler = MinMaxScaler(feature_range=(0, 100))
df_scaled_100 = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)
print("\n缩放到 [0, 100]:")
print(df_scaled_100)
```

### Z-score 标准化

```python
from sklearn.preprocessing import StandardScaler

# Z-score 标准化（均值0，标准差1）
scaler = StandardScaler()
df_standardized = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)

print("标准化后:")
print(df_standardized)
print("\n均值:", df_standardized.mean())
print("标准差:", df_standardized.std())
```

### Robust 缩放

```python
from sklearn.preprocessing import RobustScaler

# 对异常值更鲁棒（使用中位数和IQR）
scaler = RobustScaler()
df_robust = pd.DataFrame(
    scaler.fit_transform(df),
    columns=df.columns
)

print("Robust 缩放:")
print(df_robust)
```

## 数据离散化

### 等宽分箱

```python
df = pd.DataFrame({
    'age': [18, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
})

# 分为5个等宽区间
df['age_bin'] = pd.cut(df['age'], bins=5)
print(df)

# 自定义区间
bins = [0, 30, 50, 100]
labels = ['年轻', '中年', '老年']
df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels)
print(df)
```

### 等频分箱

```python
# 分为4个等频区间（每个区间样本数相同）
df['age_qcut'] = pd.qcut(df['age'], q=4)
print(df)

# 带标签
df['age_quartile'] = pd.qcut(df['age'], q=4, 
                              labels=['Q1', 'Q2', 'Q3', 'Q4'])
print(df['age_quartile'].value_counts())
```

## 编码转换

### 标签编码

```python
from sklearn.preprocessing import LabelEncoder

df = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'blue', 'red', 'green']
})

# 标签编码
le = LabelEncoder()
df['color_encoded'] = le.fit_transform(df['color'])

print(df)
print("\n编码映射:", dict(zip(le.classes_, le.transform(le.classes_))))
```

### One-Hot 编码

```python
df = pd.DataFrame({
    'color': ['red', 'blue', 'green', 'blue', 'red'],
    'size': ['S', 'M', 'L', 'M', 'S']
})

# Pandas One-Hot 编码
df_onehot = pd.get_dummies(df, columns=['color', 'size'])
print(df_onehot)

# Scikit-learn One-Hot 编码
from sklearn.preprocessing import OneHotEncoder

encoder = OneHotEncoder(sparse_output=False)
encoded = encoder.fit_transform(df[['color', 'size']])
df_encoded = pd.DataFrame(
    encoded,
    columns=encoder.get_feature_names_out(['color', 'size'])
)
print(df_encoded)
```

### 频率编码

```python
df = pd.DataFrame({
    'city': ['Beijing', 'Shanghai', 'Beijing', 'Guangzhou', 
             'Shanghai', 'Beijing', 'Shenzhen', 'Shanghai']
})

# 用出现频率编码
freq = df['city'].value_counts(normalize=True)
df['city_freq'] = df['city'].map(freq)

print(df)
```

## 实战案例

### 综合数据清洗流程

```python
# 创建模拟的"脏"数据
np.random.seed(42)
df = pd.DataFrame({
    'id': range(1, 101),
    'name': ['  User' + str(i) + '  ' if i % 10 != 0 else None 
             for i in range(1, 101)],
    'age': [np.random.randint(18, 70) if i % 15 != 0 else np.nan 
            for i in range(100)],
    'salary': [np.random.randint(3000, 20000) if i % 20 != 0 else np.nan 
               for i in range(100)],
    'city': np.random.choice(['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'], 100),
    'email': ['user' + str(i) + '@example.com' if i % 12 != 0 else 'invalid_email' 
              for i in range(100)]
})

# 添加一些重复行
df = pd.concat([df, df.iloc[:5]], ignore_index=True)

print(f"原始数据: {df.shape}")
print(f"缺失值:\n{df.isnull().sum()}")
print(f"重复行: {df.duplicated().sum()}")

# 清洗步骤
def clean_data(df):
    df_clean = df.copy()
    
    # 1. 删除重复行
    df_clean = df_clean.drop_duplicates()
    print(f"去重后: {df_clean.shape}")
    
    # 2. 处理缺失值
    # name: 填充为Unknown
    df_clean['name'] = df_clean['name'].fillna('Unknown')
    # age: 用中位数填充
    df_clean['age'] = df_clean['age'].fillna(df_clean['age'].median())
    # salary: 用均值填充
    df_clean['salary'] = df_clean['salary'].fillna(df_clean['salary'].mean())
    
    # 3. 字符串清洗
    df_clean['name'] = df_clean['name'].str.strip()
    df_clean['email'] = df_clean['email'].str.lower()
    
    # 4. 验证邮箱
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    df_clean['valid_email'] = df_clean['email'].str.match(email_pattern)
    # 无效邮箱替换为空
    df_clean.loc[~df_clean['valid_email'], 'email'] = None
    
    # 5. 异常值处理（salary）
    Q1 = df_clean['salary'].quantile(0.25)
    Q3 = df_clean['salary'].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    df_clean['salary'] = df_clean['salary'].clip(lower=lower, upper=upper)
    
    # 6. 年龄分组
    df_clean['age_group'] = pd.cut(df_clean['age'], 
                                    bins=[0, 30, 50, 100],
                                    labels=['青年', '中年', '老年'])
    
    # 7. 城市编码
    df_clean = pd.get_dummies(df_clean, columns=['city'], prefix='city')
    
    # 8. 数据类型优化
    df_clean['id'] = df_clean['id'].astype('int32')
    df_clean['age'] = df_clean['age'].astype('int16')
    df_clean['salary'] = df_clean['salary'].astype('float32')
    
    return df_clean

df_cleaned = clean_data(df)

print(f"\n清洗后数据: {df_cleaned.shape}")
print(f"缺失值:\n{df_cleaned.isnull().sum()}")
print(f"\n数据类型:\n{df_cleaned.dtypes}")
print(f"\n前5行:\n{df_cleaned.head()}")
```

### 数据质量报告

```python
def data_quality_report(df):
    """生成数据质量报告"""
    report = {
        '总行数': len(df),
        '总列数': len(df.columns),
        '缺失值总数': df.isnull().sum().sum(),
        '缺失值比例': f"{df.isnull().sum().sum() / (len(df) * len(df.columns)) * 100:.2f}%",
        '重复行数': df.duplicated().sum(),
        '重复行比例': f"{df.duplicated().sum() / len(df) * 100:.2f}%",
        '数值列数': len(df.select_dtypes(include=[np.number]).columns),
        '分类列数': len(df.select_dtypes(include=['object', 'category']).columns),
    }
    
    print("=" * 50)
    print("数据质量报告")
    print("=" * 50)
    for key, value in report.items():
        print(f"{key}: {value}")
    
    print("\n各列缺失值统计:")
    missing = df.isnull().sum()
    missing_pct = (missing / len(df) * 100).round(2)
    missing_df = pd.DataFrame({
        '缺失值数量': missing,
        '缺失值比例(%)': missing_pct
    })
    print(missing_df[missing_df['缺失值数量'] > 0])
    
    # 数值列统计
    print("\n数值列统计:")
    print(df.describe())

# 生成报告
data_quality_report(df)
```

## 易错点

::: warning 常见错误
1. **链式赋值警告** - 使用 `.loc[]` 而非链式索引
2. **inplace 参数** - 注意某些方法默认返回副本
3. **缺失值判断** - 使用 `isnull()` 或 `isna()`，而非 `== None`
4. **数据类型** - 数值计算前确保类型正确
5. **异常值处理** - 根据业务场景选择合适方法
6. **One-Hot 膨胀** - 高基数分类特征会产生大量列
7. **标准化顺序** - 应在训练集上 fit，然后 transform 测试集
:::

## 自我检验

1. 缺失值处理有哪几种常见方法？各适用于什么场景？
2. Z-score 和 IQR 方法检测异常值有什么区别？
3. Min-Max 归一化和 Z-score 标准化有什么区别？
4. 什么是分箱？等宽分箱和等频分箱的区别是什么？
5. 标签编码和 One-Hot 编码各适用于什么场景？
6. 如何验证邮箱和手机号的格式？
7. 数据清洗的一般流程是什么？

## 练习题

1. 创建一个包含缺失值的 DataFrame，分别用均值、中位数和众数填充
2. 使用 Z-score 和 IQR 方法检测异常值，比较结果
3. 对数值数据进行 Min-Max 归一化和 Z-score 标准化
4. 将年龄数据分为"青年"、"中年"、"老年"三组
5. 对分类变量进行 One-Hot 编码
6. 编写一个完整的数据清洗函数，处理缺失值、重复值和异常值
7. 生成一份数据质量报告，包含缺失值、重复值、数据类型等信息

## 参考资源

- [Pandas 数据清洗文档](https://pandas.pydata.org/docs/user_guide/missing_data.html)
- [Scikit-learn 预处理文档](https://scikit-learn.org/stable/modules/preprocessing.html)
