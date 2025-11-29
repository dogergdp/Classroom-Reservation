# 🔐 Classroom Reservation System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PHP](https://img.shields.io/badge/PHP-7.4+-blue.svg)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-orange.svg)](https://www.mysql.com/)
[![Security](https://img.shields.io/badge/Security-Focused-red.svg)](https://github.com)

> **A secure, role-based classroom reservation management system developed as a university group project to demonstrate cybersecurity best practices and object-oriented design principles.**

## 📋 Table of Contents
- [Overview](#overview)
- [Cybersecurity Features](#cybersecurity-features)
- [Architecture & Design](#architecture--design)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Security Implementation](#security-implementation)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
- [Learning Outcomes](#learning-outcomes)
- [License](#license)
- [Contact](#contact)

## 🎯 Overview

The **Classroom Reservation System** is an enterprise-grade web application designed for educational institutions to manage classroom bookings efficiently. This project was developed as part of a **university group project** with a strong emphasis on **cybersecurity principles** and **object-oriented programming** paradigms.

The system implements a robust **role-based access control (RBAC)** mechanism, secure session management, and follows OWASP security guidelines to prevent common vulnerabilities such as SQL injection, XSS attacks, and CSRF exploits.

### 🎓 Academic Purpose
This project showcases:
- **Secure software development lifecycle (SDLC)**
- **Object-oriented design patterns**
- **Database security and encryption**
- **Authentication and authorization mechanisms**
- **Input validation and sanitization**
- **Session management and secure communication**

## 🔐 Cybersecurity Features

Our system implements multiple layers of security:

### 1. **Authentication & Authorization**
- ✅ **SHA-1 Password Hashing** with salting
- ✅ **Role-Based Access Control (RBAC)** - 4 distinct user roles
- ✅ **Session Management** with secure session tokens
- ✅ **Automatic Session Timeout** and invalidation
- ✅ **Protected API Endpoints** with role verification

### 2. **Data Protection**
- ✅ **Prepared Statements (PDO)** to prevent SQL injection
- ✅ **Input Validation & Sanitization** on all user inputs
- ✅ **AES-128-CBC Encryption** for sensitive data transmission
- ✅ **XSS Prevention** through output encoding
- ✅ **CSRF Token Protection** (planned enhancement)

### 3. **Database Security**
- ✅ **Foreign Key Constraints** for referential integrity
- ✅ **Cascade Delete Operations** for data consistency
- ✅ **Indexed Queries** for performance optimization
- ✅ **Database Connection Security** with PDO exceptions

### 4. **Access Control**
- ✅ **Server-side validation** on all requests
- ✅ **API endpoint protection** with session checks
- ✅ **Role-specific functionality** segregation
- ✅ **Unauthorized access prevention** mechanisms

## 🏗️ Architecture & Design

### Object-Oriented Design Principles

The system follows **SOLID principles** and implements:

#### **Separation of Concerns**
```
├── Presentation Layer    (HTML/CSS/JavaScript)
├── Business Logic Layer  (PHP API)
├── Data Access Layer     (PDO/MySQL)
└── Database Layer        (MySQL Schema)
```

#### **Design Patterns Used**
- **MVC Pattern**: Separation of model, view, and controller logic
- **Factory Pattern**: Database connection management (`getDbConnection()`)
- **Singleton Pattern**: Session management
- **Strategy Pattern**: Role-specific rendering and behavior
- **Repository Pattern**: Database operations abstraction

#### **Class Structure** (Object-Oriented Approach)
```php
// Example: Database Connection Factory
class DatabaseConnection {
    private static $instance = null;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new PDO(...);
        }
        return self::$instance;
    }
}

// Example: User Model with Encapsulation
class User {
    private $id;
    private $username;
    private $role;
    private $department_id;
    
    public function hasPermission($action) { ... }
    public function authenticate($password) { ... }
}

// Example: Reservation Service (Business Logic)
class ReservationService {
    public function createReservation($data) { ... }
    public function approveReservation($id) { ... }
    public function validateAvailability($room, $date, $time) { ... }
}
```

## ✨ Features

### 👨‍🎓 Student Features
- View available classrooms and schedules
- Request classroom reservations
- Track reservation status (pending/approved/denied)
- Receive notifications for reservation updates

### 👨‍🏫 Professor Features
- Submit classroom reservation requests
- View personal reservation history
- Receive approval/denial notifications with reasons
- Check real-time room availability

### 👔 Department Head Features
- Review and approve/deny reservation requests
- Assign classrooms directly to professors
- Monitor department-wide classroom usage
- Generate reservation reports

### 👨‍💼 Administrator Features
- **User Management**: Create, update, delete user accounts
- **System Configuration**: Manage departments and roles
- **Audit Trail**: View all system activities
- **Global Oversight**: Monitor all reservations across departments

## 💻 Technology Stack

### Backend
- **PHP 7.4+** - Server-side scripting
- **MySQL/MariaDB** - Relational database
- **PDO** - Database abstraction layer

### Frontend
- **HTML5 & CSS3** - Modern markup and styling
- **Vanilla JavaScript (ES6+)** - Dynamic UI interactions
- **Font Awesome** - Icon library

### Security
- **OpenSSL** - Data encryption (AES-128-CBC)
- **SHA-1 Hashing** - Password security
- **PDO Prepared Statements** - SQL injection prevention

### Development Environment
- **XAMPP/WAMP** - Local server environment
- **phpMyAdmin** - Database management

## 🚀 Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or MariaDB 10.4+
- Apache/Nginx web server
- XAMPP/WAMP (recommended for local development)

### Step 1: Clone the Repository
```bash
git clone https://github.com/dogergdp/Classroom-Reservation.git
cd Classroom-Reservation
```

### Step 2: Database Setup
1. Start your MySQL server (via XAMPP/WAMP)
2. Open phpMyAdmin and create a database:
```sql
CREATE DATABASE classroom_reservation;
```
3. Import the database schema:
```bash
mysql -u root -p classroom_reservation < classroom_reservation.sql
```

### Step 3: Configure Database Connection
Edit `db_config.php` with your database credentials:
```php
<?php
$host = "localhost";
$dbname = "classroom_reservation";
$username_db = "root";
$password_db = "";  // Your MySQL password
?>
```

### Step 4: Deploy to Web Server
- Copy the project folder to your web server root:
  - **XAMPP**: `C:\xampp\htdocs\`
  - **WAMP**: `C:\wamp\www\`

### Step 5: Access the Application
Open your browser and navigate to:
```
http://localhost/Classroom-Reservation/
```

### Default Login Credentials
| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | 123456 |
| **Department Head** | deptHead | 123456 |
| **Professor** | prof | 123456 |
| **Student** | student | 123456 |

> ⚠️ **Security Note**: Change default passwords immediately in production!

## 🗃️ Database Schema

### Core Tables

#### **users**
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
