// Find your login function and add the logging code
function login(event) {
    event.preventDefault();
    
    console.log("Login function called");
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    fetch('api/login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Direct AJAX call to log activity instead of using the logActivity function
            const logFormData = new FormData();
            logFormData.append('action', 'User login');
            logFormData.append('details', `${username} logged in successfully`);
            logFormData.append('action_type', 'login');
            
            // Log the activity
            fetch('api/log_activity.php', {
                method: 'POST',
                body: logFormData
            })
            .then(logResponse => logResponse.json())
            .then(logData => {
                console.log('Login activity logged:', logData);
            })
            .catch(logError => {
                console.error('Error logging login activity:', logError);
            });
            
            // Continue with normal login process
            console.log("Login successful. Redirecting to dashboard...");
            window.location.href = 'index.php';
        } else {
            // Handle login error
            console.error("Login failed:", data.message);
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        console.error("Network error during login:", error);
        showNotification("Network error. Please try again.", 'error');
    });
}

// In your logout function
function logout() {
    // Get the current username before logging out
    const username = state.user ? state.user.username : 'Unknown user';
    
    // Direct AJAX call to log activity
    const logFormData = new FormData();
    logFormData.append('action', 'User logout');
    logFormData.append('details', `${username} logged out`);
    logFormData.append('action_type', 'logout');
    
    // Log the activity
    fetch('api/log_activity.php', {
        method: 'POST',
        body: logFormData
    })
    .then(logResponse => logResponse.json())
    .then(logData => {
        console.log('Logout activity logged:', logData);
        
        // After logging is complete, perform the actual logout
        fetch('api/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Logout successful. Redirecting to login page...");
                    window.location.href = 'login.php';
                } else {
                    console.error("Logout failed:", data.message);
                }
            })
            .catch(error => {
                console.error("Network error during logout:", error);
            });
    })
    .catch(logError => {
        console.error('Error logging logout activity:', logError);
        
        // Even if logging fails, still proceed with logout
        fetch('api/logout.php')
            .then(response => response.json())
            .then(data => {
                window.location.href = 'login.php';
            });
    });
}