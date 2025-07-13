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

// Hàm chuyển đến câu hỏi cụ thể theo index
function goToQuestion(questionIndex) {
    if (questionIndex >= 0 && questionIndex < window.AppState.currentExam.questions.length) {
        loadQuestion(questionIndex);
    }
}

// Hàm cập nhật nút "Đã đánh dấu"
function updateFlaggedButton() {
    const flaggedBtn = document.getElementById('flagged-btn');
    if (!flaggedBtn) return;
    
    const flaggedCount = Object.keys(window.AppState.flaggedQuestions)
        .filter(index => window.AppState.flaggedQuestions[index]).length;
    
    // Cập nhật text và hiển thị số lượng
    const btnText = flaggedBtn.querySelector('span') || flaggedBtn.childNodes[flaggedBtn.childNodes.length - 1];
    if (flaggedCount > 0) {
        flaggedBtn.disabled = false;
        const statusText = window.AppState.examSubmitted ? ' (đã nộp bài)' : '';
        flaggedBtn.title = `Chuyển đến câu đã đánh dấu tiếp theo (${flaggedCount} câu)${statusText}`;
        
        // Cập nhật text nếu là text node
        if (btnText && btnText.nodeType === Node.TEXT_NODE) {
            btnText.textContent = ` Đã đánh dấu (${flaggedCount})`;
        } else {
            // Tìm text node để cập nhật
            const textNodes = Array.from(flaggedBtn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
            if (textNodes.length > 0) {
                textNodes[textNodes.length - 1].textContent = ` Đã đánh dấu (${flaggedCount})`;
            }
        }
    } else {
        flaggedBtn.disabled = true;
        flaggedBtn.title = 'Chưa có câu nào được đánh dấu';
        
        // Reset text
        if (btnText && btnText.nodeType === Node.TEXT_NODE) {
            btnText.textContent = ' Đã đánh dấu';
        } else {
            const textNodes = Array.from(flaggedBtn.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
            if (textNodes.length > 0) {
                textNodes[textNodes.length - 1].textContent = ' Đã đánh dấu';
            }
        }
    }
}
