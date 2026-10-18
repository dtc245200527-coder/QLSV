# ĐỀ TÀI 02: HỆ THỐNG QUẢN LÝ SINH VIÊN (SMS)
> **Môn học**: Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM K23)  
> **Sinh viên thực hiện**: `dtc245200527-coder`  
> **Mã số sinh viên**: `DTC245200527`  
> **Email**: `dtc245200527@ictu.edu.vn`  
> **Repository GitHub**: [https://github.com/dtc245200527-coder/QLSV](https://github.com/dtc245200527-coder/QLSV)

---

## 📌 1. Giới thiệu Đề tài
Dự án triển khai website **Hệ thống Quản lý Sinh viên** phục vụ quản lý thông tin sinh viên, lớp học và điểm số (CRUD), đáp ứng đầy đủ các tiêu chuẩn hiện đại về triển khai và quản trị hệ thống phần mềm:
- **Web App**: Node.js / Express.js tích hợp hệ thống Logging (Winston + Morgan).
- **Cơ sở dữ liệu**: MySQL 8.0 tự động khởi tạo dữ liệu mẫu (`01-init.sql`).
- **Quản trị CSDL**: phpMyAdmin.
- **Reverse Proxy**: Nginx (HTTPS SSL tự ký + Security Headers).
- **Giám sát (Monitoring)**: Prometheus + Grafana + cAdvisor / mysqld_exporter.
- **Quản lý Log tập trung**: Grafana Loki + Promtail (truy vấn LogQL).
- **Bảo mật (Hardening)**: Chạy container Non-root (`uid=1001`), Phân vùng mạng (Network Isolation), Quản lý mật khẩu qua `.env`, Giới hạn tài nguyên (Resource Limits).

---

## 🚀 2. Hướng dẫn Cài đặt & Khởi chạy

### Yêu cầu tiên quyết:
- Đã cài đặt Docker và Docker Compose (v2.x trở lên).

### Các bước thực hiện:

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/dtc245200527-coder/QLSV.git
   cd QLSV
   ```

2. **Cấu hình biến môi trường**:
   ```bash
   cp .env.example .env
   ```

3. **Khởi chạy toàn bộ hệ thống bằng Docker Compose**:
   ```bash
   docker compose up -d --build
   ```

4. **Kiểm tra trạng thái các container**:
   ```bash
   docker compose ps
   ```

---

## 🌐 3. Danh sách các Cổng và Dịch vụ

| Dịch vụ | Địa chỉ truy cập | Tài khoản / Mật khẩu |
| :--- | :--- | :--- |
| **Hệ thống Quản lý Sinh viên** | [http://localhost:3000](http://localhost:3000) | Truy cập trực tiếp |
| **Cổng quản trị phpMyAdmin** | [http://localhost:8080](http://localhost:8080) | `student_user` / `SecurePass_2026@TKQTPM!` |
| **Kiểm tra Healthcheck Web** | [http://localhost:3000/health](http://localhost:3000/health) | API JSON Status |
| **Metrics Web App** | [http://localhost:3000/metrics](http://localhost:3000/metrics) | Prometheus Scrape Target |

---

## 🛡️ 4. Xác minh Bảo mật Hardening
Để kiểm tra container Web App đang chạy dưới quyền Non-root User theo đúng tiêu chí an toàn:
```bash
docker compose exec app id
# Kết quả mong muốn: uid=1001(appuser) gid=1001(appgroup)
```

Xem log ứng dụng ghi nhận hoạt động (Winston & Morgan):
```bash
docker compose logs app --tail 20
```
