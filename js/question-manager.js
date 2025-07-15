// Hàm tạo lưới câu hỏi
function createQuestionGrid() {
    const questionGrid = document.getElementById('question-grid');
    questionGrid.innerHTML = '';
    
    for (let i = 0; i < window.AppState.currentExam.questions.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'question-btn';
        btn.textContent = i + 1;
        btn.addEventListener('click', () => loadQuestion(i));
        questionGrid.appendChild(btn);
    }
    
    // Mark first question as current
    questionGrid.children[0].classList.add('current');
}

// Hàm tải câu hỏi
function loadQuestion(index) {
    window.AppState.currentQuestionIndex = index;
    const question = window.AppState.currentExam.questions[index];
    
    // Update question content
    const totalQuestions = window.AppState.currentExam.total_questions || window.AppState.currentExam.questions.length;
    const isFlagged = window.AppState.flaggedQuestions[index] || false;
    
    // Cập nhật header với số câu và nút đánh dấu
    document.getElementById('question-number').innerHTML = `
        <div class="question-header-content">
            <span class="question-text">${question.question_number || `Câu ${index + 1}`}/${totalQuestions}</span>
            <button class="flag-btn ${isFlagged ? 'flagged' : ''} ${window.AppState.examSubmitted ? 'disabled' : ''}" 
                    onclick="toggleFlag(${index})" 
                    title="${window.AppState.examSubmitted 
                        ? (isFlagged ? 'Câu đã được đánh dấu (không thể thay đổi)' : 'Câu chưa được đánh dấu') 
                        : (isFlagged ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi')}">
                <i class="fas fa-flag"></i>
                <span class="flag-text">${isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
            </button>
        </div>
    `;
    
    let questionHTML = '';
    
    // Hiển thị phần của đề thi nếu có
    if (question.part) {
        questionHTML += `<div class="exam-part"><strong>${question.part}</strong></div>`;
    }
    
    // Render theo loại câu hỏi
    if (question.sub_questions) {
        // PHẦN 2: TRẮC NGHIỆM ĐÚNG/SAI
        questionHTML += renderTrueFalseQuestion(question, index);
    } else if (question.answer_type) {
        // PHẦN 3: ĐIỀN ĐÁP ÁN
        questionHTML += renderFillInQuestion(question, index);
    } else {
        // PHẦN 1: TRẮC NGHIỆM THƯỜNG
        questionHTML += renderMultipleChoiceQuestion(question, index);
    }
    
    // Thêm giải thích đáp án nếu đã nộp bài
    if (window.AppState.examSubmitted) {
        questionHTML += generateExplanationHTML(index + 1);
    }
    
    document.getElementById('question-content').innerHTML = questionHTML;
    
    // Re-render MathJax for math formulas
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([document.getElementById('question-content')]).catch(function (err) {
            console.log('MathJax typeset failed: ' + err.message);
        });
    }
    
    // Update question grid
    updateQuestionGrid();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update progress bar
    updateProgressBar();
    
    // Update flagged button
    updateFlaggedButton();
}

