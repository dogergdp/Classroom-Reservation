// Professor-specific functions
function renderRoleSpecificContent() {
    // State initialization is now handled by initializeApplicationState()
    
    let html = '';
    html += renderProfessorDepartmentInfo();
    html += renderProfessorNewReservation();
    html += renderProfessorAssignedRooms();
    return html;
}

function showNotification(message, type = 'success', duration = 2500) {
    // Remove any existing notification
    const existing = document.getElementById('prof-notification');
    if (existing) existing.remove();

    // Create notification element
    const notif = document.createElement('div');
    notif.id = 'prof-notification';
    notif.className = `fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-opacity duration-500 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    notif.style.opacity = '1';
    notif.innerHTML = `<i class="fas fa-check-circle mr-2"></i> ${message}`;

    document.body.appendChild(notif);

    // Fade out after duration
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, duration);
}

function setupRoleEventListeners() {
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
}

function renderProfessorDepartmentInfo() {
    return `
        <div class="card mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <i class="fas fa-university text-blue-600 mr-2"></i> Department Information
            </h2>
            <div class="p-4 bg-blue-50 rounded-lg">
                <p class="text-black mb-2">
                    <span class="font-medium">Department:</span> ${state.currentUser.departmentName || 'Not assigned'}
                </p>
                <p class="text-black">
                    <span class="font-medium">Department Head:</span> ${state.currentUser.deptHeadName || 'Not assigned'}
                </p>
                <p class="text-black mt-2">
                    <span class="font-medium">Professor ID:</span> ${state.currentUser.id}
                </p>
                <p class="text-black">
                    <span class="font-medium">Professor Name:</span> ${state.currentUser.name}
                </p>
            </div>
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

function renderProfessorAssignedRooms() {
    const professorAssignments = state.roomAssignments.filter(a => a.professorId === state.currentUser.id);
    
    let html = `
        <div class="card mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                <i class="fas fa-door-open text-rose-600 mr-2"></i> Your Assigned Rooms
            </h2>
            
            ${professorAssignments.length > 0 
                ? `<div class="space-y-4">
                    ${professorAssignments.map(assignment => {
                        // Ensure date is properly formatted
                        const displayDate = formatDate(assignment.date);
                        
                        return `
                        <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div class="flex justify-between">
                                <div>
                                    <p class="font-medium text-black">Room ${assignment.room}</p>
                                    <p class="text-sm text-black mt-1">
                                        <i class="fas fa-user mr-1"></i> Professor: ${assignment.professorName || state.currentUser.name}
                                    </p>
                                    <p class="text-sm text-black mt-1">
                                        ${displayDate} | ${assignment.startTime} to ${assignment.endTime}
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
                    `}).join('')}
                   </div>`
                : `<div class="text-black text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <p>No rooms assigned to you yet</p>
                   </div>`
            }
        </div>
    `;
    
    return html;
}

function handleSubmitReservation(event) {
    event.preventDefault();
    if (!validateReservation()) return;

    const reservationData = {
        room: state.selectedRoom,
        date: state.reservationDate,
        startTime: state.startTime,
        duration: state.duration,
        reason: state.reason,
        course: state.course,
        section: state.section,
        professorName: state.currentUser.name  // Add professor name to the request
    };

    // Display loading indicator
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';

    // Send request to the server
    fetch('api/submit_reservation.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Reservation request submitted successfully', 'success');
            // Add new reservation to the local state
            const newReservation = new Reservation(
                data.reservation.id,
                state.currentUser.id,
                data.reservation.room,
                data.reservation.date,
                data.reservation.startTime,
                data.reservation.duration,
                'pending',
                data.reservation.reason,
                data.reservation.course,
                data.reservation.section
            );
            
            // Add professor name to the reservation
            newReservation.professorName = state.currentUser.name;
            
            state.reservations.push(newReservation);
            
            // Reset form
            state.selectedRoom = '';
            state.reservationDate = '';
            state.startTime = '';
            state.duration = 1;
            state.reason = '';
            state.course = '';
            state.section = '';
            
            // Show success message
            showNotification('Reservation request submitted successfully', 'success');
        } else {
            showNotification('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error submitting reservation:', error);
        showNotification('Network error when submitting reservation', 'error');
    })
    .finally(() => {
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        renderApp();
    });
}

function validateReservation() {
    if (!state.selectedRoom) {
        showNotification('Please select a room', 'warning');
        return false;
    }
    
    if (!state.reservationDate) {
        showNotification('Please select a date', 'warning');
        return false;
    }
    
    // Check that date is not in the past
    const selectedDate = new Date(state.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Cannot reserve rooms for past dates', 'warning');
        return false;
    }
    
    if (!state.startTime) {
        showNotification('Please select a start time', 'warning');
        return false;
    }
    
    if (!state.course) {
        showNotification('Please select a course', 'warning');
        return false;
    }
    
    if (!state.section) {
        showNotification('Please select a section', 'warning');
        return false;
    }
    
    return true;
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
        // Ensure professorName is preserved
        if (!state.reservations[index].professorName) {
            state.reservations[index].professorName = state.currentUser?.name;
        }
    }
    
    state.roomAssignments = state.roomAssignments.filter(a => a.id !== assignmentId);
    state.confirmingCancelId = null;
    state.cancellationReason = '';
    
    renderApp();
}
