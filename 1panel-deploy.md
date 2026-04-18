# 1Panel 部署指南 - 崖城风骨

## 方式一：使用 1Panel 容器管理（推荐）

### 步骤 1：准备项目文件

1. 将项目文件上传到服务器（如 `/opt/yazhou-guocai` 目录）
2. 确保包含以下文件：
   - `Dockerfile`
   - `docker-compose.yml`
   - `.env`（从 `.env.example` 复制并配置）
   - 所有网站文件（html, css, js, images 等）

### 步骤 2：配置环境变量

```bash
cd /opt/yazhou-guocai
cp .env.example .env
nano .env
```

编辑 `.env` 文件：
```
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### 步骤 3：在 1Panel 中部署

1. 登录 1Panel 面板
2. 进入【容器】→【编排】
3. 点击【创建编排】
4. 选择【路径】，填写 `/opt/yazhou-guocai`
5. 点击【确定】，等待部署完成

### 步骤 4：配置反向代理

1. 进入【网站】→【创建网站】→【反向代理】
2. 填写域名：`sujianyu.cn`
3. 代理地址填写：`http://127.0.0.1:6677`
4. 点击【确定】
5. 申请 SSL 证书（可选但推荐）

---

## 方式二：使用 1Panel 运行环境

### 步骤 1：创建运行环境

1. 进入【运行环境】→【Node.js】
2. 点击【创建运行环境】
3. 选择 Node.js 版本：18.x
4. 代码目录：选择项目目录
5. 启动命令：`node api-server.js`
6. 端口：8080

### 步骤 2：配置环境变量

在运行环境配置中，添加环境变量：
- `DEEPSEEK_API_KEY` = your_api_key_here
- `DEEPSEEK_BASE_URL` = https://api.deepseek.com

### 步骤 3：启动并配置网站

1. 启动运行环境
2. 进入【网站】创建反向代理，指向该运行环境端口

---

## 方式三：命令行部署（适合熟悉 Docker 的用户）

```bash
# 进入项目目录
cd /opt/yazhou-guocai

# 创建环境变量文件
echo "DEEPSEEK_API_KEY=your_api_key_here" > .env
echo "DEEPSEEK_BASE_URL=https://api.deepseek.com" >> .env

# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 验证部署

1. **访问网站**：打开配置的域名，确认页面正常显示
2. **测试 AI 功能**：点击右下角智能助手图标，发送消息测试
3. **检查 API 状态**：访问 `https://sujianyu.cn/api/health`

---

## 常见问题

### 1. AI 返回 "API密钥未配置"
- 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确设置
- 重启容器使配置生效

### 2. 容器无法启动
```bash
# 查看容器日志
docker logs yazhou-guocai
```

### 3. 端口冲突
修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "6677:8080"  # 将主机 6677 映射到容器 8080
```

### 4. 静态资源加载失败
确保所有文件（包括 images, bkmusic 目录）都已上传到服务器

---

## 更新部署

```bash
cd /opt/yazhou-guocai

# 拉取最新代码（如果使用 git）
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

---

## 备份建议

定期备份以下内容：
1. 项目代码文件
2. `.env` 配置文件（包含 API 密钥）
3. 1Panel 网站配置

---

## 技术支持

- Deepseek API 文档：https://platform.deepseek.com/
- 1Panel 文档：https://1panel.cn/docs/
