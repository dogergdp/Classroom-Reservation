// Admin-specific functions
function renderRoleSpecificContent() {
    return renderAdminDashboard();
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
        // Need to fetch user counts from server in a real implementation
        const userCounts = { total: 0, professors: 0, students: 0 };
        const pendingCount = state.reservations.filter(r => r.status === 'pending').length;
        const approvedCount = state.reservations.filter(r => r.status === 'approved').length;
        const deniedCount = state.reservations.filter(r => r.status === 'denied').length;
        
        html += `
            <div class="grid md-grid-cols-2 lg-grid-cols-3 gap-4 mb-8">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 class="text-lg font-medium text-blue-800 mb-2">User Statistics</h3>
                    <p class="text-blue-700">Total Users: <span class="font-bold">${userCounts.total}</span></p>
                    <p class="text-blue-700">Professors: <span class="font-bold">${userCounts.professors}</span></p>
                    <p class="text-blue-700">Students: <span class="font-bold">${userCounts.students}</span></p>
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
                    <tbody id="users-table-body">
                        <!-- This would be populated from the server -->
                        <tr>
                            <td colspan="3" class="text-center">Loading users...</td>
                        </tr>
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
