# 文件上传与处理

## 文件上传基础

### HTTP multipart/form-data

文件上传使用 `multipart/form-data` 编码格式：

```html
<!-- HTML 表单 -->
<form action="/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file">
    <button type="submit">上传</button>
</form>
```

**关键点：**
- 必须使用 `POST` 方法
- `enctype` 必须设置为 `multipart/form-data`
- 文件通过 `<input type="file">` 上传

### 文件大小限制

不同框架的默认限制：

| 框架 | 默认大小限制 | 配置项 |
|------|-------------|--------|
| Flask | 16 MB | `MAX_CONTENT_LENGTH` |
| Django | 2.5 MB | `FILE_UPLOAD_MAX_MEMORY_SIZE` |
| FastAPI | 无限制（需手动限制） | 自定义中间件 |

```python
# Flask 配置
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB

# Django 配置（settings.py）
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760
```

### 文件类型验证

**三层验证策略：**

1. **前端验证**（用户体验）
```html
<input type="file" accept=".jpg,.png,.pdf">
```

2. **MIME 类型验证**（基础安全）
```python
ALLOWED_TYPES = {'image/jpeg', 'image/png', 'application/pdf'}
if file.content_type not in ALLOWED_TYPES:
    raise ValueError("不支持的文件类型")
```

3. **文件内容验证**（真实安全）
```python
import imghdr

def validate_image(stream):
    """验证真实图片类型"""
    header = stream.read(512)
    stream.seek(0)
    format = imghdr.what(None, header)
    if format not in ['jpeg', 'png', 'gif']:
        raise ValueError("不是有效的图片文件")
```

---

## Flask 文件上传

### 基础上传

```python
from flask import Flask, request
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB

@app.route('/upload', methods=['POST'])
def upload_file():
    # 检查是否有文件
    if 'file' not in request.files:
        return '没有文件', 400
    
    file = request.files['file']
    
    # 检查文件名
    if file.filename == '':
        return '未选择文件', 400
    
    # 保存文件
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return f'文件已保存: {filename}', 200
```

### secure_filename 的重要性

**危险示例（不使用 secure_filename）：**

```python
# ❌ 危险：用户可以通过 ../../etc/passwd 进行路径遍历
filename = request.files['file'].filename
file.save(f'uploads/{filename}')  # 可能被攻击
```

**安全示例：**

```python
# ✅ 安全：secure_filename 会清理危险字符
from werkzeug.utils import secure_filename

filename = secure_filename(request.files['file'].filename)
# '../../etc/passwd' -> 'etc_passwd'
# '文件名.txt' -> '.txt' (非ASCII被移除)
```

### 完整的 Flask 上传示例

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

app = Flask(__name__)

# 配置
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}

# 确保上传目录存在
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    """检查文件扩展名"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    # 检查文件
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件类型'}), 400
    
    # 生成唯一文件名
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    
    # 保存文件
    file.save(filepath)
    
    return jsonify({
        'message': '上传成功',
        'filename': unique_filename,
        'size': os.path.getsize(filepath)
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
```

---

## Django 文件上传

### 模型定义

```python
# models.py
from django.db import models

class Document(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')  # 自动上传到 MEDIA_ROOT/documents/
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

class UserProfile(models.Model):
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to='avatars/%Y/%m/%d/')  # 按日期分目录
    
    def __str__(self):
        return f"{self.user.username}'s profile"
```

**upload_to 参数说明：**

```python
# 固定路径
file = models.FileField(upload_to='uploads/')
# 结果：MEDIA_ROOT/uploads/filename.pdf

# 按日期分目录
file = models.FileField(upload_to='uploads/%Y/%m/%d/')
# 结果：MEDIA_ROOT/uploads/2026/06/22/filename.pdf

# 自定义函数
def user_directory_path(instance, filename):
    return f'user_{instance.user.id}/{filename}'

file = models.FileField(upload_to=user_directory_path)
# 结果：MEDIA_ROOT/user_123/filename.pdf
```

### 配置 MEDIA 文件

```python
# settings.py
import os

# 媒体文件根目录
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# 媒体文件访问 URL
MEDIA_URL = '/media/'

# 文件上传限制
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760
```

```python
# urls.py（开发环境）
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

urlpatterns = [
    # ... 其他路由
]

# 开发环境下提供媒体文件服务
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

### 视图处理

```python
# views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from .models import Document
from .forms import DocumentForm

def upload_file(request):
    if request.method == 'POST':
        form = DocumentForm(request.POST, request.FILES)
        if form.is_valid():
            document = form.save()
            return JsonResponse({
                'message': '上传成功',
                'url': document.file.url,
                'size': document.file.size
            })
    else:
        form = DocumentForm()
    
    return render(request, 'upload.html', {'form': form})

# 手动处理上传文件
def upload_manual(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # 创建文档对象
        document = Document(
            title=uploaded_file.name,
            file=uploaded_file
        )
        document.save()
        
        return JsonResponse({
            'message': '上传成功',
            'filename': uploaded_file.name,
            'size': uploaded_file.size,
            'url': document.file.url
        })
    
    return JsonResponse({'error': '没有文件'}, status=400)
```

### 表单定义

```python
# forms.py
from django import forms
from .models import Document

class DocumentForm(forms.ModelForm):
    class Meta:
        model = Document
        fields = ['title', 'file']
        widgets = {
            'file': forms.FileInput(attrs={'accept': '.pdf,.doc,.docx'})
        }
    
    def clean_file(self):
        """自定义文件验证"""
        file = self.cleaned_data.get('file')
        
        if file:
            # 验证文件大小
            if file.size > 10 * 1024 * 1024:  # 10 MB
                raise forms.ValidationError('文件不能超过 10 MB')
            
            # 验证文件类型
            ext = file.name.split('.')[-1].lower()
            if ext not in ['pdf', 'doc', 'docx']:
                raise forms.ValidationError('只支持 PDF 和 Word 文档')
        
        return file
```

---

## FastAPI 文件上传

### 基础上传

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import uuid

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传单个文件"""
    
    # 验证文件类型
    allowed_types = ["image/jpeg", "image/png", "application/pdf"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="不支持的文件类型")
    
    # 生成唯一文件名
    ext = file.filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 异步保存文件
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "filename": unique_filename,
        "content_type": file.content_type,
        "size": os.path.getsize(file_path)
    }
