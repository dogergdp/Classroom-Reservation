console.log("--- script.js started -hsththnhxjhjj22222222222211111119999999--");

// Data models
class User {
    constructor(id, name, role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }
}

class Reservation {
    constructor(id, professorId, room, date, startTime, duration, status, reason, course, section) {
        this.id = id;
        this.professorId = professorId;
        this.room = room;
        this.date = date;
        this.startTime = startTime;
        this.duration = duration;
        this.status = status;
        this.reason = reason;
        this.course = course;
        this.section = section;
        
        // Initialize professorName property (will be set from API data later)
        this.professorName = null;
    }
}

class RoomAssignment {
    constructor(id, professorId, professorName, room, date, startTime, endTime, course, section) {
        this.id = id;
        this.professorId = professorId;
        this.professorName = professorName;
        this.room = room;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.course = course;
        this.section = section;
    }
}

// Application state
let state = {
    currentUser: null,
    reservations: [],
    roomAssignments: [],
    selectedRoom: '',
    reservationDate: '',
    startTime: '',
    duration: 1,
    reason: '',
    course: '',
    section: '',
    viewingReservation: null,
    confirmingCancelId: null,
    cancellationReason: '',
    assignmentProfessorId: '',
    assignmentRoom: '',
    assignmentDate: '',
    assignmentStartTime: '',
    assignmentEndTime: '',
    assignmentCourse: '',
    assignmentSection: '',
    activeTab: 'overview',
    searchQuery: '',
    approvalAction: null, // 'approve' or 'deny'
    approvalReservationId: null,
    denialReason: ''
};

// Constants for all roles
const rooms = Array.from({ length: 6 }, (_, i) => `R${(i + 1).toString().padStart(2, '0')}`);
const courses = ['BSCS', 'BSIT', 'BSIS'];
const sections = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = '<p class="text-center py-10"><i class="fas fa-spinner fa-spin"></i> Loading...</p>'; 

    // First, get the user session information
    fetch('session.php')
        .then(response => response.json())
        .then(data => {
            console.log("Received session data:", data);
            if (data.loggedIn) {
                state.currentUser = {
                    id: data.userId,
                    name: data.fullName || data.username,
                    username: data.username,
                    role: data.role,
                    departmentId: data.departmentId,
                    departmentName: data.departmentName,
                    deptHeadName: data.deptHeadName,
                    professorCount: data.professorCount
                };
                console.log("Assigned state.currentUser:", state.currentUser);
                
                // Load role-specific script based on user role
                loadRoleScript(state.currentUser.role);
            } else {
                console.log("Session data indicates not logged in. Redirecting.");
                window.location.href = 'index.php';
            }
        })
        .catch(error => {
            console.error("Error fetching session data:", error);
            window.location.href = 'index.php';
        });
});

function loadRoleScript(role) {
    const scriptElement = document.createElement('script');
    scriptElement.src = `js/role_${role.toLowerCase()}.js`;
    scriptElement.onload = function() {
        console.log(`Role script loaded for ${role}`);
        // After role-specific script is loaded, load common utils then render the app
        const utilsScript = document.createElement('script');
        utilsScript.src = 'js/utils.js';
        utilsScript.onload = function() {
            console.log('Utils script loaded');
            // Fetch reservations and assignments before rendering
            loadReservationsAndAssignments();
        };
        document.body.appendChild(utilsScript);
    };
    scriptElement.onerror = function() {
        console.error(`Failed to load script for role: ${role}`);
        // Fallback to default script
        const defaultScript = document.createElement('script');
        defaultScript.src = 'js/utils.js';
        defaultScript.onload = function() {
            renderApp();
        };
        document.body.appendChild(defaultScript);
    };
    document.body.appendChild(scriptElement);
}

function handleLogout() {
    fetch('logout.php')
        .then(() => {
            state.currentUser = null;
            window.location.href = 'index.php';
        });
}

// This renderApp function will be the base and will be extended by role-specific scripts
function renderApp() {
    console.log("Entering renderApp(). Current state.currentUser:", state.currentUser);
    const appContainer = document.getElementById('app-container');
    
    if (!state.currentUser) {
        console.error("No current user found inside renderApp(). Redirecting to login.");
        window.location.href = 'index.php';
        return;
    }

    console.log("User found in renderApp(). Proceeding to render header.");
    let html = renderUserHeader();
    
    // Role-specific rendering will be handled by the loaded role script
    if (typeof renderRoleSpecificContent === 'function') {
        html += renderRoleSpecificContent();
    }

    html += renderAllReservations();
    html += renderReservationModal();
    html += renderApprovalDenialModal();
    
    appContainer.innerHTML = html;
    
    if (typeof setupRoleEventListeners === 'function') {
        setupRoleEventListeners();
    }
    
    console.log("renderApp finished.");
}

