-- Database initialization script for Student Management System
CREATE DATABASE IF NOT EXISTS student_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_db;

-- 1. Table Classes (Lớp học)
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) NOT NULL UNIQUE,
    class_name VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table Students (Sinh viên)
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Nam',
    dob DATE NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    class_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table Grades (Điểm số)
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    attendance_score DECIMAL(4,2) DEFAULT 0.00,
    midterm_score DECIMAL(4,2) DEFAULT 0.00,
    final_score DECIMAL(4,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Sample Data
INSERT INTO classes (class_code, class_name, faculty) VALUES
('D23CQCN01', 'Công nghệ thông tin 01', 'Khoa Công nghệ Thông tin'),
('D23CQCN02', 'Công nghệ thông tin 02', 'Khoa Công nghệ Thông tin'),
('D23CQAT01', 'An toàn thông tin 01', 'Khoa An toàn Thông tin');

INSERT INTO students (student_code, full_name, gender, dob, email, phone, class_id) VALUES
('B23DCCN001', 'Nguyễn Văn An', 'Nam', '2005-03-15', 'an.nv@ptit.edu.vn', '0912345678', 1),
('B23DCCN002', 'Trần Thị Bình', 'Nữ', '2005-07-22', 'binh.tt@ptit.edu.vn', '0987654321', 1),
('B23DCAT001', 'Lê Hoàng Cường', 'Nam', '2005-11-09', 'cuong.lh@ptit.edu.vn', '0905123456', 3);

INSERT INTO grades (student_id, subject_name, attendance_score, midterm_score, final_score) VALUES
(1, 'Triển khai và Quản trị HTPM', 9.0, 8.5, 9.0),
(1, 'Kiến trúc phần mềm', 8.5, 7.5, 8.0),
(2, 'Triển khai và Quản trị HTPM', 9.5, 9.0, 9.5),
(3, 'Mạng máy tính', 8.0, 8.0, 8.5);
