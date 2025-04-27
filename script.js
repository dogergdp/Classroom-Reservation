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

/* Demo data
const demoUsers = [
    new User('1', 'Dr. Alice', 'deptHead'),
    new User('2', 'Prof. Bob', 'professor'),
    new User('3', 'Student Charlie', 'student'),
    new User('4', 'Dana', 'admin')
];
*/

document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = '<p>Loading...jwkfnwlgfnwgnwginigwlgnwgnrgnwgnwogwqign</p>'; // Show a loading message

    fetch('session.php')
        .then(response => response.json())
        .then(data => {
            console.log("Received session data:", data); // <<< ADD LOG 1
            if (data.loggedIn) {
                state.currentUser = {
                    id: data.userId,
                    name: data.username,
                    role: data.role
                };
                console.log("Assigned state.currentUser:", state.currentUser); // <<< ADD LOG 2
                renderApp();
            } else {
                console.log("Session data indicates not logged in. Redirecting."); // Optional log
                window.location.href = 'index.php'; // Redirect to login if not logged in
            }
        })
        .catch(error => {
            console.error("Error fetching session data:", error);
            window.location.href = 'index.php'; // Redirect to login on error
        });
});


const rooms = Array.from({ length: 6 }, (_, i) => `R${(i + 1).toString().padStart(2, '0')}`);
const courses = ['BSCS', 'BSIT', 'BSIS'];
const sections = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];

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
    searchQuery: ''
};

// Helper functions
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

/* Event handlers
function handleLogin(userId) {
    const user = demoUsers.find(u => u.id === userId);
    if (user) {
        state.currentUser = user;
        renderApp();
    }
}
    */

function handleLogout() {
    fetch('logout.php') // Call the backend to destroy the session
        .then(() => {
            state.currentUser = null;
            window.location.href = 'index.php'; // Redirect to login page
        });
}



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

function handleSubmitReservation(event) {
    event.preventDefault();
    if (!state.currentUser || state.currentUser.role !== 'professor') return;
    if (!validateReservation()) return;

    const newReservation = new Reservation(
        Date.now().toString(),
        state.currentUser.id,
        state.selectedRoom,
        state.reservationDate,
        state.startTime,
        state.duration,
        'pending',
        state.reason,
        state.course,
        state.section
    );

    state.reservations.push(newReservation);
    state.selectedRoom = '';
    state.reservationDate = '';
    state.startTime = '';
    state.duration = 1;
    state.reason = '';
    state.course = '';
    state.section = '';
    
    renderApp();
}

