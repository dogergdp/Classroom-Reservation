// Student-specific functions
function renderRoleSpecificContent() {
    let html = '';
    html += renderStudentInfo();
    html += renderClassroomSchedule();
    return html;
}

function renderStudentInfo() {
    return `
        <div class="card mb-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                <i class="fas fa-user-graduate text-indigo-600 mr-2"></i> Student Information
            </h2>
            <div class="p-4 bg-indigo-50 rounded-lg">
                <p class="text-black mb-2">
                    <span class="font-medium">Student ID:</span> ${state.currentUser.id}
                </p>
                <p class="text-black">
                    <span class="font-medium">Name:</span> ${state.currentUser.name}
                </p>
                <p class="text-black mt-2">
                    <span class="font-medium">Department:</span> ${state.currentUser.departmentName || 'Computer Science'}
                </p>
                <p class="text-black">
                    <span class="font-medium">Course:</span> ${state.currentUser.course || 'Not assigned'}
                </p>
                <p class="text-black">
                    <span class="font-medium">Section:</span> ${state.currentUser.section || 'Not assigned'}
                </p>
            </div>
        </div>
    `;
}

function renderClassroomSchedule() {
    // Filter reservations for student's course and section
    const studentReservations = state.reservations.filter(r => 
        r.status === 'approved' && 
        r.course === state.currentUser.course && 
        r.section === state.currentUser.section
    );

    return `
        <div class="card">
            <h2 class="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center">
                <i class="fas fa-calendar-alt text-pink-600 mr-2"></i> Your Class Schedule
                <span class="ml-2 text-sm bg-pink-100 text-pink-800 py-1 px-2 rounded-full">${studentReservations.length}</span>
                <button onclick="loadReservationsAndAssignments()" class="ml-auto text-sm bg-gray-100 hover:bg-gray-200 py-1 px-2 rounded">
                    <i class="fas fa-sync-alt mr-1"></i> Refresh
                </button>
            </h2>
            
            <div class="mt-4 mb-4">
                <div class="flex gap-2 mb-2">
                    <div class="badge badge-success"><i class="fas fa-check mr-1"></i> Current Course: ${state.currentUser.course || 'None'}</div>
                    <div class="badge badge-warning"><i class="fas fa-users mr-1"></i> Section: ${state.currentUser.section || 'None'}</div>
                </div>
                <p class="text-sm text-gray-600">
                    Below are classes scheduled for your course and section.
                </p>
            </div>
            
            ${studentReservations.length > 0 
                ? `<div class="space-y-4">
                    ${studentReservations.map(res => {
                        // Ensure date is properly formatted
                        const displayDate = formatDate(res.date);
                        
                        // Calculate end time
                        const [hours, minutes] = res.startTime.split(':');
                        const startTime = new Date();
                        startTime.setHours(parseInt(hours), parseInt(minutes), 0);
                        
                        const endTime = new Date(startTime.getTime() + res.duration * 60 * 60 * 1000);
                        const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                        
                        return `
                        <div class="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                            <div class="flex justify-between">
                                <div>
                                    <p class="font-medium text-black flex items-center">
                                        <i class="fas fa-door-open mr-1 text-pink-500"></i> Room ${res.room}
                                    </p>
                                    <p class="text-sm text-black mt-1 flex items-center">
                                        <i class="fas fa-user mr-1"></i> Professor: ${res.professorName}
                                    </p>
                                    <p class="text-sm text-black mt-1 flex items-center">
                                        <i class="fas fa-calendar-alt mr-1"></i> ${displayDate} | <i class="fas fa-clock mx-1"></i> ${formatTime(res.startTime)} - ${endTimeStr}
                                    </p>
                                    <p class="text-sm text-black flex items-center">
                                        <i class="fas fa-graduation-cap mr-1"></i> ${res.course} | <i class="fas fa-users mx-1"></i> Section ${res.section}
                                    </p>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                   </div>`
                : `<div class="text-black text-center py-8 border border-dashed border-gray-200 rounded-lg">
                    <i class="fas fa-calendar-times" style="font-size: 40px; color: #6b7280; margin-bottom: 8px;"></i>
                    <p>No classes scheduled for your course and section</p>
                   </div>`
            }
        </div>
    `;
}

function setupRoleEventListeners() {
    // Student-specific event listeners could be added here
    console.log("Setting up student role event listeners");
    
    // Fetch current student's course and section if not already in state
    if (!state.currentUser.course || !state.currentUser.section) {
        fetchStudentInfo();
    }
}

function fetchStudentInfo() {
    fetch('api/get_student_info.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                state.currentUser.course = data.course;
                state.currentUser.section = data.section;
                renderApp();
            } else {
                console.error('Error fetching student info:', data.error);
            }
        })
        .catch(error => {
            console.error('Network error when fetching student info:', error);
        });
}
