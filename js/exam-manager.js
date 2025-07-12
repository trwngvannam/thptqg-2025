// Hàm bắt đầu làm bài thi
async function startExam() {
    const studentName = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    
    if (!window.AppState.selectedSubject || !window.AppState.selectedExamCode || !studentName) {
        alert('Vui lòng chọn môn thi, mã đề và nhập họ tên!');
        return;
    }
    
    // Show loading message
    document.getElementById('selected-exam').textContent = 'Đang tải đề thi...';
    
    // Load specific exam data
    const examData = await loadSpecificExamData(window.AppState.selectedExamCode);
    
    // Xử lý trường hợp đề thi chưa có nội dung
    if (!examData || examData.isEmpty) {
        document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
        showEmptyExamNotification(window.AppState.selectedExamCode);
        return;
    }
    
    // Load explanations for this exam code (lazy loading)
    await loadExplanationsData(window.AppState.selectedExamCode);
    
    // Initialize exam
    window.AppState.currentExam = examData;
    window.AppState.currentQuestionIndex = 0;
    window.AppState.userAnswers = {};
    window.AppState.examStartTime = new Date();
    window.AppState.examSubmitted = false;
    window.AppState.timeUpAlertShown = false;
    
    // Set time remaining based on subject
    if (window.AppState.selectedSubject === 'english') {
        window.AppState.timeRemaining = 50 * 60; // 50 minutes
    } else if (window.AppState.selectedSubject === 'math') {
        window.AppState.timeRemaining = 90 * 60; // 90 minutes
    }
    
    // Update UI
    document.getElementById('exam-code-display').textContent = `Mã đề: ${window.AppState.selectedExamCode}`;
    document.getElementById('student-name-display').textContent = studentName;
    
    // Show exam screen
    window.DOMElements.welcomeScreen.style.display = 'none';
    window.DOMElements.examScreen.style.display = 'block';
    window.DOMElements.timer.style.display = 'flex';
    
    // Initialize exam interface
    createQuestionGrid();
    loadQuestion(0);
    startTimer();
}

// Hàm nộp bài thi
function submitExam() {
    // Nếu vẫn còn timer (người dùng tự nộp), hỏi xác nhận
    if (window.AppState.examTimer && window.AppState.timeRemaining > 0) {
        // Tính số câu đã làm và chưa làm
        const totalQuestions = window.AppState.currentExam.questions.length;
        const answeredQuestions = Object.keys(window.AppState.userAnswers).length;
        const unansweredQuestions = totalQuestions - answeredQuestions;
        const flaggedCount = Object.keys(window.AppState.flaggedQuestions).filter(key => window.AppState.flaggedQuestions[key]).length;
        
        let confirmMessage = `Bạn có chắc chắn muốn nộp bài không?\n\n`;
        confirmMessage += `📊 Trạng thái bài làm của bạn:\n`;
        confirmMessage += `✅ Đã làm: ${answeredQuestions}/${totalQuestions} câu\n`;
        
        if (unansweredQuestions > 0) {
            confirmMessage += `❌ Chưa làm: ${unansweredQuestions} câu\n`;
        }
        
        if (flaggedCount > 0) {
            confirmMessage += `🚩 Đã đánh dấu: ${flaggedCount} câu\n`;
        }
        
        if (unansweredQuestions > 0) {
            confirmMessage += `\n⚠️ Lưu ý: Những câu chưa làm sẽ được tính là sai!`;
        } else {
            confirmMessage += `\n🎉 Bạn đã hoàn thành tất cả câu hỏi!`;
        }
        
        if (confirm(confirmMessage)) {
            clearInterval(window.AppState.examTimer);
            window.AppState.examSubmitted = true;
            calculateResults();
        }
    } else {
        // Hết giờ hoặc timer đã dừng, nộp tự động không cần xác nhận
        if (window.AppState.examTimer) {
            clearInterval(window.AppState.examTimer);
        }
        window.AppState.examSubmitted = true;
        calculateResults();
    }
}

// Hàm tính toán kết quả bài thi
function calculateResults() {
    const totalQuestions = window.AppState.currentExam.questions.length;
    let correctAnswers = 0;
    
    // Calculate correct answers
    window.AppState.currentExam.questions.forEach((question, index) => {
        if (window.AppState.userAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / totalQuestions) * 10;
    const examEndTime = new Date();
    const timeTakenMs = examEndTime - window.AppState.examStartTime;
    
    // Chuyển đổi milliseconds thành phút và giây
    const timeTakenSeconds = Math.floor(timeTakenMs / 1000);
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    
    // Reload current question để hiển thị đáp án và giải thích
    loadQuestion(window.AppState.currentQuestionIndex);
    
    // Display results
    displayResults(correctAnswers, totalQuestions, score, minutes, seconds);
}
