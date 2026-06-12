# WebSocket 实时通信

WebSocket 实现浏览器与服务器的全双工实时通信，适用于聊天、实时通知、协同编辑等场景。

## WebSocket 基础

### 与 HTTP 的区别

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信方式 | 单向（请求-响应） | 双向（全双工） |
| 连接 | 短连接 | 长连接 |
| 开销 | 每次请求都有 HTTP 头 | 握手后开销极小 |
| 实时性 | 需要轮询 | 真正实时 |

### 生命周期

```
1. 握手（HTTP Upgrade）
2. 连接建立
3. 消息传输（双向）
4. 连接关闭
```

## Flask-SocketIO

### 安装

```bash
pip install flask-socketio python-socketio eventlet
```

### 基础示例

```python
from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('index.html')

# 客户端连接
@socketio.on('connect')
def handle_connect():
    print(f'Client connected: {request.sid}')
    emit('response', {'data': 'Connected'})

# 接收消息
@socketio.on('message')
def handle_message(data):
    print(f'Received message: {data}')
    emit('response', {'data': f'Server received: {data}'})

# 广播消息
@socketio.on('broadcast')
def handle_broadcast(data):
    emit('broadcast_message', data, broadcast=True)

# 断开连接
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
```

### 前端代码

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
    <input id="message" type="text">
    <button onclick="sendMessage()">Send</button>
    <div id="messages"></div>

    <script>
        const socket = io('http://localhost:5000');

        // 连接成功
        socket.on('connect', () => {
            console.log('Connected');
        });

        // 接收消息
        socket.on('response', (data) => {
            document.getElementById('messages').innerHTML += 
                `<p>${data.data}</p>`;
        });

        // 发送消息
        function sendMessage() {
            const msg = document.getElementById('message').value;
            socket.emit('message', msg);
        }

        // 断开连接
        socket.on('disconnect', () => {
            console.log('Disconnected');
        });
    </script>
</body>
</html>
```

## 聊天室实战

```python
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
socketio = SocketIO(app)

users = {}  # {sid: username}
rooms = {}  # {room_name: [sid1, sid2, ...]}

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    
    join_room(room)
    users[request.sid] = username
    
    if room not in rooms:
        rooms[room] = []
    rooms[room].append(request.sid)
    
    emit('message', {
        'username': 'System',
        'message': f'{username} 加入了房间'
    }, room=room)

@socketio.on('send_message')
def handle_message(data):
    room = data['room']
    message = data['message']
    username = users.get(request.sid, 'Anonymous')
    
    emit('message', {
        'username': username,
        'message': message
    }, room=room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    username = users.get(request.sid, 'Anonymous')
    
    leave_room(room)
    if request.sid in rooms.get(room, []):
        rooms[room].remove(request.sid)
    
    emit('message', {
        'username': 'System',
        'message': f'{username} 离开了房间'
    }, room=room)

@socketio.on('typing')
def on_typing(data):
    room = data['room']
    username = users.get(request.sid, 'Anonymous')
    emit('user_typing', {'username': username}, room=room, include_self=False)
```

## Django Channels

### 安装

```bash
pip install channels channels-redis daphne
```

### 配置

`settings.py`：

```python
INSTALLED_APPS = [
    'daphne',  # 放在最前面
    'channels',
    ...
]

ASGI_APPLICATION = 'myproject.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### Consumer

`chat/consumers.py`：

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        # 加入房间组
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        # 离开房间组
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        username = data['username']
        
        # 发送消息到房间组
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username
            }
        )
    
    async def chat_message(self, event):
        # 接收来自房间组的消息
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username']
        }))
```

### 路由

`chat/routing.py`：

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
]
```

`myproject/asgi.py`：

```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import chat.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
```

### 前端连接

```javascript
const roomName = 'lobby';
const ws = new WebSocket(`ws://localhost:8000/ws/chat/${roomName}/`);

ws.onopen = () => {
    console.log('WebSocket connected');
};

ws.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log('Message:', data.message, 'from', data.username);
};

ws.onclose = () => {
    console.log('WebSocket disconnected');
};

