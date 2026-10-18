const express = require('express');
const path = require('path');
const morgan = require('morgan');
const { logger, morganStream } = require('./logger');
const { initDB, getPool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));
app.use(express.static(path.join(__dirname, '../public')));

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Health Check Endpoint (For Docker & Prometheus)
app.get('/health', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', database: 'CONNECTED', timestamp: new Date() });
  } catch (err) {
    logger.error(`Healthcheck failed: ${err.message}`);
    res.status(500).json({ status: 'DOWN', error: err.message });
  }
});

// Metrics dummy endpoint (can be queried or scraped)
let requestCount = 0;
app.use((req, res, next) => {
  requestCount++;
  next();
});
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${requestCount}
`);
});

// 1. Dashboard Route
app.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) AS totalStudents FROM students');
    const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) AS totalClasses FROM classes');
    const [[{ totalGrades }]] = await pool.query('SELECT COUNT(*) AS totalGrades FROM grades');
    
    // Top 5 recent students
    const [recentStudents] = await pool.query(`
      SELECT s.id, s.student_code, s.full_name, s.gender, s.email, c.class_name
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.id DESC LIMIT 5
    `);

    res.render('dashboard', {
      title: 'Tổng quan hệ thống',
      totalStudents,
      totalClasses,
      totalGrades,
      recentStudents
    });
  } catch (err) {
    logger.error(`Lỗi tải trang Dashboard: ${err.message}`);
    res.status(500).render('error', { error: err.message });
  }
});

// 2. Students Routes
app.get('/students', async (req, res) => {
  try {
    const pool = getPool();
    const [students] = await pool.query(`
      SELECT s.*, c.class_name, c.class_code
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY s.id DESC
    `);
    const [classes] = await pool.query('SELECT * FROM classes ORDER BY class_name ASC');

    res.render('students', {
      title: 'Quản lý Sinh viên',
      students,
      classes
    });
  } catch (err) {
    logger.error(`Lỗi tải danh sách sinh viên: ${err.message}`);
    res.status(500).render('error', { error: err.message });
  }
});

app.post('/students/add', async (req, res) => {
  const { student_code, full_name, gender, dob, email, phone, class_id } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO students (student_code, full_name, gender, dob, email, phone, class_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_code, full_name, gender, dob, email, phone, class_id || null]
    );
    logger.info(`ACTION: ADD_STUDENT - Thêm thành công sinh viên [${student_code}] ${full_name}`);
    res.redirect('/students');
  } catch (err) {
    logger.error(`ACTION: ADD_STUDENT_FAILED - Mã SV: ${student_code}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể thêm sinh viên: ${err.message}` });
  }
});

app.post('/students/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, gender, dob, email, phone, class_id } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE students SET full_name = ?, gender = ?, dob = ?, email = ?, phone = ?, class_id = ?
       WHERE id = ?`,
      [full_name, gender, dob, email, phone, class_id || null, id]
    );
    logger.info(`ACTION: UPDATE_STUDENT - Cập nhật thông tin sinh viên ID [${id}] - ${full_name}`);
    res.redirect('/students');
  } catch (err) {
    logger.error(`ACTION: UPDATE_STUDENT_FAILED - ID: ${id}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể cập nhật sinh viên: ${err.message}` });
  }
});

app.post('/students/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    logger.warn(`ACTION: DELETE_STUDENT - Đã xóa sinh viên ID [${id}]`);
    res.redirect('/students');
  } catch (err) {
    logger.error(`ACTION: DELETE_STUDENT_FAILED - ID: ${id}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể xóa sinh viên: ${err.message}` });
  }
});

// 3. Classes Routes
app.get('/classes', async (req, res) => {
  try {
    const pool = getPool();
    const [classes] = await pool.query(`
      SELECT c.*, COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);
    res.render('classes', { title: 'Quản lý Lớp học', classes });
  } catch (err) {
    logger.error(`Lỗi tải danh sách lớp: ${err.message}`);
    res.status(500).render('error', { error: err.message });
  }
});

app.post('/classes/add', async (req, res) => {
  const { class_code, class_name, faculty } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      'INSERT INTO classes (class_code, class_name, faculty) VALUES (?, ?, ?)',
      [class_code, class_name, faculty]
    );
    logger.info(`ACTION: ADD_CLASS - Thêm thành công lớp học [${class_code}] ${class_name}`);
    res.redirect('/classes');
  } catch (err) {
    logger.error(`ACTION: ADD_CLASS_FAILED - Lớp: ${class_code}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể thêm lớp học: ${err.message}` });
  }
});

app.post('/classes/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    logger.warn(`ACTION: DELETE_CLASS - Đã xóa lớp học ID [${id}]`);
    res.redirect('/classes');
  } catch (err) {
    logger.error(`ACTION: DELETE_CLASS_FAILED - ID: ${id}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể xóa lớp: ${err.message}` });
  }
});

// 4. Grades Routes
app.get('/grades', async (req, res) => {
  try {
    const pool = getPool();
    const [grades] = await pool.query(`
      SELECT g.*, s.student_code, s.full_name, c.class_name,
        ROUND((g.attendance_score * 0.1 + g.midterm_score * 0.3 + g.final_score * 0.6), 2) AS total_score
      FROM grades g
      JOIN students s ON g.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      ORDER BY g.id DESC
    `);
    const [students] = await pool.query('SELECT id, student_code, full_name FROM students ORDER BY full_name ASC');

    res.render('grades', { title: 'Quản lý Điểm số', grades, students });
  } catch (err) {
    logger.error(`Lỗi tải bảng điểm: ${err.message}`);
    res.status(500).render('error', { error: err.message });
  }
});

app.post('/grades/add', async (req, res) => {
  const { student_id, subject_name, attendance_score, midterm_score, final_score } = req.body;
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO grades (student_id, subject_name, attendance_score, midterm_score, final_score)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, subject_name, attendance_score || 0, midterm_score || 0, final_score || 0]
    );
    logger.info(`ACTION: ADD_GRADE - Nhập điểm môn [${subject_name}] cho sinh viên ID [${student_id}]`);
    res.redirect('/grades');
  } catch (err) {
    logger.error(`ACTION: ADD_GRADE_FAILED - SV ID: ${student_id}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể nhập điểm: ${err.message}` });
  }
});

app.post('/grades/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    await pool.query('DELETE FROM grades WHERE id = ?', [id]);
    logger.warn(`ACTION: DELETE_GRADE - Đã xóa bản ghi điểm ID [${id}]`);
    res.redirect('/grades');
  } catch (err) {
    logger.error(`ACTION: DELETE_GRADE_FAILED - ID: ${id}, Lỗi: ${err.message}`);
    res.status(500).render('error', { error: `Không thể xóa điểm: ${err.message}` });
  }
});

// Start Server
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server đang chạy trên cổng ${PORT} (http://localhost:${PORT})`);
    });
  } catch (err) {
    logger.error(`Không thể khởi động server: ${err.message}`);
    process.exit(1);
  }
}

startServer();