// Render câu hỏi trắc nghiệm thường (PHẦN 1)
function renderMultipleChoiceQuestion(question, index) {
    return `
        <div class="question">
            <div class="question-text">${question.text}</div>
            <div class="options">
                ${question.options.map((option, i) => {
                    const isSelected = window.AppState.userAnswers[index] === option.charAt(0); // A, B, C, D
                    const isCorrect = question.correct === option.charAt(0);
                    const isWrong = window.AppState.examSubmitted && isSelected && !isCorrect;
                    
                    let optionClass = 'option';
                    if (isSelected) optionClass += ' selected';
                    if (window.AppState.examSubmitted && isCorrect) optionClass += ' correct';
                    if (window.AppState.examSubmitted && isWrong) optionClass += ' wrong';
                    
                    return `
                        <div class="${optionClass}" onclick="${!window.AppState.examSubmitted ? `selectMultipleChoiceAnswer(${index}, '${option.charAt(0)}')` : ''}">
                            <input type="radio" name="question-${index}" value="${option.charAt(0)}" ${isSelected ? 'checked' : ''} ${window.AppState.examSubmitted ? 'disabled' : ''}>
                            <span class="option-text">${option}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Render câu hỏi đúng/sai (PHẦN 2)
function renderTrueFalseQuestion(question, index) {
    return `
        <div class="question">
            <div class="question-text">${question.text}</div>
            <div class="true-false-options">
                ${question.sub_questions.map((sub, i) => {
                    const userAnswer = window.AppState.userAnswers[`${index}_${i}`];
                    const isCorrect = sub.correct;
                    const showCorrect = window.AppState.examSubmitted;
                    
                    return `
                        <div class="sub-question">
                            <div class="sub-question-text">${sub.text}</div>
                            <div class="true-false-buttons">
                                <button class="tf-btn ${userAnswer === true ? 'selected' : ''} ${showCorrect && isCorrect === true ? 'correct' : ''} ${showCorrect && userAnswer === true && isCorrect !== true ? 'wrong' : ''}" 
                                        onclick="${!window.AppState.examSubmitted ? `selectTrueFalseAnswer(${index}, ${i}, true)` : ''}" 
                                        ${window.AppState.examSubmitted ? 'disabled' : ''}>
                                    Đúng
                                </button>
                                <button class="tf-btn ${userAnswer === false ? 'selected' : ''} ${showCorrect && isCorrect === false ? 'correct' : ''} ${showCorrect && userAnswer === false && isCorrect !== false ? 'wrong' : ''}" 
                                        onclick="${!window.AppState.examSubmitted ? `selectTrueFalseAnswer(${index}, ${i}, false)` : ''}" 
                                        ${window.AppState.examSubmitted ? 'disabled' : ''}>
                                    Sai
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Render câu hỏi điền đáp án (PHẦN 3)
function renderFillInQuestion(question, index) {
    const userAnswer = window.AppState.userAnswers[index] || '';
    const isCorrect = window.AppState.examSubmitted && userAnswer.toString().trim() === question.correct_answer.toString().trim();
    
    return `
        <div class="question">
            <div class="question-text">${question.text}</div>
            <div class="fill-in-section">
                <div class="answer-input-container">
                    <label>Đáp án:</label>
                    <input type="text" 
                           class="answer-input ${window.AppState.examSubmitted ? (isCorrect ? 'correct' : 'wrong') : ''}" 
                           value="${userAnswer}" 
                           onchange="selectFillInAnswer(${index}, this.value)"
                           ${window.AppState.examSubmitted ? 'disabled' : ''}
                           placeholder="Nhập đáp án của bạn...">
                </div>
                ${window.AppState.examSubmitted ? `
                    <div class="correct-answer">
                        <strong>Đáp án đúng:</strong> ${question.correct_answer}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Function để chọn đáp án trắc nghiệm (A, B, C, D)
function selectMultipleChoiceAnswer(questionIndex, answer) {
    if (window.AppState.examSubmitted) return;
    
    window.AppState.userAnswers[questionIndex] = answer;
    loadQuestion(questionIndex);
}

// Function để chọn đáp án đúng/sai
function selectTrueFalseAnswer(questionIndex, subIndex, answer) {
    if (window.AppState.examSubmitted) return;
    
    window.AppState.userAnswers[`${questionIndex}_${subIndex}`] = answer;
    loadQuestion(questionIndex);
}

// Function để chọn đáp án điền vào
function selectFillInAnswer(questionIndex, answer) {
    if (window.AppState.examSubmitted) return;
    
    window.AppState.userAnswers[questionIndex] = answer.trim();
    // Không reload question để không làm mất focus input
}

// Legacy function for backward compatibility
function selectAnswer(questionIndex, answerIndex) {
    selectMultipleChoiceAnswer(questionIndex, answerIndex);
}