// 发送消息
function sendMessage(message) {
    ws.send(JSON.stringify({
        'message': message,
        'username': 'Alice'
    }));
}
```

## FastAPI WebSocket

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You: {data}", websocket)
            await manager.broadcast(f"Client {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client {client_id} left")
```

### 前端示例

```html
<!DOCTYPE html>
<html>
<body>
    <input id="messageInput" type="text">
    <button onclick="sendMessage()">Send</button>
    <ul id="messages"></ul>

    <script>
        const ws = new WebSocket("ws://localhost:8000/ws/123");
        
        ws.onmessage = (event) => {
            const messages = document.getElementById('messages');
            const message = document.createElement('li');
            message.textContent = event.data;
            messages.appendChild(message);
        };
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            ws.send(input.value);
            input.value = '';
        }
    </script>
</body>
</html>
```

## 实战：在线协同编辑

```python
from flask_socketio import SocketIO, emit, join_room

socketio = SocketIO(app)

documents = {}  # {doc_id: content}

@socketio.on('join_document')
def on_join_document(data):
    doc_id = data['doc_id']
    join_room(doc_id)
    
    # 发送当前文档内容
    content = documents.get(doc_id, '')
    emit('document_content', {'content': content})

@socketio.on('edit')
def on_edit(data):
    doc_id = data['doc_id']
    content = data['content']
    position = data['position']
    
    # 更新文档
    documents[doc_id] = content
    
    # 广播编辑操作
    emit('edit_broadcast', {
        'content': content,
        'position': position,
        'user': request.sid
    }, room=doc_id, include_self=False)
```

## 实战：实时通知系统

```python
from flask_socketio import emit
from flask_login import current_user

@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        join_room(f'user_{current_user.id}')

def send_notification(user_id, message):
    socketio.emit('notification', {
        'message': message,
        'timestamp': datetime.now().isoformat()
    }, room=f'user_{user_id}')

# 在其他地方触发通知
@app.route('/api/posts', methods=['POST'])
def create_post():
    # ... 创建文章
    send_notification(author_id, '你的文章已发布')
    return jsonify({'status': 'success'})
```

## 性能优化

### 1. 使用 Redis 作为消息代理

```python
# Flask-SocketIO
socketio = SocketIO(app, message_queue='redis://localhost:6379')

# Django Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

### 2. 心跳检测

```javascript
let heartbeatInterval;

ws.onopen = () => {
    heartbeatInterval = setInterval(() => {
        ws.send(JSON.stringify({type: 'ping'}));
    }, 30000);  // 每 30 秒发送心跳
};

ws.onclose = () => {
    clearInterval(heartbeatInterval);
};
```

### 3. 断线重连

```javascript
let ws;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function connect() {
    ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
        console.log('Connected');
        reconnectAttempts = 0;
    };
    
    ws.onclose = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
            setTimeout(() => {
                reconnectAttempts++;
                connect();
            }, 2000 * reconnectAttempts);  // 指数退避
        }
    };
}

connect();
```

## 安全性

### 1. 认证

```python
from flask_socketio import disconnect

@socketio.on('connect')
def handle_connect():
    token = request.args.get('token')
    if not verify_token(token):
        disconnect()
        return False
```

### 2. CORS 配置

```python
# Flask-SocketIO
socketio = SocketIO(app, cors_allowed_origins=["https://yourdomain.com"])

# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
)
```

### 3. 消息验证

```python
@socketio.on('message')
def handle_message(data):
    if not isinstance(data, dict) or 'content' not in data:
        return {'error': 'Invalid message format'}
    
    content = data['content']
    if len(content) > 1000:
        return {'error': 'Message too long'}
```

::: tip 最佳实践
1. 使用 Redis 作为消息代理支持横向扩展
2. 实现心跳检测和断线重连
3. 对消息进行验证和过滤
4. 使用房间隔离不同用户/场景
5. 生产环境使用 HTTPS + WSS
:::

## 下一步

- **[Nginx 高级配置](08-nginx-advanced.md)** - WebSocket 代理配置
- **[Flask 进阶](03-flask-advanced.md)** - Flask-SocketIO 集成
- **[Django 进阶](06-django-advanced.md)** - Django Channels 深入