// Function to load reservations and room assignments from the database
function loadReservationsAndAssignments() {
    console.log('Fetching reservations and room assignments...');
    
    // Show loading state
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.innerHTML = '<p class="text-center py-10"><i class="fas fa-spinner fa-spin"></i> Loading data...</p>';
    }
    
    // Fetch reservations
    fetch('api/get_reservations.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Reservations fetched:', data.reservations);
                state.reservations = data.reservations.map(res => {
                    // Create the reservation object
                    const reservation = new Reservation(
                        res.id,
                        res.professorId,
                        res.room,
                        res.date,
                        res.startTime,
                        res.duration,
                        res.status,
                        res.reason,
                        res.course,
                        res.section
                    );
                    
                    // Explicitly set professorName from API response
                    reservation.professorName = res.professorName || 'Unknown Professor';
                    
                    // Log the professor name to verify it's set
                    console.log(`Reservation ${res.id} professor name: ${reservation.professorName}`);
                    
                    return reservation;
                });
                
                // Now fetch room assignments
                return fetch('api/get_room_assignments.php');
            } else {
                console.error('Error fetching reservations:', data.error);
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
                console.log('Room assignments fetched:', data.assignments);
                state.roomAssignments = data.assignments.map(assign => {
                    // Make sure professor name is present in room assignments
                    const assignment = new RoomAssignment(
                        assign.id,
                        assign.professorId,
                        assign.professorName || 'Unknown Professor',
                        assign.room,
                        assign.date,
                        assign.startTime,
                        assign.endTime,
                        assign.course,
                        assign.section
                    );
                    
                    // Log the professor name to verify it's set
                    console.log(`Assignment ${assign.id} professor name: ${assignment.professorName}`);
                    
                    return assignment;
                });
            } else {
                console.error('Error fetching room assignments:', data.error);
                showNotification('Failed to load room assignments: ' + data.error, 'error');
                throw new Error(data.error);
            }
        })
        .catch(error => {
            console.error('Network error when fetching data:', error);
            showNotification('Network error when loading data', 'error');
        })
        .finally(() => {
            // Render the app after all data is loaded
            renderApp();
        });
}

// Helper function to display notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = '';
    switch (type) {
        case 'success': icon = '<i class="fas fa-check-circle mr-2"></i>'; break;
        case 'error': icon = '<i class="fas fa-exclamation-circle mr-2"></i>'; break;
        case 'warning': icon = '<i class="fas fa-exclamation-triangle mr-2"></i>'; break;
        default: icon = '<i class="fas fa-info-circle mr-2"></i>';
    }
    
    notification.innerHTML = `${icon}${message}`;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Helper functions that are used by all roles
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function getRoleIcon(role) {
    switch (role) {
        case 'professor': return '<i class="fas fa-chalkboard-teacher text-rose-600"></i>';
        case 'deptHead': return '<i class="fas fa-user-tie text-fuchsia-600"></i>';
        case 'student': return '<i class="fas fa-user-graduate text-pink-600"></i>';
        case 'admin': return '<i class="fas fa-user-cog text-blue-600"></i>';
        default: return '';
    }
}

function getStatusBadge(status) {
    switch (status) {
        case 'approved': 
            return '<span class="badge badge-success"><i class="fas fa-check mr-1"></i> Approved</span>';
        case 'denied': 
            return '<span class="badge badge-danger"><i class="fas fa-times mr-1"></i> Denied</span>';
        case 'pending': 
            return '<span class="badge badge-warning"><i class="fas fa-clock mr-1"></i> Pending</span>';
        default: return '';
    }
}

function renderUserHeader() {
    const user = state.currentUser;
    return `
        <div class="card flex justify-between items-center border-l-4 border-rose-500">
            <div class="flex items-center">
                <div class="p-3 bg-rose-50 rounded-lg mr-4">
                    ${getRoleIcon(user.role)}
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">Welcome, ${user.name}</h1>
                    <p class="text-black capitalize flex items-center">
                        <span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                        ${user.role}
                        ${user.departmentName ? ` | <i class="fas fa-university ml-2 mr-1"></i> ${user.departmentName}` : ''}
                    </p>
                </div>
            </div>
            <button
                onclick="handleLogout()"
                class="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
            >
                <i class="fas fa-sign-out-alt mr-1"></i> Logout
            </button>
        </div>
    `;
}

