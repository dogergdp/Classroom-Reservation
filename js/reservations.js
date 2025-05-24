// In your createReservation function
function createReservation(event) {
    event.preventDefault();
    // ... existing code ...
    
    fetch('api/create_reservation.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Log the reservation creation
            logActivity(
                'Create reservation', 
                `Room ${roomNumber} reserved for ${reservationDate} at ${startTime}`, 
                'reservation'
            );
            
            // ... rest of success handling ...
        } else {
            // ... error handling ...
        }
    });
}

// In your updateReservationStatus function
function updateReservationStatus(reservationId, newStatus, denialReason = '') {
    // ... existing code ...
    
    fetch('api/update_reservation_status.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Log the status update
            const statusAction = newStatus === 'approved' ? 'approved' : 'denied';
            logActivity(
                'Update reservation', 
                `Reservation #${reservationId} ${statusAction}${denialReason ? ': ' + denialReason : ''}`, 
                'reservation'
            );
            
            // ... rest of success handling ...
        }
    });
}