// Setup subject selection functionality
function setupSubjectSelection() {
    const subjectOptions = document.querySelectorAll('.subject-option');
    
    subjectOptions.forEach(option => {
        option.addEventListener('click', function() {
            const subject = this.dataset.subject;
            selectSubject(subject);
        });
    });
}

// Function to select a subject
function selectSubject(subject) {
    window.AppState.selectedSubject = subject;
    
    // Update UI - remove selected class from all options
    document.querySelectorAll('.subject-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to chosen option
    document.querySelector(`[data-subject="${subject}"]`).classList.add('selected');
    
    // Show exam selector and exam info
    document.getElementById('exam-selector').style.display = 'block';
    document.getElementById('exam-info').style.display = 'flex';
    
    // Update exam info based on subject
    updateExamInfo(subject);
    
    // Reset exam selection
    window.AppState.selectedExamCode = null;
    window.AppState.flaggedQuestions = {};
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    
    // Generate dropdown items for selected subject
    generateDropdownItemsForSubject(subject);
    
    // Check start button state
    checkStartButtonState();
}

// Update exam info based on selected subject
function updateExamInfo(subject) {
    const examTime = document.getElementById('exam-time');
    const examQuestions = document.getElementById('exam-questions');
    
    if (subject === 'english') {
        examTime.textContent = 'Thời gian: 50 phút';
        examQuestions.textContent = '40 câu hỏi';
        window.AppState.timeRemaining = 50 * 60; // 50 minutes for English
    } else if (subject === 'math') {
        examTime.textContent = 'Thời gian: 90 phút';
        examQuestions.textContent = '50 câu hỏi';
        window.AppState.timeRemaining = 90 * 60; // 90 minutes for Math
    }
}
