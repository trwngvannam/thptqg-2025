// Function để đồng bộ timer với thời gian thực
function syncTimer() {
    if (!window.AppState.examStartTime || window.AppState.examSubmitted) return;
    
    const examDurationMs = (window.AppState.selectedSubject === 'english' ? 50 : 90) * 60 * 1000;
    const examEndTime = new Date(window.AppState.examStartTime.getTime() + examDurationMs);
    const now = new Date();
    const remainingMs = examEndTime - now;
    
    if (remainingMs <= 0) {
        // Hết giờ rồi
        window.AppState.timeRemaining = 0;
        updateTimerDisplay();
        if (!window.AppState.examSubmitted && !window.AppState.timeUpAlertShown) {
            // Chỉ hiện alert một lần và nộp bài
            window.AppState.timeUpAlertShown = true;
            alert('Hết giờ làm bài! Bài thi sẽ được nộp tự động.');
            submitExam();
        }
    } else {
        // Cập nhật thời gian còn lại
        window.AppState.timeRemaining = Math.ceil(remainingMs / 1000);
        updateTimerDisplay();
        
        // Warning when 10 minutes left
        if (window.AppState.timeRemaining <= 600) {
            window.DOMElements.timer.classList.add('warning');
        }
    }
}

// Hàm cập nhật hiển thị thời gian còn lại
function updateTimerDisplay() {
    const minutes = Math.floor(window.AppState.timeRemaining / 60);
    const seconds = window.AppState.timeRemaining % 60;
    window.DOMElements.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Hàm bắt đầu đếm thời gian làm bài
function startTimer() {
    // Lưu thời gian bắt đầu làm bài (đã có examStartTime)
    const examDurationMs = window.AppState.timeRemaining * 1000; // Convert to milliseconds
    const examEndTime = new Date(window.AppState.examStartTime.getTime() + examDurationMs);
    
    // Đồng bộ lần đầu
    syncTimer();
    
    window.AppState.examTimer = setInterval(() => {
        // Sử dụng syncTimer để đảm bảo tính chính xác
        syncTimer();
        
        // Nếu đã nộp bài hoặc hết giờ, dừng timer
        if (window.AppState.examSubmitted || window.AppState.timeRemaining <= 0) {
            clearInterval(window.AppState.examTimer);
            window.AppState.examTimer = null;
        }
    }, 1000);
}
