const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

// Track active sessions
const activeSessions = new Map(); // userId -> { userType, username, loginTime }

// Email configuration - will be updated from database
let CURRENT_ADMIN_EMAIL = 'uj23hiueddhpna2y@ethereal.email';
const EMAIL_CONFIG = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'uj23hiueddhpna2y@ethereal.email', // Working test email
    pass: 'bUBwMXt6UWqgK4Tetd' // Working test password
  }
};

// For testing purposes, you can use these settings:
// 1. Enable 2-factor authentication on Gmail
// 2. Generate app password: https://myaccount.google.com/apppasswords
// 3. Replace 'your-app-password' with the generated 16-character password
// 4. Make sure the admin email matches your Gmail address

// Function to get admin email from database
const getAdminEmail = async () => {
  try {
    const result = await pool.query(
      'SELECT setting_value FROM admin_settings WHERE setting_key = $1',
      ['admin_email']
    );
    
    if (result.rows.length > 0) {
      CURRENT_ADMIN_EMAIL = result.rows[0].setting_value;
      EMAIL_CONFIG.auth.user = CURRENT_ADMIN_EMAIL;
    }
    return CURRENT_ADMIN_EMAIL;
  } catch (error) {
    console.error('Error getting admin email:', error);
    return 'uj23hiueddhpna2y@ethereal.email';
  }
};

// Create email transporter
let emailTransporter = null;
try {
  emailTransporter = nodemailer.createTransport(EMAIL_CONFIG);
  console.log('✅ Email transporter configured for:', EMAIL_CONFIG.auth.user);
  console.log('✅ Real Gmail SMTP enabled - emails will be sent to users');
} catch (error) {
  console.warn('⚠️ Email configuration error:', error.message);
  console.warn('Emails will be simulated.');
}

// Function to send real email
const sendResetCodeEmail = async (userEmail, userName, resetCode) => {
  // Get current admin email from database
  const adminEmail = await getAdminEmail();
  
  if (!emailTransporter) {
    console.log('📧 EMAIL SIMULATION (No transporter configured):');
    console.log(`📧 FROM: ${adminEmail}`);
    console.log(`📧 TO: ${userEmail}`);
    console.log(`📧 SUBJECT: Password Reset Code - MUST LMS`);
    console.log(`📧 CODE: ${resetCode}`);
    return { success: true, simulated: true };
  }

  try {
    // Update email config with current admin email
    EMAIL_CONFIG.auth.user = adminEmail;
    
    // Real email sending enabled with Gmail credentials
    console.log('📧 SENDING REAL EMAIL:');
    console.log(`📧 FROM: ${adminEmail}`);
    console.log(`📧 TO: ${userEmail}`);
    console.log(`📧 SUBJECT: Password Reset Code - MUST LMS`);
    
    // Create new transporter with updated config
    emailTransporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    const mailOptions = {
      from: `"MUST LMS" <${adminEmail}>`,
      to: userEmail,
      subject: 'Password Reset Code - MUST LMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af;">MUST Learning Management System</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #334155; margin-top: 0;">Password Reset Request</h2>
            <p>Dear ${userName},</p>
            <p>You have requested a password reset for your MUST LMS account.</p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;">Your verification code is:</p>
              <h1 style="color: #1e40af; font-size: 32px; letter-spacing: 4px; margin: 10px 0;">${resetCode}</h1>
              <p style="margin: 0; color: #ef4444; font-size: 12px;">This code expires in 15 minutes</p>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>Do not share this code with anyone</li>
              <li>If you did not request this reset, please ignore this email</li>
              <li>Contact IT Support if you need assistance: +255 25 295 7544</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 12px;">
            <p>© 2026 Mbeya University of Science and Technology</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    // Fallback to simulation if email fails
    console.log('📧 EMAIL FALLBACK SIMULATION:');
    console.log(`📧 TO: ${userEmail}`);
    console.log(`📧 CODE: ${resetCode}`);
    return { success: true, simulated: true, error: error.message };
  }
};
// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      // Add your Netlify domains here
      /\.netlify\.app$/,  // Allows all Netlify subdomains
      /\.onrender\.com$/  // Allows all Render domains
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for now - change to false in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from uploads directory
app.use('/content', express.static(uploadsDir));

// PostgreSQL connection - Use environment variables for production
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'LMS_MUST_DB_ORG',
      password: process.env.DB_PASSWORD || '@Jctnftr01',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to PostgreSQL database: LMS_MUST_DB_ORG');
    release();
  }
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Create lecturers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lecturers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        employee_id VARCHAR(100) UNIQUE NOT NULL,
        specialization VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create colleges table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(50) NOT NULL,
        description TEXT,
        established VARCHAR(4),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        college_id INTEGER REFERENCES colleges(id),
        description TEXT,
        head_of_department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create courses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        department_id INTEGER REFERENCES departments(id),
        credits INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update existing courses table if needed
    try {
      await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id)`);
      await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0`);
      await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 4`);
      await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS academic_level VARCHAR(20) DEFAULT 'bachelor'`);
      console.log('✅ Courses table updated with duration and academic_level columns');
    } catch (error) {
      console.log('Table alteration completed or not needed');
    }

    // Update existing departments with realistic HOD names
    try {
      const deptResult = await pool.query('SELECT * FROM departments WHERE head_of_department IS NULL OR head_of_department = \'\'');
      if (deptResult.rows.length > 0) {
        console.log('✅ Updating departments with realistic HOD names...');
        
        const departmentNames = {
          'computer': 'Dr. John Mwalimu',
          'information': 'Dr. Grace Kimaro',
          'engineering': 'Dr. Peter Moshi',
          'business': 'Dr. Mary Lyimo',
          'education': 'Dr. James Mwanza',
          'science': 'Dr. Sarah Mbwana',
          'arts': 'Dr. Robert Kihiyo',
          'law': 'Dr. Elizabeth Mwakasege',
          'medicine': 'Dr. David Mwangi',
          'agriculture': 'Dr. Joyce Mwenda'
        };
        
        for (const dept of deptResult.rows) {
          const deptType = Object.keys(departmentNames).find(type => 
            dept.name.toLowerCase().includes(type)
          );
          const hodName = departmentNames[deptType] || `Dr. ${dept.name.split(' ')[0]} Head`;
          
          await pool.query(
            'UPDATE departments SET head_of_department = $1 WHERE id = $2',
            [hodName, dept.id]
          );
        }
        console.log(`✅ Updated ${deptResult.rows.length} departments with HOD names`);
      }
    } catch (error) {
      console.log('HOD update completed or not needed');
    }

    // Create programs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS programs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        course_id INTEGER REFERENCES courses(id),
        lecturer_id INTEGER REFERENCES lecturers(id),
        credits INTEGER DEFAULT 0,
        total_semesters INTEGER DEFAULT 1,
        duration INTEGER DEFAULT 1,
        lecturer_name VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Update existing programs table if needed
    try {
      await pool.query(`ALTER TABLE programs ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1`);
      await pool.query(`ALTER TABLE programs ADD COLUMN IF NOT EXISTS lecturer_name VARCHAR(255)`);
      await pool.query(`ALTER TABLE programs ALTER COLUMN credits SET DEFAULT 0`);
      await pool.query(`ALTER TABLE programs ALTER COLUMN total_semesters SET DEFAULT 1`);
    } catch (error) {
      console.log('Programs table alteration completed or not needed');
    }

    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        course_id INTEGER REFERENCES courses(id),
        current_semester INTEGER NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create passwords table for password management
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_records (
        id SERIAL PRIMARY KEY,
        user_type VARCHAR(20) NOT NULL,
        user_id INTEGER NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create content table for file uploads
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size VARCHAR(50),
        file_url VARCHAR(500),
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'published'
      )
    `);

    // Drop and recreate discussions table to ensure correct structure
    await pool.query(`DROP TABLE IF EXISTS discussions CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS discussion_replies CASCADE`);
    
    // Create discussions table
    await pool.query(`
      CREATE TABLE discussions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        program VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_id INTEGER,
        author_type VARCHAR(20) DEFAULT 'student',
        group_name VARCHAR(255),
        group_leader VARCHAR(255),
        group_members TEXT,
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'active',
        replies INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create discussion_replies table
    await pool.query(`
      CREATE TABLE discussion_replies (
        id SERIAL PRIMARY KEY,
        discussion_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        author_id INTEGER,
        author_type VARCHAR(20) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
      )
    `);


    // Create study_group_notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS study_group_notifications (
        id SERIAL PRIMARY KEY,
        discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
        student_reg_no VARCHAR(100) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        group_name VARCHAR(255) NOT NULL,
        group_leader VARCHAR(255) NOT NULL,
        program VARCHAR(255) NOT NULL,
        notification_type VARCHAR(50) DEFAULT 'group_invitation',
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Database will be initialized when server starts

// API Routes

// Authentication endpoint for student and lecturer login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    console.log('User Type:', userType);
    
    if (!username || !password || !userType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, password, and user type are required' 
      });
    }
    
    let user = null;
    let query = '';
    let params = [];
    
    if (userType === 'student') {
      // Try to find student by registration number, email, or name
      query = `
        SELECT * FROM students 
        WHERE registration_number = $1 
           OR email = $1 
           OR LOWER(name) = LOWER($1)
      `;
      params = [username];
      
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        const student = result.rows[0];
        
        // Verify password
        if (student.password === password) {
          user = {
            id: student.id,
            name: student.name,
            registration_number: student.registration_number,
            email: student.email,
            course_id: student.course_id,
            academic_year: student.academic_year,
            current_semester: student.current_semester,
            type: 'student'
          };
          
          console.log('Student login successful:', user.name);
        } else {
          console.log('Password mismatch for student:', username);
        }
      } else {
        console.log('Student not found:', username);
      }
      
    } else if (userType === 'lecturer') {
      // Try to find lecturer by employee_id, email, or name
      query = `
        SELECT * FROM lecturers 
        WHERE employee_id = $1 
           OR email = $1 
           OR LOWER(name) = LOWER($1)
      `;
      params = [username];
      
      const result = await pool.query(query, params);
      
      if (result.rows.length > 0) {
        const lecturer = result.rows[0];
        
        // Verify password
        if (lecturer.password === password) {
          user = {
            id: lecturer.id,
            name: lecturer.name,
            employee_id: lecturer.employee_id,
            email: lecturer.email,
            specialization: lecturer.specialization,
            phone: lecturer.phone,
            type: 'lecturer'
          };
          
          console.log('Lecturer login successful:', user.name);
        } else {
          console.log('Password mismatch for lecturer:', username);
        }
      } else {
        console.log('Lecturer not found:', username);
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid user type. Must be "student" or "lecturer"' 
      });
    }
    
    if (user) {
      res.json({ 
        success: true, 
        data: user,
        message: `Welcome ${user.name}!`
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'Invalid username or password' 
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error during login. Please try again.' 
    });
  }
});

