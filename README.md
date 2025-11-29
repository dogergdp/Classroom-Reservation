# Classroom Reservation System

A secure, role-based classroom reservation management system developed as a university group project. Built with PHP and MySQL, this application provides comprehensive booking management with robust security features and an intuitive interface.

## About This Project

This application was developed as a collaborative university project to demonstrate proficiency in cybersecurity principles, object-oriented programming, and secure web application development. The project showcases modern security practices, including role-based access control, SQL injection prevention, and secure session management.

## Features

### Core Reservation Operations
- **Reservation Management**: Submit, approve, and deny classroom reservation requests
- **Room Assignment**: 
  - Direct room assignment by department heads
  - Conflict detection and availability checking
  - Multi-hour booking support
- **Real-time Availability**: View classroom schedules and availability in real-time
- **Reservation Tracking**: Monitor reservation status (pending/approved/denied) with detailed history

### Role-Based Access Control
- **Student Role**:
  - View classroom schedules and availability
  - Track personal reservation requests
- **Professor Role**:
  - Submit classroom reservation requests
  - View reservation history and status
  - Receive approval/denial notifications
- **Department Head Role**:
  - Review and approve/deny reservation requests
  - Assign classrooms directly to professors
  - Monitor department-wide classroom usage
- **Administrator Role**:
  - Complete user management (create, update, delete accounts)
  - System configuration and department management
  - Global oversight of all reservations

### Security & Authentication
- **SHA-1 Password Hashing**: Secure password storage with hashing
- **Session Management**: Secure session handling with automatic timeout
- **Protected API Endpoints**: Role verification on all API calls
- **SQL Injection Prevention**: PDO prepared statements for all database queries
- **XSS Prevention**: Input sanitization and output encoding
- **AES-128-CBC Encryption**: Secure data transmission for sensitive information

## Technology Stack

### Backend
- **PHP 7.4+**: Server-side scripting language
- **MySQL/MariaDB**: Relational database management system
- **PDO**: Database abstraction layer for secure queries

### Frontend
- **HTML5 & CSS3**: Modern markup and styling
- **Vanilla JavaScript (ES6+)**: Dynamic UI interactions
- **Font Awesome**: Icon library for enhanced UI

### Security
- **OpenSSL**: Data encryption (AES-128-CBC)
- **SHA-1 Hashing**: Password security
- **PDO Prepared Statements**: SQL injection prevention

### Development Environment
- **XAMPP/WAMP**: Local server environment
- **phpMyAdmin**: Database management interface

