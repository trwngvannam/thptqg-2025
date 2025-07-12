// Hàm cập nhật lưới câu hỏi
function updateQuestionGrid() {
    const questionGrid = document.getElementById('question-grid');
    
    Array.from(questionGrid.children).forEach((btn, index) => {
        btn.classList.remove('current', 'answered', 'correct', 'wrong', 'flagged');
        
        if (index === window.AppState.currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        if (window.AppState.userAnswers.hasOwnProperty(index)) {
            btn.classList.add('answered');
            
            // Sau khi nộp bài, hiển thị câu đúng/sai
            if (window.AppState.examSubmitted) {
                const isCorrect = window.AppState.userAnswers[index] === window.AppState.currentExam.questions[index].correct;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        }
        
        // Thêm class flagged cho câu đã đánh dấu
        if (window.AppState.flaggedQuestions[index]) {
            btn.classList.add('flagged');
        }
    });
}

// Hàm cập nhật nút điều hướng trước/sau
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = window.AppState.currentQuestionIndex === 0;
    nextBtn.disabled = window.AppState.currentQuestionIndex === window.AppState.currentExam.questions.length - 1;
}

// Hàm cập nhật thanh tiến độ
function updateProgressBar() {
    const progress = ((window.AppState.currentQuestionIndex + 1) / window.AppState.currentExam.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Hàm quay lại câu hỏi trước
function previousQuestion() {
    if (window.AppState.currentQuestionIndex > 0) {
        loadQuestion(window.AppState.currentQuestionIndex - 1);
    }
}

// Hàm chuyển đến câu hỏi tiếp theo
function nextQuestion() {
    if (window.AppState.currentQuestionIndex < window.AppState.currentExam.questions.length - 1) {
        loadQuestion(window.AppState.currentQuestionIndex + 1);
    }
}
