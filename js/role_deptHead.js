// Department Head specific functions
let departmentProfessors = [];

function renderRoleSpecificContent() {
    // State initialization is now handled by initializeApplicationState()
    
    let html = '';
    html += renderDeptHeadPendingRequests();
    html += renderDeptHeadRoomAssignment();
    return html;
}

function setupRoleEventListeners() {
    // Fetch professors for this department head
    fetchDepartmentProfessors();
    
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
}

function fetchDepartmentProfessors() {
    // Add loading state
    const professorSelect = document.getElementById('professor-select');
    if (professorSelect) {
        professorSelect.innerHTML = '<option value="">Loading professors...</option>';
        professorSelect.disabled = true;
    }

    fetch('api/get_professors.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Professors fetched:', data.professors);
                departmentProfessors = data.professors;
                populateProfessorSelect();
            } else {
                console.error('Error fetching professors:', data.error);
                showNotification('Failed to load professors: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Network error when fetching professors:', error);
            showNotification('Network error when loading professors', 'error');
        })
        .finally(() => {
            // Reset loading state
            if (professorSelect) {
                professorSelect.disabled = false;
            }
        });
}

function populateProfessorSelect() {
    const professorSelect = document.getElementById('professor-select');
    if (professorSelect) {
        // Reset the select element
        professorSelect.innerHTML = '<option value="">Select a professor</option>';
        
        // Check if we have professors
        if (!departmentProfessors || departmentProfessors.length === 0) {
            professorSelect.innerHTML += '<option value="" disabled>No professors found in your department</option>';
            return;
        }
        
        // Add professors from our department
        departmentProfessors.forEach(prof => {
            const option = document.createElement('option');
            option.value = prof.id;
            option.textContent = prof.full_name || prof.username;
            professorSelect.appendChild(option);
        });
    }
}

