/**
 * Initialize application state
 * This file ensures all date fields and other state properties have proper default values
 */

function initializeApplicationState() {
    // Set default date values if not already set
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Initialize reservation dates
    if (!state.reservationDate) {
        state.reservationDate = todayFormatted;
    }
    
    if (!state.assignmentDate) {
        state.assignmentDate = todayFormatted;
    }
    
    // Default times if not set
    if (!state.startTime) {
        state.startTime = "08:00";
    }
    
    if (!state.assignmentStartTime) {
        state.assignmentStartTime = "08:00";
    }
    
    if (!state.assignmentEndTime) {
        state.assignmentEndTime = "09:00";
    }
    
    // Initialize default duration
    if (!state.duration) {
        state.duration = 1;
    }
    
    // Ensure reservations have properly formatted dates
    if (state.reservations && Array.isArray(state.reservations)) {
        state.reservations.forEach(reservation => {
            if (reservation.date && typeof reservation.date === 'string') {
                // Ensure date is in YYYY-MM-DD format
                if (!reservation.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    try {
                        reservation.date = new Date(reservation.date).toISOString().split('T')[0];
                    } catch (e) {
                        console.error('Invalid date format:', reservation.date);
                    }
                }
            }
        });
    }
    
    // Ensure room assignments have properly formatted dates
    if (state.roomAssignments && Array.isArray(state.roomAssignments)) {
        state.roomAssignments.forEach(assignment => {
            if (assignment.date && typeof assignment.date === 'string') {
                // Ensure date is in YYYY-MM-DD format
                if (!assignment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    try {
                        assignment.date = new Date(assignment.date).toISOString().split('T')[0];
                    } catch (e) {
                        console.error('Invalid date format:', assignment.date);
                    }
                }
            }
        });
    }
    
    console.log('Application state initialized with default values');
}

// Enhance the formatDate function to handle different date formats
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        // Try to parse the date
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return dateString; // Return original if parsing failed
        }
        
        // Format the date as Month Day, Year (e.g., "May 15, 2023")
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        console.error('Error formatting date:', e);
        return dateString; // Return original in case of error
    }
}
