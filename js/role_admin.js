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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-table-body">
        `;
        
        // Only show loading if actually loading
        if (state.isLoadingUsers) {
            html += `
                <tr>
                    <td colspan="7" class="text-center py-4"><i class="fas fa-spinner fa-spin mr-2"></i> Loading users...</td>
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
                            <td>
                                <div class="flex space-x-2">
                                    <button onclick="openChangeRoleModal(${user.id}, '${user.username}', '${user.role}')" class="btn btn-primary" style="font-size: 12px; padding: 4px 8px;">
                                        <i class="fas fa-user-edit"></i> Change Role
                                    </button>
                                    ${user.role !== 'admin' ? `
                                        <button onclick="openDeleteUserModal(${user.id}, '${user.username}')" class="btn btn-danger" style="font-size: 12px; padding: 4px 8px;">
                                            <i class="fas fa-user-times"></i> Delete
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                });
            } else {
                html += `
                    <tr>
                        <td colspan="7" class="text-center py-4">No users match your search.</td>
                    </tr>
                `;
            }
        } else {
            html += `
                <tr>
                    <td colspan="7" class="text-center py-4">No users found.</td>
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
                <button onclick="fetchActivityLogs()" class="btn btn-primary">
                    <i class="fas fa-sync-alt mr-1"></i> Refresh
                </button>
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
    
    // Add modals for user management
    if (state.editingUser) {
        html += `
            <div class="modal-backdrop">
                <div class="modal animate-fade-in" onclick="event.stopPropagation()">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b flex items-center">
                        <i class="fas fa-user-edit mr-2 text-blue-600"></i> Change User Role
                    </h3>
                    <p class="mb-4 text-black">
                        Changing role for user: <span class="font-bold">${state.editingUser.username}</span>
                    </p>
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-black">Current Role:</label>
                            <div class="bg-gray-100 p-2 rounded text-black">${state.editingUser.currentRole}</div>
                        </div>
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-black">New Role:</label>
                            <select id="new-role-select" class="form-control">
                                <option value="">Select a role</option>
                                <option value="student">Student</option>
                                <option value="professor">Professor</option>
                                <option value="deptHead">Department Head</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex justify-between gap-4 mt-6">
                        <button onclick="cancelUserAction()" class="btn btn-secondary flex-1">
                            <i class="fas fa-times mr-1"></i> Cancel
                        </button>
                        <button id="change-role-submit" onclick="handleChangeRole()" class="btn btn-primary flex-1">
                            <i class="fas fa-save mr-1"></i> Save Changes
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (state.deletingUser) {
        html += `
            <div class="modal-backdrop">
                <div class="modal animate-fade-in" onclick="event.stopPropagation()">
                    <h3 class="text-lg font-semibold mb-4 pb-2 border-b flex items-center">
                        <i class="fas fa-user-times mr-2 text-red-600"></i> Delete User
                    </h3>
                    <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-4">
                        <p class="font-medium">Warning: This action cannot be undone.</p>
                        <p>You are about to delete user: <span class="font-bold">${state.deletingUser.username}</span></p>
                    </div>
                    <div class="flex justify-between gap-4 mt-6">
                        <button onclick="cancelUserAction()" class="btn btn-secondary flex-1">
                            <i class="fas fa-times mr-1"></i> Cancel
                        </button>
                        <button id="delete-user-submit" onclick="handleDeleteUser()" class="btn btn-danger flex-1">
                            <i class="fas fa-trash-alt mr-1"></i> Delete User
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
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

// Make the new functions accessible globally
window.fetchUsers = fetchUsers;
window.handleUserSearch = handleUserSearch;
window.handleRoleFilter = handleRoleFilter;
window.fetchActivityLogs = fetchActivityLogs;
window.handleLogSearch = handleLogSearch;
window.handleLogTypeFilter = handleLogTypeFilter;

// Add these new functions for user management at the end of the file

// Function to open the change role modal
function openChangeRoleModal(userId, username, currentRole) {
    state.editingUser = {
        id: userId,
        username: username,
        currentRole: currentRole
    };
    
    renderApp(); // Re-render to show the modal
}

// Function to open the delete user modal
function openDeleteUserModal(userId, username) {
    state.deletingUser = {
        id: userId,
        username: username
    };
    
    renderApp(); // Re-render to show the modal
}

// Function to handle role change
function handleChangeRole() {
    const userId = state.editingUser.id;
    const newRole = document.getElementById('new-role-select').value;

    if (!newRole) {
        showNotification('Please select a role', 'warning');
        return;
    }

    // Show loading state in the modal
    const submitButton = document.getElementById('change-role-submit');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';

    // Make API call to change role
    fetch('api/update_user_role.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId,
            newRole: newRole
        })
    })
    .then(response => response.json())
    .then(data => {
        // Always close the modal after the request finishes
        state.editingUser = null;
        renderApp();

        if (data.success) {
            showNotification(`User role updated successfully to ${newRole}`, 'success');

            // Update the local state
            const userIndex = state.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                state.users[userIndex].role = newRole;
            }

            // Log the activity
            logActivity('Change user role', `Changed role of user ${userId} to ${newRole}`, 'user');

            // Refresh users list
            fetchUsers();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Network error when updating user role:', error);
        showNotification('Network error when updating user role', 'error');

        // Reset button (modal will be closed anyway)
        // submitButton.disabled = false;
        // submitButton.innerHTML = originalButtonText;
    });
}

// Function to handle user deletion
function handleDeleteUser() {
    const userId = state.deletingUser.id;
    
    // Show loading state in the modal
    const submitButton = document.getElementById('delete-user-submit');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Deleting...';
    
    // Make API call to delete user
    fetch('api/delete_user.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('User deleted successfully', 'success');
            
            // Update local state by removing the user
            state.users = state.users.filter(u => u.id !== userId);
            
            // Close the modal
            state.deletingUser = null;
            
            // Log the activity
            logActivity('Delete user', `Deleted user ${state.deletingUser.username}`, 'user');
            
            // Refresh the UI
            renderApp();
        } else {
            showNotification('Error: ' + data.error, 'error');
            
            // Reset button
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    })
    .catch(error => {
        console.error('Network error when deleting user:', error);
        showNotification('Network error when deleting user', 'error');
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    });
}

// Function to cancel modals
function cancelUserAction() {
    state.editingUser = null;
    state.deletingUser = null;
    renderApp();
}

