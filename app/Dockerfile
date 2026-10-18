# Multi-stage or lightweight Node alpine base
FROM node:18-alpine

# Hardening: Tối ưu bảo mật môi trường production
ENV NODE_ENV=production

# Thiết lập thư mục làm việc
WORKDIR /usr/src/app

# Sao chép package files
COPY package*.json ./

# Cài đặt production dependencies
RUN npm install --omit=dev

# Sao chép mã nguồn
COPY . .

# Hardening: Tạo non-root user và group (UID 1001) để chạy ứng dụng an toàn
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

# Chuyển sang non-root user
USER appuser

# Expose port
EXPOSE 3000

# Healthcheck nội bộ container
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Khởi chạy ứng dụng
CMD ["node", "src/server.js"]
