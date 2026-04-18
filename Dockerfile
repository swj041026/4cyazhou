# 崖城风骨 - 崖州古城建筑文化数字图鉴
# Dockerfile for 1Panel 部署

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 8080

# 启动命令
CMD ["node", "api-server.js"]