## Setup Instructions

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or MariaDB 10.4+
- Apache/Nginx web server
- XAMPP/WAMP (recommended for local development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dogergdp/Classroom-Reservation.git
cd Classroom-Reservation
```

2. Install and start your local server (XAMPP/WAMP)
   - Start Apache and MySQL services

3. Create the database
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `classroom_reservation`
   - Import the SQL schema:
```sql
CREATE DATABASE classroom_reservation;
```
   - Import `classroom_reservation.sql` file

4. Configure database connection
   - Edit `db_config.php` with your credentials:
```php
<?php
$host = "localhost";
$dbname = "classroom_reservation";
$username_db = "root";
$password_db = "";  // Your MySQL password
?>
```

5. Deploy to web server
   - Copy the project folder to your server root:
     - XAMPP: `C:\xampp\htdocs\`
     - WAMP: `C:\wamp\www\`

6. Access the application
   - Open browser and navigate to: `http://localhost/Classroom-Reservation/`

### Default Login Credentials
| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | 123456 |
| **Department Head** | deptHead | 123456 |
| **Professor** | prof | 123456 |
| **Student** | student | 123456 |

> ⚠️ **Security Note**: Change default passwords immediately in production!

## Database Schema

### Collections (Tables)
- `users`: User accounts with role-based access
- `departments`: Department information and hierarchy
- `reservations`: Classroom reservation requests and approvals
- `room_assignments`: Direct room assignments by administrators

### Key Tables

#### users
```sql
- id (INT, PK, AUTO_INCREMENT)
- username (VARCHAR, UNIQUE)
- password (VARCHAR) -- SHA-1 hashed
- role (ENUM: student, professor, deptHead, admin)
- full_name (VARCHAR)
- email (VARCHAR)
- department_id (INT, FK)
- course (VARCHAR) -- For students
- section (VARCHAR) -- For students
```

#### **reservations**
```sql
- id (INT, PK, AUTO_INCREMENT)
- professor_id (INT, FK → users.id)
- department_id (INT, FK → departments.id)
- room (VARCHAR)
- reservation_date (DATE)
- start_time (TIME)
- duration (INT) -- in hours
- status (ENUM: pending, approved, denied)
- reason (TEXT)
- denial_reason (TEXT)
- course (VARCHAR)
- section (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **departments**
```sql
- id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR)
- head_id (INT, FK → users.id)
```

#### **room_assignments**
```sql
- id (INT, PK, AUTO_INCREMENT)
- reservation_id (INT, FK → reservations.id, NULL)
- professor_id (INT, FK → users.id)
- room (VARCHAR)
- assignment_date (DATE)
- start_time (TIME)
- end_time (TIME)
- course (VARCHAR)
- section (VARCHAR)
- assigned_by (INT, FK → users.id)
- created_at (TIMESTAMP)
```

### Entity Relationship Diagram
```
users ←→ departments (Many-to-One)
users ←→ reservations (One-to-Many via professor_id)
departments ←→ reservations (One-to-Many)
users ←→ room_assignments (Many relationships)
reservations ←→ room_assignments (One-to-One optional)
```

## 👥 User Roles

### Role Hierarchy & Permissions

| Permission | Student | Professor | Dept Head | Admin |
|-----------|---------|-----------|-----------|-------|
| View Schedules | ✅ | ✅ | ✅ | ✅ |
| Submit Reservations | ❌ | ✅ | ✅ | ✅ |
| Approve/Deny Reservations | ❌ | ❌ | ✅ | ✅ |
| Assign Rooms Directly | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Department Management | ❌ | ❌ | ❌ | ✅ |
| System Configuration | ❌ | ❌ | ❌ | ✅ |

## 🔌 API Endpoints

### Authentication
- `POST /login.php` - User authentication
- `GET /logout.php` - Session termination
- `POST /signup.php` - New user registration

### Reservations
- `POST /api/submit_reservation.php` - Create reservation (Professor)
- `GET /api/get_reservations.php` - Fetch reservations (All roles)
- `POST /api/approve_reservation.php` - Approve request (Dept Head/Admin)
- `POST /api/deny_reservation.php` - Deny request (Dept Head/Admin)
- `POST /api/update_reservation_status.php` - Update status (Dept Head/Admin)

### Room Management
- `POST /api/assign_room.php` - Direct room assignment (Dept Head/Admin)
- `GET /api/get_room_assignments.php` - Fetch assignments (All roles)

### User Management
- `GET /api/get_users.php` - Fetch all users (Admin)
- `GET /api/get_professors.php` - Fetch professors (Dept Head/Admin)
- `GET /api/get_student_info.php` - Fetch student details (Student)

### Debugging (Development Only)
- `GET /api/debug_database.php` - Database diagnostics

## 🛡️ Security Implementation

### 1. **Password Security**
```php
// Password hashing with SHA-1 (upgrade to bcrypt recommended)
$hashedPassword = sha1($password);

// Secure password verification
if (sha1($inputPassword) === $storedHash) {
    // Authenticate user
}
```

### 2. **SQL Injection Prevention**
```php
// Using PDO prepared statements
$stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
$stmt->bindParam(':username', $username, PDO::PARAM_STR);
$stmt->execute();
```

### 3. **Session Security**
```php
// Secure session initialization
session_start();
session_regenerate_id(true); // Prevent session fixation

// Session validation
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit();
}
```

### 4. **XSS Prevention**
```php
// Output encoding
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

### 5. **Data Encryption**
```php
// AES-128-CBC encryption for sensitive data
function encryptData($data, $key) {
    $cipher = "AES-128-CBC";
    $ivlen = openssl_cipher_iv_length($cipher);
    $iv = openssl_random_pseudo_bytes($ivlen);
    $encrypted = openssl_encrypt($data, $cipher, $key, OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $encrypted);
}
```

### 6. **Access Control**
```php
// Role-based access control
if ($_SESSION['role'] !== 'admin') {
    echo json_encode(['error' => 'Unauthorized access']);
    exit();
}
```

## 🤝 Contributors

This project was developed as a **university group project** to demonstrate:
- Collaborative software development
- Secure coding practices
- Object-oriented design principles
- Real-world application of cybersecurity concepts

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Learning Outcomes

Through this project, our team gained practical experience in:

1. **Cybersecurity**: Implementation of authentication, authorization, encryption, and secure coding practices
2. **Object-Oriented Programming**: Design patterns, encapsulation, inheritance, and polymorphism
3. **Database Design**: Normalization, relationships, indexing, and query optimization
4. **Web Security**: OWASP Top 10 vulnerabilities and mitigation strategies
5. **Full-Stack Development**: Integration of frontend, backend, and database layers
6. **Team Collaboration**: Version control, code reviews, and agile methodology

---

## ⭐ Star this Repository

If you find this project helpful for learning web security and object-oriented design, please consider giving it a star! ⭐