function renderAllReservations() {
    let html = `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b flex items-center">
                <i class="fas fa-history mr-2 text-rose-600"></i>
                ${state.currentUser.role === 'student' ? 'Available Classrooms' : 'All Reservations'}
            </h2>
            <div class="grid md-grid-cols-2 lg-grid-cols-3 gap-5">
    `;
    
    rooms.forEach(room => {
        const roomReservations = state.reservations.filter(r => 
            r.room === room && (state.currentUser.role === 'student' ? r.status === 'approved' : true)
        );
        
        html += `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <h3 class="font-medium mb-3 pb-2 border-b flex items-center text-rose-700">
                    <i class="fas fa-door-open mr-2"></i> Room ${room}
                </h3>
                <div class="space-y-2">
        `;
        
        if (roomReservations.length > 0) {
            roomReservations.forEach(res => {
                // Debug the professor name
                console.log(`Rendering reservation ${res.id}, professor: ${res.professorName}`);
                
                html += `
                    <div
                        class="text-sm p-3 rounded-md cursor-pointer bg-gray-50 hover:bg-rose-50 transition-colors"
                        onclick="viewReservation('${res.id}')"
                    >
                        <div class="flex justify-between items-center mb-1">
                            <p class="font-medium flex items-center">
                                <i class="fas fa-calendar-alt mr-1"></i> ${formatDate(res.date)}
                            </p>
                            ${getStatusBadge(res.status)}
                        </div>
                        <p class="text-black flex items-center">
                            <i class="fas fa-user mr-1"></i> <strong>${res.professorName || 'No Name Available'}</strong>
                        </p>
                        <p class="text-black flex items-center">
                            <i class="fas fa-clock mr-1"></i> ${formatTime(res.startTime)} (${res.duration}hrs)
                        </p>
                        <p class="text-black flex items-center mt-1">
                            <i class="fas fa-chalkboard-teacher mr-1"></i> ${res.course} - ${res.section}
                        </p>
                        ${res.status === 'denied' && res.reason ? `
                            <p class="text-xs text-red-600 mt-1 italic">
                                ${res.reason.length > 40 ? res.reason.substring(0, 40) + '...' : res.reason}
                            </p>
                        ` : ''}
                    </div>
                `;
            });
        } else {
            html += `
                <div class="text-black text-sm p-4 text-center border border-dashed border-gray-200 rounded-md">
                    No reservations
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderReservationModal() {
    if (!state.viewingReservation) return '';
    
    // Get additional buttons based on user role and reservation status
    let actionButtons = '';
    if ((state.currentUser.role === 'admin' || state.currentUser.role === 'deptHead') && 
        state.viewingReservation.status === 'pending') {
        actionButtons = `
            <div class="flex justify-between gap-4 mt-4">
                <button
                    onclick="showApprovalConfirmation('${state.viewingReservation.id}')"
                    class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    <i class="fas fa-check mr-1"></i> Approve
                </button>
                <button
                    onclick="showDenialConfirmation('${state.viewingReservation.id}')"
                    class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    <i class="fas fa-times mr-1"></i> Deny
                </button>
            </div>
        `;
    }

    return `
        <div class="modal-backdrop" onclick="closeReservationModal()">
            <div class="modal animate-fade-in" onclick="event.stopPropagation()">
                <h3 class="text-lg font-semibold mb-4 pb-2 border-b flex items-center">
                    <i class="fas fa-clipboard-check mr-2 text-rose-600"></i> Reservation Details
                </h3>
                <div class="space-y-3">
                    <p class="flex items-center">
                        <i class="fas fa-door-open mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Room:</span> 
                        <span class="ml-2 text-black">${state.viewingReservation.room}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-user mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Professor:</span> 
                        <span class="ml-2 text-black">${state.viewingReservation.professorName || 'Unknown Professor'}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-calendar-alt mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Date:</span> 
                        <span class="ml-2 text-black">${formatDate(state.viewingReservation.date)}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-clock mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Time:</span> 
                        <span class="ml-2 text-black">${formatTime(state.viewingReservation.startTime)} (${state.viewingReservation.duration}hrs)</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-chalkboard-teacher mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Course:</span> 
                        <span class="ml-2 text-black">${state.viewingReservation.course}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-user-graduate mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Section:</span> 
                        <span class="ml-2 text-black">${state.viewingReservation.section}</span>
                    </p>
                    <p class="flex items-center">
                        <i class="fas fa-file-alt mr-2 text-gray-500"></i>
                        <span class="font-medium text-black">Status:</span> 
                        <span class="ml-2">${getStatusBadge(state.viewingReservation.status)}</span>
                    </p>
                    ${state.viewingReservation.reason ? `
                        <div class="mt-2 p-3 bg-gray-50 rounded-md">
                            <p class="font-medium text-black mb-1">
                                ${state.viewingReservation.status === 'denied' ? 'Cancellation/Denial Reason:' : 'Reason:'}
                            </p>
                            <p class="text-black">${state.viewingReservation.reason}</p>
                        </div>
                    ` : ''}
                </div>
                ${actionButtons}
                <button
                    onclick="closeReservationModal()"
                    class="mt-6 w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                    <i class="fas fa-times mr-1"></i> Close
                </button>
            </div>
        </div>
    `;
}

function renderApprovalDenialModal() {
    if (!state.approvalAction) return '';
    
    return `
        <div class="modal-backdrop">
            <div class="modal sm-modal animate-fade-in" onclick="event.stopPropagation()">
                <h3 class="text-lg font-semibold mb-4 flex items-center">
                    <i class="fas fa-question-circle mr-2 text-blue-600"></i> 
                    ${state.approvalAction === 'approve' ? 'Approve Reservation' : 'Deny Reservation'}
                </h3>
                <p class="text-black mb-4">
                    Are you sure you want to ${state.approvalAction === 'approve' ? 'approve' : 'deny'} this reservation?
                </p>
                ${state.approvalAction === 'deny' ? `
                    <div class="mb-4">
                        <label for="denialReason" class="block text-gray-700 text-sm font-bold mb-2">Reason for denial:</label>
                        <textarea 
                            id="denialReason" 
                            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            rows="3"
                            placeholder="Please provide a reason for denying this request"
                        ></textarea>
                    </div>
                ` : ''}
                <div class="flex justify-between gap-4">
                    <button 
                        onclick="cancelApprovalAction()"
                        class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md"
                    >
                        Cancel
                    </button>
                    <button 
                        onclick="confirmApprovalAction()"
                        class="flex-1 ${state.approvalAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white py-2 px-4 rounded-md"
                    >
                        ${state.approvalAction === 'approve' ? 'Approve' : 'Deny'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function showApprovalConfirmation(reservationId) {
    console.log("Showing approval confirmation for reservation:", reservationId);
    state.approvalAction = 'approve';
    state.approvalReservationId = reservationId;
    renderApp();
}

function showDenialConfirmation(reservationId) {
    console.log("Showing denial confirmation for reservation:", reservationId);
    state.approvalAction = 'deny';
    state.approvalReservationId = reservationId;
    renderApp();
}

function cancelApprovalAction() {
    console.log("Cancelling approval action");
    state.approvalAction = null;
    state.approvalReservationId = null;
    renderApp();
}

function confirmApprovalAction() {
    const action = state.approvalAction;
    const reservationId = state.approvalReservationId;
    
    console.log(`Confirming ${action} for reservation ${reservationId}`);
    
    if (!reservationId) {
        showNotification('No reservation selected', 'error');
        return;
    }
    
    const apiEndpoint = action === 'approve' ? 'api/approve_reservation.php' : 'api/deny_reservation.php';
    
    const formData = new FormData();
    formData.append('reservation_id', reservationId);
    
    if (action === 'deny') {
        const denialReason = document.getElementById('denialReason')?.value || '';
        console.log("Denial reason:", denialReason);
        formData.append('reason', denialReason);
    }
    
    console.log("Sending request to:", apiEndpoint);
    
    fetch(apiEndpoint, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log("Response received:", response);
        return response.json();
    })
    .then(data => {
        console.log("Processing response data:", data);
        if (data.success) {
            showNotification(`Reservation ${action === 'approve' ? 'approved' : 'denied'} successfully`, 'success');
            
            // If we approved and got assignment data back, add it to our state
            if (action === 'approve' && data.assignment) {
                const newAssignment = new RoomAssignment(
                    data.assignment.id,
                    data.assignment.professorId,
                    data.assignment.professorName,
                    data.assignment.room,
                    data.assignment.date,
                    data.assignment.startTime,
                    data.assignment.endTime,
                    data.assignment.course,
                    data.assignment.section
                );
                
                state.roomAssignments.push(newAssignment);
            }
            
            // Close modals first
            state.approvalAction = null;
            state.approvalReservationId = null;
            state.viewingReservation = null;
            
            // Refresh the data from the server
            loadReservationsAndAssignments();
        } else {
            showNotification(`Failed to ${action} reservation: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(`An error occurred while ${action === 'approve' ? 'approving' : 'denying'} the reservation`, 'error');
    });
}

function viewReservation(id) {
    state.viewingReservation = state.reservations.find(r => r.id === id);
    renderApp();
}

function closeReservationModal() {
    state.viewingReservation = null;
    renderApp();
}

