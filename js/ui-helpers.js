// Hàm cập nhật lưới câu hỏi
function updateQuestionGrid() {
    const questionGrid = document.getElementById('question-grid');
    
    // Lấy tất cả button, bất kể layout
    const allButtons = questionGrid.querySelectorAll('.question-btn');
    
    allButtons.forEach((btn, index) => {
        btn.classList.remove('current', 'answered', 'correct', 'wrong', 'flagged');
        
        if (index === window.AppState.currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        // Kiểm tra xem câu hỏi đã được trả lời chưa
        const question = window.AppState.currentExam.questions[index];
        let hasAnswered = false;
        let isCorrect = false;
        
        if (question.sub_questions) {
            // Câu hỏi đúng/sai - kiểm tra tất cả sub questions
            hasAnswered = question.sub_questions.every((_, subIndex) => 
                window.AppState.userAnswers.hasOwnProperty(`${index}_${subIndex}`)
            );
            
            if (window.AppState.examSubmitted && hasAnswered) {
                isCorrect = question.sub_questions.every((sub, subIndex) => 
                    window.AppState.userAnswers[`${index}_${subIndex}`] === sub.correct
                );
            }
        } else if (question.answer_type) {
            // Câu hỏi điền đáp án
            hasAnswered = window.AppState.userAnswers.hasOwnProperty(index) && 
                         window.AppState.userAnswers[index] !== '';
            
            if (window.AppState.examSubmitted && hasAnswered) {
                isCorrect = window.AppState.userAnswers[index].toString().trim() === 
                           question.correct_answer.toString().trim();
            }
        } else {
            // Câu hỏi trắc nghiệm thường
            hasAnswered = window.AppState.userAnswers.hasOwnProperty(index);
            
            if (window.AppState.examSubmitted && hasAnswered) {
                isCorrect = window.AppState.userAnswers[index] === question.correct;
            }
        }
        
        if (hasAnswered) {
            btn.classList.add('answered');
            
            // Sau khi nộp bài, hiển thị câu đúng/sai
            if (window.AppState.examSubmitted) {
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
