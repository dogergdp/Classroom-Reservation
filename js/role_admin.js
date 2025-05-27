// Admin-specific functions
function renderRoleSpecificContent() {
    return renderAdminDashboard();
}

function setupRoleEventListeners() {
    console.log("Setting up admin role event listeners");

    // Only fetch users if we're on the users tab and haven't loaded users yet
    if (state.activeTab === 'users' && (!state.users || state.users.length === 0)) {
        fetchUsers();
    }
    
    // Fetch activity logs if we're on the logs tab
    if (state.activeTab === 'logs' && typeof state.activityLogs === 'undefined') {
        fetchActivityLogs();
    }

    // Initialize users array if it doesn't exist in the state
    if (!state.users) {
        state.users = [];
    }
    
    // Initialize activity logs array if it doesn't exist in the state
    if (!state.activityLogs) {
        state.activityLogs = [];
    }

    // Set up tab event handlers for dynamic content
    const tabs = document.querySelectorAll('.tab');
    if (tabs) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                if (tabName === 'users' && (!state.users || state.users.length === 0)) {
                    fetchUsers();
                }
                if (tabName === 'logs' && typeof state.activityLogs === 'undefined') {
                    fetchActivityLogs();
                }
            });
        });
    }
}

function fetchUsers() {
    console.log("Fetching users from server...");

    // Set loading state
    state.isLoadingUsers = true;

    // Show loading state only if on users tab
    if (state.activeTab === 'users') {
        const usersTableBody = document.getElementById('users-table-body');
        if (usersTableBody) {
            usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading users...</td></tr>';
        }
    }

    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();

    fetch(`api/get_users.php?t=${timestamp}`)
        .then(response => {
            console.log("API Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response data:", data);
            state.isLoadingUsers = false;
            if (data.success) {
                // Store users in state
                state.users = data.users;
                console.log("Users loaded:", state.users.length);

                // Only re-render if still on users tab
                if (state.activeTab === 'users') {
                    renderApp();
                }
            } else {
                console.error('Error fetching users:', data.error);
                showNotification('Failed to load users: ' + data.error, 'error');

                // Update the table with the error only if on users tab
                if (state.activeTab === 'users') {
                    const usersTableBody = document.getElementById('users-table-body');
                    if (usersTableBody) {
                        usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">
                            <i class="fas fa-exclamation-circle mr-2"></i> Failed to load users: ${data.error}
                        </td></tr>`;
                    }
                }
            }
        })
        .catch(error => {
            state.isLoadingUsers = false;
            console.error('Network error when fetching users:', error);
            showNotification('Network error when loading users', 'error');

            // Update the table with the error only if on users tab
            if (state.activeTab === 'users') {
                const usersTableBody = document.getElementById('users-table-body');
                if (usersTableBody) {
                    usersTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500 py-4">
                        <i class="fas fa-exclamation-circle mr-2"></i> Failed to load users: ${error.message}
                    </td></tr>`;
                }
            }
        });
}

function fetchActivityLogs() {
    console.log("Fetching activity logs from server...");

    // Set loading state
    state.isLoadingLogs = true;

    // Show loading state only if on logs tab
    if (state.activeTab === 'logs') {
        const logsTableBody = document.getElementById('logs-table-body');
        if (logsTableBody) {
            logsTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading activity logs...</td></tr>';
        }
    }

    // Add a timestamp to prevent caching
    const timestamp = new Date().getTime();

    fetch(`api/get_activity_logs.php?t=${timestamp}`)
        .then(response => {
            console.log("API Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response data:", data);
            state.isLoadingLogs = false;
            if (data.success) {
                // Store logs in state
                state.activityLogs = data.logs;
                console.log("Activity logs loaded:", state.activityLogs.length);

                // Only re-render if still on logs tab
                if (state.activeTab === 'logs') {
                    renderApp();
                }
            } else {
                console.error('Error fetching activity logs:', data.error);
                showNotification('Failed to load activity logs: ' + data.error, 'error');

                // Update the table with the error only if on logs tab
                if (state.activeTab === 'logs') {
                    const logsTableBody = document.getElementById('logs-table-body');
                    if (logsTableBody) {
                        logsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">
                            <i class="fas fa-exclamation-circle mr-2"></i> Failed to load activity logs: ${data.error}
                        </td></tr>`;
                    }
                }
            }
        })
        .catch(error => {
            state.isLoadingLogs = false;
            console.error('Network error when fetching activity logs:', error);
            showNotification('Network error when loading activity logs', 'error');

            // Update the table with the error only if on logs tab
            if (state.activeTab === 'logs') {
                const logsTableBody = document.getElementById('logs-table-body');
                if (logsTableBody) {
                    logsTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-red-500 py-4">
                        <i class="fas fa-exclamation-circle mr-2"></i> Failed to load activity logs: ${error.message}
                    </td></tr>`;
                }
            }
        });
}

function renderAdminDashboard() {
    let html = `
        <div class="card">
            <h2 class="text-2xl font-bold text-black mb-6 flex items-center">
                <i class="fas fa-user-cog text-blue-600 mr-2"></i> System Administrator Dashboard
            </h2>

            <!-- Tabs -->
            <div class="tabs">
                <div class="tab ${state.activeTab === 'overview' ? 'active' : ''}" onclick="setActiveTab('overview')" data-tab="overview">
                    <i class="fas fa-chart-pie mr-1"></i> Overview
                </div>
                <div class="tab ${state.activeTab === 'users' ? 'active' : ''}" onclick="setActiveTab('users')" data-tab="users">
                    <i class="fas fa-users mr-1"></i> Users
                </div>
                <div class="tab ${state.activeTab === 'reservations' ? 'active' : ''}" onclick="setActiveTab('reservations')" data-tab="reservations">
                    <i class="fas fa-calendar-check mr-1"></i> Reservations
                </div>
                <div class="tab ${state.activeTab === 'rooms' ? 'active' : ''}" onclick="setActiveTab('rooms')" data-tab="rooms">
                    <i class="fas fa-door-open mr-1"></i> Room Assignments
                </div>
                <div class="tab ${state.activeTab === 'logs' ? 'active' : ''}" onclick="setActiveTab('logs')" data-tab="logs">
                    <i class="fas fa-history mr-1"></i> Activity Logs
                </div>
            </div>
    `;
    
    // Content based on active tab
    if (state.activeTab === 'overview') {
        // Calculate user counts if users are available
        const userCounts = { 
            total: state.users ? state.users.length : 0, 
            professors: state.users ? state.users.filter(u => u.role === 'professor').length : 0,
            students: state.users ? state.users.filter(u => u.role === 'student').length : 0,
            deptHeads: state.users ? state.users.filter(u => u.role === 'deptHead').length : 0,
            admins: state.users ? state.users.filter(u => u.role === 'admin').length : 0
        };
        
        const pendingCount = state.reservations.filter(r => r.status === 'pending').length;
        const approvedCount = state.reservations.filter(r => r.status === 'approved').length;
        const deniedCount = state.reservations.filter(r => r.status === 'denied').length;
        
        html += `
            <div class="grid md-grid-cols-2 lg-grid-cols-3 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 class="text-lg font-medium text-blue-800 mb-2">User Statistics</h3>
                    <p class="text-blue-700">Total Users: <span class="font-bold">${userCounts.total}</span></p>
                    <p class="text-blue-700">Professors: <span class="font-bold">${userCounts.professors}</span></p>
                    <p class="text-blue-700">Department Heads: <span class="font-bold">${userCounts.deptHeads}</span></p>
                    <p class="text-blue-700">Students: <span class="font-bold">${userCounts.students}</span></p>
                    <p class="text-blue-700">Administrators: <span class="font-bold">${userCounts.admins}</span></p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 class="text-lg font-medium text-green-800 mb-2">Reservation Statistics</h3>
                    <p class="text-green-700">Total Reservations: <span class="font-bold">${state.reservations.length}</span></p>
                    <p class="text-green-700">Pending: <span class="font-bold">${pendingCount}</span></p>
                    <p class="text-green-700">Approved: <span class="font-bold">${approvedCount}</span></p>
                    <p class="text-green-700">Denied: <span class="font-bold">${deniedCount}</span></p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 class="text-lg font-medium text-purple-800 mb-2">Room Assignments</h3>
                    <p class="text-purple-700">Total Assignments: <span class="font-bold">${state.roomAssignments.length}</span></p>
                </div>
            </div>
        `;
    } else if (state.activeTab === 'users') {
        // Add a refresh button and search box
        html += `
            <div class="mb-4 flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 flex-1" style="min-width: 250px;">
                    <div style="position: relative; flex: 1;">
                        <input
                            type="text"
                            placeholder="Search users..."
                            id="user-search-input"
                            class="form-control"
                            style="padding-left: 36px; width: 250px;"
                            value="${state.userSearchQuery || ''}"
                            onkeyup="handleUserSearch(event)"
                        />
                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;"></i>
                    </div>
                    <select id="user-role-filter" class="form-control" onchange="handleRoleFilter(event)">
                        <option value="" ${!state.userRoleFilter ? 'selected' : ''}>All Roles</option>
                        <option value="student" ${state.userRoleFilter === 'student' ? 'selected' : ''}>Students</option>
                        <option value="professor" ${state.userRoleFilter === 'professor' ? 'selected' : ''}>Professors</option>
                        <option value="deptHead" ${state.userRoleFilter === 'deptHead' ? 'selected' : ''}>Department Heads</option>
                    </select>
                </div>
                <button onclick="fetchUsers()" class="btn btn-primary">
                    <i class="fas fa-sync-alt mr-1"></i> Refresh
                </button>
            </div>
        `;
        
        html += `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th> <!-- Added Username column -->
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
        `;
        
        // Only show loading if actually loading
        if (state.isLoadingUsers) {
            html += `
                <tr>
                    <td colspan="5" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading users...</td>
                </tr>
            `;
        } else if (state.users && state.users.length > 0) {
            // Filter users if there is a search query
                const searchQuery = state.userSearchQuery || '';
                const selectedRole = state.userRoleFilter || '';
                const filteredUsers = state.users.filter(user =>
                    (selectedRole === '' || user.role === selectedRole) &&
                    (
                        user.id.toString().includes(searchQuery) ||
                        (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (user.department_name && user.department_name.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                );
            
            if (filteredUsers.length > 0) {
                filteredUsers.forEach(user => {
                    // Get a font awesome icon based on role
                    let roleIcon = '';
                    switch (user.role) {
                        case 'admin': 
                            roleIcon = '<i class="fas fa-user-cog text-blue-600 mr-1"></i>';
                            break;
                        case 'deptHead': 
                            roleIcon = '<i class="fas fa-user-tie text-purple-600 mr-1"></i>';
                            break;
                        case 'professor': 
                            roleIcon = '<i class="fas fa-chalkboard-teacher text-green-600 mr-1"></i>';
                            break;
                        case 'student': 
                            roleIcon = '<i class="fas fa-user-graduate text-orange-600 mr-1"></i>';
                            break;
                        default:
                            roleIcon = '<i class="fas fa-user mr-1"></i>';
                    }
                    
                    html += `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.username || 'N/A'}</td> <!-- Added Username cell -->
                            <td>${user.full_name || 'N/A'}</td>
                            <td>${user.email || 'N/A'}</td>
                            <td>${roleIcon} ${user.role}</td>
                            <td>${user.department_name || 'N/A'}</td>
                        </tr>
                    `;
                });
            } else {
                html += `
                    <tr>
                        <td colspan="5" class="text-center py-4">No users match your search.</td>
                    </tr>
                `;
            }
        } else {
            html += `
                <tr>
                    <td colspan="5" class="text-center py-4">No users found.</td>
                </tr>
            `;
        }
        
        html += `
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
    } else if (state.activeTab === 'logs') {
        html += `
            <div class="mb-4 flex flex-wrap items-center gap-2">
                <div class="flex items-center gap-2 flex-1" style="min-width: 250px;">
                    <div style="position: relative; flex: 1;">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            id="log-search-input"
                            class="form-control"
                            style="padding-left: 36px; width: 250px;"
                            value="${state.logSearchQuery || ''}"
                            onkeyup="handleLogSearch(event)"
                        />
                        <i class="fas fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;"></i>
                    </div>
                    <select id="log-type-filter" class="form-control" onchange="handleLogTypeFilter(event)">
                        <option value="" ${!state.logTypeFilter ? 'selected' : ''}>All Activities</option>
                        <option value="login" ${state.logTypeFilter === 'login' ? 'selected' : ''}>Login/Logout</option>
                        <option value="user" ${state.logTypeFilter === 'user' ? 'selected' : ''}>User Management</option>
                        <option value="reservation" ${state.logTypeFilter === 'reservation' ? 'selected' : ''}>Reservations</option>
                    </select>
                </div>
                <div class="flex gap-2">
                    <button onclick="fetchActivityLogs()" class="btn btn-primary">
                        <i class="fas fa-sync-alt mr-1"></i> Refresh
                    </button>
                    <button onclick="downloadActivityLogs()" class="btn btn-success">
                        <i class="fas fa-download mr-1"></i> Download Logs
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody id="logs-table-body">
        `;
        
        // Only show loading if actually loading
            if (state.isLoadingLogs) {
                html += `
                    <tr>
                        <td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading activity logs...</td>
                    </tr>
                `;
            } else if (Array.isArray(state.activityLogs) && state.activityLogs.length > 0) {
            // Filter logs if there is a search query or type filter
            const searchQuery = state.logSearchQuery || '';
            const typeFilter = state.logTypeFilter || '';
            const filteredLogs = state.activityLogs.filter(log =>
                (typeFilter === '' || log.action_type === typeFilter) &&
                (
                    (log.timestamp && log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (log.username && log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            );
            
            if (filteredLogs.length > 0) {
                filteredLogs.forEach(log => {
                    // Get a font awesome icon based on action type
                    let actionIcon = '';
                    switch (log.action_type) {
                        case 'login': 
                            actionIcon = '<i class="fas fa-sign-in-alt text-blue-600 mr-1"></i>';
                            break;
                        case 'logout': 
                            actionIcon = '<i class="fas fa-sign-out-alt text-orange-600 mr-1"></i>';
                            break;
                        case 'user': 
                            actionIcon = '<i class="fas fa-user-edit text-purple-600 mr-1"></i>';
                            break;
                        case 'reservation': 
                            actionIcon = '<i class="fas fa-calendar-plus text-green-600 mr-1"></i>';
                            break;
                        default:
                            actionIcon = '<i class="fas fa-info-circle mr-1"></i>';
                    }
                    
                    html += `
                        <tr>
                            <td>${log.timestamp || 'N/A'}</td>
                            <td>${log.username || 'N/A'}</td>
                            <td>${actionIcon} ${log.action || 'N/A'}</td>
                            <td>${log.details || 'N/A'}</td>
                        </tr>
                    `;
                });
            } else {
                html += `
                    <tr>
                        <td colspan="4" class="text-center py-4">No logs match your search.</td>
                    </tr>
                `;
            }
        } else if (Array.isArray(state.activityLogs) && state.activityLogs.length === 0) {
            html += `
                <tr>
                    <td colspan="4" class="text-center py-4">No activity logs found.</td>
                </tr>
            `;
        }
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += `</div>`;
    return html;
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

function handleUserSearch(event) {
    state.userSearchQuery = event.target.value;
    renderApp();
}
function handleRoleFilter(event) {
    state.userRoleFilter = event.target.value;
    renderApp();
}
function handleLogSearch(event) {
    state.logSearchQuery = event.target.value;
    renderApp();
}
function handleLogTypeFilter(event) {
    state.logTypeFilter = event.target.value;
    renderApp();
}

function downloadActivityLogs() {
    console.log("Downloading activity logs...");
    
    // Check if we have logs to download
    if (!state.activityLogs || !Array.isArray(state.activityLogs) || state.activityLogs.length === 0) {
        showNotification('No logs available to download', 'error');
        return;
    }
    
    // Apply the same filters as currently shown in the UI
    const searchQuery = state.logSearchQuery || '';
    const typeFilter = state.logTypeFilter || '';
    const filteredLogs = state.activityLogs.filter(log =>
        (typeFilter === '' || log.action_type === typeFilter) &&
        (
            (log.timestamp && log.timestamp.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (log.username && log.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );
    
    if (filteredLogs.length === 0) {
        showNotification('No logs match your current filters', 'error');
        return;
    }
    
    // Create CSV content
    let csvContent = "Timestamp,User ID,Username,Action,Details,Action Type\n";
    
    filteredLogs.forEach(log => {
        // Replace commas in text fields with spaces to avoid CSV formatting issues
        const timestamp = log.timestamp || 'N/A';
        const userId = log.user_id || 'N/A';
        const username = (log.username || 'N/A').replace(/,/g, ' ');
        const action = (log.action || 'N/A').replace(/,/g, ' ');
        const details = (log.details || 'N/A').replace(/,/g, ' ').replace(/\n/g, ' ');
        const actionType = (log.action_type || 'N/A').replace(/,/g, ' ');
        
        // Add row to CSV
        csvContent += `"${timestamp}","${userId}","${username}","${action}","${details}","${actionType}"\n`;
    });
    
    // Create and download the file
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Create a filename with current date/time
    const now = new Date();
    const filename = `activity_logs_${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}.csv`;
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Downloaded ${filteredLogs.length} log entries`, 'success');
}

// Make the new functions accessible globally
window.fetchUsers = fetchUsers;
window.handleUserSearch = handleUserSearch;
window.handleRoleFilter = handleRoleFilter;
window.fetchActivityLogs = fetchActivityLogs;
window.handleLogSearch = handleLogSearch;
window.handleLogTypeFilter = handleLogTypeFilter;
window.downloadActivityLogs = downloadActivityLogs;

