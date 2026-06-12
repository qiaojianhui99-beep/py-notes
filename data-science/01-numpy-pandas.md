# NumPy 与 Pandas 数据分析基础

NumPy 和 Pandas 是 Python 数据分析的核心库。

## NumPy 数组

### 创建数组

```python
import numpy as np

# 从列表创建
arr = np.array([1, 2, 3, 4, 5])
arr_2d = np.array([[1, 2, 3], [4, 5, 6]])

# 特殊数组
np.zeros((3, 4))        # 全0
np.ones((2, 3))         # 全1
np.eye(3)               # 单位矩阵
np.arange(0, 10, 2)     # [0, 2, 4, 6, 8]
np.linspace(0, 1, 5)    # [0, 0.25, 0.5, 0.75, 1]
np.random.rand(3, 4)    # 随机数组
```

### 数组操作

```python
# 索引切片
arr = np.array([1, 2, 3, 4, 5])
arr[0]          # 1
arr[1:4]        # [2, 3, 4]
arr[-1]         # 5

# 二维数组
arr_2d = np.array([[1, 2, 3], [4, 5, 6]])
arr_2d[0, 1]    # 2
arr_2d[:, 1]    # [2, 5]
arr_2d[0, :]    # [1, 2, 3]

# 布尔索引
arr[arr > 3]    # [4, 5]

# 运算
arr + 10        # [11, 12, 13, 14, 15]
arr * 2         # [2, 4, 6, 8, 10]
arr ** 2        # [1, 4, 9, 16, 25]

# 聚合
arr.sum()       # 15
arr.mean()      # 3.0
arr.std()       # 标准差
arr.min()       # 1
arr.max()       # 5
```

## Pandas 基础

### Series

```python
import pandas as pd

# 创建 Series
s = pd.Series([1, 2, 3, 4, 5])
s = pd.Series([1, 2, 3], index=['a', 'b', 'c'])

# 索引
s[0]            # 1
s['a']          # 1
s[s > 2]        # 筛选
```

### DataFrame

```python
# 创建 DataFrame
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie'],
    'age': [25, 30, 35],
    'city': ['New York', 'London', 'Tokyo']
})

# 查看数据
df.head()       # 前5行
df.tail()       # 后5行
df.info()       # 信息
df.describe()   # 统计

# 选择列
df['name']
df[['name', 'age']]

# 选择行
df.loc[0]           # 按标签
df.iloc[0]          # 按位置
df[df['age'] > 25]  # 条件筛选

# 添加列
df['country'] = ['USA', 'UK', 'Japan']

# 删除
df.drop('city', axis=1)     # 删除列
df.drop(0, axis=0)          # 删除行
```

### 数据读写

```python
# CSV
df = pd.read_csv('data.csv')
df.to_csv('output.csv', index=False)

# Excel
df = pd.read_excel('data.xlsx')
df.to_excel('output.xlsx', index=False)

# JSON
df = pd.read_json('data.json')
df.to_json('output.json')

# SQL
import sqlalchemy
engine = sqlalchemy.create_engine('sqlite:///db.sqlite')
df = pd.read_sql('SELECT * FROM users', engine)
df.to_sql('users', engine, if_exists='replace')
```

### 数据清洗

```python
# 缺失值
df.isnull()             # 检查
df.dropna()             # 删除
df.fillna(0)            # 填充

# 重复值
df.duplicated()
df.drop_duplicates()

# 类型转换
df['age'] = df['age'].astype(int)
df['date'] = pd.to_datetime(df['date'])
```

### 数据分组

```python
# 分组统计
df.groupby('city')['age'].mean()
df.groupby('city').agg({'age': ['mean', 'max'], 'name': 'count'})

# 透视表
pd.pivot_table(df, values='age', index='city', columns='gender', aggfunc='mean')
```

### 数据合并

```python
# 合并
df1 = pd.DataFrame({'id': [1, 2], 'name': ['Alice', 'Bob']})
df2 = pd.DataFrame({'id': [1, 2], 'age': [25, 30]})
pd.merge(df1, df2, on='id')

# 连接
pd.concat([df1, df2], axis=0)  # 纵向
pd.concat([df1, df2], axis=1)  # 横向
```

::: tip 学习建议
1. 掌握 NumPy 数组操作
2. 熟悉 Pandas DataFrame
3. 学习数据清洗技巧
4. 实践真实数据集
:::

## 下一步

- **[数据可视化](../data-science/02-visualization.md)** - Matplotlib 绘图
- **[机器学习入门](../data-science/03-ml-basics.md)** - Scikit-learn 基础
