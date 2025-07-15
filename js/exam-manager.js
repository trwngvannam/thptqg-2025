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
    window.AppState.flaggedQuestions = {};
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
    
    // Update UI components to reflect reset state
    if (typeof updateFlaggedButton === 'function') {
        updateFlaggedButton();
    }
    
    // Re-render MathJax for the exam content
    setTimeout(() => {
        if (typeof renderMathJax === 'function') {
            renderMathJax();
        }
    }, 100);
}

// Hàm nộp bài thi
function submitExam() {
    // Nếu vẫn còn timer (người dùng tự nộp), hỏi xác nhận
    if (window.AppState.examTimer && window.AppState.timeRemaining > 0) {
        // Tính số câu đã làm và chưa làm
        const totalQuestions = window.AppState.currentExam.questions.length;
        
        // Đếm số câu đã trả lời (tính cả sub-questions cho câu đúng/sai)
        let answeredQuestions = 0;
        window.AppState.currentExam.questions.forEach((question, index) => {
            if (question.sub_questions) {
                // Câu hỏi đúng/sai - kiểm tra tất cả sub questions
                const hasAnswered = question.sub_questions.every((_, subIndex) => 
                    window.AppState.userAnswers.hasOwnProperty(`${index}_${subIndex}`)
                );
                if (hasAnswered) answeredQuestions++;
            } else if (question.answer_type) {
                // Câu hỏi điền đáp án
                if (window.AppState.userAnswers.hasOwnProperty(index) && 
                    window.AppState.userAnswers[index] !== '') {
                    answeredQuestions++;
                }
            } else {
                // Câu hỏi trắc nghiệm thường
                if (window.AppState.userAnswers.hasOwnProperty(index)) {
                    answeredQuestions++;
                }
            }
        });
        
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
    const questions = window.AppState.currentExam.questions;
    let totalScore = 0;
    let maxScore = 0;
    
    // Calculate score based on question types
    questions.forEach((question, index) => {
        if (question.sub_questions) {
            // PHẦN 2: TRẮC NGHIỆM ĐÚNG/SAI - 0.25 điểm mỗi ý
            question.sub_questions.forEach((sub, subIndex) => {
                maxScore += 0.25;
                const userAnswer = window.AppState.userAnswers[`${index}_${subIndex}`];
                if (userAnswer === sub.correct) {
                    totalScore += 0.25;
                }
            });
        } else if (question.answer_type) {
            // PHẦN 3: ĐIỀN ĐÁP ÁN - 0.5 điểm mỗi câu
            maxScore += 0.5;
            const userAnswer = window.AppState.userAnswers[index];
            if (userAnswer && userAnswer.toString().trim() === question.correct_answer.toString().trim()) {
                totalScore += 0.5;
            }
        } else {
            // PHẦN 1: TRẮC NGHIỆM - 0.25 điểm mỗi câu
            maxScore += 0.25;
            const userAnswer = window.AppState.userAnswers[index];
            if (userAnswer === question.correct) {
                totalScore += 0.25;
            }
        }
    });
    
    // Round to 2 decimal places
    const finalScore = Math.round(totalScore * 100) / 100;
    const examEndTime = new Date();
    const timeTakenMs = examEndTime - window.AppState.examStartTime;
    
    // Convert milliseconds to minutes and seconds
    const timeTakenSeconds = Math.floor(timeTakenMs / 1000);
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    
    // Calculate number of correct answers for display
    const correctAnswers = Math.round(totalScore / 0.25); // Approximation for display
    const totalQuestions = questions.length;
    
    // Reload current question to show answers and explanations
    loadQuestion(window.AppState.currentQuestionIndex);
    
    // Display results
    displayResults(correctAnswers, totalQuestions, finalScore, minutes, seconds);
}