```

### 多文件上传

```python
from typing import List

@app.post("/upload-multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """上传多个文件"""
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="最多上传 10 个文件")
    
    uploaded_files = []
    
    for file in files:
        # 验证每个文件
        if file.size > 5 * 1024 * 1024:  # 5 MB
            raise HTTPException(status_code=400, detail=f"{file.filename} 超过大小限制")
        
        # 保存文件
        ext = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        uploaded_files.append({
            "filename": unique_filename,
            "original_name": file.filename,
            "size": os.path.getsize(file_path)
        })
    
    return {"files": uploaded_files, "count": len(uploaded_files)}
```

### File vs UploadFile

| 特性 | File | UploadFile |
|------|------|-----------|
| 类型 | `bytes` | 类文件对象 |
| 内存使用 | 全部加载到内存 | 流式处理 |
| 适用场景 | 小文件（< 1 MB） | 大文件 |
| 元数据 | 无 | 有（filename, content_type） |
| 异步支持 | 否 | 是 |

```python
# 使用 File（小文件）
@app.post("/upload-small")
async def upload_small(file: bytes = File(...)):
    """适合小文件，直接返回字节"""
    return {"size": len(file)}

# 使用 UploadFile（推荐）
@app.post("/upload-large")
async def upload_large(file: UploadFile = File(...)):
    """适合大文件，流式处理"""
    content = await file.read()
    return {"filename": file.filename, "size": len(content)}
```

### 完整的 FastAPI 示例

```python
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import FileResponse
from typing import Optional
import shutil
import os
import uuid
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_file(file: UploadFile):
    """验证文件"""
    # 检查扩展名
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型: {ext}")
    
    # 检查大小（需要读取内容）
    file.file.seek(0, 2)  # 移到文件末尾
    size = file.file.tell()
    file.file.seek(0)  # 回到开头
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="文件过大")

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """上传文件（支持额外表单字段）"""
    
    # 验证文件
    validate_file(file)
    
    # 保存文件
    ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "filename": unique_filename,
        "original_name": file.filename,
        "description": description,
        "size": file_path.stat().st_size
    }

@app.get("/download/{filename}")
async def download_file(filename: str):
    """下载文件"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(file_path, filename=filename)
```

---

## 图片处理

### Pillow 基础

```bash
pip install Pillow
```

```python
from PIL import Image
import os

# 打开图片
img = Image.open('photo.jpg')

# 获取图片信息
print(img.format)  # JPEG
print(img.size)    # (1920, 1080)
print(img.mode)    # RGB

# 保存图片
img.save('output.png')
```

### 图片缩放

```python
from PIL import Image

def resize_image(input_path, output_path, max_width=800, max_height=600):
    """等比例缩放图片"""
    img = Image.open(input_path)
    
    # 计算缩放比例
    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    
    # 保存
    img.save(output_path, quality=85, optimize=True)

# 使用示例
resize_image('large.jpg', 'small.jpg', 800, 600)
```

### 生成缩略图

```python
from PIL import Image
import os

def create_thumbnail(input_path, output_dir, sizes=None):
    """生成多种尺寸的缩略图"""
    if sizes is None:
        sizes = [(150, 150), (300, 300), (600, 600)]
    
    img = Image.open(input_path)
    filename = os.path.basename(input_path)
    name, ext = os.path.splitext(filename)
    
    thumbnails = []
    
    for width, height in sizes:
        # 创建缩略图
        thumb = img.copy()
        thumb.thumbnail((width, height), Image.Resampling.LANCZOS)
        
        # 保存
        output_path = os.path.join(output_dir, f"{name}_{width}x{height}{ext}")
        thumb.save(output_path, quality=85)
        thumbnails.append(output_path)
    
    return thumbnails

# 使用示例
create_thumbnail('photo.jpg', 'thumbnails/')
# 生成：photo_150x150.jpg, photo_300x300.jpg, photo_600x600.jpg
```

### 图片格式转换

```python
from PIL import Image

def convert_image(input_path, output_path, format='PNG'):
    """转换图片格式"""
    img = Image.open(input_path)
    
    # 如果是 RGBA 模式，转换 JPEG 时需要先转为 RGB
    if img.mode == 'RGBA' and format.upper() == 'JPEG':
        # 创建白色背景
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        rgb_img.paste(img, mask=img.split()[3])  # 使用 alpha 通道作为 mask
        img = rgb_img
    
    img.save(output_path, format=format)

# 使用示例
convert_image('photo.png', 'photo.jpg', 'JPEG')
convert_image('photo.jpg', 'photo.webp', 'WEBP')
```

### 添加水印

```python
from PIL import Image, ImageDraw, ImageFont

def add_watermark(input_path, output_path, watermark_text="© 2026"):
    """添加文字水印"""
    img = Image.open(input_path)
    
    # 创建绘图对象
    draw = ImageDraw.Draw(img)
    
    # 设置字体（可选）
    try:
        font = ImageFont.truetype("arial.ttf", 36)
    except:
        font = ImageFont.load_default()
    
    # 计算水印位置（右下角）
    bbox = draw.textbbox((0, 0), watermark_text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = img.width - text_width - 20
    y = img.height - text_height - 20
    
    # 绘制半透明背景
    draw.rectangle(
        [(x - 10, y - 5), (x + text_width + 10, y + text_height + 5)],
        fill=(0, 0, 0, 128)
    )
    
    # 绘制文字
    draw.text((x, y), watermark_text, fill=(255, 255, 255), font=font)
    
    img.save(output_path)

# 图片水印
def add_image_watermark(input_path, output_path, watermark_path):
    """添加图片水印"""
    img = Image.open(input_path)
    watermark = Image.open(watermark_path)
    
    # 调整水印大小（10% 的原图宽度）
    wm_width = img.width // 10
    wm_ratio = wm_width / watermark.width
    wm_height = int(watermark.height * wm_ratio)
    watermark = watermark.resize((wm_width, wm_height), Image.Resampling.LANCZOS)
    
    # 设置透明度
    if watermark.mode != 'RGBA':
        watermark = watermark.convert('RGBA')
    
    alpha = watermark.split()[3]
    alpha = alpha.point(lambda p: p * 0.5)  # 50% 透明度
    watermark.putalpha(alpha)
    
    # 粘贴水印（右下角）
    position = (img.width - watermark.width - 20, img.height - watermark.height - 20)
    img.paste(watermark, position, watermark)
    
    img.save(output_path)
```

### Flask + Pillow 完整示例

```python
from flask import Flask, request, send_file, jsonify
from PIL import Image
import os
import uuid
from io import BytesIO

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['THUMBNAIL_FOLDER'] = 'thumbnails'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['THUMBNAIL_FOLDER'], exist_ok=True)

@app.route('/upload-image', methods=['POST'])
def upload_image():
    """上传图片并生成缩略图"""
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    # 验证是否为图片
    try:
        img = Image.open(file.stream)
        img.verify()
        file.stream.seek(0)
    except:
        return jsonify({'error': '不是有效的图片'}), 400
    
    # 保存原图
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # 生成缩略图
    img = Image.open(filepath)
    img.thumbnail((300, 300), Image.Resampling.LANCZOS)
    thumb_path = os.path.join(app.config['THUMBNAIL_FOLDER'], filename)
    img.save(thumb_path)
    
    return jsonify({
        'filename': filename,
        'url': f'/uploads/{filename}',
        'thumbnail': f'/thumbnails/{filename}'
    })
```

---

## 大文件上传

### 分块上传原理

大文件（> 100 MB）应该使用分块上传：

1. 前端将文件切分为多个小块（如 5 MB）
2. 每个块单独上传
3. 服务器接收后合并

**优势：**
- 避免内存溢出
- 支持断点续传
- 提升上传速度（并行上传）

### FastAPI 分块上传示例

```python
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pathlib import Path
import hashlib

app = FastAPI()

CHUNK_DIR = Path("chunks")
UPLOAD_DIR = Path("uploads")
CHUNK_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload-chunk")
async def upload_chunk(
    file: UploadFile = File(...),
    chunk_index: int = Form(...),
    total_chunks: int = Form(...),
    file_id: str = Form(...)
):
    """上传单个文件块"""
    
    # 创建文件专属目录
    file_chunk_dir = CHUNK_DIR / file_id
    file_chunk_dir.mkdir(exist_ok=True)
    
    # 保存块
    chunk_path = file_chunk_dir / f"chunk_{chunk_index}"
    with open(chunk_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {
        "chunk_index": chunk_index,
        "status": "success"
    }

@app.post("/merge-chunks")
async def merge_chunks(
    file_id: str = Form(...),
    filename: str = Form(...),
    total_chunks: int = Form(...)
):
    """合并文件块"""
    
    file_chunk_dir = CHUNK_DIR / file_id
    
    # 检查所有块是否都已上传
    for i in range(total_chunks):
        chunk_path = file_chunk_dir / f"chunk_{i}"
        if not chunk_path.exists():
            raise HTTPException(status_code=400, detail=f"块 {i} 缺失")
    
    # 合并文件
    output_path = UPLOAD_DIR / filename
    with open(output_path, "wb") as outfile:
        for i in range(total_chunks):
            chunk_path = file_chunk_dir / f"chunk_{i}"
            with open(chunk_path, "rb") as infile:
                outfile.write(infile.read())
            chunk_path.unlink()  # 删除块
    
    # 删除临时目录
    file_chunk_dir.rmdir()
    
    return {
        "filename": filename,
        "size": output_path.stat().st_size,
        "message": "合并成功"
    }
```

### 前端分块上传示例

```javascript
// JavaScript 分块上传
async function uploadLargeFile(file) {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = generateUUID();
    
    // 上传所有块
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('chunk_index', i);
        formData.append('total_chunks', totalChunks);
        formData.append('file_id', fileId);
        
        await fetch('/upload-chunk', {
            method: 'POST',
            body: formData
        });
        
        // 更新进度
        const progress = ((i + 1) / totalChunks * 100).toFixed(2);
        console.log(`上传进度: ${progress}%`);
    }
    
    // 合并块
    const mergeData = new FormData();
    mergeData.append('file_id', fileId);
    mergeData.append('filename', file.name);
    mergeData.append('total_chunks', totalChunks);
    
    const response = await fetch('/merge-chunks', {
        method: 'POST',
        body: mergeData
    });
    
    return await response.json();
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
```

### 断点续传

```python
from fastapi import FastAPI, UploadFile, File, Form
from pathlib import Path
import json

app = FastAPI()

CHUNK_DIR = Path("chunks")
CHUNK_DIR.mkdir(exist_ok=True)

@app.get("/upload-status/{file_id}")
async def get_upload_status(file_id: str):
    """查询已上传的块"""
    file_chunk_dir = CHUNK_DIR / file_id
    
    if not file_chunk_dir.exists():
        return {"uploaded_chunks": []}
    
    # 获取已上传的块索引
    uploaded = []
    for chunk_file in file_chunk_dir.iterdir():
        if chunk_file.name.startswith("chunk_"):
            index = int(chunk_file.name.split("_")[1])
            uploaded.append(index)
    
    return {"uploaded_chunks": sorted(uploaded)}

@app.post("/upload-chunk")
async def upload_chunk(
    file: UploadFile = File(...),
    chunk_index: int = Form(...),
    file_id: str = Form(...)
):
    """上传单个文件块（支持续传）"""
    
    file_chunk_dir = CHUNK_DIR / file_id
    file_chunk_dir.mkdir(exist_ok=True)
    
    chunk_path = file_chunk_dir / f"chunk_{chunk_index}"
    
    # 如果块已存在，跳过
    if chunk_path.exists():
        return {"status": "already_uploaded", "chunk_index": chunk_index}
    
    # 保存块
    with open(chunk_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"status": "success", "chunk_index": chunk_index}
```

---

## 文件存储策略

### 本地存储

**目录组织策略：**

```python
import os
from datetime import datetime

# 1. 按日期分目录（推荐）
def get_upload_path(filename):
    today = datetime.now()
    dir_path = f"uploads/{today.year}/{today.month:02d}/{today.day:02d}"
    os.makedirs(dir_path, exist_ok=True)
    return os.path.join(dir_path, filename)
# 结果：uploads/2026/06/22/file.jpg

# 2. 按用户分目录
def get_user_upload_path(user_id, filename):
    dir_path = f"uploads/user_{user_id}"
    os.makedirs(dir_path, exist_ok=True)
    return os.path.join(dir_path, filename)
# 结果：uploads/user_123/file.jpg

# 3. 按文件类型分目录
def get_type_upload_path(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    type_map = {
        'jpg': 'images', 'png': 'images', 'gif': 'images',
        'pdf': 'documents', 'doc': 'documents', 'docx': 'documents',
        'mp4': 'videos', 'avi': 'videos'
    }
    dir_path = f"uploads/{type_map.get(ext, 'others')}"
    os.makedirs(dir_path, exist_ok=True)
    return os.path.join(dir_path, filename)
# 结果：uploads/images/file.jpg
```

**文件命名策略：**

```python
import uuid
import hashlib
from datetime import datetime

# 1. UUID（推荐，避免冲突）
def uuid_filename(original_filename):
    ext = original_filename.rsplit('.', 1)[1].lower()
    return f"{uuid.uuid4().hex}.{ext}"
# 结果：a3f8d9c7e1b2.jpg

# 2. 时间戳 + 随机数
def timestamp_filename(original_filename):
    ext = original_filename.rsplit('.', 1)[1].lower()
    timestamp = int(datetime.now().timestamp() * 1000)
    random_str = uuid.uuid4().hex[:8]
    return f"{timestamp}_{random_str}.{ext}"
# 结果：1719043200000_a3f8d9c7.jpg

# 3. 内容哈希（去重）
def hash_filename(file_content, original_filename):
    ext = original_filename.rsplit('.', 1)[1].lower()
    file_hash = hashlib.md5(file_content).hexdigest()
    return f"{file_hash}.{ext}"
# 结果：5d41402abc4b2a76b9719d911017c592.jpg
# 优势：相同内容的文件会得到相同的名称，自动去重
```

### 对象存储（OSS/S3）

**阿里云 OSS 示例：**

```bash
pip install oss2
```

```python
import oss2
from flask import Flask, request, jsonify

app = Flask(__name__)

# OSS 配置
OSS_ACCESS_KEY_ID = 'your_access_key'
OSS_ACCESS_KEY_SECRET = 'your_secret_key'
OSS_ENDPOINT = 'oss-cn-hangzhou.aliyuncs.com'
OSS_BUCKET_NAME = 'my-bucket'

# 初始化 OSS
auth = oss2.Auth(OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET)
bucket = oss2.Bucket(auth, OSS_ENDPOINT, OSS_BUCKET_NAME)

@app.route('/upload-to-oss', methods=['POST'])
def upload_to_oss():
    """上传文件到 OSS"""
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    # 生成 OSS 对象名称
    ext = file.filename.rsplit('.', 1)[1].lower()
    object_name = f"uploads/{uuid.uuid4().hex}.{ext}"
    
    # 上传到 OSS
    result = bucket.put_object(object_name, file.stream)
    
    # 生成访问 URL
    url = f"https://{OSS_BUCKET_NAME}.{OSS_ENDPOINT}/{object_name}"
    
    return jsonify({
        'url': url,
        'status': result.status,
        'etag': result.etag
    })
```

**AWS S3 示例：**

```bash
pip install boto3
```

```python
import boto3
from flask import Flask, request, jsonify
import uuid

app = Flask(__name__)

# S3 配置
s3_client = boto3.client(
    's3',
    aws_access_key_id='your_access_key',
    aws_secret_access_key='your_secret_key',
    region_name='us-west-2'
)

BUCKET_NAME = 'my-bucket'

@app.route('/upload-to-s3', methods=['POST'])
def upload_to_s3():
    """上传文件到 S3"""
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    # 生成 S3 对象键
    ext = file.filename.rsplit('.', 1)[1].lower()
    object_key = f"uploads/{uuid.uuid4().hex}.{ext}"
    
    # 上传到 S3
    s3_client.upload_fileobj(
        file.stream,
        BUCKET_NAME,
        object_key,
        ExtraArgs={'ContentType': file.content_type}
    )
    
    # 生成访问 URL
    url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{object_key}"
    
    return jsonify({'url': url})
```

**对象存储的优势：**

| 特性 | 本地存储 | 对象存储 |
|------|---------|---------|
| 扩展性 | 受限于磁盘 | 无限扩展 |
| 可靠性 | 单点故障 | 多副本冗余 |
| 访问速度 | 受服务器带宽限制 | CDN 加速 |
| 成本 | 硬件成本 | 按使用量付费 |
| 维护成本 | 需要运维 | 零运维 |

---

## 安全防护

### 文件类型验证

**三层防御：**

```python
import magic  # pip install python-magic
import imghdr

def validate_file_security(file, allowed_types):
    """完整的文件安全验证"""
    
    # 第一层：扩展名验证（最弱）
    ext = file.filename.rsplit('.', 1)[1].lower()
    if ext not in allowed_types:
        raise ValueError(f"不支持的扩展名: {ext}")
    
    # 第二层：MIME 类型验证
    mime_map = {
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf'
    }
    if file.content_type != mime_map.get(ext):
        raise ValueError("MIME 类型不匹配")
    
    # 第三层：文件内容验证（最强）
    file.stream.seek(0)
    file_magic = magic.from_buffer(file.stream.read(2048), mime=True)
    file.stream.seek(0)
    
    if file_magic != mime_map.get(ext):
        raise ValueError(f"文件内容不匹配，实际类型: {file_magic}")
    
    return True
```

### 防止路径遍历攻击

```python
import os
from werkzeug.utils import secure_filename

# ❌ 危险：路径遍历漏洞
@app.route('/upload')
def upload():
    filename = request.files['file'].filename
    file.save(f"uploads/{filename}")  # 可能被攻击
    # 攻击者上传文件名：../../etc/passwd

# ✅ 安全：使用 secure_filename
@app.route('/upload')
def upload():
    filename = secure_filename(request.files['file'].filename)
    file.save(f"uploads/{filename}")
    # '../../etc/passwd' -> 'etc_passwd'

# ✅ 更安全：完全重命名
@app.route('/upload')
def upload():
    ext = request.files['file'].filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    file.save(f"uploads/{filename}")
```

### 文件内容检测

```python
import magic

def scan_malicious_content(file_path):
    """检测恶意文件内容"""
    
    # 检查文件头（Magic Number）
    with open(file_path, 'rb') as f:
        header = f.read(512)
    
    # 检测可执行文件
    dangerous_signatures = [
        b'MZ',      # Windows EXE
        b'\x7fELF',  # Linux ELF
        b'#!',      # Shell script
        b'<?php',   # PHP 脚本
    ]
    
    for sig in dangerous_signatures:
        if header.startswith(sig):
            raise ValueError("检测到可执行文件")
    
    # 使用 python-magic 验证
    file_type = magic.from_file(file_path, mime=True)
    
    blocked_types = [
        'application/x-executable',
        'application/x-sharedlib',
        'text/x-php',
        'text/x-shellscript'
    ]
    
    if file_type in blocked_types:
        raise ValueError(f"禁止的文件类型: {file_type}")
    
    return True
```

### 上传频率限制

```python
from flask import Flask, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

# 配置限流器
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/upload', methods=['POST'])
@limiter.limit("10 per hour")  # 每小时最多上传 10 个文件
def upload_file():
    # ... 上传逻辑
    pass
```

### 病毒扫描（ClamAV）

```bash
# 安装 ClamAV
sudo apt-get install clamav clamav-daemon
pip install pyclamd
```

```python
import pyclamd

def scan_virus(file_path):
    """使用 ClamAV 扫描病毒"""
    try:
        cd = pyclamd.ClamdUnixSocket()
        
        # 扫描文件
        result = cd.scan_file(file_path)
        
        if result:
            # 发现病毒
            virus_name = result[file_path][1]
            raise ValueError(f"检测到病毒: {virus_name}")
        
        return True
    except Exception as e:
        print(f"病毒扫描失败: {e}")
        return False
```

### 完整的安全上传示例

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
import magic
import hashlib

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'application/pdf'
}

def validate_file(file):
    """多层文件验证"""
    
    # 1. 检查文件名
    if not file.filename:
        raise ValueError("文件名为空")
    
    # 2. 检查扩展名
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"不支持的文件类型: {ext}")
    
    # 3. 检查 MIME 类型
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise ValueError(f"不支持的 MIME 类型: {file.content_type}")
    
    # 4. 检查文件内容
    file.stream.seek(0)
    file_magic = magic.from_buffer(file.stream.read(2048), mime=True)
    file.stream.seek(0)
    
    if file_magic not in ALLOWED_MIME_TYPES:
        raise ValueError(f"文件内容类型不匹配: {file_magic}")
    
    return True

@app.route('/upload', methods=['POST'])
def upload_file():
    """安全的文件上传"""
    
    try:
        # 获取文件
        if 'file' not in request.files:
            return jsonify({'error': '没有文件'}), 400
        
        file = request.files['file']
        
        # 验证文件
        validate_file(file)
        
        # 生成安全的文件名（完全重命名）
        ext = file.filename.rsplit('.', 1)[-1].lower()
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # 保存文件
        file.save(filepath)
        
        # 计算文件哈希（用于去重）
        with open(filepath, 'rb') as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()
        
        return jsonify({
            'message': '上传成功',
            'filename': filename,
            'hash': file_hash,
            'size': os.path.getsize(filepath)
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': '上传失败'}), 500
```

---

## 实战案例

### 案例 1：头像上传系统

```python
from flask import Flask, request, jsonify
from PIL import Image
import os
import uuid

app = Flask(__name__)
app.config['AVATAR_FOLDER'] = 'avatars'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB

os.makedirs(app.config['AVATAR_FOLDER'], exist_ok=True)

@app.route('/upload-avatar', methods=['POST'])
def upload_avatar():
    """上传头像（自动裁剪为正方形）"""
    
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    # 验证是否为图片
    if not file.content_type.startswith('image/'):
        return jsonify({'error': '只支持图片'}), 400
    
    try:
        # 打开图片
        img = Image.open(file.stream)
        
        # 转换为 RGB（移除透明通道）
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 裁剪为正方形（中心裁剪）
        width, height = img.size
        size = min(width, height)
        left = (width - size) // 2
        top = (height - size) // 2
        img = img.crop((left, top, left + size, top + size))
        
        # 生成三种尺寸
        sizes = {
            'large': 400,
            'medium': 200,
            'small': 100
        }
        
        filename = uuid.uuid4().hex
        urls = {}
        
        for size_name, size_px in sizes.items():
            # 缩放
            resized = img.copy()
            resized.thumbnail((size_px, size_px), Image.Resampling.LANCZOS)
            
            # 保存
            filepath = os.path.join(
                app.config['AVATAR_FOLDER'],
                f"{filename}_{size_name}.jpg"
            )
            resized.save(filepath, 'JPEG', quality=85, optimize=True)
            
            urls[size_name] = f"/avatars/{filename}_{size_name}.jpg"
        
        return jsonify({
            'message': '头像上传成功',
            'urls': urls
        }), 200
        
    except Exception as e:
        return jsonify({'error': '图片处理失败'}), 500
```

### 案例 2：文档管理系统

```python
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime

app = FastAPI()

UPLOAD_DIR = "documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 模拟数据库模型
class Document:
    def __init__(self, id, filename, original_name, size, uploaded_at):
        self.id = id
        self.filename = filename
        self.original_name = original_name
        self.size = size
        self.uploaded_at = uploaded_at

# 模拟数据库
documents_db = []

@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """上传文档"""
    
    # 验证文件类型
    allowed_types = ['application/pdf', 'application/msword',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="只支持 PDF 和 Word 文档")
    
    # 保存文件
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # 保存记录到数据库
    document = Document(
        id=len(documents_db) + 1,
        filename=filename,
        original_name=file.filename,
        size=len(content),
        uploaded_at=datetime.now()
    )
    documents_db.append(document)
    
    return {
        "id": document.id,
        "filename": document.original_name,
        "size": document.size
    }

@app.get("/documents")
async def list_documents():
    """列出所有文档"""
    return [{
        "id": doc.id,
        "filename": doc.original_name,
        "size": doc.size,
        "uploaded_at": doc.uploaded_at.isoformat()
    } for doc in documents_db]

@app.get("/documents/{document_id}/download")
async def download_document(document_id: int):
    """下载文档"""
    
    # 查找文档
    document = next((doc for doc in documents_db if doc.id == document_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    filepath = os.path.join(UPLOAD_DIR, document.filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return FileResponse(
        filepath,
        filename=document.original_name,
        media_type='application/octet-stream'
    )

@app.delete("/documents/{document_id}")
async def delete_document(document_id: int):
    """删除文档"""
    
    # 查找文档
    document = next((doc for doc in documents_db if doc.id == document_id), None)
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    
    # 删除文件
    filepath = os.path.join(UPLOAD_DIR, document.filename)
    if os.path.exists(filepath):
        os.remove(filepath)
    
    # 从数据库删除
    documents_db.remove(document)
    
    return {"message": "删除成功"}
```

### 案例 3：图片相册

```python
from flask import Flask, request, jsonify, send_file
from PIL import Image
import os
import uuid
from datetime import datetime

app = Flask(__name__)

ALBUM_DIR = 'albums'
THUMB_DIR = 'thumbnails'
os.makedirs(ALBUM_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

# 模拟数据库
photos_db = []

@app.route('/albums/upload', methods=['POST'])
def upload_photos():
    """批量上传照片"""
    
    if 'files' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    files = request.files.getlist('files')
    
    if len(files) > 20:
        return jsonify({'error': '最多上传 20 张照片'}), 400
    
    uploaded = []
    
    for file in files:
        # 验证图片
        if not file.content_type.startswith('image/'):
            continue
        
        try:
            # 打开图片
            img = Image.open(file.stream)
            
            # 读取 EXIF 信息
            exif = img._getexif() if hasattr(img, '_getexif') else None
            
            # 保存原图
            ext = file.filename.rsplit('.', 1)[-1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            filepath = os.path.join(ALBUM_DIR, filename)
            img.save(filepath, quality=95)
            
            # 生成缩略图
            thumb = img.copy()
            thumb.thumbnail((300, 300), Image.Resampling.LANCZOS)
            thumb_path = os.path.join(THUMB_DIR, filename)
            thumb.save(thumb_path, quality=85)
            
            # 保存记录
            photo = {
                'id': len(photos_db) + 1,
                'filename': filename,
                'original_name': file.filename,
                'width': img.width,
                'height': img.height,
                'size': os.path.getsize(filepath),
                'uploaded_at': datetime.now().isoformat()
            }
            photos_db.append(photo)
            uploaded.append(photo)
            
        except Exception as e:
            print(f"处理 {file.filename} 失败: {e}")
            continue
    
    return jsonify({
        'message': f'成功上传 {len(uploaded)} 张照片',
        'photos': uploaded
    }), 200

@app.route('/albums/photos')
def list_photos():
    """获取相册列表"""
    return jsonify({'photos': photos_db})

@app.route('/albums/photos/<int:photo_id>')
def get_photo(photo_id):
    """获取单张照片"""
    photo = next((p for p in photos_db if p['id'] == photo_id), None)
    if not photo:
        return jsonify({'error': '照片不存在'}), 404
    
    filepath = os.path.join(ALBUM_DIR, photo['filename'])
    return send_file(filepath, mimetype='image/jpeg')

@app.route('/albums/photos/<int:photo_id>/thumbnail')
def get_thumbnail(photo_id):
    """获取缩略图"""
    photo = next((p for p in photos_db if p['id'] == photo_id), None)
    if not photo:
        return jsonify({'error': '照片不存在'}), 404
    
    thumb_path = os.path.join(THUMB_DIR, photo['filename'])
    return send_file(thumb_path, mimetype='image/jpeg')
```

---

## 易错点

### 1. 不使用 secure_filename

```python
# ❌ 错误：直接使用用户提供的文件名
filename = request.files['file'].filename
file.save(f'uploads/{filename}')
# 风险：路径遍历攻击（../../etc/passwd）

# ✅ 正确：清理文件名或完全重命名
from werkzeug.utils import secure_filename
filename = secure_filename(request.files['file'].filename)
# 或者
filename = f"{uuid.uuid4().hex}.{ext}"
```

### 2. 忘记验证文件大小

```python
# ❌ 错误：不限制大小
@app.route('/upload')
def upload():
    file = request.files['file']
    file.save('uploads/file.jpg')  # 可能导致内存溢出

# ✅ 正确：设置大小限制
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB

@app.route('/upload')
def upload():
    file = request.files['file']
    # Flask 会自动拒绝超过限制的请求
    file.save('uploads/file.jpg')
```

### 3. 只验证扩展名

```python
# ❌ 错误：只检查扩展名
def allowed_file(filename):
    return filename.endswith('.jpg')
# 风险：攻击者可以上传 virus.exe.jpg

# ✅ 正确：验证文件内容
import magic

def validate_file(file):
    # 检查真实的文件类型
    file_magic = magic.from_buffer(file.read(2048), mime=True)
    file.seek(0)
    return file_magic == 'image/jpeg'
```

### 4. 文件名冲突

```python
# ❌ 错误：直接使用原文件名
file.save(f'uploads/{file.filename}')
# 风险：同名文件会被覆盖

# ✅ 正确：生成唯一文件名
import uuid
ext = file.filename.rsplit('.', 1)[1]
unique_filename = f"{uuid.uuid4().hex}.{ext}"
file.save(f'uploads/{unique_filename}')
```

### 5. 不处理图片方向（EXIF）

```python
# ❌ 错误：直接保存图片
img = Image.open(file)
img.save('output.jpg')
# 问题：某些手机拍摄的照片会旋转显示

# ✅ 正确：处理 EXIF 方向
from PIL import Image, ExifTags

def fix_image_orientation(img):
    """根据 EXIF 信息旋转图片"""
    try:
        for orientation in ExifTags.TAGS.keys():
            if ExifTags.TAGS[orientation] == 'Orientation':
                break
        
        exif = img._getexif()
        if exif is not None:
            orientation_value = exif.get(orientation)
            
            if orientation_value == 3:
                img = img.rotate(180, expand=True)
            elif orientation_value == 6:
                img = img.rotate(270, expand=True)
            elif orientation_value == 8:
                img = img.rotate(90, expand=True)
    except:
        pass
    
    return img
```

### 6. 内存溢出（大文件）

```python
# ❌ 错误：一次性读取整个文件
content = file.read()  # 如果文件是 1 GB，会占用 1 GB 内存

# ✅ 正确：流式处理
CHUNK_SIZE = 8192
with open('output.jpg', 'wb') as f:
    while True:
        chunk = file.read(CHUNK_SIZE)
        if not chunk:
            break
        f.write(chunk)
```

### 7. 不清理上传目录

```python
# ❌ 错误：上传文件永久保留
# 问题：磁盘空间逐渐耗尽

# ✅ 正确：定期清理过期文件
import os
import time

def cleanup_old_files(directory, days=7):
    """删除 N 天前的文件"""
    now = time.time()
    cutoff = now - (days * 86400)
    
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            if os.path.getmtime(filepath) < cutoff:
                os.remove(filepath)
```

---

## 练习题

### 练习 1：基础上传

实现一个 Flask 文件上传接口，要求：
- 只允许上传 PNG 和 JPG 图片
- 文件大小不超过 5 MB
- 使用 UUID 重命名文件
- 返回文件 URL

<details>
<summary>参考答案</summary>

```python
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件类型'}), 400
    
    # 生成唯一文件名
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    file.save(filepath)
    
    return jsonify({
        'message': '上传成功',
        'url': f'/uploads/{filename}'
    }), 200
```
</details>

### 练习 2：图片缩放

编写函数，将上传的图片缩放到指定宽度，保持宽高比。

<details>
<summary>参考答案</summary>

```python
from PIL import Image

def resize_image_by_width(input_path, output_path, target_width):
    """按宽度缩放图片，保持宽高比"""
    img = Image.open(input_path)
    
    # 计算新高度
    width_percent = target_width / float(img.size[0])
    target_height = int(float(img.size[1]) * width_percent)
    
    # 缩放
    img = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # 保存
    img.save(output_path, quality=85, optimize=True)

# 使用示例
resize_image_by_width('large.jpg', 'small.jpg', 800)
```
</details>

### 练习 3：多文件上传

实现 FastAPI 多文件上传，要求：
- 最多上传 5 个文件
- 每个文件不超过 10 MB
- 返回所有文件的信息

<details>
<summary>参考答案</summary>

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from typing import List
import os
import uuid

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-multiple")
async def upload_multiple(files: List[UploadFile] = File(...)):
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="最多上传 5 个文件")
    
    uploaded = []
    
    for file in files:
        # 检查大小
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"{file.filename} 超过 10 MB")
        
        # 保存
        ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        with open(filepath, "wb") as f:
            f.write(content)
        
        uploaded.append({
            'filename': filename,
            'original': file.filename,
            'size': len(content)
        })
    
    return {"files": uploaded, "count": len(uploaded)}
```
</details>

### 练习 4：生成缩略图

编写函数，为图片生成三种尺寸的缩略图（小、中、大）。

<details>
<summary>参考答案</summary>

```python
from PIL import Image
import os

def create_thumbnails(input_path, output_dir):
    """生成三种尺寸的缩略图"""
    sizes = {
        'small': (150, 150),
        'medium': (300, 300),
        'large': (600, 600)
    }
    
    img = Image.open(input_path)
    filename = os.path.basename(input_path)
    name, ext = os.path.splitext(filename)
    
    result = {}
    
    for size_name, (width, height) in sizes.items():
        thumb = img.copy()
        thumb.thumbnail((width, height), Image.Resampling.LANCZOS)
        
        output_path = os.path.join(output_dir, f"{name}_{size_name}{ext}")
        thumb.save(output_path, quality=85)
        
        result[size_name] = output_path
    
    return result

# 使用示例
thumbnails = create_thumbnails('photo.jpg', 'thumbnails/')
print(thumbnails)
# {'small': 'thumbnails/photo_small.jpg', ...}
```
</details>

### 练习 5：安全验证

编写完整的文件安全验证函数，包括扩展名、MIME 类型和文件内容验证。

<details>
<summary>参考答案</summary>

```python
import magic

def validate_file_security(file, allowed_extensions, allowed_mime_types):
    """完整的文件安全验证"""
    
    # 1. 验证扩展名
    if not file.filename:
        raise ValueError("文件名为空")
    
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed_extensions:
        raise ValueError(f"不支持的扩展名: {ext}")
    
    # 2. 验证 MIME 类型
    if file.content_type not in allowed_mime_types:
        raise ValueError(f"不支持的 MIME 类型: {file.content_type}")
    
    # 3. 验证文件内容
    file.stream.seek(0)
    file_magic = magic.from_buffer(file.stream.read(2048), mime=True)
    file.stream.seek(0)
    
    if file_magic not in allowed_mime_types:
        raise ValueError(f"文件内容类型不匹配: {file_magic}")
    
    return True

# 使用示例
try:
    validate_file_security(
        file,
        allowed_extensions={'jpg', 'png'},
        allowed_mime_types={'image/jpeg', 'image/png'}
    )
except ValueError as e:
    print(f"验证失败: {e}")
```
</details>

### 练习 6：断点续传

实现简单的断点续传功能，支持查询已上传的块。

<details>
<summary>参考答案</summary>

```python
from fastapi import FastAPI, UploadFile, File, Form
from pathlib import Path

app = FastAPI()

CHUNK_DIR = Path("chunks")
CHUNK_DIR.mkdir(exist_ok=True)

@app.get("/upload-status/{file_id}")
async def get_status(file_id: str):
    """查询已上传的块"""
    file_dir = CHUNK_DIR / file_id
    
    if not file_dir.exists():
        return {"uploaded": []}
    
    uploaded = []
    for chunk in file_dir.iterdir():
        if chunk.name.startswith("chunk_"):
            index = int(chunk.name.split("_")[1])
            uploaded.append(index)
    
    return {"uploaded": sorted(uploaded)}

@app.post("/upload-chunk")
async def upload_chunk(
    file: UploadFile = File(...),
    chunk_index: int = Form(...),
    file_id: str = Form(...)
):
    """上传块"""
    file_dir = CHUNK_DIR / file_id
    file_dir.mkdir(exist_ok=True)
    
    chunk_path = file_dir / f"chunk_{chunk_index}"
    
    # 如果已存在，跳过
    if chunk_path.exists():
        return {"status": "exists"}
    
    # 保存
    with open(chunk_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"status": "success"}
```
</details>

---

## 总结

文件上传与处理的核心要点：

1. **安全第一**：多层验证（扩展名、MIME、内容）、防止路径遍历、限制大小
2. **文件命名**：使用 UUID 或哈希，避免冲突和注入攻击
3. **图片处理**：使用 Pillow 进行缩放、裁剪、水印、格式转换
4. **大文件**：分块上传、流式处理、断点续传
5. **存储策略**：本地存储按日期/用户分类，生产环境推荐对象存储（OSS/S3）
6. **性能优化**：异步处理、缓存、CDN 加速

**下一步学习：**
- [中间件开发](./12-middleware.md) - 学习请求拦截和处理
- [RESTful API](./07-restful-api.md) - 设计文件上传 API
- [Web 认证与授权](./10-authentication.md) - 保护上传接口
