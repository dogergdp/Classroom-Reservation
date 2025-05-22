<?php
session_start();
require_once 'db_config.php';
$encryption_key = getenv('CLASSROOM_APP_KEY');

$errors = [];
$success = false;
$detected_role = 'student'; // Default role
$detected_course = ''; // For storing detected program (BSCS/BSIT/BSIS)
$detected_section = ''; // For storing detected section (1A/2B/etc)

// Handle signup form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $first_name = encryptData(trim($_POST['first_name']), $encryption_key);
    $middle_name = encryptData(trim($_POST['middle_name']), $encryption_key);
    $last_name = encryptData(trim($_POST['last_name']), $encryption_key);
    $email = encryptData(trim($_POST['email']), $encryption_key);
    
    // Determine role based on email
    if (preg_match('/^professor\.|\.professor@|^prof\.|\.prof@|^faculty\.|\.faculty@/i', $email)) {
        $detected_role = 'professor';
    } else if (preg_match('/^student\.|\.student@|^std\.|\.std@/i', $email)) {
        $detected_role = 'student';
    } else {
        // Detect common university domains
        $email_parts = explode('@', $email);
        if (count($email_parts) == 2) {
            $domain = $email_parts[1];
            if (strpos($domain, 'faculty.') !== false || strpos($domain, 'professor.') !== false) {
                $detected_role = 'professor';
            } else if (strpos($domain, 'student.') !== false) {
                $detected_role = 'student';
            }
        }
    }
    
    $role = $detected_role;
    
    // Get course and section for students
    $course = '';
    $section = '';
    if ($role === 'student') {
        $course = trim($_POST['course']);
        $section = trim($_POST['section']);
    }
    
    // Basic validation
    if (empty($username)) {
        $errors[] = "Username is required";
    }
    if (empty($password)) {
        $errors[] = "Password is required";
    }
    if ($password !== $confirm_password) {
        $errors[] = "Passwords do not match";
    }
    $raw_email = trim($_POST['email']);

    if (empty($raw_email)) {
        $errors[] = "Email is required";
    } elseif (!filter_var($raw_email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format";
    }

    // Only encrypt after validation
    $email = encryptData($raw_email, $encryption_key);
    
    // Validate student-specific fields
    if ($role === 'student') {
        if (empty($course)) {
            $errors[] = "Program (BSCS/BSIT/BSIS) is required for students";
        }
        if (empty($section)) {
            $errors[] = "Section is required for students";
        }
    }
    
    // If no errors, proceed with registration
    if (empty($errors)) {
        try {
            $conn = getDbConnection();
            
            // Check if email already exists
            $encrypted_email = encryptData($email, $encryption_key);

            $stmt = $conn->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->bindParam(':email', $encrypted_email);
            $stmt->execute();
            if ($stmt->rowCount() > 0) {
                $errors[] = "Email already exists. Please use another email.";
            }

            // Check if username already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username");
            $stmt->bindParam(':username', $username);
            $stmt->execute();
            
            
            
            if ($stmt->rowCount() > 0) {
                $errors[] = "Username already exists. Please choose another one.";
            } else {
                // Hash the password using SHA-1
                $hashed_password = sha1($password);
                
                // Insert new user
            if ($role === 'student') {
                // Get department_id for the course
                $department_id = getDepartmentIdForCourse($conn, strtoupper($course));

                // For students, include course, section, and department_id
                $stmt = $conn->prepare("INSERT INTO users (username, password, role, first_name, middle_name, last_name, email, course, section, department_id) 
                        VALUES (:username, :password, :role, :first_name, :middle_name, :last_name, :email, :course, :section, :department_id)");
                $stmt->bindParam(':course', $course);
                $stmt->bindParam(':section', $section);
                $stmt->bindParam(':department_id', $department_id);
            }
                
                $stmt->bindParam(':username', $username);
                $stmt->bindParam(':password', $hashed_password);
                $stmt->bindParam(':role', $role);
                $stmt->bindParam(':first_name', $first_name);
                $stmt->bindParam(':middle_name', $middle_name);
                $stmt->bindParam(':last_name', $last_name);
                $stmt->bindParam(':email', $email);
                
                if ($stmt->execute()) {
                    $success = true;
                    $_SESSION['signup_success'] = "Registration successful! You can now log in.";
                    header("Location: index.php");
                    exit();
                } else {
                    $errors[] = "Registration failed. Please try again.";
                }
            }
        } catch(PDOException $e) {
            $errors[] = "Database error: " . $e->getMessage();
        }
    }
}


function encryptData($data, $key) {
    $ivlen = openssl_cipher_iv_length($cipher="AES-128-CBC");
    $iv = openssl_random_pseudo_bytes($ivlen);
    $ciphertext_raw = openssl_encrypt($data, $cipher, $key, $options=OPENSSL_RAW_DATA, $iv);
    $hmac = hash_hmac('sha256', $ciphertext_raw, $key, $as_binary=true);
    return base64_encode($iv.$hmac.$ciphertext_raw);
}


// Additional logic to detect course and section from username/email
function getDepartmentIdForCourse($conn, $course) {
    // All courses map to "Computer Studies"
    $deptName = 'Computer Studies';
    $stmt = $conn->prepare("SELECT id FROM departments WHERE name = :name");
    $stmt->bindParam(':name', $deptName);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id'] : null;
}



function detectStudentInfo($input) {
    $info = [
        'course' => '',
        'section' => ''
    ];
    
    // Convert to lowercase for easier matching
    $input = strtolower($input);
    
    // Look for program (course)
    if (strpos($input, 'bscs') !== false) {
        $info['course'] = 'BSCS';
    } elseif (strpos($input, 'bsit') !== false) {
        $info['course'] = 'BSIT';
    } elseif (strpos($input, 'bsis') !== false) {
        $info['course'] = 'BSIS';
    }
    
    // Look for section pattern (number followed by letter)
    if (preg_match('/[1-4][a-b]/i', $input, $matches)) {
        $info['section'] = strtoupper($matches[0]);
    }
    
    return $info;
}

// Check for hints in username/email
if (isset($_POST['username']) || isset($_POST['email'])) {
    $username_hints = isset($_POST['username']) ? detectStudentInfo($_POST['username']) : ['course' => '', 'section' => ''];
    $email_hints = isset($_POST['email']) ? detectStudentInfo($_POST['email']) : ['course' => '', 'section' => ''];
    
    $detected_course = $username_hints['course'] ?: $email_hints['course'];
    $detected_section = $username_hints['section'] ?: $email_hints['section'];
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Classroom Reservation System</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-gray-100">
    <div class="flex items-center justify-center min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div class="w-full max-w-md space-y-8">
            <div>
                <h1 class="text-3xl font-extrabold text-center text-rose-600">
                    <i class="fas fa-door-open mr-2"></i> Classroom Reservation
                </h1>
                <h2 class="mt-6 text-2xl font-bold text-center text-gray-900">
                    Create your account
                </h2>
            </div>
            
            <?php if (!empty($errors)): ?>
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p class="font-bold">Please fix the following errors:</p>
                    <ul class="list-disc list-inside">
                        <?php foreach ($errors as $error): ?>
                            <li><?php echo htmlspecialchars($error); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>
            
            <form class="mt-8 space-y-6" method="POST" action="signup.php">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="first_name" class="sr-only">First Name</label>
                        <input id="first_name" name="first_name" type="text" required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                            placeholder="First Name"
                            value="<?php echo isset($_POST['first_name']) ? htmlspecialchars($_POST['first_name']) : ''; ?>">
                    </div>
                    <div>
                        <label for="middle_name" class="sr-only">Middle Name</label>
                        <input id="middle_name" name="middle_name" type="text"
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                            placeholder="Middle Name"
                            value="<?php echo isset($_POST['middle_name']) ? htmlspecialchars($_POST['middle_name']) : ''; ?>">
                    </div>
                    <div>
                        <label for="last_name" class="sr-only">Last Name</label>
                        <input id="last_name" name="last_name" type="text" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                            placeholder="Last Name"
                            value="<?php echo isset($_POST['last_name']) ? htmlspecialchars($_POST['last_name']) : ''; ?>">
                    </div>
                    <div>
                        <label for="email" class="sr-only">Email address</label>
                        <input id="email" name="email" type="email" required 
                               class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                               placeholder="Email address"
                               value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>"
                               onblur="detectRole(this.value); detectStudentInfo(this.value);">
                        <div id="role-indicator" class="text-sm text-gray-600 mt-1 ml-1"></div>
                    </div>
                    <div>
                        <label for="username" class="sr-only">Username</label>
                        <input id="username" name="username" type="text" required 
                               class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                               placeholder="Username"
                               value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>"
                               onblur="detectStudentInfo(this.value);">
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input id="password" name="password" type="password" required 
                               class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                               placeholder="Password">
                    </div>
                    <div>
                        <label for="confirm_password" class="sr-only">Confirm Password</label>
                        <input id="confirm_password" name="confirm_password" type="password" required 
                               class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-rose-500 focus:border-rose-500 focus:z-10 sm:text-sm" 
                               placeholder="Confirm Password">
                    </div>
                </div>
                
                <!-- Student-specific fields that appear based on detected role -->
                <div id="student-fields" class="mt-4 space-y-4" style="display: none;">
                    <h3 class="text-lg font-medium text-gray-900">Student Information</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="course" class="block text-sm font-medium text-gray-700">Program</label>
                            <select id="course" name="course" 
                                   class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm">
                                <option value="">Select your program</option>
                                <option value="BSCS" <?php echo $detected_course === 'BSCS' ? 'selected' : ''; ?>>BSCS - Computer Science</option>
                                <option value="BSIT" <?php echo $detected_course === 'BSIT' ? 'selected' : ''; ?>>BSIT - Information Technology</option>
                                <option value="BSIS" <?php echo $detected_course === 'BSIS' ? 'selected' : ''; ?>>BSIS - Information Systems</option>
                            </select>
                            <div id="course-hint" class="text-xs text-gray-500 mt-1"></div>
                        </div>
                        <div>
                            <label for="section" class="block text-sm font-medium text-gray-700">Section</label>
                            <select id="section" name="section" 
                                   class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm">
                                <option value="">Select your section</option>
                                <optgroup label="First Year">
                                    <option value="1A" <?php echo $detected_section === '1A' ? 'selected' : ''; ?>>1A</option>
                                    <option value="1B" <?php echo $detected_section === '1B' ? 'selected' : ''; ?>>1B</option>
                                </optgroup>
                                <optgroup label="Second Year">
                                    <option value="2A" <?php echo $detected_section === '2A' ? 'selected' : ''; ?>>2A</option>
                                    <option value="2B" <?php echo $detected_section === '2B' ? 'selected' : ''; ?>>2B</option>
                                </optgroup>
                                <optgroup label="Third Year">
                                    <option value="3A" <?php echo $detected_section === '3A' ? 'selected' : ''; ?>>3A</option>
                                    <option value="3B" <?php echo $detected_section === '3B' ? 'selected' : ''; ?>>3B</option>
                                </optgroup>
                                <optgroup label="Fourth Year">
                                    <option value="4A" <?php echo $detected_section === '4A' ? 'selected' : ''; ?>>4A</option>
                                    <option value="4B" <?php echo $detected_section === '4B' ? 'selected' : ''; ?>>4B</option>
                                </optgroup>
                            </select>
                            <div id="section-hint" class="text-xs text-gray-500 mt-1"></div>
                        </div>
                    </div>
                </div>

                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <i class="fas fa-user-plus"></i>
                        </span>
                        Sign up
                    </button>
                </div>
                
                <div class="text-center">
                    <p class="text-sm text-gray-600">
                        Already have an account? 
                        <a href="index.php" class="font-medium text-rose-600 hover:text-rose-500">
                            Log in
                        </a>
                    </p>
                </div>
            </form>
        </div>
    </div>

    <script>
    // Global variable to store current role
    let currentRole = 'student';
    
    function detectRole(email) {
        const roleIndicator = document.getElementById('role-indicator');
        let detectedRole = 'student'; // Default role
        
        // Check for professor patterns
        if (email.match(/^professor\.|\.professor@|^prof\.|\.prof@|^faculty\.|\.faculty@/i)) {
            detectedRole = 'professor';
        } 
        // Check for student patterns
        else if (email.match(/^student\.|\.student@|^std\.|\.std@/i)) {
            detectedRole = 'student';
        } 
        // Check domain
        else {
            const domain = email.split('@')[1];
            if (domain) {
                if (domain.includes('faculty.') || domain.includes('professor.')) {
                    detectedRole = 'professor';
                } else if (domain.includes('student.')) {
                    detectedRole = 'student';
                }
            }
        }
        
        // Update UI to show detected role
        if (detectedRole === 'professor') {
            roleIndicator.innerHTML = '<i class="fas fa-chalkboard-teacher text-blue-600 mr-1"></i> Detected: Professor account';
            roleIndicator.className = 'text-sm text-blue-600 mt-1 ml-1';
            document.getElementById('student-fields').style.display = 'none';
        } else {
            roleIndicator.innerHTML = '<i class="fas fa-user-graduate text-green-600 mr-1"></i> Detected: Student account';
            roleIndicator.className = 'text-sm text-green-600 mt-1 ml-1';
            document.getElementById('student-fields').style.display = 'block';
        }
        
        currentRole = detectedRole;
    }
    
    function detectStudentInfo(input) {
        // Only run detection if we're in student role mode
        if (currentRole !== 'student') return;
        
        // Convert input to lowercase for easier matching
        const lowerInput = input.toLowerCase();
        
        // Try to detect course
        let course = '';
        if (lowerInput.includes('bscs')) {
            course = 'BSCS';
            document.getElementById('course-hint').innerHTML = 
                '<i class="fas fa-check-circle text-green-500 mr-1"></i>Detected: BSCS from your input';
            document.getElementById('course').value = 'BSCS';
        } else if (lowerInput.includes('bsit')) {
            course = 'BSIT';
            document.getElementById('course-hint').innerHTML = 
                '<i class="fas fa-check-circle text-green-500 mr-1"></i>Detected: BSIT from your input';
            document.getElementById('course').value = 'BSIT';
        } else if (lowerInput.includes('bsis')) {
            course = 'BSIS';
            document.getElementById('course-hint').innerHTML = 
                '<i class="fas fa-check-circle text-green-500 mr-1"></i>Detected: BSIS from your input';
            document.getElementById('course').value = 'BSIS';
        }
        
        // Try to detect section - look for pattern like 1A, 2B, etc.
        const sectionMatch = lowerInput.match(/[1-4][a-b]/i);
        if (sectionMatch) {
            const detectedSection = sectionMatch[0].toUpperCase();
            document.getElementById('section-hint').innerHTML = 
                `<i class="fas fa-check-circle text-green-500 mr-1"></i>Detected: Section ${detectedSection} from your input`;
            document.getElementById('section').value = detectedSection;
        }
    }
    
    // Run detection on page load if fields are already populated
    document.addEventListener('DOMContentLoaded', function() {
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        
        // Auto-detect based on initial form values
        if (email) {
            detectRole(email);
            detectStudentInfo(email);
        }
        
        if (username) {
            detectStudentInfo(username);
        }
        
        // If we already detected a role (e.g. from PHP), update the UI
        <?php if ($detected_role): ?>
        currentRole = '<?php echo $detected_role; ?>';
        if (currentRole === 'student') {
            document.getElementById('student-fields').style.display = 'block';
        } else {
            document.getElementById('student-fields').style.display = 'none';
        }
        <?php endif; ?>
    });
    </script>
</body>
</html>
