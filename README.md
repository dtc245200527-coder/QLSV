# ĐỀ TÀI 02: HỆ THỐNG QUẢN LÝ SINH VIÊN (SMS)
> **Môn học**: Triển khai và Quản trị Hệ thống Phần mềm (TKQT HTPM K23)  
> **Sinh viên thực hiện**: **Đỗ Ngọc Anh**  
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

## 🌐 3. Danh sách các Cổng và Dịch vụ (Port Mapping)

### 3.1. Các cổng công khai mở ra ngoài Host:

| Dịch vụ | Cổng Host | Giao thức | Địa chỉ truy cập | Tài khoản / Ghi chú |
| :--- | :---: | :---: | :--- | :--- |
| **Nginx Reverse Proxy (HTTPS)** | **`443`** | HTTPS | [https://localhost](https://localhost) | Cổng truy cập chính bảo mật SSL tự ký & Security Headers |
| **Nginx Reverse Proxy (HTTP)** | **`80`** | HTTP | [http://localhost](http://localhost) | Tự động chuyển hướng (HTTP 301 Redirect) sang HTTPS 443 |
| **Hệ thống Quản lý Sinh viên** | **`3000`** | HTTP | [http://localhost:3000](http://localhost:3000) | Node.js Web App trực tiếp (hoặc qua HTTPS 443) |
| **Cổng quản trị phpMyAdmin** | **`8080`** | HTTP | [http://localhost:8080](http://localhost:8080) | `student_user` / `SecurePass_2026@TKQTPM!` |
| **Grafana Dashboard** | **`3001`** | HTTP | [http://localhost:3001](http://localhost:3001) | Biểu đồ giám sát CPU/RAM & truy vấn Loki LogQL (User: `admin` / `admin`) |
| **Prometheus Server** | **`9090`** | HTTP | [http://localhost:9090](http://localhost:9090) | Bảng điều khiển thu thập Time-Series Metrics & Scrape Targets |
| **Grafana Loki API** | **`3100`** | HTTP | [http://localhost:3100](http://localhost:3100) | Máy chủ thu nhận và lập chỉ mục Log tập trung |
| **Healthcheck Web App** | **`3000`** | HTTP | [http://localhost:3000/health](http://localhost:3000/health) | API JSON kiểm tra trạng thái hoạt động ứng dụng |
| **Metrics Web App** | **`3000`** | HTTP | [http://localhost:3000/metrics](http://localhost:3000/metrics) | Prometheus Scrape Target chỉ số HTTP traffic |

### 3.2. Các cổng dịch vụ nội bộ (Network Isolation - Hardening):

| Dịch vụ | Cổng Container | Mạng nội bộ | Mục đích sử dụng |
| :--- | :---: | :--- | :--- |
| **MySQL 8.0** | `3306` | `backend-net` | **Cô lập bảo mật:** Cổng CSDL chỉ giao tiếp trong mạng nội bộ, không mở ra Host để tránh tấn công brute-force. |
| **cAdvisor** | `8080` | `monitoring-net` | Xuất metrics container (CPU, RAM, Network) cho Prometheus (`http://cadvisor:8080/metrics`). |
| **Nginx Exporter** | `9113` | `monitoring-net` | Thu thập metrics Nginx stub_status cho Prometheus (`http://nginx-exporter:9113/metrics`). |
| **MySQL Exporter** | `9104` | `backend-net`, `monitoring-net` | Thu thập chỉ số truy vấn MySQL cho Prometheus (`http://mysql-exporter:9104/metrics`). |
| **Promtail** | `9080` | `logging-net` | Daemon đọc Docker logs và chuyển tiếp tới Loki qua cổng `3100`. |

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
