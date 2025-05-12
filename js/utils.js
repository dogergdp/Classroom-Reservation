// Common utility functions
function validateReservation() {
    const startHour = parseInt(state.startTime.split(':')[0]);
    const endTime = startHour + state.duration;
    
    if (state.duration > 3) {
        alert('Maximum reservation duration is 3 hours');
        return false;
    }
    
    if (startHour < 7 || endTime > 20) {
        alert('Reservations must be between 7am and 8pm');
        return false;
    }
    
    return true;
}

// Utility functions for the application

// Function to show notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.classList.add('notification', `notification-${type}`);
    
    // Icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            ${icon}
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to DOM
    const notificationsContainer = document.getElementById('notifications-container');
    if (!notificationsContainer) {
        const container = document.createElement('div');
        container.id = 'notifications-container';
        document.body.appendChild(container);
        container.appendChild(notification);
    } else {
        notificationsContainer.appendChild(notification);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.add('notification-hiding');
            setTimeout(() => notification.remove(), 500);
        }
    }, 5000);
}

// Function to create a room assignment from a reservation
function createRoomAssignmentFromReservation(reservation) {
    // Calculate end time
    const [hours, minutes] = reservation.startTime.split(':');
    const startTime = new Date();
    startTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endTime = new Date(startTime.getTime() + reservation.duration * 60 * 60 * 1000);
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Get professor name (this would normally come from the server)
    let professorName = "Professor";
    if (typeof departmentProfessors !== 'undefined') {
        const professor = departmentProfessors.find(p => p.id == reservation.professorId);
        if (professor) {
            professorName = professor.full_name;
        }
    }
    
    return new RoomAssignment(
        Date.now().toString(),
        reservation.professorId,
        professorName,
        reservation.room,
        reservation.date,
        reservation.startTime,
        endTimeStr,
        reservation.course,
        reservation.section
    );
}

// Function to load reservations and assignments from the server
function loadReservationsAndAssignments() {
    // Show loading indicator
    showNotification('Loading reservations...', 'info');
    
    fetch('api/get_reservations.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Data loaded:', data);
                
                // Map server data to client models
                state.reservations = data.reservations.map(r => new Reservation(
                    r.id,
                    r.professor_id,
                    r.room,
                    r.reservation_date,
                    r.start_time,
                    r.duration,
                    r.status,
                    r.denial_reason || r.reason,
                    r.course,
                    r.section
                ));
                
                // Make sure we set the professorName property
                data.reservations.forEach((r, index) => {
                    state.reservations[index].professorName = r.professor_name || 'Unknown Professor';
                });
                
                // Now fetch room assignments separately to make sure they're up to date
                return fetch('api/get_room_assignments.php');
            } else {
                console.error('Error loading data:', data.error);
                showNotification('Failed to load reservations: ' + data.error, 'error');
                throw new Error(data.error);
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Room assignments loaded:', data.assignments);
                
                // Map server data to client models
                state.roomAssignments = data.assignments.map(a => new RoomAssignment(
                    a.id,
                    a.professor_id,
                    a.professor_name || 'Unknown Professor',
                    a.room,
                    a.assignment_date,
                    a.start_time,
                    a.end_time,
                    a.course,
                    a.section
                ));
                
                // Re-render the application
                renderApp();
                showNotification('Data loaded successfully', 'success');
            } else {
                console.error('Error loading assignments:', data.error);
                showNotification('Failed to load room assignments: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Network error when loading data:', error);
            showNotification('Network error when loading reservations', 'error');
        });
}

// Add CSS for notifications
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        #notifications-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        }
        
        .notification {
            padding: 12px 16px;
            border-radius: 4px;
            box-shadow: 0 3px 6px rgba(0,0,0,0.16);
            display: flex;
            justify-content: space-between;
            align-items: center;
            animation: slide-in 0.3s ease-out forwards;
            opacity: 1;
            transition: opacity 0.3s;
        }
        
        .notification-hiding {
            opacity: 0;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .notification-close {
            background: none;
            border: none;
            cursor: pointer;
            color: inherit;
            opacity: 0.7;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification-info {
            background-color: #e3f2fd;
            color: #0d47a1;
        }
        
        .notification-success {
            background-color: #e8f5e9;
            color: #1b5e20;
        }
        
        .notification-warning {
            background-color: #fff3e0;
            color: #e65100;
        }
        
        .notification-error {
            background-color: #ffebee;
            color: #b71c1c;
        }
        
        @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Create notifications container
    const container = document.createElement('div');
    container.id = 'notifications-container';
    document.body.appendChild(container);
    
    // Load data when utils script is loaded
    loadReservationsAndAssignments();
});

function setupEventListeners() {
    // These listeners need to be set up after the DOM is updated
    
    // For search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = state.searchQuery;
    
    // For cancellation reason
    const cancellationReason = document.getElementById('cancellation-reason');
    if (cancellationReason) cancellationReason.value = state.cancellationReason;
    
    // Call role-specific event listeners if available
    if (typeof setupRoleEventListeners === 'function') {
        setupRoleEventListeners();
    }
}

function handleSearch(event) {
    state.searchQuery = event.target.value;
    renderApp();
}

function setActiveTab(tab) {
    state.activeTab = tab;
    renderApp();
}
