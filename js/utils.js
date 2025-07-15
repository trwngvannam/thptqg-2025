// Hàm chọn mã đề thi
function selectExamCode(code) {
    window.AppState.selectedExamCode = code;
    window.AppState.flaggedQuestions = {};
    
    // Enable start button if name is provided
    checkStartButtonState();
}

// Hàm kiểm tra trạng thái nút bắt đầu
function checkStartButtonState() {
    const startBtn = document.getElementById('start-exam');
    const studentName = document.getElementById('student-name').value.trim();
    
    if (window.AppState.selectedSubject && window.AppState.selectedExamCode && studentName) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Hàm khởi động lại đề thi hiện tại
function restartCurrentExam() {
    if (!window.AppState.currentExam) return;
    
    // Confirm với user trước khi restart
    if (!confirm("Bạn có chắc chắn muốn làm lại đề này? Tất cả đáp án hiện tại sẽ bị xóa.")) {
        return;
    }
    
    // Reset hoàn toàn tất cả variables
    window.AppState.currentQuestionIndex = 0;
    window.AppState.userAnswers = {};
    window.AppState.flaggedQuestions = {};
    window.AppState.examStartTime = new Date();
    window.AppState.timeRemaining = 50 * 60;
    window.AppState.examSubmitted = false;
    window.AppState.timeUpAlertShown = false;
    
    // Stop timer hiện tại nếu có
    if (window.AppState.examTimer) {
        clearInterval(window.AppState.examTimer);
        window.AppState.examTimer = null;
    }
    
    // Reset timer display và remove warning class
    window.DOMElements.timer.classList.remove('warning');
    window.DOMElements.timer.style.display = 'block';
    updateTimerDisplay();
    
    // Remove result banner nếu có
    const resultBanner = document.getElementById('result-banner');
    if (resultBanner) {
        resultBanner.remove();
    }
    
    // Show submit button lại
    const submitBtn = document.getElementById('submit-exam');
    if (submitBtn) {
        submitBtn.style.display = 'block';
        submitBtn.disabled = false;
    }
    
    // Reset question grid và setup lại từ đầu
    createQuestionGrid();
    
    // Load câu hỏi đầu tiên
    loadQuestion(0);
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update progress bar
    updateProgressBar();
    
    // Start timer mới
    startTimer();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Hàm render MathJax cho các công thức toán học
function renderMathJax(element = document) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]).catch(function (err) {
            console.log('MathJax typeset failed: ' + err.message);
        });
    }
}

// Hàm re-render MathJax toàn bộ trang
function rerenderAllMath() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(function (err) {
            console.log('MathJax full re-render failed: ' + err.message);
        });
    }
}
