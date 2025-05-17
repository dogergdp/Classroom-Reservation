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
    denialReason: '',
    // Calendar view properties
    calendarDate: null,  // Reference date for the calendar view
    selectedRoomTab: 'all'  // Selected room tab for filtering
};

// Constants for all roles
const rooms = Array.from({ length: 6 }, (_, i) => `R${(i + 1).toString().padStart(2, '0')}`);
const courses = ['BSCS', 'BSIT', 'BSIS'];
const sections = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B'];

document.addEventListener('DOMContentLoaded', () => {
    // Add calendar styles
    const calendarStyles = document.createElement('style');
    calendarStyles.textContent = `
        .calendar-container {
            max-width: 100%;
            overflow-x: auto;
            margin-bottom: 20px;
        }
        
        .calendar-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        
        .calendar-table th, .calendar-table td {
            border: 1px solid #e5e7eb;
        }
        
        .hour-column {
            width: 80px;
            min-width: 80px;
        }
        
        .date-column {
            width: 14%;
        }
        
        .date-header {
            padding: 8px;
            text-align: center;
            background-color: #f9fafb;
        }
        
        .day-name {
            font-weight: bold;
            color: #6b7280;
        }
        
        .day-number {
            font-size: 1.2rem;
            font-weight: bold;
            color: #111827;
        }
        
        .today .date-header {
            background-color: #fee2e2;
            color: #b91c1c;
        }
        
        .hour-cell {
            padding: 4px 8px;
            text-align: right;
            font-size: 0.8rem;
            color: #4b5563;
            background-color: #f9fafb;
            height: 60px;
        }
        
        .time-cell {
            height: 60px;
            position: relative;
            vertical-align: top;
            padding: 0;
        }
        
        .reservation-block {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            padding: 4px;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.2s;
        }
        
        .reservation-block:hover {
            filter: brightness(1.1);
            z-index: 10;
        }
        
        .res-title {
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 0.8rem;
        }
        
        .res-details {
            font-size: 0.7rem;
            display: flex;
            flex-direction: column;
        }
        
        .status-approved {
            background-color: rgba(52, 211, 153, 0.2);
            border: 1px solid #34d399;
            color: #065f46;
        }
        
        .status-pending {
            background-color: rgba(251, 191, 36, 0.2);
            border: 1px solid #fbbf24;
            color: #92400e;
        }
        
        .status-denied {
            background-color: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            color: #991b1b;
        }
        
        .res-start {
            border-top-width: 2px;
        }
        
        .res-middle {
            border-top: 1px dashed rgba(0,0,0,0.1);
        }
        
        .res-end {
            border-bottom-width: 2px;
        }
        
        .room-tabs {
            margin-bottom: 15px;
        }
        
        /* Tooltip for reservations */
        .reservation-tooltip {
            position: absolute;
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.7rem;
            z-index: 20;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            pointer-events: none;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(calendarStyles);

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
        const utilsScript = document.createElement('script');
        utilsScript.src = 'js/utils.js';
        utilsScript.onload = function() {
            console.log('Utils script loaded');
            console.log('About to call loadReservationsAndAssignments()...');
            
            // Log the function reference itself
            console.log('Type of loadReservationsAndAssignments:', typeof loadReservationsAndAssignments);
            console.log('loadReservationsAndAssignments function body:', loadReservationsAndAssignments.toString().substring(0, 200) + "..."); // Log first 200 chars of its body

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
            console.log("User logged out and redirected to login page.");
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
    console.log('[SCRIPT.JS] Fetching reservations and room assignments...'); // Identify this version
    
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        appContainer.innerHTML = '<p class="text-center py-10"><i class="fas fa-spinner fa-spin"></i> Loading data...</p>';
    }
    
    const cacheBuster = `?t=${new Date().getTime()}`;

    // Promise for reservations
    const reservationsPromise = fetch(`api/get_reservations.php${cacheBuster}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} from get_reservations.php`);
            }
            return response.json();
        })
        .then(data => {
            console.log('[SCRIPT.JS DEBUG] Raw API response from get_reservations.php:', JSON.stringify(data, null, 2));
            if (data.success && data.reservations) {
                state.reservations = data.reservations.map(apiRes => {
                    console.log('[SCRIPT.JS DEBUG] API reservation item (apiRes) before mapping:', JSON.stringify(apiRes, null, 2));
                    const reservation = new Reservation(
                        apiRes.id,
                        apiRes.professorId,      // Ensure this is in API response
                        apiRes.room,
                        apiRes.date,             // Ensure this is in API response
                        apiRes.startTime,        // Ensure this is in API response
                        apiRes.duration,
                        apiRes.status,
                        apiRes.reason,
                        apiRes.course,
                        apiRes.section
                    );
                    reservation.professorName = apiRes.professorName || 'Unknown Professor'; // Ensure this is in API response
                    console.log(`[SCRIPT.JS DEBUG] Constructed Reservation object for ID ${apiRes.id}:`, JSON.stringify(reservation, null, 2));
                    return reservation;
                });
                console.log('[SCRIPT.JS DEBUG] Final state.reservations after mapping:', JSON.stringify(state.reservations, null, 2));
            } else {
                const errorMsg = `Error fetching reservations: ${data.error || 'Unknown API error from get_reservations.php'}`;
                console.error(errorMsg);
                showNotification(errorMsg, 'error');
                // Optionally re-throw or handle differently if one part fails
            }
        });

    // Promise for room assignments
    const assignmentsPromise = fetch(`api/get_room_assignments.php${cacheBuster}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} from get_room_assignments.php`);
            }
            return response.json();
        })
        .then(data => {
            console.log('[SCRIPT.JS DEBUG] Raw API response from get_room_assignments.php:', JSON.stringify(data, null, 2));
            if (data.success && data.assignments) {
                state.roomAssignments = data.assignments.map(apiAssign => {
                    console.log('[SCRIPT.JS DEBUG] API assignment item (apiAssign) before mapping:', JSON.stringify(apiAssign, null, 2));
                    const assignment = new RoomAssignment(
                        apiAssign.id,
                        apiAssign.professorId,       // Ensure this is in API response
                        apiAssign.professorName || 'Unknown Professor', // Ensure this is in API response
                        apiAssign.room,
                        apiAssign.date,              // Ensure this is in API response
                        apiAssign.startTime,         // Ensure this is in API response
                        apiAssign.endTime,           // Ensure this is in API response
                        apiAssign.course,
                        apiAssign.section
                    );
                    console.log(`[SCRIPT.JS DEBUG] Constructed RoomAssignment object for ID ${apiAssign.id}:`, JSON.stringify(assignment, null, 2));
                    return assignment;
                });
                console.log('[SCRIPT.JS DEBUG] Final state.roomAssignments after mapping:', JSON.stringify(state.roomAssignments, null, 2));
            } else {
                const errorMsg = `Error fetching room assignments: ${data.error || 'Unknown API error from get_room_assignments.php'}`;
                console.error(errorMsg);
                showNotification(errorMsg, 'error');
            }
        });

    // Wait for both promises to complete
    Promise.all([reservationsPromise, assignmentsPromise])
        .catch(error => {
            // This will catch errors from the fetch calls or the .then blocks above them
            console.error('[SCRIPT.JS] Network or processing error in loadReservationsAndAssignments:', error);
            showNotification(`Error loading data: ${error.message}`, 'error');
        })
        .finally(() => {
            console.log('[SCRIPT.JS] Both fetches complete (or failed). Rendering app.');
            renderApp(); // Render the app after all data is fetched (or attempted)
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

// Add a helper function to format time ranges
function formatTimeRange(startTime, duration) {
    // Parse start time
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);
    
    // Calculate end time
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + duration);
    
    // Format both times
    const start = formatTime(startTime);
    const end = `${endDate.getHours() % 12 || 12}:${String(endDate.getMinutes()).padStart(2, '0')} ${endDate.getHours() >= 12 ? 'PM' : 'AM'}`;
    
    return `${start} - ${end}`;
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
    // Get the current week's dates for display - use calendarDate if set, otherwise use today
    const today = new Date();
    const referenceDate = state.calendarDate || today;
    const weekDates = getWeekDates(referenceDate);
    
    // Hours to display (7am to 8pm)
    const hours = Array.from({ length: 14 }, (_, i) => i + 7);
    
    let html = `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b flex items-center justify-between">
                <div>
                    <i class="fas fa-history mr-2 text-rose-600"></i>
                    ${state.currentUser.role === 'student' ? 'Available Classrooms' : 'All Reservations'}
                </div>
                <div class="flex items-center">
                    <button onclick="previousWeek()" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded mr-2">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <span id="week-display" class="text-sm font-medium">
                        ${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}
                    </span>
                    <button onclick="nextWeek()" class="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded ml-2">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <button onclick="resetToCurrentWeek()" class="ml-4 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-sm">
                        Today
                    </button>
                </div>
            </h2>
            
            <div class="room-tabs mb-4">
                <div class="flex space-x-2 overflow-x-auto pb-2">
                    ${rooms.map(room => `
                        <button 
                            onclick="selectRoom('${room}')" 
                            class="px-4 py-2 rounded-md whitespace-nowrap ${state.selectedRoomTab === room ? 'bg-rose-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
                        >
                            Room ${room}
                        </button>
                    `).join('')}
                    <button 
                        onclick="selectRoom('all')" 
                        class="px-4 py-2 rounded-md whitespace-nowrap ${state.selectedRoomTab === 'all' || !state.selectedRoomTab ? 'bg-rose-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
                    >
                        All Rooms
                    </button>
                </div>
            </div>
            
            <div class="calendar-container overflow-x-auto">
                <table class="calendar-table">
                    <thead>
                        <tr>
                            <th class="hour-column"></th>
                            ${weekDates.map(date => `
                                <th class="date-column ${isSameDay(date, today) ? 'today' : ''}">
                                    <div class="date-header">
                                        <div class="day-name">${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        <div class="day-number">${new Date(date).getDate()}</div>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${hours.map(hour => {
                            const hourStr = `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
                            return `
                                <tr>
                                    <td class="hour-cell">${hourStr}</td>
                                    ${weekDates.map(date => {
                                        const formattedDate = formatDateForComparison(date);
                                        // Get all reservations for this hour and date
                                        const hourReservations = state.reservations.filter(r => {
                                            // Skip if filtering by room and this isn't the selected room
                                            if (state.selectedRoomTab && state.selectedRoomTab !== 'all' && r.room !== state.selectedRoomTab) {
                                                return false;
                                            }
                                            // For students, only show approved reservations
                                            if (state.currentUser.role === 'student' && r.status !== 'approved') {
                                                return false;
                                            }
                                            const resDate = formatDateForComparison(r.date);
                                            if (resDate !== formattedDate) return false;
                                            
                                            // Calculate start and end hours properly
                                            const [startHour, startMinute] = r.startTime.split(':').map(Number);
                                            const durationInHours = parseInt(r.duration);
                                            
                                            // Calculate end time components
                                            const endTimeObj = new Date();
                                            endTimeObj.setHours(startHour, startMinute, 0);
                                            endTimeObj.setHours(endTimeObj.getHours() + durationInHours);
                                            
                                            const endHour = endTimeObj.getHours();
                                            const endMinute = endTimeObj.getMinutes();
                                            
                                            // If ending exactly on the hour boundary (e.g., 10:00), exclude the end hour
                                            // Otherwise include it for partial hours (e.g., 10:30)
                                            const includeEndHour = endMinute > 0;
                                            
                                            // Check if current hour falls within the reservation's time span
                                            return hour >= startHour && (hour < endHour || (hour === endHour && includeEndHour));
                                        });
                                        
                                        if (hourReservations.length === 0) {
                                            return `<td class="time-cell"></td>`;
                                        } else {
                                            return `
                                                <td class="time-cell">
                                                    ${hourReservations.map(res => {
                                                        const [startHour, startMinute] = res.startTime.split(':').map(Number);
                                                        const endHour = startHour + parseInt(res.duration);
                                                        
                                                        // Determine cell position (start, middle, end)
                                                        const isStartHour = hour === startHour;
                                                        const isEndHour = hour === endHour - 1;  // Last hour of reservation
                                                        const isMiddleHour = !isStartHour && !isEndHour;
                                                        
                                                        // Build class for cell position
                                                        const positionClass = isStartHour ? 'res-start' : 
                                                                             (isEndHour ? 'res-end' : 'res-middle');
                                                        
                                                        const statusClass = getStatusClass(res.status);
                                                        
                                                        // Full time range for display
                                                        const timeRange = formatTimeRange(res.startTime, res.duration);
                                                        
                                                        return `
                                                            <div class="reservation-block ${statusClass} ${positionClass}" 
                                                                 onclick="viewReservation('${res.id}')"
                                                                 title="${res.course} - ${res.section} | ${timeRange}">
                                                                ${isStartHour ? `
                                                                    <div class="res-title">Room ${res.room} - ${res.course}</div>
                                                                    <div class="res-details">
                                                                        <span>${timeRange}</span>
                                                                        <span>${res.professorName || 'Unknown'}</span>
                                                                    </div>
                                                                ` : ''}
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </td>
                                            `;
                                        }
                                    }).join('')}
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="mt-4 flex justify-end">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span class="text-sm">Approved</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
                        <span class="text-sm">Pending</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                        <span class="text-sm">Denied</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// Calendar helper functions
function getWeekDates(date) {
    const currentDate = new Date(date);
    const day = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = currentDate.getDate() - day; // Adjust to get Sunday
    
    return Array(7).fill().map((_, i) => {
        const newDate = new Date(currentDate);
        newDate.setDate(diff + i);
        return newDate;
    });
}

function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
}

