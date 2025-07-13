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
            <span class="question-text">Câu ${index + 1}/${totalQuestions}</span>
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
    
    // Hiển thị instruction (hướng dẫn) nếu có
    if (question.instruction) {
        questionHTML += `<div class="instruction"><strong>📋 Hướng dẫn:</strong><br><em>${question.instruction}</em></div>`;
    }
    
    // Hiển thị đoạn văn nếu có
    if (question.passage) {
        questionHTML += `<div class="passage"><strong>📖 Đoạn văn:</strong><div>${question.passage.replace(/\n/g, '<br>')}</div></div>`;
    }
    
    // Hiển thị context nếu có (cho câu sắp xếp)
    if (question.context) {
        // Tách các câu và hiển thị có thứ tự rõ ràng
        const sentences = question.context.split('\n').filter(line => line.trim());
        const formattedContext = sentences.map(sentence => sentence.trim()).join('<br>');
        questionHTML += `<div class="context"><strong>📝 Các câu cần sắp xếp:</strong><br><div style="line-height: 2; margin-top: 1rem; font-size: 1.05rem;">${formattedContext}</div></div>`;
    }
    
    questionHTML += `
        <div class="question">
            <div class="question-text">${question.text}</div>
            ${question.image ? `<div class="question-image"><img src="${question.image}" alt="Hình minh họa" style="max-width: 100%; height: auto; margin: 1rem 0; border: 1px solid #ddd; border-radius: 8px;"/></div>` : ''}
            <div class="options">
                ${question.options.map((option, i) => {
                    const isSelected = window.AppState.userAnswers[index] === i;
                    const isCorrect = question.correct === i;
                    const isWrong = window.AppState.examSubmitted && isSelected && !isCorrect;
                    
                    let optionClass = 'option';
                    if (isSelected) optionClass += ' selected';
                    if (window.AppState.examSubmitted && isCorrect) optionClass += ' correct';
                    if (window.AppState.examSubmitted && isWrong) optionClass += ' wrong';
                    
                    return `
                        <div class="${optionClass}" onclick="${!window.AppState.examSubmitted ? `selectAnswer(${index}, ${i})` : ''}">
                            <input type="radio" name="question-${index}" value="${i}" ${isSelected ? 'checked' : ''} ${window.AppState.examSubmitted ? 'disabled' : ''}>
                            <span class="option-text">${option}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
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

// Hàm chọn đáp án cho câu hỏi
function selectAnswer(questionIndex, answerIndex) {
    if (window.AppState.examSubmitted) return; // Không cho phép chọn sau khi nộp bài
    
    window.AppState.userAnswers[questionIndex] = answerIndex;
    
    // Update UI
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    event.currentTarget.querySelector('input').checked = true;
    
    // Update question grid
    updateQuestionGrid();
}
