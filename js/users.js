// In your createUser function
function createUser(event) {
    event.preventDefault();
    // ... existing code ...
    
    fetch('api/create_user.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Log the user creation
            logActivity(
                'Create user', 
                `New ${role} account created: ${username}`, 
                'user'
            );
            
            // ... rest of success handling ...
        }
    });
}

// Similar for updateUser, deleteUser functions