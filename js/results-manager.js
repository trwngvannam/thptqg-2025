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
                    <span class="value score">${score.toFixed(2)}</span>
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
        const question = window.AppState.currentExam.questions[questionNumber - 1];
        
        // Kiểm tra xem có phải câu trắc nghiệm đúng/sai không
        if (question.sub_questions && explanation.sub_answers) {
            // Câu trắc nghiệm đúng/sai
            let correctAnswersText = [];
            Object.keys(explanation.sub_answers).forEach(subId => {
                const subQuestion = question.sub_questions.find(sub => sub.id === subId);
                if (subQuestion && explanation.sub_answers[subId]) {
                    correctAnswersText.push(subQuestion.text.substring(0, 2)); // Lấy "a)", "b)", etc.
                }
            });
            
            return `
                <div class="answer-explanation">
                    <div class="explanation-header">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Giải thích đáp án chi tiết:</strong>
                    </div>
                    
                    <div class="correct-answer">
                        <i class="fas fa-check-circle"></i>
                        <span>Đáp án đúng: ${correctAnswersText.join(', ')} đúng</span>
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
                    
                    ${explanation.explanation.sub_explanations ? `
                        <div class="sub-explanations-section">
                            <div class="explanation-title">
                                <i class="fas fa-list"></i>
                                Giải thích từng ý:
                            </div>
                            ${Object.keys(explanation.explanation.sub_explanations).map(subId => {
                                const subExp = explanation.explanation.sub_explanations[subId];
                                const subQuestion = question.sub_questions.find(sub => sub.id === subId);
                                const statusIcon = subExp.correct ? 
                                    '<i class="fas fa-check-circle correct-icon"></i>' : 
                                    '<i class="fas fa-times-circle incorrect-icon"></i>';
                                
                                return `
                                    <div class="sub-explanation">
                                        <div class="sub-question-text">
                                            ${statusIcon}
                                            <strong>${subQuestion.text}</strong>
                                        </div>
                                        <div class="sub-explanation-reason">
                                            ${subExp.reason}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                    
                    ${explanation.explanation.application ? `
                        <div class="application-section">
                            <div class="explanation-title">
                                <i class="fas fa-cogs"></i>
                                Ứng dụng thực tiễn:
                            </div>
                            <div class="application-content">
                                ${explanation.explanation.application}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (question.answer_type) {
            // Câu điền đáp án
            let html = `
                <div class="answer-explanation">
                    <div class="explanation-header">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Giải thích đáp án chi tiết:</strong>
                    </div>
                    
                    <div class="correct-answer">
                        <i class="fas fa-check-circle"></i>
                        <span>Đáp án đúng: ${question.correct_answer}</span>
                    </div>
            `;
            
            // Hiển thị các bước giải nếu có (cấu trúc mới)
            if (explanation.cac_buoc_giai) {
                html += `
                    <div class="explanation-section">
                        <div class="explanation-title">
                            <i class="fas fa-list-ol"></i>
                            Các bước giải:
                        </div>
                        <div class="solution-steps">
                            ${explanation.cac_buoc_giai.map(step => 
                                `<div class="explanation-point">${step}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Hiển thị phân tích trường hợp nếu có (cấu trúc mới)
            if (explanation.phan_tich_truong_hop) {
                html += `
                    <div class="explanation-section">
                        <div class="explanation-title">
                            <i class="fas fa-sitemap"></i>
                            Phân tích trường hợp:
                        </div>
                        <div class="case-analysis">
                            ${explanation.phan_tich_truong_hop.map(caseItem => 
                                `<div class="explanation-point">${caseItem}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Hiển thị tính toán cuối nếu có (cấu trúc mới)
            if (explanation.tinh_toan_cuoi) {
                html += `
                    <div class="explanation-section">
                        <div class="explanation-title">
                            <i class="fas fa-calculator"></i>
                            Tính toán cuối:
                        </div>
                        <div class="final-calculation">
                            ${explanation.tinh_toan_cuoi.map(calculation => 
                                `<div class="explanation-point">${calculation}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Hiển thị điểm quan trọng nếu có (cấu trúc mới)
            if (explanation.diem_quan_trong) {
                html += `
                    <div class="explanation-section">
                        <div class="explanation-title">
                            <i class="fas fa-key"></i>
                            Điểm quan trọng:
                        </div>
                        <div class="key-insights">
                            ${explanation.diem_quan_trong.map(insight => 
                                `<div class="insight-point">${insight}</div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }
            
            // Fallback cho cấu trúc cũ nếu không có cấu trúc mới
            if (!explanation.cac_buoc_giai && explanation.explanation) {
                html += `
                    <div class="explanation-section">
                        <div class="explanation-title">
                            <i class="fas fa-search"></i>
                            Lí do:
                        </div>
                        <div class="explanation-content">
                            <div class="explanation-point">${explanation.explanation.reason}</div>
                `;
                
                // Hiển thị các bước giải nếu có (cấu trúc cũ)
                if (explanation.explanation.cac_buoc_giai) {
                    html += `
                        <div class="solution-steps">
                            ${explanation.explanation.cac_buoc_giai.map(step => 
                                `<div class="explanation-point">${step}</div>`
                            ).join('')}
                        </div>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            }
            
            html += `</div>`;
            return html;
        } else {
            // Câu trắc nghiệm thường
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
                    
                    ${explanation.explanation.wrongAnswers ? `
                        <div class="wrong-answers-section">
                            <div class="explanation-title">
                                <i class="fas fa-exclamation-triangle"></i>
                                Những đáp án còn lại thì sao?
                            </div>
                            ${explanation.explanation.wrongAnswers.map(wrong => 
                                `<div class="wrong-answer">• ${wrong}</div>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } else {
        // Chỉ hiển thị đáp án đúng nếu không có giải thích chi tiết
        const question = window.AppState.currentExam.questions[questionNumber - 1];
        
        if (question.sub_questions) {
            // Câu trắc nghiệm đúng/sai không có giải thích
            const correctSubs = question.sub_questions.filter(sub => sub.correct);
            const correctLabels = correctSubs.map(sub => sub.text.substring(0, 2));
            
            return `
                <div class="answer-explanation simple">
                    <div class="correct-answer">
                        <i class="fas fa-check-circle"></i>
                        <span>Đáp án đúng: ${correctLabels.join(', ')} đúng</span>
                    </div>
                    <div class="explanation-note">
                        <em>Giải thích chi tiết cho câu này đang được cập nhật...</em>
                    </div>
                </div>
            `;
        } else if (question.answer_type) {
            // Câu điền đáp án không có giải thích
            return `
                <div class="answer-explanation simple">
                    <div class="correct-answer">
                        <i class="fas fa-check-circle"></i>
                        <span>Đáp án đúng: ${question.correct_answer}</span>
                    </div>
                    <div class="explanation-note">
                        <em>Giải thích chi tiết cho câu này đang được cập nhật...</em>
                    </div>
                </div>
            `;
        } else {
            // Câu trắc nghiệm thường không có giải thích
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
}

// Helper function để chuyển đổi tên trường sang tiếng Việt
function getVietnameseLabel(key) {
    const labelMap = {
        'tap_so_le': 'Tập số lẻ',
        'tap_so_chan': 'Tập số chẵn',
        'tong_to_hop': 'Tổng số tổ hợp',
        'cac_cap_so_cong': 'Các cấp số cộng',
        'loai_bo': 'Loại bỏ',
        'to_hop_hop_le': 'Tổ hợp hợp lệ',
        'cach_sap_xep': 'Cách sắp xếp',
        'tong_cong': 'Tổng cộng',
        'tong_truong_hop_thuan_loi': 'Tổng trường hợp thuận lợi',
        'xac_suat': 'Xác suất',
        'dap_an': 'Đáp án'
    };
    return labelMap[key] || key;
}