function formatDateForComparison(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getStatusClass(status) {
    switch (status) {
        case 'approved': return 'status-approved';
        case 'denied': return 'status-denied';
        case 'pending': return 'status-pending';
        default: return '';
    }
}

function previousWeek() {
    if (!state.calendarDate) {
        state.calendarDate = new Date();
    }
    state.calendarDate.setDate(state.calendarDate.getDate() - 7);
    renderApp();
}

function nextWeek() {
    if (!state.calendarDate) {
        state.calendarDate = new Date();
    }
    state.calendarDate.setDate(state.calendarDate.getDate() + 7);
    renderApp();
}

function resetToCurrentWeek() {
    state.calendarDate = new Date();
    renderApp();
}

function selectRoom(room) {
    state.selectedRoomTab = room;
    renderApp();
}

// Make calendar functions accessible from HTML
window.previousWeek = previousWeek;
window.nextWeek = nextWeek;
window.resetToCurrentWeek = resetToCurrentWeek;
window.selectRoom = selectRoom;
window.viewReservation = viewReservation;
window.closeReservationModal = closeReservationModal;
window.showApprovalConfirmation = showApprovalConfirmation;
window.showDenialConfirmation = showDenialConfirmation;
window.cancelApprovalAction = cancelApprovalAction;
window.confirmApprovalAction = confirmApprovalAction;

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
    const found = state.reservations.find(r => String(r.id) === String(id));
    console.log('viewReservation: looking for id', id, 'found:', found);
    state.viewingReservation = found;
    renderApp();
}

function closeReservationModal() {
    state.viewingReservation = null;
    renderApp();
}

