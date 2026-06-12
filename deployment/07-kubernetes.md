# Kubernetes 入门

Kubernetes（K8s）是容器编排平台，用于自动化部署、扩展和管理容器化应用。

## 核心概念

### 架构组件

```
Control Plane（控制平面）
├── API Server      # 所有操作的入口
├── etcd           # 存储集群数据
├── Scheduler      # 调度 Pod 到节点
└── Controller     # 维护集群状态

Node（工作节点）
├── kubelet        # 管理 Pod
├── kube-proxy     # 网络代理
└── Container Runtime  # Docker/containerd
```

### 核心资源

| 资源 | 说明 |
|------|------|
| Pod | 最小部署单元，包含一个或多个容器 |
| Deployment | 管理 Pod 副本，支持滚动更新 |
| Service | 暴露 Pod 服务，提供负载均衡 |
| ConfigMap | 存储配置信息 |
| Secret | 存储敏感信息（密码、密钥） |
| Ingress | HTTP/HTTPS 路由 |
| PersistentVolume | 持久化存储 |

## 安装

### Minikube（本地开发）

```bash
# 安装 Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 启动集群
minikube start

# 查看状态
minikube status
kubectl cluster-info
```

### kubectl 命令行工具

```bash
# 安装
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# 验证
kubectl version --client
```

## Pod

### 创建 Pod

`pod.yaml`：

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
  labels:
    app: myapp
spec:
  containers:
  - name: myapp
    image: myapp:latest
    ports:
    - containerPort: 8000
    env:
    - name: DATABASE_URL
      value: "postgresql://localhost/mydb"
```

```bash
# 创建
kubectl apply -f pod.yaml

# 查看
kubectl get pods
kubectl describe pod myapp-pod

# 日志
kubectl logs myapp-pod

# 进入容器
kubectl exec -it myapp-pod -- /bin/bash

# 删除
kubectl delete pod myapp-pod
```

## Deployment

### 创建 Deployment

`deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 3  # 副本数
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:1.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "64Mi"
            cpu: "250m"
          limits:
            memory: "128Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
# 创建
kubectl apply -f deployment.yaml

# 查看
kubectl get deployments
kubectl get pods

# 扩容
kubectl scale deployment myapp-deployment --replicas=5

# 滚动更新
kubectl set image deployment/myapp-deployment myapp=myapp:2.0

# 查看更新状态
kubectl rollout status deployment/myapp-deployment

# 查看历史
kubectl rollout history deployment/myapp-deployment

# 回滚
kubectl rollout undo deployment/myapp-deployment
```

## Service

### ClusterIP（集群内部）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

### NodePort（外部访问）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8000
    nodePort: 30080  # 30000-32767
```

### LoadBalancer（云环境）

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp-lb
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8000
```

```bash
# 创建
kubectl apply -f service.yaml

# 查看
kubectl get services
kubectl describe service myapp-service

# 查看端点
kubectl get endpoints myapp-service
```

## ConfigMap

### 创建 ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  app.conf: |
    debug = false
    log_level = info
  DATABASE_HOST: "postgres.default.svc.cluster.local"
  DATABASE_PORT: "5432"
```

### 使用 ConfigMap

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp
    image: myapp:latest
    env:
    - name: DATABASE_HOST
      valueFrom:
        configMapKeyRef:
          name: myapp-config
          key: DATABASE_HOST
    volumeMounts:
    - name: config
      mountPath: /etc/config
  volumes:
  - name: config
    configMap:
      name: myapp-config
```

## Secret

### 创建 Secret

```bash
# 命令行创建
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123
```

```yaml
# YAML 创建（base64 编码）
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=        # admin
  password: c2VjcmV0MTIz    # secret123
```

### 使用 Secret

```yaml
spec:
  containers:
  - name: myapp
    env:
    - name: DB_USERNAME
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: username
    - name: DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: db-secret
          key: password
```

## PersistentVolume

### PV 和 PVC

```yaml
# PersistentVolume
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/pv

---
# PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

### 使用 PVC

```yaml
spec:
  containers:
  - name: myapp
    volumeMounts:
    - name: data
      mountPath: /app/data
  volumes:
  - name: data
    persistentVolumeClaim:
      claimName: pvc-data
```

## Ingress

### 安装 Ingress Controller

```bash
# Nginx Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

### 配置 Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: myapp-service
            port:
              number: 80
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
```

## 完整应用示例

### Flask 应用部署

`flask-deployment.yaml`：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flask-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flask
  template:
    metadata:
      labels:
        app: flask
    spec:
      containers:
      - name: flask
        image: myflask:1.0
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: production
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 5000
          initialDelaySeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: flask-service
spec:
  selector:
    app: flask
  ports:
  - port: 80
    targetPort: 5000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: flask-ingress
spec:
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: flask-service
            port:
              number: 80
```

部署：

```bash
kubectl apply -f flask-deployment.yaml

# 查看状态
kubectl get all

# 查看日志
kubectl logs -l app=flask --tail=100 -f
```

## 常用命令

```bash
# 查看资源
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# 详细信息
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>

# 日志
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # 实时日志
kubectl logs <pod-name> -c <container-name>  # 多容器

# 执行命令
kubectl exec <pod-name> -- ls /app
kubectl exec -it <pod-name> -- /bin/bash

# 端口转发
kubectl port-forward pod/<pod-name> 8080:80
kubectl port-forward service/<service-name> 8080:80

# 复制文件
kubectl cp <pod-name>:/path/to/file ./local-file
kubectl cp ./local-file <pod-name>:/path/to/file

# 删除资源
kubectl delete pod <pod-name>
kubectl delete deployment <deployment-name>
kubectl delete -f deployment.yaml

# 查看集群信息
kubectl cluster-info
kubectl get nodes
kubectl top nodes
kubectl top pods
```

## Namespace

```bash
# 创建命名空间
kubectl create namespace dev
kubectl create namespace prod

# 在指定命名空间操作
kubectl get pods -n dev
kubectl apply -f deployment.yaml -n prod

# 设置默认命名空间
kubectl config set-context --current --namespace=dev
```

## 调试技巧

### 查看事件

```bash
kubectl get events
kubectl get events -n <namespace>
```

### 查看资源使用

```bash
kubectl top nodes
kubectl top pods
kubectl top pods -n <namespace>
```

### 临时 Pod 调试

```bash
# 运行临时 Pod
kubectl run debug-pod --image=busybox --rm -it -- sh

# 使用特定镜像调试网络
kubectl run curl-pod --image=curlimages/curl --rm -it -- sh
```

## 生产最佳实践

### 1. 资源限制

```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### 2. 健康检查

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### 3. 滚动更新策略

```yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

### 4. Pod 反亲和性

```yaml
spec:
  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
            - key: app
              operator: In
              values:
              - myapp
          topologyKey: kubernetes.io/hostname
```

::: tip 最佳实践
1. 使用 Deployment 而非裸 Pod
2. 始终设置资源请求和限制
3. 配置健康检查
4. 使用 ConfigMap/Secret 管理配置
5. 使用 Namespace 隔离环境
6. 启用滚动更新策略
:::

## 下一步

- **[Docker 容器化](03-docker.md)** - 构建 K8s 使用的镜像
- **[CI/CD 自动化](04-cicd.md)** - 自动部署到 K8s
- **[监控与日志](05-monitoring.md)** - K8s 监控方案