function renderDeptHeadPendingRequests() {
    const pendingReservations = state.reservations.filter(r => r.status === 'pending');
    console.log('Pending reservations:', pendingReservations);
    
    let html = `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <i class="fas fa-clock text-amber-600 mr-2"></i> Pending Requests
                <span class="ml-2 text-sm bg-amber-100 text-amber-800 py-1 px-2 rounded-full">${pendingReservations.length}</span>
                <button onclick="loadReservationsAndAssignments()" class="ml-auto text-sm bg-gray-100 hover:bg-gray-200 py-1 px-2 rounded">
                    <i class="fas fa-sync-alt mr-1"></i> Refresh
                </button>
            </h2>
            <div class="space-y-4">
    `;
    
    if (pendingReservations.length > 0) {
        pendingReservations.forEach(res => {
            // Ensure date is properly formatted
            const displayDate = formatDate(res.date);
            
            html += `
                <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-lg flex items-center">
                                <i class="fas fa-door-open mr-1 text-rose-500"></i> Room ${res.room}
                            </p>
                            <p class="text-sm text-black mt-1 flex items-center">
                                <i class="fas fa-user mr-1"></i> ${res.professorName}
                            </p>
                            <p class="text-sm text-black mt-1 flex items-center">
                                <i class="fas fa-calendar-alt mr-1"></i> ${displayDate} | <i class="fas fa-clock mx-1"></i> ${formatTime(res.startTime)} (${res.duration}hrs)
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
                            <!-- Will be populated from API -->
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
                        ${state.roomAssignments.map(assignment => {
                            // Ensure date is properly formatted
                            const displayDate = formatDate(assignment.date);
                            
                            return `
                            <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                                <div class="flex justify-between">
                                    <div>
                                        <p class="font-medium text-black">${assignment.professorName} - Room ${assignment.room}</p>
                                        <p class="text-sm text-black mt-1">
                                            ${displayDate} | ${assignment.startTime} to ${assignment.endTime}
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
                        `}).join('')}
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

function handleApproveDeny(id, status) {
    console.log('Approve/Deny clicked:', { id, status }); 
    
    const reservationIndex = state.reservations.findIndex(r => String(r.id) === String(id));
    console.log('Reservation index:', reservationIndex); 
    
    if (reservationIndex === -1) return;

    
    const updateData = {
        id: id,
        status: status
    };
     console.log('Sending updateData:', updateData);
    
    // Display loading indicator
    showNotification(`Processing ${status === 'approved' ? 'approval' : 'denial'}...`, 'info');
    
    // Send the update to the server
    fetch('api/update_reservation_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update the local state with the new status
            state.reservations[reservationIndex].status = status;
            
            // If approved and we got an assignment back, add it to local state
            if (status === 'approved' && data.assignment) {
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
            
            showNotification(`Reservation ${status === 'approved' ? 'approved' : 'denied'} successfully`, 'success');
            
            // Refresh data from server to ensure everything is up to date
            loadReservationsAndAssignments();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error updating reservation status:', error);
        showNotification('Network error when updating reservation: ' + error.message, 'error');
    });
}

function denyWithPrompt(id) {
    const reason = prompt("Please provide a reason for denial:");
    if (reason !== null) {
        handleDenyWithReason(id, reason);
    }
}

function handleDenyWithReason(id, reason) {
    const reservationIndex = state.reservations.findIndex(r => r.id === id);
    
    if (reservationIndex === -1) return;
    
    const updateData = {
        id: id,
        status: 'denied',
        reason: reason
    };
    
    // Display loading indicator
    showNotification(`Processing denial...`, 'info');
    
    // Send the update to the server
    fetch('api/update_reservation_status.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update the local state with the new status and reason
            state.reservations[reservationIndex].status = 'denied';
            state.reservations[reservationIndex].reason = `Denied by department head: ${reason ? reason : 'No reason provided'} (${formatDate(new Date().toISOString())})`;
            showNotification('Reservation denied successfully', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error denying reservation:', error);
        showNotification('Network error when denying reservation: ' + error.message, 'error');
    })
    .finally(() => {
        // Refresh the page content
        renderApp();
    });
}

function handleRoomAssignment(event) {
    event.preventDefault();
    
    // Calculate duration from start to end time
    const startHour = parseInt(state.assignmentStartTime.split(':')[0]);
    const endHour = parseInt(state.assignmentEndTime.split(':')[0]);
    const duration = endHour - startHour;
    
    if (duration <= 0) {
        showNotification('End time must be after start time', 'warning');
        return;
    }
    
    const assignmentData = {
        professorId: state.assignmentProfessorId,
        room: state.assignmentRoom,
        date: state.assignmentDate,
        startTime: state.assignmentStartTime,
        endTime: state.assignmentEndTime,
        course: state.assignmentCourse,
        section: state.assignmentSection
    };
    
    // Display loading indicator
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Assigning...';
    
    // Send request to the server
    fetch('api/assign_room.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Add new reservation to the local state
            const newReservation = new Reservation(
                data.reservation.id,
                data.reservation.professorId,
                data.reservation.room,
                data.reservation.date,
                data.reservation.startTime,
                data.reservation.duration,
                'approved',
                'Directly assigned by department head',
                data.reservation.course,
                data.reservation.section
            );
            
            state.reservations.push(newReservation);
            
            // Add new assignment to the local state
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
            
            // Reset form
            state.assignmentProfessorId = '';
            state.assignmentRoom = '';
            state.assignmentDate = '';
            state.assignmentStartTime = '';
            state.assignmentEndTime = '';
            state.assignmentCourse = '';
            state.assignmentSection = '';
            
            // Show success message
            showNotification('Room assigned successfully', 'success');
            
            // Reload all data to ensure consistency
            loadReservationsAndAssignments();
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error assigning room:', error);
        showNotification('Network error when assigning room', 'error');
    })
    .finally(() => {
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    });
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


window.handleApproveDeny = handleApproveDeny;
window.denyWithPrompt = denyWithPrompt;