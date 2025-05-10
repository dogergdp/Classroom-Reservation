/**
 * Application loader
 * Initializes the application state and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize application state with default values
    initializeApplicationState();
    
    // Load initial data
    loadReservationsAndAssignments();
    
    // Render the application
    renderApp();
});

// Call initializeApplicationState before rendering the app
function renderApp() {
    // Ensure state is properly initialized before rendering
    initializeApplicationState();
    
    // Existing rendering logic
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = renderAppContent();
    setupEventListeners();
}

// Update loadReservationsAndAssignments to initialize state
function loadReservationsAndAssignments() {
    // Show loading indicator
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = '<div class="flex justify-center items-center h-screen"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>';
    }
    
    // Fetch data
    Promise.all([
        fetch('api/get_reservations.php').then(res => res.json()),
        fetch('api/get_room_assignments.php').then(res => res.json())
    ])
    .then(([reservationsData, assignmentsData]) => {
        if (reservationsData.success) {
            state.reservations = reservationsData.reservations.map(r => new Reservation(
                r.id, r.professorId, r.room, r.date, r.startTime, 
                r.duration, r.status, r.reason, r.course, r.section
            ));
        }
        
        if (assignmentsData.success) {
            state.roomAssignments = assignmentsData.assignments.map(a => new RoomAssignment(
                a.id, a.professorId, a.professorName, a.room, a.date, 
                a.startTime, a.endTime, a.course, a.section
            ));
        }
        
        // Initialize state with defaults after loading data
        initializeApplicationState();
        
        // Render the app
        renderApp();
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        if (app) {
            app.innerHTML = '<div class="text-center text-red-600 p-4">Error loading data. Please try again later.</div>';
        }
    });
}
