// Hàm khởi động lại bài thi
function restartExam() {
    // Reset all variables
    window.AppState.currentExam = null;
    window.AppState.currentQuestionIndex = 0;
    window.AppState.userAnswers = {};
    window.AppState.flaggedQuestions = {};
    window.AppState.examStartTime = null;
    window.AppState.timeRemaining = 50 * 60;
    window.AppState.selectedExamCode = null;
    window.AppState.selectedSubject = null;
    window.AppState.examSubmitted = false;
    window.AppState.timeUpAlertShown = false;
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
    
    // Reset dropdown selection and subject selection
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('dropdown-list').classList.remove('open');
    document.getElementById('dropdown-header').classList.remove('active');
    
    // Reset subject selection
    document.querySelectorAll('.subject-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Hide exam selector and exam info
    document.getElementById('exam-selector').style.display = 'none';
    document.getElementById('exam-info').style.display = 'none';
    
    // Reset timer display
    window.DOMElements.timer.classList.remove('warning');
    updateTimerDisplay();
    
    // Remove result banner if exists
    const resultBanner = document.getElementById('result-banner');
    if (resultBanner) {
        resultBanner.remove();
    }
    
    // Show submit button again
    const submitBtn = document.getElementById('submit-exam');
    if (submitBtn) {
        submitBtn.style.display = 'block';
    }
    
    // Show welcome screen
    window.DOMElements.examScreen.style.display = 'none';
    window.DOMElements.welcomeScreen.style.display = 'block';
    window.DOMElements.timer.style.display = 'none';
    
    // Reset any inline styles that might affect positioning
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Scroll to top to center the welcome screen
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
    
    // Check start button state
    checkStartButtonState();
}

// Hàm chọn đề mới
function newExam() {
    // Reset all variables except keeping student info
    window.AppState.currentExam = null;
    window.AppState.currentQuestionIndex = 0;
    window.AppState.userAnswers = {};
    window.AppState.examStartTime = null;
    window.AppState.timeRemaining = 50 * 60;
    window.AppState.selectedExamCode = null;
    window.AppState.selectedSubject = null;
    window.AppState.examSubmitted = false;
    window.AppState.timeUpAlertShown = false;
    
    // Reset dropdown selection and subject selection
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('dropdown-list').classList.remove('open');
    document.getElementById('dropdown-header').classList.remove('active');
    
    // Reset subject selection
    document.querySelectorAll('.subject-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Hide exam selector and exam info
    document.getElementById('exam-selector').style.display = 'none';
    document.getElementById('exam-info').style.display = 'none';
    
    // Reset timer display
    window.DOMElements.timer.classList.remove('warning');
    updateTimerDisplay();
    
    // Remove result banner if exists
    const resultBanner = document.getElementById('result-banner');
    if (resultBanner) {
        resultBanner.remove();
    }
    
    // Show submit button again
    const submitBtn = document.getElementById('submit-exam');
    if (submitBtn) {
        submitBtn.style.display = 'block';
    }
    
    // Show welcome screen
    window.DOMElements.resultScreen.style.display = 'none';
    window.DOMElements.examScreen.style.display = 'none';
    window.DOMElements.welcomeScreen.style.display = 'block';
    window.DOMElements.timer.style.display = 'none';
    
    // Reset any inline styles that might affect positioning
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Scroll to top to center the welcome screen
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
    
    // Check start button state
    checkStartButtonState();
}

// Function để đánh dấu/bỏ đánh dấu câu hỏi
function toggleFlag(questionIndex) {
    if (window.AppState.examSubmitted) return; // Không cho phép đánh dấu sau khi nộp bài
    
    // Toggle flag status
    window.AppState.flaggedQuestions[questionIndex] = !window.AppState.flaggedQuestions[questionIndex];
    
    // Update flag button
    const flagBtn = document.querySelector('.flag-btn');
    const flagText = flagBtn.querySelector('.flag-text');
    
    if (window.AppState.flaggedQuestions[questionIndex]) {
        flagBtn.classList.add('flagged');
        flagBtn.title = 'Bỏ đánh dấu';
        if (flagText) flagText.textContent = 'Đã đánh dấu';
    } else {
        flagBtn.classList.remove('flagged');
        flagBtn.title = 'Đánh dấu câu hỏi';
        if (flagText) flagText.textContent = 'Đánh dấu';
    }
    
    // Update question grid to show flagged questions
    updateQuestionGrid();
}