function createRoomAssignmentFromReservation(reservation) {
    const professor = demoUsers.find(u => u.id === reservation.professorId);
    const startHour = parseInt(reservation.startTime.split(':')[0]);
    const endHour = startHour + reservation.duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:${reservation.startTime.split(':')[1]}`;
    
    return new RoomAssignment(
        Date.now().toString() + '-assign',
        reservation.professorId,
        professor ? professor.name : 'Unknown Professor',
        reservation.room,
        reservation.date,
        reservation.startTime,
        endTime,
        reservation.course,
        reservation.section
    );
}

function handleApproveDeny(id, status) {
    const reservationIndex = state.reservations.findIndex(r => r.id === id);
    
    if (reservationIndex !== -1) {
        state.reservations[reservationIndex].status = status;
        
        // If approving, also create a room assignment
        if (status === 'approved') {
            const reservation = state.reservations[reservationIndex];
            const newAssignment = createRoomAssignmentFromReservation(reservation);
            state.roomAssignments.push(newAssignment);
        }
        
        renderApp();
    }
}

function denyWithPrompt(id) {
    const reason = prompt("Please provide a reason for denial:");
    if (reason !== null) {
        handleDenyWithReason(id, reason);
    }
}

function handleDenyWithReason(id, reason) {
    const reservationIndex = state.reservations.findIndex(r => r.id === id);
    
    if (reservationIndex !== -1) {
        state.reservations[reservationIndex].status = 'denied';
        state.reservations[reservationIndex].reason = `Denied by department head: ${reason ? reason : 'No reason provided'} (${formatDate(new Date().toISOString())})`;
        
        renderApp();
    }
}

function handleRoomAssignment(event) {
    event.preventDefault();
    if (!state.currentUser || state.currentUser.role !== 'deptHead') return;
    
    const professor = demoUsers.find(u => u.id === state.assignmentProfessorId);
    if (!professor) return;
    
    // Calculate duration from start to end time
    const startHour = parseInt(state.assignmentStartTime.split(':')[0]);
    const endHour = parseInt(state.assignmentEndTime.split(':')[0]);
    const duration = endHour - startHour;
    
    if (duration <= 0) {
        alert('End time must be after start time');
        return;
    }
    
    // Create room assignment
    const newAssignment = new RoomAssignment(
        Date.now().toString(),
        state.assignmentProfessorId,
        professor.name,
        state.assignmentRoom,
        state.assignmentDate,
        state.assignmentStartTime,
        state.assignmentEndTime,
        state.assignmentCourse,
        state.assignmentSection
    );
    
    const newReservation = new Reservation(
        Date.now().toString() + '-res',
        state.assignmentProfessorId,
        state.assignmentRoom,
        state.assignmentDate,
        state.assignmentStartTime,
        duration,
        'approved',
        `Directly assigned by ${state.currentUser.name} (Department Head)`,
        state.assignmentCourse,
        state.assignmentSection
    );
    
    state.roomAssignments.push(newAssignment);
    state.reservations.push(newReservation);
    
    state.assignmentProfessorId = '';
    state.assignmentRoom = '';
    state.assignmentDate = '';
    state.assignmentStartTime = '';
    state.assignmentEndTime = '';
    state.assignmentCourse = '';
    state.assignmentSection = '';
    
    renderApp();
}

function deleteRoomAssignment(id) {
    const assignment = state.roomAssignments.find(a => a.id === id);
    state.roomAssignments = state.roomAssignments.filter(a => a.id !== id);
    
    if (assignment) {
        state.reservations = state.reservations.filter(r => 
            !(r.room === assignment.room && 
              r.date === assignment.date && 
              r.startTime === assignment.startTime)
        );
    }
    
    renderApp();
}

function promptCancelAssignment(id) {
    state.confirmingCancelId = id;
    renderApp();
}

function confirmCancelAssignment(id) {
    const reasonInput = document.getElementById('cancellation-reason');
    if (reasonInput) {
        state.cancellationReason = reasonInput.value;
    }
    handleProfessorCancelAssignment(id);
}

function cancelConfirmation() {
    state.confirmingCancelId = null;
    state.cancellationReason = '';
    renderApp();
}

function handleProfessorCancelAssignment(assignmentId) {
    const assignment = state.roomAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const reservationToUpdate = state.reservations.find(r => 
        r.room === assignment.room && 
        r.date === assignment.date && 
        r.startTime === assignment.startTime &&
        r.professorId === assignment.professorId
    );
    
    if (reservationToUpdate) {
        const index = state.reservations.findIndex(r => r.id === reservationToUpdate.id);
        state.reservations[index].status = 'denied';
        state.reservations[index].reason = `Canceled by professor ${state.currentUser?.name}: ${state.cancellationReason || 'No reason provided'} (${formatDate(new Date().toISOString())})`;
    }
    
    state.roomAssignments = state.roomAssignments.filter(a => a.id !== assignmentId);
    state.confirmingCancelId = null;
    state.cancellationReason = '';
    
    renderApp();
}

function handleDeleteReservation(id) {
    const reservation = state.reservations.find(r => r.id === id);
    state.reservations = state.reservations.filter(res => res.id !== id);
    
    if (reservation && reservation.status === 'approved') {
        state.roomAssignments = state.roomAssignments.filter(a => 
            !(a.room === reservation.room && 
              a.date === reservation.date && 
              a.startTime === reservation.startTime)
        );
    }
    
    renderApp();
}

function handleUpdateReservationStatus(id, status) {
    const reservation = state.reservations.find(r => r.id === id);
    if (!reservation) return;
    
    const index = state.reservations.findIndex(r => r.id === id);
    state.reservations[index].status = status;
    
    // If approving, also create a room assignment
    if (status === 'approved') {
        // First remove any existing room assignment for this reservation
        state.roomAssignments = state.roomAssignments.filter(a => 
            !(a.room === reservation.room && 
              a.date === reservation.date && 
              a.startTime === reservation.startTime)
        );
        
        // Then create a new room assignment
        const newAssignment = createRoomAssignmentFromReservation(reservation);
        state.roomAssignments.push(newAssignment);
    }
    
    // If denying or changing to pending, remove room assignment
    if (status === 'denied' || status === 'pending') {
        state.roomAssignments = state.roomAssignments.filter(a => 
            !(a.room === reservation.room && 
              a.date === reservation.date && 
              a.startTime === reservation.startTime)
        );
    }
    
    renderApp();
}

function viewReservation(id) {
    state.viewingReservation = state.reservations.find(r => r.id === id);
    renderApp();
}

function closeReservationModal() {
    state.viewingReservation = null;
    renderApp();
}

function setActiveTab(tab) {
    state.activeTab = tab;
    renderApp();
}

function handleSearch(event) {
    state.searchQuery = event.target.value;
    renderApp();
}

// Rendering functions
function renderLoginScreen() {
    const appContainer = document.getElementById('app-container');
    let html = `
        <div class="card">
            <h1 class="text-3xl font-bold text-black mb-6 flex items-center justify-center">
                <i class="fas fa-clipboard-check text-rose-600 mr-2"></i>
                Classroom Reservation System
            </h1>
            <div class="space-y-4 max-w-md mx-auto">
                <h2 class="text-xl font-semibold text-black mb-4">Select Demo Account:</h2>
    `;
    
    demoUsers.forEach(user => {
        html += `
            <button
                onclick="handleLogin('${user.id}')"
                class="w-full p-5 bg-white border border-gray-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-all duration-200 text-left flex items-center shadow-sm hover:shadow"
            >
                <div class="p-2 bg-gray-50 rounded-lg mr-4">
                    ${getRoleIcon(user.role)}
                </div>
                <div>
                    <span class="font-bold text-lg text-black">${user.name}</span>
                    <span class="block text-sm text-black font-medium capitalize">${user.role}</span>
                </div>
            </button>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    appContainer.innerHTML = html;
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

function renderProfessorNewReservation() {
    return `
        <form id="new-reservation-form" class="card space-y-5" onsubmit="handleSubmitReservation(event)">
            <h2 class="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <i class="fas fa-calendar-check text-rose-600 mr-2"></i> New Reservation Request
            </h2>
            <div class="grid md-grid-cols-2 gap-6">
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-door-open mr-1"></i> Room
                    </label>
                    <select
                        id="room-select"
                        required
                        class="form-control"
                        onchange="state.selectedRoom = this.value"
                    >
                        <option value="">Select a room</option>
                        ${rooms.map(room => `<option value="${room}" ${state.selectedRoom === room ? 'selected' : ''}>${room}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-calendar-alt mr-1"></i> Date
                    </label>
                    <input
                        type="date"
                        required
                        id="reservation-date"
                        class="form-control"
                        value="${state.reservationDate}"
                        onchange="state.reservationDate = this.value"
                    />
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-clock mr-1"></i> Start Time
                    </label>
                    <input
                        type="time"
                        required
                        id="start-time"
                        min="07:00"
                        max="20:00"
                        class="form-control"
                        value="${state.startTime}"
                        onchange="state.startTime = this.value"
                    />
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-hourglass-half mr-1"></i> Duration (hours)
                    </label>
                    <select
                        id="duration-select"
                        class="form-control"
                        onchange="state.duration = parseInt(this.value)"
                    >
                        ${[1, 2, 3].map(h => `<option value="${h}" ${state.duration === h ? 'selected' : ''}>${h} hour${h > 1 ? 's' : ''}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-chalkboard-teacher mr-1"></i> Course
                    </label>
                    <select
                        id="course-select"
                        required
                        class="form-control"
                        onchange="state.course = this.value"
                    >
                        <option value="">Select a course</option>
                        ${courses.map(c => `<option value="${c}" ${state.course === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-sm font-medium text-black flex items-center">
                        <i class="fas fa-user-graduate mr-1"></i> Section
                    </label>
                    <select
                        id="section-select"
                        required
                        class="form-control"
                        onchange="state.section = this.value"
                    >
                        <option value="">Select a section</option>
                        ${sections.map(s => `<option value="${s}" ${state.section === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="space-y-1">
                <label class="text-sm font-medium text-black flex items-center">
                    <i class="fas fa-file-alt mr-1"></i> Reason
                </label>
                <textarea
                    id="reason-textarea"
                    class="form-control"
                    rows="3"
                    placeholder="Describe the purpose of this reservation..."
                    onchange="state.reason = this.value"
                >${state.reason}</textarea>
            </div>
            <button
                type="submit"
                class="btn btn-primary btn-block py-3"
            >
                <i class="fas fa-calendar-check mr-2"></i> Submit Reservation Request
            </button>
        </form>
    `;
}

function renderDeptHeadPendingRequests() {
    const pendingReservations = state.reservations.filter(r => r.status === 'pending');
    
    let html = `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <i class="fas fa-clock text-amber-600 mr-2"></i> Pending Requests
            </h2>
            <div class="space-y-4">
    `;
    
    if (pendingReservations.length > 0) {
        pendingReservations.forEach(res => {
            html += `
                <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-lg flex items-center">
                                <i class="fas fa-door-open mr-1 text-rose-500"></i> Room ${res.room}
                            </p>
                            <p class="text-sm text-black mt-1 flex items-center">
                                <i class="fas fa-calendar-alt mr-1"></i> ${formatDate(res.date)} | <i class="fas fa-clock mx-1"></i> ${formatTime(res.startTime)} (${res.duration}hrs)
                            </p>
                            <p class="text-sm text-black mt-1 flex items-center">
                                <i class="fas fa-chalkboard-teacher mr-1"></i> ${res.course} <i class="fas fa-user-graduate mx-1"></i> ${res.section}
                            </p>
                            ${res.reason ? `
                                <div class="mt-3 p-2 bg-gray-50 rounded text-sm">
                                    <p class="text-black mb-1 font-medium">Reason:</p>
                                    <p class="text-black">${res.reason}</p>
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex gap-2">
                            <button
                                onclick="handleApproveDeny('${res.id}', 'approved')"
                                class="btn btn-success"
                            >
                                <i class="fas fa-check mr-1"></i> Approve
                            </button>
                            <button
                                onclick="denyWithPrompt('${res.id}')"
                                class="btn btn-danger"
                            >
                                <i class="fas fa-times mr-1"></i> Deny
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        html += `
            <div class="text-black text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <i class="fas fa-clock" style="font-size: 40px; color: #6b7280; margin-bottom: 8px;"></i>
                <p>No pending requests</p>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderDeptHeadRoomAssignment() {
    let html = `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <i class="fas fa-door-open text-fuchsia-600 mr-2"></i> Assign Room to Professor
            </h2>
            
            <form id="room-assignment-form" class="space-y-5" onsubmit="handleRoomAssignment(event)">
                <div class="grid md-grid-cols-2 gap-6">
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-chalkboard-teacher mr-1"></i> Professor
                        </label>
                        <select
                            id="professor-select"
                            required
                            class="form-control"
                            onchange="state.assignmentProfessorId = this.value"
                        >
                            <option value="">Select a professor</option>
                            ${demoUsers
                                .filter(user => user.role === 'professor')
                                .map(prof => `<option value="${prof.id}" ${state.assignmentProfessorId === prof.id ? 'selected' : ''}>${prof.name}</option>`)
                                .join('')}
                        </select>
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-door-open mr-1"></i> Room
                        </label>
                        <select
                            id="assignment-room-select"
                            required
                            class="form-control"
                            onchange="state.assignmentRoom = this.value"
                        >
                            <option value="">Select a room</option>
                            ${rooms.map(room => `<option value="${room}" ${state.assignmentRoom === room ? 'selected' : ''}>${room}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-calendar-alt mr-1"></i> Date
                        </label>
                        <input
                            type="date"
                            required
                            id="assignment-date"
                            class="form-control"
                            value="${state.assignmentDate}"
                            onchange="state.assignmentDate = this.value"
                        />
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-clock mr-1"></i> Start Time
                        </label>
                        <input
                            type="time"
                            required
                            id="assignment-start-time"
                            class="form-control"
                            value="${state.assignmentStartTime}"
                            onchange="state.assignmentStartTime = this.value"
                        />
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-clock mr-1"></i> End Time
                        </label>
                        <input
                            type="time"
                            required
                            id="assignment-end-time"
                            class="form-control"
                            value="${state.assignmentEndTime}"
                            onchange="state.assignmentEndTime = this.value"
                        />
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-chalkboard-teacher mr-1"></i> Course
                        </label>
                        <select
                            id="assignment-course-select"
                            required
                            class="form-control"
                            onchange="state.assignmentCourse = this.value"
                        >
                            <option value="">Select a course</option>
                            ${courses.map(c => `<option value="${c}" ${state.assignmentCourse === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="space-y-1">
                        <label class="text-sm font-medium text-black flex items-center">
                            <i class="fas fa-user-graduate mr-1"></i> Section
                        </label>
                        <select
                            id="assignment-section-select"
                            required
                            class="form-control"
                            onchange="state.assignmentSection = this.value"
                        >
                            <option value="">Select a section</option>
                            ${sections.map(s => `<option value="${s}" ${state.assignmentSection === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
                
                <button
                    type="submit"
                    class="btn btn-primary btn-block py-3"
                    style="background-color: #c026d3;"
                >
                    <i class="fas fa-door-open mr-2"></i> Assign Room
                </button>
            </form>
            
            <div class="mt-8 border-t pt-6">
                <h3 class="text-lg font-medium mb-4 text-black">Current Room Assignments</h3>
                ${state.roomAssignments.length > 0 
                    ? `<div class="space-y-4">
                        ${state.roomAssignments.map(assignment => `
                            <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                <div class="flex justify-between">
                                    <div>
                                        <p class="font-medium text-black">${assignment.professorName} - Room ${assignment.room}</p>
                                        <p class="text-sm text-black mt-1">
                                            ${formatDate(assignment.date)} | ${assignment.startTime} to ${assignment.endTime}
                                        </p>
                                        <p class="text-sm text-black">
                                            ${assignment.course} - Section ${assignment.section}
                                        </p>
                                    </div>
                                    <button
                                        onclick="deleteRoomAssignment('${assignment.id}')"
                                        class="text-red-600 hover:text-red-800"
                                    >
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                       </div>`
                    : `<div class="text-black text-center py-8 border border-dashed border-gray-200 rounded-lg">
                        <p>No assignments yet</p>
                       </div>`
                }
            </div>
        </div>
    `;
    
    return html;
}

function renderProfessorAssignedRooms() {
    const professorAssignments = state.roomAssignments.filter(a => a.professorId === state.currentUser.id);
    
    let html = `
        <div class="card mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <i class="fas fa-door-open text-rose-600 mr-2"></i> Your Assigned Rooms
            </h2>
            
            ${professorAssignments.length > 0 
                ? `<div class="space-y-4">
                    ${professorAssignments.map(assignment => `
                        <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div class="flex justify-between">
                                <div>
                                    <p class="font-medium text-black">Room ${assignment.room}</p>
                                    <p class="text-sm text-black mt-1">
                                        ${formatDate(assignment.date)} | ${assignment.startTime} to ${assignment.endTime}
                                    </p>
                                    <p class="text-sm text-black">
                                        ${assignment.course} - Section ${assignment.section}
                                    </p>
                                </div>
                                <div>
                                    ${state.confirmingCancelId === assignment.id 
                                        ? `<div class="bg-white p-2 rounded-md shadow-md border border-gray-200">
                                            <p class="text-xs text-red-600 font-medium mb-2">Cancel this assignment?</p>
                                            <input
                                                type="text"
                                                placeholder="Reason for cancellation"
                                                class="form-control mb-2 text-xs"
                                                id="cancellation-reason"
                                                style="padding: 4px 8px;"
                                            />
                                            <div class="flex gap-2">
                                                <button
                                                    onclick="confirmCancelAssignment('${assignment.id}')"
                                                    class="btn btn-danger"
                                                    style="font-size: 12px; padding: 4px 12px;"
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onclick="cancelConfirmation()"
                                                    class="btn btn-secondary"
                                                    style="font-size: 12px; padding: 4px 12px;"
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>`
                                        : `<button
                                            onclick="promptCancelAssignment('${assignment.id}')"
                                            class="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                        >
                                            <i class="fas fa-times" style="font-size: 16px;"></i> Cancel
                                        </button>`
                                    }
                                </div>
                            </div>
                        </div>
                    `).join('')}
                   </div>`
                : `<div class="text-black text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <p>No rooms assigned to you yet</p>
                   </div>`
            }
        </div>
    `;
    
    return html;
}

function renderAdminDashboard() {
    let html = `
        <div class="card">
            <h2 class="text-2xl font-bold text-black mb-6 flex items-center">
                <i class="fas fa-user-cog text-blue-600 mr-2"></i> System Administrator Dashboard
            </h2>

            <!-- Tabs -->
            <div class="tabs">
                <div class="tab ${state.activeTab === 'overview' ? 'active' : ''}" onclick="setActiveTab('overview')">
                    <i class="fas fa-chart-pie mr-1"></i> Overview
                </div>
                <div class="tab ${state.activeTab === 'users' ? 'active' : ''}" onclick="setActiveTab('users')">
                    <i class="fas fa-users mr-1"></i> Users
                </div>
                <div class="tab ${state.activeTab === 'reservations' ? 'active' : ''}" onclick="setActiveTab('reservations')">
                    <i class="fas fa-calendar-check mr-1"></i> Reservations
                </div>
                <div class="tab ${state.activeTab === 'rooms' ? 'active' : ''}" onclick="setActiveTab('rooms')">
                    <i class="fas fa-door-open mr-1"></i> Room Assignments
                </div>
            </div>
    `;
    
    // Content based on active tab
    if (state.activeTab === 'overview') {
        html += `
            <div class="grid md-grid-cols-2 lg-grid-cols-3 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 class="text-lg font-medium text-blue-800 mb-2">User Statistics</h3>
                    <p class="text-blue-700">Total Users: <span class="font-bold">${demoUsers.length}</span></p>
                    <p class="text-blue-700">Professors: <span class="font-bold">${demoUsers.filter(u => u.role === 'professor').length}</span></p>
                    <p class="text-blue-700">Students: <span class="font-bold">${demoUsers.filter(u => u.role === 'student').length}</span></p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 class="text-lg font-medium text-green-800 mb-2">Reservation Statistics</h3>
                    <p class="text-green-700">Total Reservations: <span class="font-bold">${state.reservations.length}</span></p>
                    <p class="text-green-700">Pending: <span class="font-bold">${state.reservations.filter(r => r.status === 'pending').length}</span></p>
                    <p class="text-green-700">Approved: <span class="font-bold">${state.reservations.filter(r => r.status === 'approved').length}</span></p>
                    <p class="text-green-700">Denied: <span class="font-bold">${state.reservations.filter(r => r.status === 'denied').length}</span></p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 class="text-lg font-medium text-purple-800 mb-2">Room Assignments</h3>
                    <p class="text-purple-700">Total Assignments: <span class="font-bold">${state.roomAssignments.length}</span></p>
                </div>
            </div>
        `;
    } else if (state.activeTab === 'users') {
        html += `
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${demoUsers.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td style="font-weight: 500;">${user.name}</td>
                                <td style="text-transform: capitalize;">${user.role}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (state.activeTab === 'reservations') {
        html += `
            <div class="mb-4 flex">
                <div style="position: relative; flex: 1;">
                    <input
                        type="text"
                        placeholder="Search reservations..."
                        id="search-input"
                        style="padding-left: 36px; padding-right: 16px; padding-top: 8px; padding-bottom: 8px; width: 100%; border: 1px solid #d1d5db; border-radius: 6px;"
                        value="${state.searchQuery}"
                        onkeyup="handleSearch(event)"
                    />
                    <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;"></i>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Course/Section</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.reservations
                            .filter(r => 
                                r.room.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                r.date.includes(state.searchQuery) ||
                                r.course.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                                r.section.toLowerCase().includes(state.searchQuery.toLowerCase())
                            )
                            .map(reservation => `
                                <tr>
                                    <td style="font-weight: 500;">${reservation.room}</td>
                                    <td>${formatDate(reservation.date)}</td>
                                    <td>${formatTime(reservation.startTime)} (${reservation.duration}hrs)</td>
                                    <td>${reservation.course} - ${reservation.section}</td>
                                    <td>${getStatusBadge(reservation.status)}</td>
                                    <td class="space-x-2">
                                        <div class="flex space-x-1">
                                            <select
                                                class="form-control"
                                                style="font-size: 12px; padding: 4px 8px;"
                                                onchange="handleUpdateReservationStatus('${reservation.id}', this.value)"
                                            >
                                                <option value="pending" ${reservation.status === 'pending' ? 'selected' : ''}>Pending</option>
                                                <option value="approved" ${reservation.status === 'approved' ? 'selected' : ''}>Approved</option>
                                                <option value="denied" ${reservation.status === 'denied' ? 'selected' : ''}>Denied</option>
                                            </select>
                                            <button 
                                                class="btn btn-danger"
                                                style="font-size: 12px; padding: 4px 8px;"
                                                onclick="handleDeleteReservation('${reservation.id}')"
                                            >
                                                <i class="fas fa-trash-alt"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                    </tbody>
                </table>
                ${state.reservations.filter(r => 
                    r.room.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                    r.date.includes(state.searchQuery) ||
                    r.course.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                    r.section.toLowerCase().includes(state.searchQuery.toLowerCase())
                ).length === 0 ? `
                    <div class="text-center py-10" style="color: #6b7280;">
                        No reservations found.
                    </div>
                ` : ''}
            </div>
        `;
    } else if (state.activeTab === 'rooms') {
        html += `
            <div class="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Professor</th>
                            <th>Course/Section</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.roomAssignments.map(assignment => `
                            <tr>
                                <td style="font-weight: 500;">${assignment.room}</td>
                                <td>${formatDate(assignment.date)}</td>
                                <td>${assignment.startTime} - ${assignment.endTime}</td>
                                <td>${assignment.professorName}</td>
                                <td>${assignment.course} - ${assignment.section}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${state.roomAssignments.length === 0 ? `
                    <div class="text-center py-10" style="color: #6b7280;">
                        No room assignments found.
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
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

// filepath: c:\xampp\htdocs\Classroom Reservation\script.js
function renderApp() {
    console.log("Entering renderApp(). Current state.currentUser:", state.currentUser); // <<< ADD LOG 3
    const appContainer = document.getElementById('app-container');
    let html = '';

    if (!state.currentUser) {
        console.error("No current user found inside renderApp(). Redirecting to login."); // <<< MODIFY LOG
        window.location.href = 'index.php'; // Redirect to login if not logged in
        return;
    }

    console.log("User found in renderApp(). Proceeding to render header."); // <<< ADD LOG 4
    html += renderUserHeader();




    if (state.currentUser.role === 'professor') {
        html += renderProfessorNewReservation();
        html += renderProfessorAssignedRooms();
    }





    html += renderAllReservations();
    html += renderReservationModal();
    
    // --- TEMPORARILY COMMENT OUT THE REST ---
    /*
    
    if (state.currentUser.role === 'admin') {
        html += renderAdminDashboard();
    }


    if (state.currentUser.role === 'deptHead') {
        html += renderDeptHeadPendingRequests();
        html += renderDeptHeadRoomAssignment();
    }
    */
    // --- END OF TEMPORARY COMMENT ---

    appContainer.innerHTML = html;

    // --- TEMPORARILY COMMENT OUT ---
    // setupEventListeners();
    // --- END OF TEMPORARY COMMENT ---

    console.log("Simplified renderApp finished."); // <<< ADD LOG 5
}

function setupEventListeners() {
    // These listeners need to be set up after the DOM is updated
    
    // For professor new reservation form
    const newReservationForm = document.getElementById('new-reservation-form');
    if (newReservationForm) {
        const roomSelect = document.getElementById('room-select');
        if (roomSelect) roomSelect.value = state.selectedRoom;
        
        const dateInput = document.getElementById('reservation-date');
        if (dateInput) dateInput.value = state.reservationDate;
        
        const startTimeInput = document.getElementById('start-time');
        if (startTimeInput) startTimeInput.value = state.startTime;
        
        const durationSelect = document.getElementById('duration-select');
        if (durationSelect) durationSelect.value = state.duration;
        
        const courseSelect = document.getElementById('course-select');
        if (courseSelect) courseSelect.value = state.course;
        
        const sectionSelect = document.getElementById('section-select');
        if (sectionSelect) sectionSelect.value = state.section;
        
        const reasonTextarea = document.getElementById('reason-textarea');
        if (reasonTextarea) reasonTextarea.value = state.reason;
    }
    
    // For dept head room assignment form
    const roomAssignmentForm = document.getElementById('room-assignment-form');
    if (roomAssignmentForm) {
        const professorSelect = document.getElementById('professor-select');
        if (professorSelect) professorSelect.value = state.assignmentProfessorId;
        
        const roomSelect = document.getElementById('assignment-room-select');
        if (roomSelect) roomSelect.value = state.assignmentRoom;
        
        const dateInput = document.getElementById('assignment-date');
        if (dateInput) dateInput.value = state.assignmentDate;
        
        const startTimeInput = document.getElementById('assignment-start-time');
        if (startTimeInput) startTimeInput.value = state.assignmentStartTime;
        
        const endTimeInput = document.getElementById('assignment-end-time');
        if (endTimeInput) endTimeInput.value = state.assignmentEndTime;
        
        const courseSelect = document.getElementById('assignment-course-select');
        if (courseSelect) courseSelect.value = state.assignmentCourse;
        
        const sectionSelect = document.getElementById('assignment-section-select');
        if (sectionSelect) sectionSelect.value = state.assignmentSection;
    }
    
    // For admin search
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = state.searchQuery;
    
    // For cancellation reason
    const cancellationReason = document.getElementById('cancellation-reason');
    if (cancellationReason) cancellationReason.value = state.cancellationReason;
}

// Initialize app

