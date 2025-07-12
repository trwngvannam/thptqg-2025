// Hàm hiển thị kết quả bài thi
function displayResults(correct, total, score, minutes, seconds) {
    // Hiển thị kết quả trong exam screen thay vì chuyển màn hình
    showResultsInExamScreen(correct, total, score, minutes, seconds);
    
    // Ẩn timer và nút submit
    window.DOMElements.timer.style.display = 'none';
    document.getElementById('submit-exam').style.display = 'none';
}

// Hàm hiển thị kết quả trong màn hình thi
function showResultsInExamScreen(correct, total, score, minutes, seconds) {
    // Tạo hoặc cập nhật phần hiển thị kết quả ở đầu exam screen
    let resultBanner = document.getElementById('result-banner');
    if (!resultBanner) {
        resultBanner = document.createElement('div');
        resultBanner.id = 'result-banner';
        resultBanner.className = 'result-banner';
        
        // Insert vào đầu exam content
        const examContent = document.querySelector('.exam-content');
        examContent.insertBefore(resultBanner, examContent.firstChild);
    }
    
    // Lấy thông tin thí sinh
    const studentName = document.getElementById('student-name').value;
    const studentId = document.getElementById('student-id').value;
    
    // Tính số câu đã làm và chưa làm
    const answeredQuestions = Object.keys(window.AppState.userAnswers).length;
    const unansweredQuestions = total - answeredQuestions;
    const flaggedCount = Object.keys(window.AppState.flaggedQuestions).filter(key => window.AppState.flaggedQuestions[key]).length;
    
    // Tạo HTML cho thông tin thí sinh
    let studentInfoHTML = `
        <div class="result-item">
            <span class="label">Tên thí sinh:</span>
            <span class="value">${studentName}</span>
        </div>
    `;
    
    // Thêm số báo danh nếu có
    if (studentId && studentId.trim() !== '') {
        studentInfoHTML += `
            <div class="result-item">
                <span class="label">Số báo danh:</span>
                <span class="value">${studentId}</span>
            </div>
        `;
    }
    
    resultBanner.innerHTML = `
        <div class="result-banner-content">
            <h3><i class="fas fa-check-circle"></i> Kết quả bài thi</h3>
            <div class="result-summary">
                <div class="result-item">
                    <span class="label">Mã đề:</span>
                    <span class="value">${window.AppState.selectedExamCode}</span>
                </div>
                ${studentInfoHTML}
                <div class="result-item">
                    <span class="label">Đã làm:</span>
                    <span class="value">${answeredQuestions}/${total} câu</span>
                </div>
                ${unansweredQuestions > 0 ? `
                <div class="result-item">
                    <span class="label">Chưa làm:</span>
                    <span class="value unanswered">${unansweredQuestions} câu</span>
                </div>
                ` : ''}
                ${flaggedCount > 0 ? `
                <div class="result-item">
                    <span class="label">Đã đánh dấu:</span>
                    <span class="value flagged">${flaggedCount} câu</span>
                </div>
                ` : ''}
                <div class="result-item">
                    <span class="label">Số câu đúng:</span>
                    <span class="value">${correct}/${total}</span>
                </div>
                <div class="result-item">
                    <span class="label">Điểm số:</span>
                    <span class="value score">${score.toFixed(1)}</span>
                </div>
                <div class="result-item">
                    <span class="label">Thời gian:</span>
                    <span class="value">${minutes} phút ${seconds} giây</span>
                </div>
            </div>
            <div class="result-actions">
                <button class="restart-btn" id="restart-exam-inline" onclick="restartCurrentExam()">
                    <i class="fas fa-redo"></i>
                    Làm lại đề này
                </button>
                <button class="new-exam-btn" id="new-exam-inline" onclick="newExam()">
                    <i class="fas fa-home"></i>
                    Chọn đề mới
                </button>
            </div>
        </div>
    `;
    
    // Re-render MathJax for math formulas in results
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([resultBanner]).catch(function (err) {
            console.log('MathJax typeset failed: ' + err.message);
        });
    }
}

// Hàm tạo HTML giải thích đáp án
function generateExplanationHTML(questionNumber) {
    // Kiểm tra xem có giải thích cho câu hỏi này không
    if (window.explanationsData && 
        window.explanationsData[window.AppState.selectedExamCode] && 
        window.explanationsData[window.AppState.selectedExamCode][questionNumber]) {
        
        const explanation = window.explanationsData[window.AppState.selectedExamCode][questionNumber];
        
        return `
            <div class="answer-explanation">
                <div class="explanation-header">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Giải thích đáp án chi tiết:</strong>
                </div>
                
                <div class="correct-answer">
                    <i class="fas fa-check-circle"></i>
                    <span>Đáp án đúng: ${explanation.correct}</span>
                </div>
                
                <div class="explanation-section">
                    <div class="explanation-title">
                        <i class="fas fa-search"></i>
                        Lí do:
                    </div>
                    <div class="explanation-content">
                        <div class="explanation-point">${explanation.explanation.reason}</div>
                        ${explanation.explanation.points.map(point => 
                            `<div class="explanation-point">• ${point}</div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="wrong-answers-section">
                    <div class="explanation-title">
                        <i class="fas fa-exclamation-triangle"></i>
                        Những đáp án còn lại thì sao?
                    </div>
                    ${explanation.explanation.wrongAnswers.map(wrong => 
                        `<div class="wrong-answer">• ${wrong}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    } else {
        // Chỉ hiển thị đáp án đúng nếu không có giải thích chi tiết
        const question = window.AppState.currentExam.questions[questionNumber - 1];
        const correctOption = question.options[question.correct];
        
        return `
            <div class="answer-explanation simple">
                <div class="correct-answer">
                    <i class="fas fa-check-circle"></i>
                    <span>Đáp án đúng: ${correctOption}</span>
                </div>
                <div class="explanation-note">
                    <em>Giải thích chi tiết cho câu này đang được cập nhật...</em>
                </div>
            </div>
        `;
    }
}
