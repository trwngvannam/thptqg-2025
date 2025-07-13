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
    if (window.AppState.examSubmitted) {
        // Sau khi nộp bài, không cho phép thay đổi flag nhưng vẫn hiển thị thông báo
        showNotification('Không thể đánh dấu sau khi nộp bài', 'warning');
        return;
    }
    
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
    
    // Update flagged button in navigation
    updateFlaggedButton();
}

// Function để chuyển đến câu đã đánh dấu tiếp theo
function goToNextFlaggedQuestion() {
    // Cho phép navigation đến câu đã đánh dấu ngay cả sau khi nộp bài
    const flaggedIndexes = Object.keys(window.AppState.flaggedQuestions)
        .filter(index => window.AppState.flaggedQuestions[index])
        .map(index => parseInt(index))
        .sort((a, b) => a - b);
    
    if (flaggedIndexes.length === 0) {
        showNotification('Không có câu nào được đánh dấu', 'warning');
        return;
    }
    
    // Tìm câu đã đánh dấu tiếp theo sau câu hiện tại
    const currentIndex = window.AppState.currentQuestionIndex;
    let nextFlaggedIndex = flaggedIndexes.find(index => index > currentIndex);
    
    // Nếu không tìm thấy câu nào sau câu hiện tại, quay về câu đầu tiên được đánh dấu
    if (nextFlaggedIndex === undefined) {
        nextFlaggedIndex = flaggedIndexes[0];
    }
    
    // Chuyển đến câu đã đánh dấu
    goToQuestion(nextFlaggedIndex);
}

// Function để hiển thị thông báo ngắn
function showNotification(message, type = 'info') {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'warning' ? '#ff9800' : type === 'info' ? '#2196f3' : '#4caf50'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Animate out và remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