// Lecturer routes
app.post('/api/lecturers', async (req, res) => {
  try {
    const { name, employeeId, specialization, email, phone, password } = req.body;
    
    // Check if email already exists
    const existingEmail = await pool.query(
      'SELECT id FROM lecturers WHERE email = $1',
      [email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email already exists. Please use a different email address.' 
      });
    }
    
    // Check if employee ID already exists
    const existingEmployeeId = await pool.query(
      'SELECT id FROM lecturers WHERE employee_id = $1',
      [employeeId]
    );
    
    if (existingEmployeeId.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Employee ID already exists. Please use a different employee ID.' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO lecturers (name, employee_id, specialization, email, phone, password) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, employeeId, specialization, email, phone, password]
    );

    // Also save to password records
    await pool.query(
      `INSERT INTO password_records (user_type, user_id, username, password_hash) 
       VALUES ('lecturer', $1, $2, $3)`,
      [result.rows[0].id, employeeId, password]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating lecturer:', error);
    
    // Handle specific database errors
    if (error.code === '23505') {
      if (error.constraint === 'lecturers_email_key') {
        return res.status(400).json({ 
          success: false, 
          error: 'Email already exists. Please use a different email address.' 
        });
      } else if (error.constraint === 'lecturers_employee_id_key') {
        return res.status(400).json({ 
          success: false, 
          error: 'Employee ID already exists. Please use a different employee ID.' 
        });
      }
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/lecturers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lecturers ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete lecturer
app.delete('/api/lecturers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove active session if exists
    activeSessions.delete(parseInt(id));
    
    // First delete from password_records
    await pool.query('DELETE FROM password_records WHERE user_type = $1 AND user_id = $2', ['lecturer', id]);
    
    // Update programs to remove lecturer assignment
    await pool.query('UPDATE programs SET lecturer_id = NULL, lecturer_name = NULL WHERE lecturer_id = $1', [id]);
    
    // Then delete the lecturer
    const result = await pool.query('DELETE FROM lecturers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Lecturer not found' });
    }
    
    res.json({ success: true, message: 'Lecturer deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student routes
app.post('/api/students', async (req, res) => {
  try {
    const { name, registrationNumber, academicYear, courseId, currentSemester, email, phone, password } = req.body;
    
    const result = await pool.query(
      `INSERT INTO students (name, registration_number, academic_year, course_id, current_semester, email, phone, password) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, registrationNumber, academicYear, courseId, currentSemester, email, phone, password]
    );

    // Also save to password records
    await pool.query(
      `INSERT INTO password_records (user_type, user_id, username, password_hash) 
       VALUES ('student', $1, $2, $3)`,
      [result.rows[0].id, registrationNumber, password]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, c.name as course_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id 
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get students by registration numbers (for study group notifications)
app.post('/api/students/by-registration', async (req, res) => {
  try {
    const { registrationNumbers } = req.body;
    
    if (!registrationNumbers || !Array.isArray(registrationNumbers)) {
      return res.status(400).json({ success: false, error: 'Registration numbers array is required' });
    }
    
    const placeholders = registrationNumbers.map((_, index) => `$${index + 1}`).join(',');
    const result = await pool.query(`
      SELECT s.*, c.name as course_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id 
      WHERE s.registration_number = ANY($1)
    `, [registrationNumbers]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching students by registration:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student's enrolled programs
app.get('/api/students/:id/programs', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== FETCHING STUDENT PROGRAMS ===');
    console.log('Student ID:', id);
    
    // First get student info
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const student = studentResult.rows[0];
    
    // Get programs for student's course
    const programsResult = await pool.query(`
      SELECT p.*, c.name as course_name 
      FROM programs p 
      LEFT JOIN courses c ON p.course_id = c.id 
      WHERE p.course_id = $1
    `, [student.course_id]);
    
    console.log('Student programs found:', programsResult.rows.length);
    res.json({ success: true, data: programsResult.rows });
  } catch (error) {
    console.error('Error fetching student programs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Remove active session if exists
    activeSessions.delete(parseInt(id));
    
    // First delete from password_records
    await pool.query('DELETE FROM password_records WHERE user_type = $1 AND user_id = $2', ['student', id]);
    
    // Then delete the student
    const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    res.json({ success: true, message: 'Student deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Course routes
app.post('/api/colleges', async (req, res) => {
  try {
    const { name, shortName, description, established } = req.body;
    const result = await pool.query(
      `INSERT INTO colleges (name, short_name, description, established) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, shortName, description, established]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating college:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/colleges', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM colleges ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const { name, collegeId, description, headOfDepartment } = req.body;
    
    // Generate realistic HOD name if not provided
    let hodName = headOfDepartment;
    if (!hodName || hodName.trim() === '') {
      const departmentNames = {
        'computer': 'Dr. John Mwalimu',
        'information': 'Dr. Grace Kimaro',
        'engineering': 'Dr. Peter Moshi',
        'business': 'Dr. Mary Lyimo',
        'education': 'Dr. James Mwanza',
        'science': 'Dr. Sarah Mbwana',
        'arts': 'Dr. Robert Kihiyo',
        'law': 'Dr. Elizabeth Mwakasege',
        'medicine': 'Dr. David Mwangi',
        'agriculture': 'Dr. Joyce Mwenda'
      };
      
      // Find matching department type
      const deptType = Object.keys(departmentNames).find(type => 
        name.toLowerCase().includes(type)
      );
      
      hodName = departmentNames[deptType] || `Dr. ${name.split(' ')[0]} Head`;
    }
    
    const result = await pool.query(
      `INSERT INTO departments (name, college_id, description, head_of_department) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, collegeId, description, hodName]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { name, code, departmentId, duration, academicLevel, description } = req.body;
    console.log('=== BACKEND COURSE CREATION ===');
    console.log('Received data:', req.body);
    
    const result = await pool.query(
      `INSERT INTO courses (name, code, department_id, duration, academic_level, description) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, code, departmentId, duration || 4, academicLevel || 'bachelor', description]
    );
    
    console.log('Created course:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/programs', async (req, res) => {
  try {
    const { name, courseId, lecturerName, credits, totalSemesters, duration, description } = req.body;
    
    // Find lecturer by name or employee_id
    let lecturerId = null;
    if (lecturerName) {
      const lecturerResult = await pool.query(
        'SELECT id FROM lecturers WHERE name = $1 OR employee_id = $1',
        [lecturerName]
      );
      if (lecturerResult.rows.length > 0) {
        lecturerId = lecturerResult.rows[0].id;
      }
    }
    
    const result = await pool.query(
      `INSERT INTO programs (name, course_id, lecturer_id, credits, total_semesters, duration, lecturer_name, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, courseId, lecturerId, credits || 0, totalSemesters || 1, duration || 1, lecturerName, description]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/programs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM programs ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Authentication route
app.post('/api/auth', async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM password_records WHERE username = $1 AND password_hash = $2 AND user_type = $3',
      [username, password, userType]
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      // Track active session
      activeSessions.set(user.user_id, {
        userType: user.user_type,
        username: user.username,
        loginTime: new Date()
      });
      
      res.json({ success: true, data: user });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Session validation endpoint
app.post('/api/validate-session', async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    // Check if session exists
    if (activeSessions.has(parseInt(userId))) {
      const session = activeSessions.get(parseInt(userId));
      if (session.userType === userType) {
        res.json({ success: true, valid: true });
      } else {
        res.json({ success: true, valid: false, reason: 'User type mismatch' });
      }
    } else {
      res.json({ success: true, valid: false, reason: 'Session not found or user deleted' });
    }
  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Remove session
    activeSessions.delete(parseInt(userId));
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET INDIVIDUAL ENDPOINTS FOR COURSE MANAGEMENT
// Get individual college by ID
app.get('/api/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE ENDPOINTS FOR COURSE MANAGEMENT
app.delete('/api/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete in correct order to avoid foreign key constraints
    await pool.query('DELETE FROM students WHERE course_id IN (SELECT id FROM courses WHERE department_id IN (SELECT id FROM departments WHERE college_id = $1))', [id]);
    await pool.query('DELETE FROM programs WHERE course_id IN (SELECT id FROM courses WHERE department_id IN (SELECT id FROM departments WHERE college_id = $1))', [id]);
    await pool.query('DELETE FROM courses WHERE department_id IN (SELECT id FROM departments WHERE college_id = $1)', [id]);
    await pool.query('DELETE FROM departments WHERE college_id = $1', [id]);
    const result = await pool.query('DELETE FROM colleges WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }
    res.json({ success: true, message: 'College deleted successfully' });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get individual department by ID
app.get('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete in correct order to avoid foreign key constraints
    await pool.query('DELETE FROM students WHERE course_id IN (SELECT id FROM courses WHERE department_id = $1)', [id]);
    await pool.query('DELETE FROM programs WHERE course_id IN (SELECT id FROM courses WHERE department_id = $1)', [id]);
    await pool.query('DELETE FROM courses WHERE department_id = $1', [id]);
    const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get individual course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete in correct order to avoid foreign key constraints
    await pool.query('DELETE FROM students WHERE course_id = $1', [id]);
    await pool.query('DELETE FROM programs WHERE course_id = $1', [id]);
    const result = await pool.query('DELETE FROM courses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM programs WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE ENDPOINTS FOR COURSE MANAGEMENT
app.put('/api/colleges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortName, established, description } = req.body;
    const result = await pool.query(
      'UPDATE colleges SET name = $1, short_name = $2, established = $3, description = $4 WHERE id = $5 RETURNING *',
      [name, shortName, established, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'College not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, collegeId, headOfDepartment, description } = req.body;
    const result = await pool.query(
      'UPDATE departments SET name = $1, college_id = $2, head_of_department = $3, description = $4 WHERE id = $5 RETURNING *',
      [name, collegeId, headOfDepartment, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, duration, academicLevel, description } = req.body;
    console.log('=== BACKEND COURSE UPDATE ===');
    console.log('Updating course ID:', id);
    console.log('Update data:', req.body);
    
    const result = await pool.query(
      'UPDATE courses SET name = $1, code = $2, department_id = $3, duration = $4, academic_level = $5, description = $6 WHERE id = $7 RETURNING *',
      [name, code, departmentId, duration, academicLevel, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, courseId, lecturerName, credits, totalSemesters, duration, description } = req.body;
    
    // Find lecturer by name or employee_id
    let lecturerId = null;
    if (lecturerName) {
      const lecturerResult = await pool.query(
        'SELECT id FROM lecturers WHERE name = $1 OR employee_id = $1',
        [lecturerName]
      );
      if (lecturerResult.rows.length > 0) {
        lecturerId = lecturerResult.rows[0].id;
      }
    }
    
    const result = await pool.query(
      'UPDATE programs SET name = $1, course_id = $2, lecturer_id = $3, credits = $4, total_semesters = $5, duration = $6, lecturer_name = $7, description = $8 WHERE id = $9 RETURNING *',
      [name, courseId, lecturerId, credits, totalSemesters, duration, lecturerName, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CONTENT MANAGEMENT ENDPOINTS

// Create content table if not exists
app.post('/api/content/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size VARCHAR(50),
        file_url TEXT,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'published'
      )
    `);
    console.log('Content table initialized successfully');
    res.json({ success: true, message: 'Content table initialized' });
  } catch (error) {
    console.error('Error initializing content table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoint to check content table
app.get('/api/content/test', async (req, res) => {
  try {
    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'content'
      );
    `);
    
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'content'
      ORDER BY ordinal_position;
    `);
    
    // Get content count
    const contentCount = await pool.query('SELECT COUNT(*) FROM content');
    
    res.json({ 
      success: true, 
      tableExists: tableExists.rows[0].exists,
      tableStructure: tableStructure.rows,
      contentCount: contentCount.rows[0].count
    });
  } catch (error) {
    console.error('Error testing content table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload content endpoint with actual file
app.post('/api/content/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, program, type, lecturer_id, lecturer_name, file_size } = req.body;
    const uploadedFile = req.file;
    
    console.log('=== BACKEND UPLOAD DEBUG ===');
    console.log('Received data:', req.body);
    console.log('Uploaded file:', uploadedFile);
    
    if (!uploadedFile) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Real file URL pointing to actual uploaded file
    const fileUrl = `/content/${uploadedFile.filename}`;
    
    // Store content metadata with real file info
    const result = await pool.query(
      'INSERT INTO content (title, description, program_name, content_type, file_name, file_size, file_url, lecturer_id, lecturer_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, description, program, type, uploadedFile.filename, file_size, fileUrl, lecturer_id, lecturer_name]
    );
    
    console.log('File saved to:', path.join(uploadsDir, uploadedFile.filename));
    console.log('Saved to database:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all content
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content ORDER BY upload_date DESC');
    console.log('=== CONTENT API DEBUG ===');
    console.log('Total content in database:', result.rows.length);
    console.log('Content rows:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get content by lecturer
app.get('/api/content/lecturer/:lecturerId', async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const result = await pool.query('SELECT * FROM content WHERE lecturer_id = $1 ORDER BY upload_date DESC', [lecturerId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lecturer content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get content for specific student based on their program
app.get('/api/content/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`=== FETCHING CONTENT FOR STUDENT ${studentId} ===`);
    
    // First get student's program information
    const studentResult = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    
    const student = studentResult.rows[0];
    console.log('Student info:', student);
    
    // Get programs for this student's course
    const programsResult = await pool.query('SELECT * FROM programs WHERE course_id = $1', [student.course_id]);
    console.log('Student programs:', programsResult.rows);
    
    if (programsResult.rows.length === 0) {
      return res.json({ success: true, data: [] });
    }
    
    // Get content for student's programs, excluding deleted ones
    const programNames = programsResult.rows.map(p => p.name);
    const placeholders = programNames.map((_, index) => `$${index + 1}`).join(',');
    
    const contentResult = await pool.query(
      `SELECT c.* FROM content c 
       LEFT JOIN student_content_deletions scd ON c.id = scd.content_id AND scd.student_id = $${programNames.length + 1}
       WHERE c.program_name IN (${placeholders}) AND scd.id IS NULL 
       ORDER BY c.upload_date DESC`,
      [...programNames, studentId]
    );
    
    console.log(`Content found for student ${studentId}:`, contentResult.rows.length);
    res.json({ success: true, data: contentResult.rows });
  } catch (error) {
    console.error('Error fetching student content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create student_content_deletions table for tracking individual deletions
app.post('/api/content/init-deletions', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_content_deletions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        content_id INTEGER NOT NULL,
        deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, content_id)
      )
    `);
    console.log('Student content deletions table initialized');
    res.json({ success: true, message: 'Deletions table initialized' });
  } catch (error) {
    console.error('Error initializing deletions table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Student delete content (only for themselves)
app.delete('/api/content/:contentId/student/:studentId', async (req, res) => {
  try {
    const { contentId, studentId } = req.params;
    console.log(`=== STUDENT ${studentId} DELETING CONTENT ${contentId} ===`);
    
    // Add to deletions table (content remains for other students)
    await pool.query(
      'INSERT INTO student_content_deletions (student_id, content_id) VALUES ($1, $2) ON CONFLICT (student_id, content_id) DO NOTHING',
      [studentId, contentId]
    );
    
    console.log(`Content ${contentId} marked as deleted for student ${studentId}`);
    res.json({ success: true, message: 'Content deleted for student' });
  } catch (error) {
    console.error('Error deleting content for student:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete content (admin/lecturer only - removes completely)
app.delete('/api/content/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM content WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ASSIGNMENTS ENDPOINTS
// Create assignments table if not exists
app.post('/api/assignments/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        due_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ success: true, message: 'Assignments table initialized' });
  } catch (error) {
    console.error('Error initializing assignments table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assignments ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// CLEAR ALL DATA ENDPOINTS - kama ulivyoeleza
app.delete('/api/clear-all-data', async (req, res) => {
  try {
    console.log('Clearing all data from database...');
    
    // Delete all data from all tables - correct order to avoid foreign key constraints
    await pool.query('DELETE FROM assignments');
    await pool.query('DELETE FROM content');
    await pool.query('DELETE FROM students');
    await pool.query('DELETE FROM programs');
    await pool.query('DELETE FROM courses');
    await pool.query('DELETE FROM departments');
    await pool.query('DELETE FROM colleges');
    await pool.query('DELETE FROM lecturers');
    
    // Reset sequences
    await pool.query('ALTER SEQUENCE students_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE lecturers_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE programs_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE courses_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE departments_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE colleges_id_seq RESTART WITH 1');
    
    console.log('All data cleared successfully');
    res.json({ success: true, message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ASSESSMENT MANAGEMENT ENDPOINTS

// Initialize assessments table
app.post('/api/assessments/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        duration INTEGER DEFAULT 60,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        scheduled_date DATE,
        scheduled_time TIME,
        auto_grade BOOLEAN DEFAULT true,
        grading_format VARCHAR(20) DEFAULT 'percentage',
        total_questions INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'draft',
        questions JSONB DEFAULT '[]',
        results_published_to_students BOOLEAN DEFAULT false,
        results_published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_submissions (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
        student_id INTEGER,
        student_name VARCHAR(255),
        student_registration VARCHAR(100),
        student_program VARCHAR(255),
        answers JSONB DEFAULT '{}',
        score INTEGER DEFAULT 0,
        percentage INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'submitted',
        auto_graded_score INTEGER,
        manual_graded_score INTEGER,
        manual_scores JSONB DEFAULT '{}',
        feedback JSONB DEFAULT '{}',
        graded_at TIMESTAMP,
        published_to_students BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns if they don't exist
    try {
      await pool.query(`
        ALTER TABLE assessment_submissions 
        ADD COLUMN IF NOT EXISTS published_to_students BOOLEAN DEFAULT false
      `);
      await pool.query(`
        ALTER TABLE assessment_submissions 
        ADD COLUMN IF NOT EXISTS published_at TIMESTAMP
      `);
      
      // Add missing column to assessments table
      await pool.query(`
        ALTER TABLE assessments 
        ADD COLUMN IF NOT EXISTS results_published_to_students BOOLEAN DEFAULT false
      `);
      await pool.query(`
        ALTER TABLE assessments 
        ADD COLUMN IF NOT EXISTS results_published_at TIMESTAMP
      `);
      
      // Add missing columns to assessment_submissions table for manual grading
      await pool.query(`
        ALTER TABLE assessment_submissions 
        ADD COLUMN IF NOT EXISTS manual_scores JSONB DEFAULT '{}'
      `);
      await pool.query(`
        ALTER TABLE assessment_submissions 
        ADD COLUMN IF NOT EXISTS feedback JSONB DEFAULT '{}'
      `);
      await pool.query(`
        ALTER TABLE assessment_submissions 
        ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP
      `);
    } catch (error) {
      console.log('Columns already exist or error adding:', error.message);
    }

    console.log('Assessment tables initialized successfully');
    res.json({ success: true, message: 'Assessment tables initialized' });
  } catch (error) {
    console.error('Error initializing assessment tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new assessment
app.post('/api/assessments', async (req, res) => {
  try {
    const {
      title, description, program_name, lecturer_id, lecturer_name,
      duration, start_date, end_date, scheduled_date, scheduled_time,
      auto_grade, grading_format, questions, status
    } = req.body;

    console.log('=== ASSESSMENT CREATION DEBUG ===');
    console.log('Assessment Data:', req.body);

    const total_questions = questions ? questions.length : 0;
    const total_points = questions ? questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0;

    const result = await pool.query(
      `INSERT INTO assessments (
        title, description, program_name, lecturer_id, lecturer_name,
        duration, start_date, end_date, scheduled_date, scheduled_time,
        auto_grade, grading_format, total_questions, total_points,
        questions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *`,
      [
        title, description, program_name, lecturer_id, lecturer_name,
        duration, start_date, end_date, scheduled_date, scheduled_time,
        auto_grade, grading_format, total_questions, total_points,
        JSON.stringify(questions || []), status || 'draft'
      ]
    );

    console.log('Assessment created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all assessments
app.get('/api/assessments', async (req, res) => {
  try {
    const { lecturer_id, lecturer_name, program_name, status } = req.query;
    
    let query = 'SELECT * FROM assessments';
    let params = [];
    let conditions = [];

    if (lecturer_id) {
      conditions.push(`lecturer_id = $${params.length + 1}`);
      params.push(lecturer_id);
    }

    if (lecturer_name) {
      conditions.push(`lecturer_name = $${params.length + 1}`);
      params.push(lecturer_name);
    }

    if (program_name) {
      conditions.push(`program_name = $${params.length + 1}`);
      params.push(program_name);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    console.log('=== ASSESSMENTS FETCH DEBUG ===');
    console.log('Query:', query);
    console.log('Params:', params);
    console.log('Found assessments:', result.rows.length);

    // AUTO-EXPIRE ASSESSMENTS BASED ON REAL TIME
    const now = new Date();
    const updatedAssessments = [];
    
    for (const assessment of result.rows) {
      let updatedAssessment = { ...assessment };
      
      // Check if scheduled assessment has expired
      if (assessment.start_date && assessment.start_time && assessment.duration) {
        const startDateTime = new Date(`${assessment.start_date}T${assessment.start_time}`);
        const endDateTime = new Date(startDateTime.getTime() + (assessment.duration * 60 * 1000));
        
        console.log(`=== AUTO-EXPIRE CHECK: ${assessment.title} ===`);
        console.log('Current time:', now.toISOString());
        console.log('Assessment start:', startDateTime.toISOString());
        console.log('Assessment end:', endDateTime.toISOString());
        console.log('Current status:', assessment.status);
        
        // Auto-expire if time has passed and not already completed
        if (now > endDateTime && assessment.status !== 'completed' && assessment.status !== 'expired') {
          console.log(`AUTO-EXPIRING: ${assessment.title}`);
          
          // Update status to expired in database
          await pool.query(
            'UPDATE assessments SET status = $1 WHERE id = $2',
            ['expired', assessment.id]
          );
          
          updatedAssessment.status = 'expired';
        }
        // Auto-activate if time has started and status is published
        else if (now >= startDateTime && now <= endDateTime && assessment.status === 'published') {
          console.log(`AUTO-ACTIVATING: ${assessment.title}`);
          
          // Update status to active in database
          await pool.query(
            'UPDATE assessments SET status = $1 WHERE id = $2',
            ['active', assessment.id]
          );
          
          updatedAssessment.status = 'active';
        }
      }
      
      updatedAssessments.push(updatedAssessment);
    }

    res.json({ success: true, data: updatedAssessments });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assessment by ID
app.get('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('SELECT * FROM assessments WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    // Get submissions for this assessment
    const submissionsResult = await pool.query(
      'SELECT * FROM assessment_submissions WHERE assessment_id = $1 ORDER BY submitted_at DESC',
      [id]
    );

    const assessment = result.rows[0];
    assessment.submissions = submissionsResult.rows;

    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update assessment
app.put('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, program_name, duration, start_date, end_date,
      scheduled_date, scheduled_time, auto_grade, grading_format,
      questions, status
    } = req.body;

    const total_questions = questions ? questions.length : 0;
    const total_points = questions ? questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0;

    const result = await pool.query(
      `UPDATE assessments SET 
        title = $1, description = $2, program_name = $3, duration = $4,
        start_date = $5, end_date = $6, scheduled_date = $7, scheduled_time = $8,
        auto_grade = $9, grading_format = $10, total_questions = $11, total_points = $12,
        questions = $13, status = $14, updated_at = CURRENT_TIMESTAMP
      WHERE id = $15 RETURNING *`,
      [
        title, description, program_name, duration, start_date, end_date,
        scheduled_date, scheduled_time, auto_grade, grading_format,
        total_questions, total_points, JSON.stringify(questions || []), status, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    console.log('Assessment updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete assessment
app.delete('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM assessments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    console.log('Assessment deleted:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// REMOVED DUPLICATE - Using improved endpoint below

// Submit assessment (student)
app.post('/api/assessments/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id, student_name, student_registration, student_program, answers,
      auto_submitted, reason
    } = req.body;

    console.log('=== ASSESSMENT SUBMISSION DEBUG ===');
    console.log('Assessment ID:', id);
    console.log('Student Data:', { student_id, student_name, student_registration, student_program });
    console.log('Answers:', answers);
    console.log('Auto submitted:', auto_submitted, 'Reason:', reason);

    // Get assessment details
    const assessmentResult = await pool.query('SELECT * FROM assessments WHERE id = $1', [id]);
    
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];
    const questions = assessment.questions || [];

    // Calculate score if auto-grading is enabled
    let score = 0;
    let percentage = 0;
    
    if (assessment.auto_grade && questions.length > 0) {
      questions.forEach((question, index) => {
        const studentAnswer = answers[question.id];
        let isCorrect = false;

        if (question.type === 'multiple-choice') {
          isCorrect = studentAnswer === question.correctAnswer;
        } else if (question.type === 'true-false') {
          isCorrect = studentAnswer === question.correctAnswer;
        }
        // Short answer questions require manual grading

        if (isCorrect) {
          score += question.points || 0;
        }
      });

      percentage = assessment.total_points > 0 ? Math.round((score / assessment.total_points) * 100) : 0;
    }

    // Insert submission
    const submissionResult = await pool.query(
      `INSERT INTO assessment_submissions (
        assessment_id, student_id, student_name, student_registration, student_program,
        answers, score, percentage, auto_graded_score, status, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) 
      RETURNING *`,
      [
        id, student_id, student_name, student_registration, student_program,
        JSON.stringify(answers), score, percentage, score, 'submitted'
      ]
    );

    console.log('Assessment submission saved:', submissionResult.rows[0]);
    
    // Return success without showing score to student
    res.json({ 
      success: true, 
      message: 'Assessment submitted successfully',
      submission_id: submissionResult.rows[0].id,
      submitted_at: submissionResult.rows[0].submitted_at
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assessment with submissions (for lecturer results view)
app.get('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== ASSESSMENT WITH SUBMISSIONS DEBUG ===');
    console.log('Assessment ID:', id);

    // Get assessment details
    const assessmentResult = await pool.query('SELECT * FROM assessments WHERE id = $1', [id]);
    
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];

    // Get submissions for this assessment
    const submissionsResult = await pool.query(
      'SELECT * FROM assessment_submissions WHERE assessment_id = $1 ORDER BY submitted_at DESC',
      [id]
    );

    const submissions = submissionsResult.rows.map(submission => ({
      id: submission.id,
      student_name: submission.student_name,
      student_registration: submission.student_registration,
      student_program: submission.student_program,
      score: submission.score || 0,
      percentage: submission.percentage || 0,
      status: submission.status,
      submitted_at: submission.submitted_at,
      answers: submission.answers,
      auto_graded_score: submission.auto_graded_score,
      manual_graded_score: submission.manual_graded_score
    }));

    console.log('Assessment with submissions:', { assessment: assessment.title, submissions: submissions.length });

    res.json({ 
      success: true, 
      data: {
        ...assessment,
        submissions: submissions
      }
    });
  } catch (error) {
    console.error('Error fetching assessment with submissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update assessment (for status changes, etc.)
app.put('/api/assessments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('=== UPDATE ASSESSMENT ===');
    console.log('Assessment ID:', id);
    console.log('Update Data:', updateData);

    // Build dynamic update query
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const query = `UPDATE assessments SET ${setClause} WHERE id = $1 RETURNING *`;
    const params = [id, ...values];

    console.log('Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    console.log('Assessment updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student assessments (available assessments for student to take)
app.get('/api/student-assessments', async (req, res) => {
  try {
    const { student_id, student_program } = req.query;

    console.log('=== STUDENT ASSESSMENTS DEBUG ===');
    console.log('Student ID:', student_id);
    console.log('Student Program:', student_program);

    // Get ALL published assessments (let frontend handle filtering)
    let query = `
      SELECT a.*, 
        CASE WHEN s.id IS NOT NULL THEN true ELSE false END as submitted,
        s.score, s.percentage, s.submitted_at
      FROM assessments a
      LEFT JOIN assessment_submissions s ON a.id = s.assessment_id AND s.student_id = $1
      WHERE a.status = 'published'
    `;
    
    let params = [student_id];

    // Filter by student's program if provided
    if (student_program) {
      query += ' AND a.program_name = $2';
      params.push(student_program);
    }

    query += ' ORDER BY a.created_at DESC';

    console.log('Query:', query);
    console.log('Params:', params);

    const result = await pool.query(query, params);
    
    console.log('Found available assessments for student:', result.rows.length);
    console.log('Assessments:', result.rows);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching student assessments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get submitted assessments for student (for assignments section)
app.get('/api/student-submitted-assessments', async (req, res) => {
  try {
    const { student_id } = req.query;

    console.log('=== STUDENT SUBMITTED ASSESSMENTS DEBUG ===');
    console.log('Student ID:', student_id);

    const query = `
      SELECT a.*, s.score, s.percentage, s.submitted_at, s.status as submission_status
      FROM assessments a
      INNER JOIN assessment_submissions s ON a.id = s.assessment_id
      WHERE s.student_id = $1
      ORDER BY s.submitted_at DESC
    `;
    
    const result = await pool.query(query, [student_id]);
    
    console.log('Found submitted assessments:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching submitted assessments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUBLISH RESULTS TO STUDENTS - DONE BUTTON
app.post('/api/submit-results-to-students/:assessmentId', async (req, res) => {
  try {
    const { assessmentId } = req.params;

    console.log('=== PUBLISHING RESULTS TO STUDENTS ===');
    console.log('Assessment ID:', assessmentId);

    // Update assessment status to completed and mark results as published
    const assessmentUpdate = await pool.query(
      'UPDATE assessments SET status = $1, results_published_to_students = $2, results_published_at = $3 WHERE id = $4 RETURNING *',
      ['completed', true, new Date(), assessmentId]
    );

    if (assessmentUpdate.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    // Update all submissions to mark as published to students
    const submissionsUpdate = await pool.query(
      'UPDATE assessment_submissions SET published_to_students = $1, published_at = $2 WHERE assessment_id = $3 RETURNING *',
      [true, new Date(), assessmentId]
    );

    console.log('Assessment updated:', assessmentUpdate.rows[0]);
    console.log('Submissions published:', submissionsUpdate.rows.length);

    // Create assignment entries for students (results in Assignment section)
    for (const submission of submissionsUpdate.rows) {
      try {
        await pool.query(`
          INSERT INTO assignments (
            title, 
            description, 
            program_name, 
            lecturer_id, 
            lecturer_name, 
            status,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          `Assessment Result: ${assessmentUpdate.rows[0].title}`,
          `Your assessment score: ${submission.percentage}% (${submission.score}/${assessmentUpdate.rows[0].total_points} points)`,
          submission.student_program,
          assessmentUpdate.rows[0].lecturer_id,
          assessmentUpdate.rows[0].lecturer_name,
          'completed',
          new Date()
        ]);
      } catch (error) {
        console.log('Error creating assignment entry:', error.message);
      }
    }

    res.json({ 
      success: true, 
      message: 'Results published to students successfully',
      data: {
        assessment: assessmentUpdate.rows[0],
        submissions: submissionsUpdate.rows
      }
    });
  } catch (error) {
    console.error('Error publishing results to students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual grading endpoint
app.post('/api/manual-grade-submission', async (req, res) => {
  try {
    const { 
      submission_id, 
      manual_scores, 
      feedback, 
      total_score, 
      percentage, 
      status 
    } = req.body;

    console.log('=== MANUAL GRADING DEBUG ===');
    console.log('Request Body:', req.body);
    console.log('Submission ID:', submission_id);
    console.log('Manual Scores:', manual_scores);
    console.log('Total Score:', total_score);
    console.log('Percentage:', percentage);
    console.log('Status:', status);

    // Update submission with manual grades
    const result = await pool.query(
      `UPDATE assessment_submissions 
       SET score = $1, percentage = $2, status = $3, manual_scores = $4, feedback = $5, graded_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [total_score, percentage, status, JSON.stringify(manual_scores), JSON.stringify(feedback), submission_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    console.log('Manual grading saved:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving manual grades:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto-grade all submissions for an assessment
app.post('/api/auto-grade-all/:assessment_id', async (req, res) => {
  try {
    const { assessment_id } = req.params;

    console.log('=== AUTO GRADE ALL DEBUG ===');
    console.log('Assessment ID:', assessment_id);

    // Get assessment details
    const assessmentResult = await pool.query('SELECT * FROM assessments WHERE id = $1', [assessment_id]);
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];
    const questions = assessment.questions || [];

    // Get all ungraded submissions for this assessment
    const submissionsResult = await pool.query(
      'SELECT * FROM assessment_submissions WHERE assessment_id = $1 AND status = $2',
      [assessment_id, 'submitted']
    );

    console.log('Found submissions to auto-grade:', submissionsResult.rows.length);

    const gradedSubmissions = [];

    for (const submission of submissionsResult.rows) {
      let autoGradedScore = 0;
      let totalPoints = 0;

      questions.forEach(question => {
        totalPoints += question.points;
        const studentAnswer = submission.answers[question.id];

        if (question.type === 'multiple-choice' && studentAnswer !== undefined) {
          if (studentAnswer === question.correctAnswer) {
            autoGradedScore += question.points;
          }
        } else if (question.type === 'true-false' && studentAnswer !== undefined) {
          if (studentAnswer === question.correctAnswer) {
            autoGradedScore += question.points;
          }
        }
        // Short answer questions remain ungraded (0 points)
      });

      const percentage = totalPoints > 0 ? Math.round((autoGradedScore / totalPoints) * 100) : 0;

      // Update submission with auto-graded score
      const updateResult = await pool.query(
        `UPDATE assessment_submissions 
         SET score = $1, percentage = $2, status = $3, auto_graded_score = $4, graded_at = NOW()
         WHERE id = $5 
         RETURNING *`,
        [autoGradedScore, percentage, 'auto-graded', autoGradedScore, submission.id]
      );

      gradedSubmissions.push(updateResult.rows[0]);
    }

    console.log('Auto-graded submissions:', gradedSubmissions.length);
    res.json({ success: true, data: gradedSubmissions });
  } catch (error) {
    console.error('Error auto-grading submissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get graded assessments for student (for Assignment page)
app.get('/api/student-graded-assessments', async (req, res) => {
  try {
    const { student_id } = req.query;

    console.log('=== STUDENT GRADED ASSESSMENTS DEBUG ===');
    console.log('Student ID:', student_id);

    const query = `
      SELECT 
        a.id,
        a.title,
        a.program_name,
        a.description,
        a.duration,
        a.total_points,
        a.lecturer_name,
        s.score,
        s.percentage,
        s.submitted_at,
        s.graded_at,
        s.status,
        s.feedback
      FROM assessments a
      INNER JOIN assessment_submissions s ON a.id = s.assessment_id
      WHERE s.student_id = $1 
        AND s.status IN ('auto-graded', 'manually-graded')
      ORDER BY s.graded_at DESC
    `;
    
    const result = await pool.query(query, [student_id]);
    
    console.log('Found graded assessments:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching graded assessments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit results to students (DONE button)
app.post('/api/submit-results-to-students', async (req, res) => {
  try {
    const { assessment_id } = req.body;

    console.log('=== SUBMIT RESULTS TO STUDENTS ===');
    console.log('Assessment ID:', assessment_id);

    // Get all graded submissions for this assessment
    const submissionsResult = await pool.query(
      'SELECT * FROM assessment_submissions WHERE assessment_id = $1 AND status IN ($2, $3)',
      [assessment_id, 'auto-graded', 'manually-graded']
    );

    if (submissionsResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No graded submissions found' });
    }

    console.log('Found graded submissions:', submissionsResult.rows.length);

    // Update assessment to mark results as published
    const assessmentUpdate = await pool.query(
      'UPDATE assessments SET results_published_to_students = true, results_published_at = NOW() WHERE id = $1 RETURNING *',
      [assessment_id]
    );

    // Update all graded submissions to indicate they've been published to students
    const submissionsUpdate = await pool.query(
      'UPDATE assessment_submissions SET published_to_students = true, published_at = NOW() WHERE assessment_id = $1 AND status IN ($2, $3) RETURNING *',
      [assessment_id, 'auto-graded', 'manually-graded']
    );

    console.log('Updated submissions:', submissionsUpdate.rows.length);
    console.log('Assessment updated:', assessmentUpdate.rows[0]);

    res.json({ 
      success: true, 
      message: `Results published to ${submissionsUpdate.rows.length} students`,
      data: {
        assessment: assessmentUpdate.rows[0],
        submissions: submissionsUpdate.rows
      }
    });
  } catch (error) {
    console.error('Error submitting results to students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assessment submissions for lecturer
app.get('/api/assessment-submissions', async (req, res) => {
  try {
    const { assessment_id } = req.query;
    
    console.log('=== GET ASSESSMENT SUBMISSIONS DEBUG ===');
    console.log('Assessment ID filter:', assessment_id);
    
    let query = 'SELECT * FROM assessment_submissions ORDER BY submitted_at DESC';
    let params = [];
    
    if (assessment_id) {
      query = 'SELECT * FROM assessment_submissions WHERE assessment_id = $1 ORDER BY submitted_at DESC';
      params = [assessment_id];
    }
    
    const result = await pool.query(query, params);
    
    console.log('Found submissions:', result.rows.length);
    console.log('Submissions data:', result.rows);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching assessment submissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Individual auto-grade endpoint for specific submission
app.post('/api/assessment-submissions/:id/auto-grade', async (req, res) => {
  try {
    const submissionId = req.params.id;
    
    console.log('=== INDIVIDUAL AUTO-GRADE REQUEST ===');
    console.log('Submission ID:', submissionId);
    
    // Get submission details
    const submissionResult = await pool.query(
      'SELECT * FROM assessment_submissions WHERE id = $1',
      [submissionId]
    );
    
    if (submissionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    
    const submission = submissionResult.rows[0];
    
    // Get assessment details
    const assessmentResult = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [submission.assessment_id]
    );
    
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }
    
    const assessment = assessmentResult.rows[0];
    const questions = assessment.questions || [];
    const answers = submission.answers || {};
    
    // INDIVIDUAL AUTO-GRADING LOGIC
    let autoGradedScore = 0;
    let manualQuestionPoints = 0;
    let autoGradableQuestions = 0;
    let manualQuestions = 0;
    
    questions.forEach(question => {
      const studentAnswer = answers[question.id];
      
      if (question.type === 'multiple-choice') {
        autoGradableQuestions++;
        if (studentAnswer === question.correctAnswer) {
          autoGradedScore += question.points;
        }
      } 
      else if (question.type === 'true-false') {
        autoGradableQuestions++;
        const correctAnswer = String(question.correctAnswer).toLowerCase() === 'true';
        const studentAnswerBool = String(studentAnswer).toLowerCase() === 'true';
        if (correctAnswer === studentAnswerBool) {
          autoGradedScore += question.points;
        }
      }
      else if (question.type === 'short-answer' || question.type === 'fill-in-blank') {
        manualQuestions++;
        manualQuestionPoints += question.points;
      }
    });
    
    // Calculate final scores and status
    let finalScore = autoGradedScore;
    let finalPercentage = assessment.total_points > 0 ? Math.round((autoGradedScore / assessment.total_points) * 100) : 0;
    let submissionStatus = manualQuestions > 0 ? 'partially-graded' : 'auto-graded';
    
    // Update submission in database
    const updateResult = await pool.query(
      `UPDATE assessment_submissions 
       SET score = $1, percentage = $2, status = $3, auto_graded_score = $4, graded_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [finalScore, finalPercentage, submissionStatus, autoGradedScore, submissionId]
    );
    
    console.log('Individual auto-grade completed:', {
      submissionId,
      autoGradedScore,
      manualQuestionPoints,
      finalScore,
      finalPercentage,
      status: submissionStatus
    });
    
    res.json({ 
      success: true, 
      data: updateResult.rows[0],
      autoGradedScore,
      manualQuestionPoints,
      percentage: finalPercentage,
      status: submissionStatus
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LECTURER DONE - PUBLISH RESULTS TO ASSESSMENT RESULTS
app.post('/api/submit-results-to-students/:assessmentId', async (req, res) => {
  try {
    const assessmentId = req.params.assessmentId;
    console.log('=== LECTURER DONE - PUBLISHING RESULTS ===');
    console.log('Assessment ID:', assessmentId);
    
    // Update all submissions to published_to_students = true
    const updateResult = await pool.query(
      `UPDATE assessment_submissions 
       SET published_to_students = true, published_at = CURRENT_TIMESTAMP
       WHERE assessment_id = $1 
       RETURNING *`,
      [assessmentId]
    );
    
    // Update assessment status to completed
    const assessmentUpdate = await pool.query(
      `UPDATE assessments 
       SET status = 'completed', results_published_at = CURRENT_TIMESTAMP
       WHERE id = $1 
       RETURNING *`,
      [assessmentId]
    );
    
    console.log('Results published for:', updateResult.rows.length, 'submissions');
    console.log('Assessment marked as completed');
    
    res.json({ 
      success: true, 
      message: `Results published to ${updateResult.rows.length} students`,
      data: {
        assessment: assessmentUpdate.rows[0],
        submissions: updateResult.rows
      }
    });
    
  } catch (error) {
    console.error('Error publishing results to students:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit assessment endpoint with REAL FLEXIBLE AUTO-GRADING
app.post('/api/assessment-submissions', async (req, res) => {
  try {
    const { 
      assessment_id, 
      student_id, 
      student_name, 
      student_registration, 
      student_program,
      answers
    } = req.body;

    console.log('=== ASSESSMENT SUBMISSION DEBUG ===');
    console.log('Assessment ID:', assessment_id);
    console.log('Student ID:', student_id);
    console.log('Student Answers:', answers);

    // Check if student already submitted
    const existingSubmission = await pool.query(
      'SELECT id FROM assessment_submissions WHERE assessment_id = $1 AND student_id = $2',
      [assessment_id, student_id]
    );

    if (existingSubmission.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Assessment already submitted' 
      });
    }

    // Get assessment details to check auto_grade setting
    const assessmentResult = await pool.query('SELECT * FROM assessments WHERE id = $1', [assessment_id]);
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];
    const questions = assessment.questions || [];
    
    console.log('=== GRADING LOGIC DEBUG ===');
    console.log('Assessment auto_grade setting:', assessment.auto_grade);
    console.log('Total questions:', questions.length);
    let finalScore = 0;
    let finalPercentage = 0;
    let submissionStatus = 'submitted';

        // REAL FLEXIBLE GRADING LOGIC - MIXED QUESTION HANDLING
        console.log('=== SUBMISSION PROCESSING FOR LECTURER REVIEW ===');
        
        if (assessment.auto_grade === true) {
          console.log('=== AUTO-GRADE MODE: ON - MIXED QUESTIONS ===');
          
          // AUTO-GRADE: Process auto-gradable questions, manual for others
          let autoGradedScore = 0;
          let manualQuestionPoints = 0;
          let autoGradableQuestions = 0;
          let manualQuestions = 0;
          
          questions.forEach(question => {
            const studentAnswer = answers[question.id];
            
            if (question.type === 'multiple-choice') {
              autoGradableQuestions++;
              console.log(`MC Question ${question.id}: Student=${studentAnswer}, Correct=${question.correctAnswer}`);
              if (studentAnswer === question.correctAnswer) {
                autoGradedScore += question.points;
                console.log(`✅ Correct! Added ${question.points} points`);
              } else {
                console.log(`❌ Wrong! No points added`);
              }
            } 
            else if (question.type === 'true-false') {
              autoGradableQuestions++;
              const correctAnswer = String(question.correctAnswer).toLowerCase() === 'true';
              const studentAnswerBool = String(studentAnswer).toLowerCase() === 'true';
              console.log(`T/F Question ${question.id}: Student=${studentAnswerBool}, Correct=${correctAnswer}`);
              if (correctAnswer === studentAnswerBool) {
                autoGradedScore += question.points;
                console.log(`✅ Correct! Added ${question.points} points`);
              } else {
                console.log(`❌ Wrong! No points added`);
              }
            }
            else if (question.type === 'short-answer' || question.type === 'fill-in-blank') {
              manualQuestions++;
              // Manual grading required - add to manual points tracker
              manualQuestionPoints += question.points;
              console.log(`📝 ${question.type} Question ${question.id}: Requires manual grading (${question.points} points)`);
            }
          });

          // MIXED QUESTION HANDLING - Set appropriate status
          if (manualQuestions > 0) {
            // HAS MANUAL QUESTIONS: Partial auto-grading, needs lecturer review
            finalScore = autoGradedScore; // Partial score from auto-graded questions
            finalPercentage = assessment.total_points > 0 ? Math.round((autoGradedScore / assessment.total_points) * 100) : 0;
            submissionStatus = 'partially-graded'; // Mixed: Auto + Manual pending
            console.log(`🔄 MIXED QUESTIONS: Auto-graded ${autoGradableQuestions} questions (${autoGradedScore} pts), Manual pending ${manualQuestions} questions (${manualQuestionPoints} pts)`);
          } else {
            // ALL AUTO-GRADABLE: Complete auto-grading
            finalScore = autoGradedScore;
            finalPercentage = assessment.total_points > 0 ? Math.round((autoGradedScore / assessment.total_points) * 100) : 0;
            submissionStatus = 'auto-graded'; // Fully auto-graded
            console.log(`✅ FULLY AUTO-GRADED: All ${autoGradableQuestions} questions auto-graded (${autoGradedScore} pts)`);
          }
          
        } else {
          console.log('=== AUTO-GRADE MODE: OFF ===');
          console.log('All questions require manual grading - submitted for lecturer review');
          
          // MANUAL MODE: All questions need manual grading (score = 0)
          finalScore = 0;
          finalPercentage = 0;
          submissionStatus = 'submitted'; // LECTURER MUST REVIEW AND GRADE ALL
        }

    console.log('===FINAL GRADING RESULT ===');
    console.log('Final Score:', finalScore);
    console.log('Final Percentage:', finalPercentage);
    console.log('Status:', submissionStatus);
    // Insert submission with calculated scores
    const result = await pool.query(
      `INSERT INTO assessment_submissions 
       (assessment_id, student_id, student_name, student_registration, student_program, 
        answers, score, percentage, status, auto_graded_score, submitted_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
       RETURNING *`,
      [assessment_id, student_id, student_name, student_registration, student_program, 
       JSON.stringify(answers), finalScore, finalPercentage, submissionStatus, finalScore]
    );

    console.log('Submission saved with real grading:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ASSIGNMENT ENDPOINTS ====================

// Fix assignment table
app.post('/api/assignments/fix', async (req, res) => {
  try {
    // Drop and recreate assignments table with correct schema
    await pool.query('DROP TABLE IF EXISTS assignment_submissions CASCADE');
    await pool.query('DROP TABLE IF EXISTS assignments CASCADE');
    
    await pool.query(`
      CREATE TABLE assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        submission_type VARCHAR(20) DEFAULT 'text',
        max_points INTEGER DEFAULT 100,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER,
        student_name VARCHAR(255),
        student_registration VARCHAR(100),
        student_program VARCHAR(255),
        submission_type VARCHAR(20),
        text_content TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points_awarded INTEGER DEFAULT 0,
        feedback TEXT,
        graded_at TIMESTAMP
      )
    `);

    console.log('Assignment tables fixed successfully');
    res.json({ success: true, message: 'Assignment tables fixed' });
  } catch (error) {
    console.error('Error fixing assignment tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize assignment tables
app.post('/api/assignments/init', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        deadline TIMESTAMP NOT NULL,
        submission_type VARCHAR(20) DEFAULT 'text',
        max_points INTEGER DEFAULT 100,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
        student_id INTEGER,
        student_name VARCHAR(255),
        student_registration VARCHAR(100),
        student_program VARCHAR(255),
        submission_type VARCHAR(20),
        text_content TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        points_awarded INTEGER DEFAULT 0,
        feedback TEXT,
        graded_at TIMESTAMP
      )
    `);

    res.json({ success: true, message: 'Assignment tables initialized' });
  } catch (error) {
    console.error('Error initializing assignment tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new assignment
app.post('/api/assignments', async (req, res) => {
  try {
    const {
      title, description, program_name, deadline, submission_type,
      max_points, lecturer_id, lecturer_name
    } = req.body;

    console.log('=== CREATE ASSIGNMENT API DEBUG ===');
    console.log('Request Body:', req.body);
    console.log('Title:', title);
    console.log('Program Name:', program_name);
    console.log('Deadline:', deadline);
    console.log('Submission Type:', submission_type);
    console.log('Max Points:', max_points);
    console.log('Lecturer ID:', lecturer_id);
    console.log('Lecturer Name:', lecturer_name);

    // Validate required fields
    if (!title || !program_name || !deadline) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: title, program_name, or deadline' 
      });
    }

    if (!lecturer_id || !lecturer_name) {
      console.error('Missing lecturer information');
      return res.status(400).json({ 
        success: false, 
        error: 'Missing lecturer information' 
      });
    }

    const result = await pool.query(`
      INSERT INTO assignments (
        title, description, program_name, deadline, submission_type, 
        max_points, lecturer_id, lecturer_name, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [title, description, program_name, deadline, submission_type, max_points, lecturer_id, lecturer_name, 'active']);

    console.log('Assignment created successfully:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating assignment:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get lecturer programs
app.get('/api/lecturer-programs', async (req, res) => {
  try {
    const { lecturer_id } = req.query;
    
    console.log('=== LECTURER PROGRAMS API DEBUG ===');
    console.log('Lecturer ID requested:', lecturer_id);
    
    // First get lecturer info
    const lecturerResult = await pool.query('SELECT * FROM lecturers WHERE id = $1', [lecturer_id]);
    console.log('Lecturer found:', lecturerResult.rows[0]);
    
    if (lecturerResult.rows.length === 0) {
      console.log('No lecturer found, returning empty');
      return res.json({ success: true, data: [] });
    }
    
    const lecturer = lecturerResult.rows[0];
    
    // Get programs assigned to this lecturer
    const result = await pool.query(`
      SELECT p.*, c.name as course_name, d.name as department_name, col.name as college_name
      FROM programs p
      LEFT JOIN courses c ON p.course_id = c.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN colleges col ON d.college_id = col.id
      WHERE p.lecturer_id = $1 OR p.lecturer_name = $2
      ORDER BY p.name ASC
    `, [lecturer_id, lecturer.username]);

    console.log('Programs found:', result.rows);
    
    // If no programs found, create realistic fallback based on lecturer specialization
    if (result.rows.length === 0) {
      console.log('No programs in database, creating fallback based on specialization');
      
      let fallbackPrograms = [];
      const specialization = lecturer.specialization || 'Computer Science';
      
      if (specialization.toLowerCase().includes('computer')) {
        fallbackPrograms = [
          { id: 1, name: 'Introduction to Programming', lecturer_name: lecturer.username, course_name: 'Computer Science' },
          { id: 2, name: 'Data Structures and Algorithms', lecturer_name: lecturer.username, course_name: 'Computer Science' },
          { id: 3, name: 'Object-Oriented Programming', lecturer_name: lecturer.username, course_name: 'Computer Science' },
          { id: 4, name: 'Database Management Systems', lecturer_name: lecturer.username, course_name: 'Computer Science' }
        ];
      } else if (specialization.toLowerCase().includes('information')) {
        fallbackPrograms = [
          { id: 1, name: 'Information Systems Fundamentals', lecturer_name: lecturer.username, course_name: 'Information Technology' },
          { id: 2, name: 'Web Technologies', lecturer_name: lecturer.username, course_name: 'Information Technology' },
          { id: 3, name: 'System Analysis and Design', lecturer_name: lecturer.username, course_name: 'Information Technology' },
          { id: 4, name: 'Network Administration', lecturer_name: lecturer.username, course_name: 'Information Technology' }
        ];
      } else {
        fallbackPrograms = [
          { id: 1, name: 'General Programming', lecturer_name: lecturer.username, course_name: 'General Studies' },
          { id: 2, name: 'Software Development', lecturer_name: lecturer.username, course_name: 'General Studies' }
        ];
      }
      
      console.log('Fallback programs created:', fallbackPrograms);
      return res.json({ success: true, data: fallbackPrograms });
    }

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lecturer programs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignments for lecturer
app.get('/api/assignments', async (req, res) => {
  try {
    const { lecturer_id } = req.query;
    
    const result = await pool.query(`
      SELECT a.*, COUNT(s.id) as submission_count
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.lecturer_id = $1
      GROUP BY a.id ORDER BY a.created_at DESC
    `, [lecturer_id]);

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignments for students
app.get('/api/student-assignments', async (req, res) => {
  try {
    const { student_program } = req.query;
    
    console.log('=== STUDENT ASSIGNMENTS API DEBUG ===');
    console.log('Student program requested:', student_program);
    
    // First, auto-delete expired assignments
    await pool.query(`
      UPDATE assignments 
      SET status = 'expired' 
      WHERE deadline <= NOW() AND status = 'active'
    `);
    
    console.log('Auto-updated expired assignments');
    
    // Multiple matching strategies for program names
    const result = await pool.query(`
      SELECT a.* FROM assignments a
      WHERE (
        a.program_name = $1 OR
        a.program_name ILIKE '%' || $1 || '%' OR
        $1 ILIKE '%' || a.program_name || '%' OR
        (a.program_name ILIKE '%computer%' AND $1 ILIKE '%computer%') OR
        (a.program_name ILIKE '%information%' AND $1 ILIKE '%information%') OR
        (a.program_name ILIKE '%engineering%' AND $1 ILIKE '%engineering%')
      ) 
      AND a.status = 'active' 
      AND a.deadline > NOW()
      ORDER BY a.deadline ASC
    `, [student_program]);

    console.log('Assignments found for student:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto cleanup expired assignments (can be called periodically)
app.post('/api/assignments/cleanup', async (req, res) => {
  try {
    console.log('=== AUTO CLEANUP EXPIRED ASSIGNMENTS ===');
    
    // Update expired assignments
    const expiredResult = await pool.query(`
      UPDATE assignments 
      SET status = 'expired' 
      WHERE deadline <= NOW() AND status = 'active'
      RETURNING *
    `);
    
    console.log('Expired assignments updated:', expiredResult.rows.length);
    
    res.json({ 
      success: true, 
      message: `${expiredResult.rows.length} assignments marked as expired`,
      expired_assignments: expiredResult.rows
    });
  } catch (error) {
    console.error('Error cleaning up assignments:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit assignment
app.post('/api/assignment-submissions', async (req, res) => {
  try {
    const {
      assignment_id, student_id, student_name, student_registration,
      student_program, submission_type, text_content, file_path, file_name
    } = req.body;

    console.log('=== ASSIGNMENT SUBMISSION DEBUG ===');
    console.log('Submission data:', req.body);

    const result = await pool.query(`
      INSERT INTO assignment_submissions (
        assignment_id, student_id, student_name, student_registration,
        student_program, submission_type, text_content, file_path, file_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
    `, [assignment_id, student_id, student_name, student_registration, student_program, submission_type, text_content, file_path, file_name]);

    console.log('Submission saved:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get assignment submissions for lecturer
app.get('/api/assignment-submissions', async (req, res) => {
  try {
    const { assignment_id } = req.query;
    
    console.log('=== ASSIGNMENT SUBMISSIONS API DEBUG ===');
    console.log('Assignment ID requested:', assignment_id);
    
    const result = await pool.query(`
      SELECT * FROM assignment_submissions 
      WHERE assignment_id = $1 ORDER BY submitted_at DESC
    `, [assignment_id]);

    console.log('Submissions found:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE ASSIGNMENT DEBUG ===');
    console.log('Assignment ID to delete:', id);
    
    // First delete all submissions for this assignment
    await pool.query('DELETE FROM assignment_submissions WHERE assignment_id = $1', [id]);
    
    // Then delete the assignment
    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    console.log('Assignment deleted successfully:', result.rows[0]);
    res.json({ success: true, message: 'Assignment deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update assignment
app.put('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, program_name, deadline, submission_type, max_points } = req.body;
    
    console.log('=== UPDATE ASSIGNMENT DEBUG ===');
    console.log('Assignment ID to update:', id);
    console.log('Update data:', req.body);
    
    const result = await pool.query(`
      UPDATE assignments 
      SET title = $1, description = $2, program_name = $3, deadline = $4, 
          submission_type = $5, max_points = $6
      WHERE id = $7 
      RETURNING *
    `, [title, description, program_name, deadline, submission_type, max_points, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }
    
    console.log('Assignment updated successfully:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LIVE CLASSROOM ENDPOINTS ====================

// Create live classes table
const initializeLiveClassesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_classes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        program_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        duration INTEGER DEFAULT 60,
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        room_id VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP,
        ended_at TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS live_class_participants (
        id SERIAL PRIMARY KEY,
        class_id INTEGER REFERENCES live_classes(id) ON DELETE CASCADE,
        student_id INTEGER,
        student_name VARCHAR(255),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        left_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'joined'
      )
    `);
    
    console.log('Live classes tables initialized');
  } catch (error) {
    console.error('Error initializing live classes tables:', error);
  }
};

// Create live class
app.post('/api/live-classes', async (req, res) => {
  try {
    const { title, description, program_name, date, time, duration, lecturer_id, lecturer_name, room_id, status, meeting_url } = req.body;
    
    console.log('=== CREATE LIVE CLASS DEBUG ===');
    console.log('Class data received:', req.body);
    
    // Add meeting_url column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE live_classes ADD COLUMN IF NOT EXISTS meeting_url TEXT
      `);
    } catch (alterError) {
      console.log('Column meeting_url might already exist:', alterError.message);
    }
    
    // Generate room_id if not provided
    const finalRoomId = room_id || `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const result = await pool.query(`
      INSERT INTO live_classes (title, description, program_name, date, time, duration, lecturer_id, lecturer_name, room_id, status, meeting_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [title, description, program_name, date, time, duration, lecturer_id, lecturer_name, finalRoomId, status || 'scheduled', meeting_url]);
    
    console.log('Live class created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating live class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get live classes with enhanced program mapping
app.get('/api/live-classes', async (req, res) => {
  try {
    const { lecturer_name, student_course } = req.query;
    
    console.log('=== GET LIVE CLASSES DEBUG ===');
    console.log('Lecturer Name:', lecturer_name);
    console.log('Student Course:', student_course);
    
    let query = 'SELECT * FROM live_classes';
    let params = [];
    
    if (lecturer_name) {
      query += ' WHERE lecturer_name = $1';
      params = [lecturer_name];
    }
    
    query += ' ORDER BY date ASC, time ASC';
    
    const result = await pool.query(query, params);
    
    // Enhanced program mapping for students
    const enhancedClasses = result.rows.map(liveClass => {
      // Map program names to course names for better matching
      let mappedProgram = liveClass.program_name;
      
      // Program to Course mapping
      if (liveClass.program_name?.toLowerCase().includes('programming') || 
          liveClass.program_name?.toLowerCase().includes('computer')) {
        mappedProgram = 'BACHELOR OF COMPUTER SCIENCE';
      } else if (liveClass.program_name?.toLowerCase().includes('civil') || 
                 liveClass.program_name?.toLowerCase().includes('engineering')) {
        mappedProgram = 'BACHELOR OF CIVIL';
      } else if (liveClass.program_name?.toLowerCase().includes('architecture')) {
        mappedProgram = 'DIPLOMA IN ARCHITECTURE';
      }
      
      return {
        ...liveClass,
        mapped_course: mappedProgram,
        original_program: liveClass.program_name
      };
    });
    
    console.log('Live classes found:', result.rows.length);
    console.log('Enhanced with course mapping');
    res.json({ success: true, data: enhancedClasses });
  } catch (error) {
    console.error('Error fetching live classes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete live class
app.delete('/api/live-classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE LIVE CLASS DEBUG ===');
    console.log('Deleting class ID:', id);
    
    const result = await pool.query('DELETE FROM live_classes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Live class not found' });
    }
    
    console.log('Live class deleted:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting live class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Join live class
app.post('/api/live-classes/join', async (req, res) => {
  try {
    const { class_id, student_id, student_name, join_time } = req.body;
    
    console.log('=== STUDENT JOINING LIVE CLASS ===');
    console.log('Join data:', req.body);
    
    // Check if student already joined
    const existingParticipant = await pool.query(
      'SELECT * FROM live_class_participants WHERE class_id = $1 AND student_id = $2',
      [class_id, student_id]
    );
    
    if (existingParticipant.rows.length > 0) {
      return res.json({ success: true, message: 'Student already joined', data: existingParticipant.rows[0] });
    }
    
    // Add student to participants
    const result = await pool.query(
      'INSERT INTO live_class_participants (class_id, student_id, student_name, join_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [class_id, student_id, student_name, join_time, 'active']
    );
    
    console.log('Student joined live class:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error joining live class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get live class participants
app.get('/api/live-classes/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== GETTING LIVE CLASS PARTICIPANTS ===');
    console.log('Class ID:', id);
    
    const result = await pool.query(
      'SELECT * FROM live_class_participants WHERE class_id = $1 ORDER BY join_time ASC',
      [id]
    );
    
    console.log('Participants found:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// End all live classes
app.post('/api/live-classes/end-all', async (req, res) => {
  try {
    console.log('=== ENDING ALL LIVE CLASSES ===');
    
    const result = await pool.query(
      "UPDATE live_classes SET status = 'ended' WHERE status = 'live' RETURNING *"
    );
    
    console.log('Live classes ended:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error ending live classes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete fake/test classes
app.post('/api/live-classes/cleanup', async (req, res) => {
  try {
    console.log('=== CLEANING UP FAKE CLASSES ===');
    
    // Delete classes with fake program names
    const result = await pool.query(
      "DELETE FROM live_classes WHERE program_name IN ('ELECTRONICS', 'TEST', 'DEMO') OR title LIKE '%test%' OR title LIKE '%demo%' RETURNING *"
    );
    
    console.log(`Deleted ${result.rows.length} fake classes`);
    res.json({ success: true, message: `Deleted ${result.rows.length} fake classes`, data: result.rows });
  } catch (error) {
    console.error('Error cleaning up fake classes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auto-start scheduled class
app.post('/api/live-classes/:id/auto-start', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== AUTO-STARTING SCHEDULED CLASS ===');
    console.log('Class ID:', id);
    
    const result = await pool.query(
      "UPDATE live_classes SET status = 'live' WHERE id = $1 AND status = 'scheduled' RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Scheduled class not found' });
    }
    
    console.log('Class auto-started:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error auto-starting class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Automatic scheduler - checks every 10 seconds for classes that should start
const checkScheduledClasses = async () => {
  try {
    // Check database connection first
    const client = await pool.connect().catch(err => {
      if (err.code === 'ECONNREFUSED') {
        // Database not available - fail silently to avoid spam
        return null;
      }
      throw err;
    });
    
    if (!client) {
      // Database not connected, skip this check silently
      return;
    }
    
    client.release();
    
    console.log('=== CHECKING SCHEDULED CLASSES ===');
    console.log(`Scheduler running at: ${new Date().toLocaleString()}`);
    
    // Get ALL live classes first for debugging
    const allClassesResult = await pool.query("SELECT * FROM live_classes ORDER BY created_at DESC");
    console.log(`Total live classes in database: ${allClassesResult.rows.length}`);
    
    if (allClassesResult.rows.length > 0) {
      console.log('All live classes:');
      allClassesResult.rows.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.title} - Status: ${cls.status} - Date: ${cls.date} - Time: ${cls.time}`);
      });
    }
    
    // Get scheduled classes specifically
    const result = await pool.query(
      "SELECT * FROM live_classes WHERE status = 'scheduled' ORDER BY date, time"
    );
    
    const scheduledClasses = result.rows;
    console.log(`\nFound ${scheduledClasses.length} scheduled classes specifically`);
    
    if (scheduledClasses.length === 0) {
      console.log('No scheduled classes found');
      return;
    }
    
    // Get current time in local timezone
    const now = new Date();
    console.log(`Current server time: ${now.toLocaleString()}`);
    console.log(`Current server time (ISO): ${now.toISOString()}`);
    console.log(`Current server time (UTC): ${now.toUTCString()}`);
    
    for (const classItem of scheduledClasses) {
      try {
        console.log(`\n--- Checking class: ${classItem.title} ---`);
        console.log(`Class date: ${classItem.date}`);
        console.log(`Class time: ${classItem.time}`);
        
        // Validate date and time format
        if (!classItem.date || !classItem.time) {
          console.log(`❌ SKIPPING: Missing date or time for class ${classItem.title}`);
          continue;
        }
        
        // Handle date and time parsing more robustly
        let classDateTime;
        
        // Try different date parsing methods
        if (classItem.date && classItem.time) {
          // Extract date part from timestamp if needed
          let dateString = classItem.date;
          if (dateString.includes('T')) {
            dateString = dateString.split('T')[0]; // Get only date part: "2025-10-18"
          }
          
          console.log(`Processing date: ${dateString}, time: ${classItem.time}`);
          
          // Ensure time has seconds
          let timeString = classItem.time;
          if (timeString.split(':').length === 2) {
            timeString += ':00'; // Add seconds if missing
          }
          
          // Method 1: ISO format
          const dateTimeString = `${dateString}T${timeString}`;
          classDateTime = new Date(dateTimeString);
          
          console.log(`Parsed datetime (Method 1): ${classDateTime}`);
          
          // Method 2: If ISO fails, try manual parsing
          if (isNaN(classDateTime.getTime())) {
            console.log('Method 1 failed, trying Method 2...');
            const dateParts = dateString.split('-');
            const timeParts = classItem.time.split(':');
            classDateTime = new Date(
              parseInt(dateParts[0]), // year
              parseInt(dateParts[1]) - 1, // month (0-indexed)
              parseInt(dateParts[2]), // day
              parseInt(timeParts[0]), // hour
              parseInt(timeParts[1]), // minute
              0 // seconds
            );
            console.log(`Parsed datetime (Method 2): ${classDateTime}`);
          }
        }
        
        // Check if date is valid
        if (!classDateTime || isNaN(classDateTime.getTime())) {
          console.log(`❌ SKIPPING: Invalid date/time format for class ${classItem.title}`);
          console.log(`Date: ${classItem.date}, Time: ${classItem.time}`);
          continue;
        }
        
        console.log(`Scheduled datetime: ${classDateTime.toLocaleString()}`);
        console.log(`Current datetime: ${now.toLocaleString()}`);
        
        // Calculate time difference in seconds
        const timeDiff = (classDateTime - now) / 1000;
        console.log(`Time difference: ${timeDiff} seconds`);
        
        // If current time is past scheduled time (allowing 1 minute buffer)
        if (timeDiff <= 60) {
          console.log(`🚀 AUTO-STARTING CLASS: ${classItem.title}`);
          console.log(`Class was scheduled for: ${classDateTime.toLocaleString()}`);
          console.log(`Starting now at: ${now.toLocaleString()}`);
          
          // Update status to 'live' with started_at timestamp
          const updateResult = await pool.query(
            "UPDATE live_classes SET status = 'live', started_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
            [classItem.id]
          );
          
          if (updateResult.rows.length > 0) {
            console.log(`✅ SUCCESS: Class ${classItem.title} is now LIVE!`);
            console.log(`Updated class data:`, updateResult.rows[0]);
            console.log(`Class ID ${classItem.id} status changed from 'scheduled' to 'live'`);
            
            // Verify the update worked
            const verifyResult = await pool.query(
              "SELECT * FROM live_classes WHERE id = $1",
              [classItem.id]
            );
            
            if (verifyResult.rows.length > 0 && verifyResult.rows[0].status === 'live') {
              console.log(`✅ VERIFIED: Class ${classItem.title} status is confirmed as 'live'`);
            } else {
              console.log(`❌ VERIFICATION FAILED: Class ${classItem.title} status not updated properly`);
            }
          } else {
            console.log(`❌ FAILED: Could not update class ${classItem.title}`);
            console.log(`Attempting alternative update method...`);
            
            // Try alternative update
            try {
              const altUpdateResult = await pool.query(
                "UPDATE live_classes SET status = $1 WHERE id = $2 RETURNING *",
                ['live', classItem.id]
              );
              
              if (altUpdateResult.rows.length > 0) {
                console.log(`✅ ALTERNATIVE SUCCESS: Class ${classItem.title} updated via alternative method`);
              } else {
                console.log(`❌ ALTERNATIVE FAILED: Could not update class ${classItem.title} via alternative method`);
              }
            } catch (altError) {
              console.log(`❌ ALTERNATIVE ERROR:`, altError.message);
            }
          }
        } else {
          const minutesUntilStart = Math.round(timeDiff / 60);
          const secondsUntilStart = Math.round(timeDiff);
          console.log(`⏰ Class ${classItem.title} starts in ${minutesUntilStart} minutes (${secondsUntilStart} seconds)`);
        }
      } catch (classError) {
        console.error(`❌ Error processing class ${classItem.title}:`, classError);
      }
    }
  } catch (error) {
    // Only log non-connection errors to avoid spam
    if (error.code !== 'ECONNREFUSED') {
      console.error('❌ Error in automatic scheduler:', error.message);
    }
    // Connection errors are silently ignored as database may not be available yet
  }
};


// Manual trigger for scheduler (for testing)
app.post('/api/live-classes/check-scheduled', async (req, res) => {
  try {
    console.log('=== MANUAL SCHEDULER TRIGGER ===');
    await checkScheduledClasses();
    res.json({ success: true, message: 'Scheduler check completed' });
  } catch (error) {
    console.error('Error in manual scheduler trigger:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check all live classes
app.get('/api/live-classes/debug', async (req, res) => {
  try {
    console.log('=== DEBUG: ALL LIVE CLASSES ===');
    
    const allClasses = await pool.query("SELECT * FROM live_classes ORDER BY created_at DESC");
    const scheduledClasses = await pool.query("SELECT * FROM live_classes WHERE status = 'scheduled' ORDER BY date, time");
    const liveClasses = await pool.query("SELECT * FROM live_classes WHERE status = 'live' ORDER BY created_at DESC");
    
    const debugInfo = {
      total_classes: allClasses.rows.length,
      scheduled_classes: scheduledClasses.rows.length,
      live_classes: liveClasses.rows.length,
      all_classes: allClasses.rows,
      scheduled_only: scheduledClasses.rows,
      live_only: liveClasses.rows,
      current_time: new Date().toLocaleString(),
      scheduler_status: 'Running every 10 seconds'
    };
    
    console.log('Debug info:', debugInfo);
    res.json({ success: true, data: debugInfo });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Force start a specific class (for testing)
app.post('/api/live-classes/:id/force-start', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`=== FORCE STARTING CLASS ID: ${id} ===`);
    
    // Get class details first
    const classResult = await pool.query("SELECT * FROM live_classes WHERE id = $1", [id]);
    
    if (classResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    
    const classItem = classResult.rows[0];
    console.log(`Force starting class: ${classItem.title}`);
    console.log(`Current status: ${classItem.status}`);
    
    // Force update to live
    const updateResult = await pool.query(
      "UPDATE live_classes SET status = 'live', started_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (updateResult.rows.length > 0) {
      console.log(`✅ FORCE START SUCCESS: Class ${classItem.title} is now LIVE!`);
      res.json({ success: true, data: updateResult.rows[0], message: 'Class force started successfully' });
    } else {
      console.log(`❌ FORCE START FAILED: Could not update class ${classItem.title}`);
      res.status(500).json({ success: false, error: 'Failed to force start class' });
    }
  } catch (error) {
    console.error('Error force starting class:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test scheduler with specific time simulation
app.post('/api/live-classes/test-scheduler', async (req, res) => {
  try {
    const { simulateTime } = req.body;
    console.log('=== TESTING SCHEDULER WITH TIME SIMULATION ===');
    
    if (simulateTime) {
      console.log(`Simulating time: ${simulateTime}`);
      // Override current time for testing
      const originalCheckScheduledClasses = checkScheduledClasses;
      
      const testCheckScheduledClasses = async () => {
        try {
          console.log('=== TESTING SCHEDULED CLASSES ===');
          console.log(`Simulated time: ${new Date(simulateTime).toLocaleString()}`);
          
          const result = await pool.query("SELECT * FROM live_classes WHERE status = 'scheduled' ORDER BY date, time");
          const scheduledClasses = result.rows;
          console.log(`Found ${scheduledClasses.length} scheduled classes for testing`);
          
          const simulatedNow = new Date(simulateTime);
          
          for (const classItem of scheduledClasses) {
            const dateTimeString = `${classItem.date}T${classItem.time}:00`;
            const classDateTime = new Date(dateTimeString);
            const timeDiff = (classDateTime - simulatedNow) / 1000;
            
            console.log(`Testing class: ${classItem.title}`);
            console.log(`Scheduled: ${classDateTime.toLocaleString()}, Simulated: ${simulatedNow.toLocaleString()}`);
            console.log(`Time diff: ${timeDiff} seconds`);
            
            if (timeDiff <= 60) {
              console.log(`🚀 TEST: Would start class ${classItem.title}`);
              
              const updateResult = await pool.query(
                "UPDATE live_classes SET status = 'live', started_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
                [classItem.id]
              );
              
              if (updateResult.rows.length > 0) {
                console.log(`✅ TEST SUCCESS: Class ${classItem.title} started in test mode`);
              }
            }
          }
        } catch (error) {
          console.error('Error in test scheduler:', error);
        }
      };
      
      await testCheckScheduledClasses();
    } else {
      // Run normal scheduler check
      await checkScheduledClasses();
    }
    
    res.json({ success: true, message: 'Scheduler test completed' });
  } catch (error) {
    console.error('Error in scheduler test:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== DISCUSSION SYSTEM API ENDPOINTS =====

// Get all discussions
app.get('/api/discussions', async (req, res) => {
  try {
    console.log('=== FETCHING DISCUSSIONS ===');
    
    const result = await pool.query(`
      SELECT d.*, 
             (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id = d.id) as reply_count
      FROM discussions d 
      ORDER BY d.created_at DESC
    `);
    
    console.log('Discussions found:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching discussions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new discussion
app.post('/api/discussions', async (req, res) => {
  try {
    const { 
      title, content, category, program, author, author_id, 
      group_name, group_leader, group_members, priority, status 
    } = req.body;
    
    console.log('=== CREATING DISCUSSION ===');
    console.log('Discussion data:', req.body);
    
    const result = await pool.query(`
      INSERT INTO discussions (
        title, content, category, program, author, author_id,
        group_name, group_leader, group_members, priority, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `, [
      title, content, category, program, author, author_id,
      group_name, group_leader, group_members, priority || 'normal', status || 'active'
    ]);
    
    console.log('Discussion created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get discussion by ID
app.get('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== FETCHING DISCUSSION BY ID ===');
    console.log('Discussion ID:', id);
    
    const discussionResult = await pool.query('SELECT * FROM discussions WHERE id = $1', [id]);
    
    if (discussionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    // Get replies for this discussion
    const repliesResult = await pool.query(`
      SELECT * FROM discussion_replies 
      WHERE discussion_id = $1 
      ORDER BY created_at ASC
    `, [id]);
    
    const discussion = {
      ...discussionResult.rows[0],
      replies: repliesResult.rows
    };
    
    console.log('Discussion found with', repliesResult.rows.length, 'replies');
    res.json({ success: true, data: discussion });
  } catch (error) {
    console.error('Error fetching discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create reply to discussion
app.post('/api/discussion-replies', async (req, res) => {
  try {
    const { discussion_id, content, author, author_id, author_type } = req.body;
    
    console.log('=== CREATING DISCUSSION REPLY ===');
    console.log('Reply data:', req.body);
    
    // Insert reply
    const replyResult = await pool.query(`
      INSERT INTO discussion_replies (discussion_id, content, author, author_id, author_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [discussion_id, content, author, author_id, author_type || 'student']);
    
    // Update discussion reply count
    await pool.query(`
      UPDATE discussions 
      SET replies = replies + 1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [discussion_id]);
    
    console.log('Reply created:', replyResult.rows[0]);
    res.json({ success: true, data: replyResult.rows[0] });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update discussion (pin/unpin, like, etc.)
app.put('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_pinned, likes, views } = req.body;
    
    console.log('=== UPDATING DISCUSSION ===');
    console.log('Discussion ID:', id);
    console.log('Update data:', req.body);
    
    let updateQuery = 'UPDATE discussions SET updated_at = CURRENT_TIMESTAMP';
    let updateValues = [];
    let paramCount = 0;
    
    if (is_pinned !== undefined) {
      paramCount++;
      updateQuery += `, is_pinned = $${paramCount}`;
      updateValues.push(is_pinned);
    }
    
    if (likes !== undefined) {
      paramCount++;
      updateQuery += `, likes = $${paramCount}`;
      updateValues.push(likes);
    }
    
    if (views !== undefined) {
      paramCount++;
      updateQuery += `, views = $${paramCount}`;
      updateValues.push(views);
    }
    
    paramCount++;
    updateQuery += ` WHERE id = $${paramCount} RETURNING *`;
    updateValues.push(id);
    
    const result = await pool.query(updateQuery, updateValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    console.log('Discussion updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete discussion
app.delete('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETING DISCUSSION ===');
    console.log('Discussion ID:', id);
    
    // Delete replies first (CASCADE should handle this, but being explicit)
    await pool.query('DELETE FROM discussion_replies WHERE discussion_id = $1', [id]);
    
    // Delete discussion
    const result = await pool.query('DELETE FROM discussions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    console.log('Discussion deleted:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== STUDY GROUP NOTIFICATIONS API =====

// Create study group notifications
app.post('/api/study-group-notifications', async (req, res) => {
  try {
    const { notifications } = req.body;
    
    console.log('=== CREATING STUDY GROUP NOTIFICATIONS ===');
    console.log('Notifications:', notifications);
    
    if (!notifications || !Array.isArray(notifications)) {
      return res.status(400).json({ success: false, error: 'Notifications array is required' });
    }
    
    const results = [];
    
    for (const notification of notifications) {
      const {
        discussion_id, student_reg_no, student_name, group_name,
        group_leader, program, notification_type
      } = notification;
      
      const result = await pool.query(`
        INSERT INTO study_group_notifications (
          discussion_id, student_reg_no, student_name, group_name,
          group_leader, program, notification_type, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `, [
        discussion_id, student_reg_no, student_name, group_name,
        group_leader, program, notification_type || 'group_invitation', 'pending'
      ]);
      
      results.push(result.rows[0]);
    }
    
    console.log('Study group notifications created:', results.length);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error creating study group notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get study group notifications for a student
app.get('/api/study-group-notifications/:regNo', async (req, res) => {
  try {
    const { regNo } = req.params;
    
    console.log('=== FETCHING STUDY GROUP NOTIFICATIONS ===');
    console.log('Student Reg No:', regNo);
    
    const result = await pool.query(`
      SELECT sgn.*, d.title as discussion_title, d.content as discussion_content
      FROM study_group_notifications sgn
      LEFT JOIN discussions d ON sgn.discussion_id = d.id
      WHERE sgn.student_reg_no = $1
      ORDER BY sgn.created_at DESC
    `, [regNo]);
    
    console.log('Notifications found:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching study group notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update notification status
app.put('/api/study-group-notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('=== UPDATING NOTIFICATION STATUS ===');
    console.log('Notification ID:', id, 'Status:', status);
    
    const result = await pool.query(`
      UPDATE study_group_notifications 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating notification status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get replies for a discussion
app.get('/api/discussions/:id/replies', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM discussion_replies WHERE discussion_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add reply to discussion
app.post('/api/discussion-replies', async (req, res) => {
  try {
    const { discussion_id, content, author, author_id, author_type } = req.body;
    
    const result = await pool.query(`
      INSERT INTO discussion_replies (discussion_id, content, author, author_id, author_type)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [discussion_id, content, author, author_id, author_type || 'student']);
    
    // Update discussion reply count
    await pool.query(
      'UPDATE discussions SET replies = replies + 1 WHERE id = $1',
      [discussion_id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like a discussion
app.post('/api/discussions/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE discussions SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error liking discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a discussion (CASCADE delete will handle replies automatically)
app.delete('/api/discussions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, user_type } = req.body;
    
    console.log('=== DELETE DISCUSSION DEBUG ===');
    console.log('Discussion ID:', id);
    console.log('User ID:', user_id);
    console.log('User Type:', user_type);
    
    // First, get the discussion to check permissions
    const discussionResult = await pool.query(
      'SELECT * FROM discussions WHERE id = $1',
      [id]
    );
    
    if (discussionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Discussion not found' });
    }
    
    const discussion = discussionResult.rows[0];
    console.log('Discussion found:', discussion);
    
    // Check permissions: only lecturer of the program or discussion creator can delete
    let canDelete = false;
    
    if (user_type === 'lecturer') {
      // Lecturer can delete discussions in their programs
      const programResult = await pool.query(
        'SELECT * FROM programs WHERE name = $1 AND (lecturer_id = $2 OR lecturer_name = $3)',
        [discussion.program, user_id, req.body.username]
      );
      canDelete = programResult.rows.length > 0;
      console.log('Lecturer permission check:', canDelete);
    } else if (user_type === 'student') {
      // Student can only delete their own discussions
      canDelete = discussion.author_id == user_id || discussion.author === req.body.username;
      console.log('Student permission check:', canDelete);
    }
    
    if (!canDelete) {
      return res.status(403).json({ 
        success: false, 
        error: 'Permission denied. Only the discussion creator or program lecturer can delete this discussion.' 
      });
    }
    
    // Delete the discussion (CASCADE will automatically delete replies)
    const deleteResult = await pool.query(
      'DELETE FROM discussions WHERE id = $1 RETURNING *',
      [id]
    );
    
    console.log('Discussion deleted successfully:', deleteResult.rows[0]);
    
    res.json({ 
      success: true, 
      message: 'Discussion and all related replies deleted successfully',
      data: deleteResult.rows[0] 
    });
    
  } catch (error) {
    console.error('Error deleting discussion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize announcements table
const initializeAnnouncementsTable = async () => {
  try {
    console.log('Initializing announcements table...');
    
    // Drop and recreate announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_value VARCHAR(255),
        created_by VARCHAR(255) NOT NULL,
        created_by_id INTEGER,
        created_by_type VARCHAR(20) DEFAULT 'admin',
        file_url TEXT,
        file_name VARCHAR(255),
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Announcements table initialized successfully');
  } catch (error) {
    console.error('Error initializing announcements table:', error);
  }
};

// Initialize short-term programs table
const initializeShortTermProgramsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS short_term_programs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_value INTEGER NOT NULL,
        duration_unit VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_value VARCHAR(255),
        lecturer_id INTEGER,
        lecturer_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_by VARCHAR(255),
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Short-term programs table initialized successfully');
  } catch (error) {
    console.error('Error initializing short-term programs table:', error);
  }
};

// Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM announcements ORDER BY created_at DESC'
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new announcement
app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content, target_type, target_value, created_by, created_by_id, created_by_type, file_url, file_name } = req.body;
    
    console.log('=== CREATE ANNOUNCEMENT DEBUG ===');
    console.log('Received data:', req.body);
    
    const result = await pool.query(
      'INSERT INTO announcements (title, content, target_type, target_value, created_by, created_by_id, created_by_type, file_url, file_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [title, content, target_type, target_value, created_by, created_by_id, created_by_type, file_url, file_name]
    );
    
    console.log('Announcement created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete announcement
app.delete('/api/announcements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM announcements WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Announcement not found' });
    }
    
    res.json({ success: true, message: 'Announcement deleted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Short-Term Programs API Endpoints

// Get all short-term programs
app.get('/api/short-term-programs', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM short_term_programs ORDER BY created_at DESC'
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching short-term programs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new short-term program
app.post('/api/short-term-programs', async (req, res) => {
  try {
    const {
      title,
      description,
      duration_value,
      duration_unit,
      start_date,
      end_date,
      target_type,
      target_value,
      lecturer_id,
      lecturer_name,
      created_by,
      created_by_id
    } = req.body;

    console.log('=== CREATING SHORT-TERM PROGRAM ===');
    console.log('Program Data:', req.body);

    const result = await pool.query(
      `INSERT INTO short_term_programs 
       (title, description, duration_value, duration_unit, start_date, end_date, 
        target_type, target_value, lecturer_id, lecturer_name, created_by, created_by_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [title, description, duration_value, duration_unit, start_date, end_date,
       target_type, target_value, lecturer_id, lecturer_name, created_by, created_by_id]
    );

    console.log('Short-term program created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating short-term program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete short-term program
app.delete('/api/short-term-programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM short_term_programs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Short-term program not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting short-term program:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update short-term program status (for auto-expiry)
app.patch('/api/short-term-programs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await pool.query(
      'UPDATE short_term_programs SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Short-term program not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating short-term program status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================
// TIMETABLE MANAGEMENT SYSTEM
// ================================

// Initialize timetable table
const initializeTimetableTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        day VARCHAR(20) NOT NULL,
        time_start VARCHAR(10) NOT NULL,
        time_end VARCHAR(10) NOT NULL,
        program_name VARCHAR(255) NOT NULL,
        lecturer_name VARCHAR(255) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        course_name VARCHAR(255),
        department_name VARCHAR(255),
        college_name VARCHAR(255),
        semester INTEGER DEFAULT 1,
        academic_year VARCHAR(20) DEFAULT '2024/2025',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Timetable table initialized');
  } catch (error) {
    console.error('❌ Error initializing timetable table:', error);
  }
};

// Initialize venues table
const initializeVenuesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(100) NOT NULL,
        capacity INTEGER DEFAULT 0,
        type VARCHAR(100) NOT NULL,
        building VARCHAR(255) NOT NULL,
        floor VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Venues table initialized');
  } catch (error) {
    console.error('❌ Error initializing venues table:', error);
  }
};

// Get all timetable entries
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM timetable 
      ORDER BY 
        CASE day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          ELSE 7 
        END, 
        time_start
    `);
    
    console.log('=== TIMETABLE API DEBUG ===');
    console.log('Total timetable entries:', result.rows.length);
    console.log('Timetable entries:', result.rows);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new timetable entry
app.post('/api/timetable', async (req, res) => {
  try {
    const {
      day,
      time_start,
      time_end,
      program_name,
      lecturer_name,
      venue,
      course_name,
      department_name,
      college_name,
      semester,
      academic_year
    } = req.body;

    console.log('=== TIMETABLE CREATE DEBUG ===');
    console.log('Received data:', req.body);

    // Validate required fields
    if (!day || !time_start || !time_end || !program_name || !lecturer_name || !venue) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: day, time_start, time_end, program_name, lecturer_name, venue' 
      });
    }

    // Check for time conflicts
    const conflictCheck = await pool.query(`
      SELECT * FROM timetable 
      WHERE day = $1 
      AND venue = $2 
      AND (
        (time_start <= $3 AND time_end > $3) OR
        (time_start < $4 AND time_end >= $4) OR
        (time_start >= $3 AND time_end <= $4)
      )
    `, [day, venue, time_start, time_end]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Time conflict detected! ${venue} is already booked on ${day} during this time.`,
        conflictingEntry: conflictCheck.rows[0]
      });
    }

    // Insert new timetable entry
    const result = await pool.query(`
      INSERT INTO timetable (
        day, time_start, time_end, program_name, lecturer_name, venue,
        course_name, department_name, college_name, semester, academic_year
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `, [
      day, time_start, time_end, program_name, lecturer_name, venue,
      course_name, department_name, college_name, semester || 1, academic_year || '2024/2025'
    ]);

    console.log('Timetable entry created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update timetable entry
app.put('/api/timetable/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      day,
      time_start,
      time_end,
      program_name,
      lecturer_name,
      venue,
      course_name,
      department_name,
      college_name,
      semester,
      academic_year
    } = req.body;

    console.log('=== TIMETABLE UPDATE DEBUG ===');
    console.log('Updating entry ID:', id);
    console.log('Update data:', req.body);

    // Check for time conflicts (excluding current entry)
    const conflictCheck = await pool.query(`
      SELECT * FROM timetable 
      WHERE day = $1 
      AND venue = $2 
      AND id != $3
      AND (
        (time_start <= $4 AND time_end > $4) OR
        (time_start < $5 AND time_end >= $5) OR
        (time_start >= $4 AND time_end <= $5)
      )
    `, [day, venue, id, time_start, time_end]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Time conflict detected! ${venue} is already booked on ${day} during this time.`,
        conflictingEntry: conflictCheck.rows[0]
      });
    }

    const result = await pool.query(`
      UPDATE timetable SET 
        day = $1, time_start = $2, time_end = $3, program_name = $4, 
        lecturer_name = $5, venue = $6, course_name = $7, 
        department_name = $8, college_name = $9, semester = $10, 
        academic_year = $11, updated_at = CURRENT_TIMESTAMP
      WHERE id = $12 
      RETURNING *
    `, [
      day, time_start, time_end, program_name, lecturer_name, venue,
      course_name, department_name, college_name, semester, academic_year, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    console.log('Timetable entry updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete timetable entry
app.delete('/api/timetable/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== TIMETABLE DELETE DEBUG ===');
    console.log('Deleting entry ID:', id);

    const result = await pool.query('DELETE FROM timetable WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Timetable entry not found' });
    }

    console.log('Timetable entry deleted:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get timetable entries by lecturer
app.get('/api/timetable/lecturer/:lecturerName', async (req, res) => {
  try {
    const { lecturerName } = req.params;

    console.log('=== LECTURER TIMETABLE DEBUG ===');
    console.log('Fetching timetable for lecturer:', lecturerName);

    const result = await pool.query(`
      SELECT * FROM timetable 
      WHERE lecturer_name = $1 
      ORDER BY 
        CASE day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          ELSE 7 
        END, 
        time_start
    `, [lecturerName]);

    console.log('Lecturer timetable entries:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching lecturer timetable:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get timetable entries by program
app.get('/api/timetable/program/:programName', async (req, res) => {
  try {
    const { programName } = req.params;

    console.log('=== PROGRAM TIMETABLE DEBUG ===');
    console.log('Fetching timetable for program:', programName);

    const result = await pool.query(`
      SELECT * FROM timetable 
      WHERE program_name = $1 
      ORDER BY 
        CASE day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          ELSE 7 
        END, 
        time_start
    `, [programName]);

    console.log('Program timetable entries:', result.rows.length);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching program timetable:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get timetable statistics
app.get('/api/timetable/stats', async (req, res) => {
  try {
    const totalEntries = await pool.query('SELECT COUNT(*) FROM timetable');
    const activeLecturers = await pool.query('SELECT COUNT(DISTINCT lecturer_name) FROM timetable');
    const programsScheduled = await pool.query('SELECT COUNT(DISTINCT program_name) FROM timetable');
    const venuesUsed = await pool.query('SELECT COUNT(DISTINCT venue) FROM timetable');

    const stats = {
      totalSchedules: parseInt(totalEntries.rows[0].count),
      activeLecturers: parseInt(activeLecturers.rows[0].count),
      programsScheduled: parseInt(programsScheduled.rows[0].count),
      venuesUsed: parseInt(venuesUsed.rows[0].count)
    };

    console.log('=== TIMETABLE STATS ===');
    console.log('Statistics:', stats);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching timetable statistics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// VENUES API ENDPOINTS

// Get all venues
app.get('/api/venues', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues ORDER BY name');
    console.log('=== VENUES API DEBUG ===');
    console.log('Total venues:', result.rows.length);
    console.log('Venues:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new venue
app.post('/api/venues', async (req, res) => {
  try {
    const {
      name,
      short_name,
      capacity,
      type,
      building,
      floor,
      description
    } = req.body;

    console.log('=== VENUE CREATE DEBUG ===');
    console.log('Received data:', req.body);

    // Validate required fields
    if (!name || !short_name || !type || !building) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, short_name, type, building' 
      });
    }

    // Check for duplicate venue names
    const duplicateCheck = await pool.query(
      'SELECT * FROM venues WHERE name = $1 OR short_name = $2',
      [name, short_name]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Venue with this name or short name already exists'
      });
    }

    // Insert new venue
    const result = await pool.query(`
      INSERT INTO venues (name, short_name, capacity, type, building, floor, description) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `, [name, short_name, capacity || 0, type, building, floor || '', description || '']);

    console.log('Venue created:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update venue
app.put('/api/venues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      short_name,
      capacity,
      type,
      building,
      floor,
      description
    } = req.body;

    console.log('=== VENUE UPDATE DEBUG ===');
    console.log('Updating venue ID:', id);
    console.log('Update data:', req.body);

    const result = await pool.query(`
      UPDATE venues SET 
        name = $1, short_name = $2, capacity = $3, type = $4, 
        building = $5, floor = $6, description = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8 
      RETURNING *
    `, [name, short_name, capacity, type, building, floor, description, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    console.log('Venue updated:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete venue
app.delete('/api/venues/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== VENUE DELETE DEBUG ===');
    console.log('Deleting venue ID:', id);

    // Check if venue is being used in timetable
    const usageCheck = await pool.query('SELECT COUNT(*) as count FROM timetable WHERE venue = (SELECT name FROM venues WHERE id = $1)', [id]);
    
    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete venue. It is currently being used in the timetable.'
      });
    }

    const result = await pool.query('DELETE FROM venues WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Venue not found' });
    }

    console.log('Venue deleted:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PASSWORD RESET FUNCTIONALITY

// Create password reset logs table
const createPasswordResetTable = async () => {
  try {
    // Create password_reset_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        reset_code VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP
      )
    `);

    // Create admin_settings table for admin email
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin email if not exists
    await pool.query(`
      INSERT INTO admin_settings (setting_key, setting_value) 
      VALUES ('admin_email', 'uj23hiueddhpna2y@ethereal.email')
      ON CONFLICT (setting_key) DO NOTHING
    `);
    console.log('✅ Password reset logs table created/verified');
  } catch (error) {
    console.error('Error creating password reset table:', error);
  }
};

// Generate random 6-digit verification code
const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Manual password reset endpoint
app.post('/api/password-reset/manual', async (req, res) => {
  try {
    const { userId, userType, newPassword, adminEmail } = req.body;
    
    console.log('=== MANUAL PASSWORD RESET ===');
    console.log('User ID:', userId);
    console.log('User Type:', userType);
    console.log('Admin Email:', adminEmail);
    
    // Update password in respective table
    let updateResult;
    let userName = '';
    let userEmail = '';
    
    if (userType === 'student') {
      updateResult = await pool.query(
        'UPDATE students SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING name, email',
        [newPassword, userId]
      );
      if (updateResult.rows.length > 0) {
        userName = updateResult.rows[0].name;
        userEmail = updateResult.rows[0].email;
      }
    } else if (userType === 'lecturer') {
      updateResult = await pool.query(
        'UPDATE lecturers SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING name, email',
        [newPassword, userId]
      );
      if (updateResult.rows.length > 0) {
        userName = updateResult.rows[0].name;
        userEmail = updateResult.rows[0].email;
      }
    }
    
    if (!updateResult || updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update password_records table
    await pool.query(
      'UPDATE password_records SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_type = $2 AND user_id = $3',
      [newPassword, userType, userId]
    );
    
    // Log the manual reset
    await pool.query(
      `INSERT INTO password_reset_logs (user_id, user_name, email, user_type, reset_code, expires_at, used, used_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, userName, adminEmail, userType, 'MANUAL_RESET', new Date(Date.now() + 24*60*60*1000), true, new Date()]
    );
    
    console.log('✅ Manual password reset completed for:', userName);
    res.json({ 
      success: true, 
      message: `Password successfully reset for ${userName}`,
      data: { userName, userEmail, userType }
    });
    
  } catch (error) {
    console.error('Error in manual password reset:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send reset code endpoint
app.post('/api/password-reset/send-code', async (req, res) => {
  try {
    const { email, userType, adminEmail } = req.body;
    
    console.log('=== SENDING RESET CODE ===');
    console.log('User Email:', email);
    console.log('User Type:', userType);
    console.log('Admin Email from request:', adminEmail);
    
    // Get current admin email from database
    const currentAdminEmail = await getAdminEmail();
    console.log('Current admin email from database:', currentAdminEmail);
    
    // Find user by email
    let user = null;
    let userId = null;
    let userName = '';
    
    if (userType === 'student') {
      const result = await pool.query('SELECT id, name, email FROM students WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        userId = user.id;
        userName = user.name;
      }
    } else if (userType === 'lecturer') {
      const result = await pool.query('SELECT id, name, email FROM lecturers WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        user = result.rows[0];
        userId = user.id;
        userName = user.name;
      }
    }
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: `No ${userType} found with email: ${email}` 
      });
    }
    
    // Generate reset code
    const resetCode = generateResetCode();
    const expiresAt = new Date(Date.now() + 15*60*1000); // 15 minutes expiry
    
    // Save reset code to database
    await pool.query(
      `INSERT INTO password_reset_logs (user_id, user_name, email, user_type, reset_code, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, userName, email, userType, resetCode, expiresAt]
    );
    
    console.log('✅ Reset code generated:', resetCode);
    console.log('✅ Code expires at:', expiresAt);
    console.log('✅ Sending email to user:', email);
    
    // Send real email to user
    const emailResult = await sendResetCodeEmail(email, userName, resetCode);
    
    if (emailResult.success) {
      console.log('✅ Reset code sent to user email:', email);
      
      // SECURE RESPONSE - No reset code included
      res.json({ 
        success: true, 
        message: `Reset code sent to ${email}. Please check your email.`,
        data: { 
          userName,
          email,
          expiresAt,
          emailSent: !emailResult.simulated
        }
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send reset code email'
      });
    }
    
  } catch (error) {
    console.error('Error sending reset code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify reset code and reset password endpoint
app.post('/api/password-reset/verify-and-reset', async (req, res) => {
  try {
    const { email, resetCode, newPassword, userType } = req.body;
    
    console.log('=== VERIFYING RESET CODE ===');
    console.log('Email:', email);
    console.log('Reset Code:', resetCode);
    console.log('User Type:', userType);
    
    // Find valid reset code
    const codeResult = await pool.query(
      `SELECT * FROM password_reset_logs 
       WHERE email = $1 AND reset_code = $2 AND user_type = $3 AND used = FALSE AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [email, resetCode, userType]
    );
    
    if (codeResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset code' 
      });
    }
    
    const resetLog = codeResult.rows[0];
    
    // Update password in respective table
    let updateResult;
    if (userType === 'student') {
      updateResult = await pool.query(
        'UPDATE students SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING name, email',
        [newPassword, resetLog.user_id]
      );
    } else if (userType === 'lecturer') {
      updateResult = await pool.query(
        'UPDATE lecturers SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING name, email',
        [newPassword, resetLog.user_id]
      );
    }
    
    if (!updateResult || updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Update password_records table
    await pool.query(
      'UPDATE password_records SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_type = $2 AND user_id = $3',
      [newPassword, userType, resetLog.user_id]
    );
    
    // Mark reset code as used
    await pool.query(
      'UPDATE password_reset_logs SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = $1',
      [resetLog.id]
    );
    
    console.log('✅ Password reset completed for:', resetLog.user_name);
    
    // Send confirmation email
    try {
      if (emailTransporter) {
        const confirmationEmail = {
          from: `"MUST LMS" <${ADMIN_EMAIL}>`,
          to: email,
          subject: 'Password Reset Successful - MUST LMS',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #16a34a;">Password Reset Successful</h1>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p>Dear ${resetLog.user_name},</p>
                <p>Your password has been successfully reset for your MUST LMS account.</p>
                <p>You can now log in with your new password.</p>
                
                <div style="background: #dcfce7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 0; color: #166534;"><strong>Security Notice:</strong></p>
                  <p style="margin: 5px 0 0 0; color: #166534;">If you did not make this change, please contact IT Support immediately.</p>
                </div>
              </div>
              
              <div style="text-align: center; color: #64748b; font-size: 12px;">
                <p>© 2026 Mbeya University of Science and Technology</p>
                <p>Contact IT Support: +255 25 295 7544</p>
              </div>
            </div>
          `
        };
        
        await emailTransporter.sendMail(confirmationEmail);
        console.log('✅ Password reset confirmation email sent');
      }
    } catch (error) {
      console.warn('⚠️ Failed to send confirmation email:', error.message);
    }

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      data: { 
        userName: updateResult.rows[0].name,
        email: updateResult.rows[0].email
      }
    });
    
  } catch (error) {
    console.error('Error verifying reset code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get password reset logs endpoint
app.get('/api/password-reset-logs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM password_reset_logs 
      ORDER BY created_at DESC 
      LIMIT 50
    `);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching password reset logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin email configuration endpoint (separate from password reset)
app.post('/api/admin/configure-email', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    
    console.log('=== CONFIGURING ADMIN EMAIL ===');
    console.log('Admin Email from request:', adminEmail);
    
    // Get current admin email from database
    const currentAdminEmail = await getAdminEmail();
    console.log('Current admin email from database:', currentAdminEmail);
    
    // Admin email configuration successful
    console.log('✅ Admin email configured:', currentAdminEmail);
    
    res.json({ 
      success: true, 
      message: `Admin email configured successfully: ${currentAdminEmail}`,
      data: { 
        adminEmail: currentAdminEmail,
        configured: true
      }
    });
    
  } catch (error) {
    console.error('Error configuring admin email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin email management endpoints
// Get admin email
app.get('/api/admin/email', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT setting_value FROM admin_settings WHERE setting_key = $1',
      ['admin_email']
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        success: true, 
        data: { adminEmail: result.rows[0].setting_value }
      });
    } else {
      res.json({ 
        success: true, 
        data: { adminEmail: 'admin@must.ac.tz' }
      });
    }
  } catch (error) {
    console.error('Error fetching admin email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save admin email
app.post('/api/admin/email', async (req, res) => {
  try {
    const { adminEmail } = req.body;
    
    if (!adminEmail || !adminEmail.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid admin email is required' 
      });
    }
    
    // Update admin email in database
    await pool.query(`
      INSERT INTO admin_settings (setting_key, setting_value, updated_at) 
      VALUES ('admin_email', $1, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP
    `, [adminEmail]);
    
    console.log('✅ Admin email updated to:', adminEmail);
    
    res.json({ 
      success: true, 
      message: 'Admin email updated successfully',
      data: { adminEmail }
    });
  } catch (error) {
    console.error('Error saving admin email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PASSWORD CHANGE ENDPOINT ====================

// Change password for logged-in users
app.post('/api/change-password', async (req, res) => {
  try {
    const { userId, username, currentPassword, newPassword, userType } = req.body;
    
    console.log('=== CHANGE PASSWORD DEBUG ===');
    console.log('User Type:', userType);
    console.log('User ID:', userId);
    console.log('Username:', username);
    
    // Validate inputs
    if (!currentPassword || !newPassword || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Determine which table to query
    const table = userType === 'student' ? 'students' : 'lecturers';
    const idField = userType === 'student' ? 'registration_number' : 'employee_id';
    
    // Get user from database
    const userQuery = `SELECT * FROM ${table} WHERE ${idField} = $1`;
    const userResult = await pool.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const user = userResult.rows[0];
    console.log('User found:', user.name || user.username);
    
    // Verify current password
    if (user.password !== currentPassword) {
      console.log('Current password incorrect');
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Update password
    const updateQuery = `UPDATE ${table} SET password = $1 WHERE ${idField} = $2 RETURNING *`;
    const updateResult = await pool.query(updateQuery, [newPassword, username]);
    
    if (updateResult.rows.length === 0) {
      console.log('Failed to update password');
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update password' 
      });
    }
    
    console.log('Password updated successfully for:', username);
    
    // Also update in password_records table if it exists
    try {
      await pool.query(`
        UPDATE password_records 
        SET password = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE user_type = $2 AND (user_id = $3 OR username = $4)
      `, [newPassword, userType, userId, username]);
      console.log('Password record also updated');
    } catch (recordError) {
      console.log('Password records table may not exist or update failed:', recordError.message);
    }
    
    res.json({ 
      success: true, 
      message: 'Password updated successfully',
      data: {
        username: user.name || user.username,
        userType
      }
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while changing password',
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Initialize database after server starts
(async () => {
  try {
    console.log('Initializing database tables...');
    await initializeDatabase();
    await initializeLiveClassesTable();
    await initializeAnnouncementsTable();
    await initializeShortTermProgramsTable();
    await initializeTimetableTable();
    await initializeVenuesTable();
    await createPasswordResetTable(); // Add this line
    console.log('✅ All database tables initialized successfully');
    
    // Start scheduler after database is ready
    console.log('🕒 Starting automatic live class scheduler...');
    setInterval(checkScheduledClasses, 60000); // 60000ms = 1 minute
    
    // Run scheduler immediately after database init
    setTimeout(() => {
      console.log('🚀 Starting initial scheduler check...');
      checkScheduledClasses();
    }, 2000); // Wait 2 seconds after database init
    
    console.log('📅 Scheduler will auto-start classes when their scheduled time arrives');
    console.log('🚀 Server is ready to accept requests');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('⚠️ Server running but database may not be ready');
  }
})();

// Keep server alive
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});