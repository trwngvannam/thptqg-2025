// Dữ liệu đề thi sẽ được load từ file JSON
let examListData = {}; // Metadata của tất cả các đề
let currentExamData = null; // Dữ liệu chi tiết của đề đang làm

// Application state
let currentExam = null;
let currentQuestionIndex = 0;
let userAnswers = {};
let flaggedQuestions = {}; // Theo dõi các câu hỏi được đánh dấu
let examStartTime = null;
let examTimer = null;
let timeRemaining = 50 * 60; // 50 phút như đề thi thật
let selectedExamCode = null;
let examSubmitted = false; // Theo dõi trạng thái đã nộp bài
let timeUpAlertShown = false; // Theo dõi đã hiển thị alert hết giờ chưa

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const examScreen = document.getElementById('exam-screen');
const resultScreen = document.getElementById('result-screen');
const timer = document.getElementById('timer');
const timeDisplay = document.getElementById('time-display');

// Load exam list metadata from JSON file
async function loadExamListData() {
    try {
        const response = await fetch('exam_list.json');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đề thi');
        }
        const data = await response.json();
        examListData = data.exams;
    } catch (error) {
        console.error('Lỗi khi tải danh sách đề thi:', error);
        alert('Không thể tải danh sách đề thi. Vui lòng kiểm tra kết nối mạng.');
    }
}

// Load specific exam data (lazy loading)
async function loadSpecificExamData(examCode) {
    try {
        const response = await fetch(`data/${examCode}.json`);
        if (!response.ok) {
            throw new Error(`Không thể tải dữ liệu đề thi ${examCode}`);
        }
        const examData = await response.json();
        
        // Kiểm tra xem đề thi có nội dung không (ít nhất 10 câu)
        if (!examData.questions || examData.questions.length < 10) {
            return { isEmpty: true, code: examCode };
        }
        
        return examData;
    } catch (error) {
        console.error(`Lỗi khi tải dữ liệu đề thi ${examCode}:`, error);
        return { isEmpty: true, code: examCode };
    }
}

// Load explanations data for specific exam (lazy loading)
async function loadExplanationsData(examCode) {
    try {
        const response = await fetch(`explanations/${examCode}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const explanations = await response.json();
        
        // Initialize global explanationsData if not exist
        if (!window.explanationsData) {
            window.explanationsData = {};
        }
        
        // Store explanations for this exam code
        window.explanationsData[examCode] = explanations;
        return explanations;
    } catch (error) {
        console.error(`Lỗi khi tải giải thích đáp án cho mã đề ${examCode}:`, error);
        // Initialize empty explanations for this exam code
        if (!window.explanationsData) {
            window.explanationsData = {};
        }
        window.explanationsData[examCode] = {};
        return {};
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadExamListData();
    // Note: Explanations will be loaded lazily when exam is selected
    initializeApp();
});

// Global event delegation for home button và các elements khác
document.addEventListener('click', function(e) {
    // Xử lý home button
    if (e.target.matches('.home-btn') || e.target.closest('.home-btn')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Home button clicked - scrolling to top'); 
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }
});

// Đồng bộ timer khi user quay lại tab
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && examTimer && examStartTime) {
        // User quay lại tab, đồng bộ lại timer
        syncTimer();
    }
});

// Function để đồng bộ timer với thời gian thực
function syncTimer() {
    if (!examStartTime || examSubmitted) return;
    
    const examDuration = 50 * 60 * 1000; // 50 phút
    const examEndTime = new Date(examStartTime.getTime() + examDuration);
    const now = new Date();
    const remainingMs = examEndTime - now;
    
    if (remainingMs <= 0) {
        // Hết giờ rồi
        timeRemaining = 0;
        updateTimerDisplay();
        if (!examSubmitted && !timeUpAlertShown) {
            // Chỉ hiện alert một lần và nộp bài
            timeUpAlertShown = true;
            alert('Hết giờ làm bài! Bài thi sẽ được nộp tự động.');
            submitExam();
        }
    } else {
        // Cập nhật thời gian còn lại
        timeRemaining = Math.ceil(remainingMs / 1000);
        updateTimerDisplay();
        
        // Warning when 10 minutes left
        if (timeRemaining <= 600) {
            timer.classList.add('warning');
        }
    }
}

function initializeApp() {
    setupEventListeners();
    updateTimerDisplay();
    generateDropdownItems(); // Generate dropdown items dynamically
}

function setupEventListeners() {
    // Dropdown functionality
    const dropdownHeader = document.getElementById('dropdown-header');
    const dropdownList = document.getElementById('dropdown-list');
    
    // Toggle dropdown
    dropdownHeader.addEventListener('click', function() {
        dropdownList.classList.toggle('open');
        dropdownHeader.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const examDropdown = e.target.closest('.exam-dropdown');
        const searchInput = e.target.closest('.dropdown-search');
        
        // Don't close if clicking inside dropdown or on search input
        if (!examDropdown || searchInput) {
            if (!examDropdown) {
                dropdownList.classList.remove('open');
                dropdownHeader.classList.remove('active');
            }
        }
    });
    
    // Note: Dropdown item listeners are added dynamically in generateDropdownItems()
    
    // Start exam button
    document.getElementById('start-exam').addEventListener('click', startExam);
    
    // Navigation buttons
    document.getElementById('prev-btn').addEventListener('click', previousQuestion);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    
    // Submit exam button
    document.getElementById('submit-exam').addEventListener('click', submitExam);
    
    // Restart exam button
    document.getElementById('restart-exam').addEventListener('click', restartExam);
    
    // New exam button
    document.getElementById('new-exam').addEventListener('click', newExam);
    
    // Student name input
    document.getElementById('student-name').addEventListener('input', checkStartButtonState);
}

// Hàm cập nhật hiển thị thời gian còn lại
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Hàm chọn mã đề thi
function selectExamCode(code) {
    selectedExamCode = code;
    
    // Enable start button if name is provided
    checkStartButtonState();
}

// Hàm kiểm tra trạng thái nút bắt đầu
function checkStartButtonState() {
    const startBtn = document.getElementById('start-exam');
    const studentName = document.getElementById('student-name').value.trim();
    
    if (selectedExamCode && studentName) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Hàm bắt đầu làm bài thi
async function startExam() {
    const studentName = document.getElementById('student-name').value.trim();
    const studentId = document.getElementById('student-id').value.trim();
    
    if (!selectedExamCode || !studentName) {
        alert('Vui lòng chọn mã đề và nhập họ tên!');
        return;
    }
    
    // Show loading message
    document.getElementById('selected-exam').textContent = 'Đang tải đề thi...';
    
    // Load specific exam data
    const examData = await loadSpecificExamData(selectedExamCode);
    
    // Xử lý trường hợp đề thi chưa có nội dung
    if (!examData || examData.isEmpty) {
        document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
        showEmptyExamNotification(selectedExamCode);
        return;
    }
    
    // Load explanations for this exam code (lazy loading)
    await loadExplanationsData(selectedExamCode);
    
    // Initialize exam
    currentExam = examData;
    currentQuestionIndex = 0;
    userAnswers = {};
    examStartTime = new Date();
    examSubmitted = false; // Reset trạng thái nộp bài
    timeUpAlertShown = false; // Reset trạng thái alert hết giờ
    
    // Update UI
    document.getElementById('exam-code-display').textContent = `Mã đề: ${selectedExamCode}`;
    document.getElementById('student-name-display').textContent = studentName;
    
    // Show exam screen
    welcomeScreen.style.display = 'none';
    examScreen.style.display = 'block';
    timer.style.display = 'flex';
    
    // Initialize exam interface
    createQuestionGrid();
    loadQuestion(0);
    startTimer();
}

// Hàm tạo lưới câu hỏi
function createQuestionGrid() {
    const questionGrid = document.getElementById('question-grid');
    questionGrid.innerHTML = '';
    
    for (let i = 0; i < currentExam.questions.length; i++) {
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
    currentQuestionIndex = index;
    const question = currentExam.questions[index];
    
    // Update question content
    const totalQuestions = currentExam.total_questions || currentExam.questions.length;
    const isFlagged = flaggedQuestions[index] || false;
    
    // Cập nhật header với số câu và nút đánh dấu
    document.getElementById('question-number').innerHTML = `
        <div class="question-header-content">
            <span class="question-text">Câu ${index + 1}/${totalQuestions}</span>
            <button class="flag-btn ${isFlagged ? 'flagged' : ''}" 
                    onclick="toggleFlag(${index})" 
                    title="${isFlagged ? 'Bỏ đánh dấu' : 'Đánh dấu câu hỏi'}"
                    ${examSubmitted ? 'disabled' : ''}>
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
            <div class="options">
                ${question.options.map((option, i) => {
                    const isSelected = userAnswers[index] === i;
                    const isCorrect = question.correct === i;
                    const isWrong = examSubmitted && isSelected && !isCorrect;
                    
                    let optionClass = 'option';
                    if (isSelected) optionClass += ' selected';
                    if (examSubmitted && isCorrect) optionClass += ' correct';
                    if (examSubmitted && isWrong) optionClass += ' wrong';
                    
                    return `
                        <div class="${optionClass}" onclick="${!examSubmitted ? `selectAnswer(${index}, ${i})` : ''}">
                            <input type="radio" name="question-${index}" value="${i}" ${isSelected ? 'checked' : ''} ${examSubmitted ? 'disabled' : ''}>
                            <span class="option-text">${option}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // Thêm giải thích đáp án nếu đã nộp bài
    if (examSubmitted) {
        questionHTML += generateExplanationHTML(index + 1);
    }
    
    document.getElementById('question-content').innerHTML = questionHTML;
    
    // Update question grid
    updateQuestionGrid();
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update progress bar
    updateProgressBar();
}

// Hàm tạo HTML giải thích đáp án
function generateExplanationHTML(questionNumber) {
    // Kiểm tra xem có giải thích cho câu hỏi này không
    if (window.explanationsData && 
        window.explanationsData[selectedExamCode] && 
        window.explanationsData[selectedExamCode][questionNumber]) {
        
        const explanation = window.explanationsData[selectedExamCode][questionNumber];
        
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
        const question = currentExam.questions[questionNumber - 1];
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

// Hàm chọn đáp án cho câu hỏi
function selectAnswer(questionIndex, answerIndex) {
    if (examSubmitted) return; // Không cho phép chọn sau khi nộp bài
    
    userAnswers[questionIndex] = answerIndex;
    
    // Update UI
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected');
    });
    
    event.currentTarget.classList.add('selected');
    event.currentTarget.querySelector('input').checked = true;
    
    // Update question grid
    updateQuestionGrid();
}

// Hàm cập nhật lưới câu hỏi
function updateQuestionGrid() {
    const questionGrid = document.getElementById('question-grid');
    
    Array.from(questionGrid.children).forEach((btn, index) => {
        btn.classList.remove('current', 'answered', 'correct', 'wrong', 'flagged');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        if (userAnswers.hasOwnProperty(index)) {
            btn.classList.add('answered');
            
            // Sau khi nộp bài, hiển thị câu đúng/sai
            if (examSubmitted) {
                const isCorrect = userAnswers[index] === currentExam.questions[index].correct;
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        }
        
        // Thêm class flagged cho câu đã đánh dấu
        if (flaggedQuestions[index]) {
            btn.classList.add('flagged');
        }
    });
}

// Hàm cập nhật nút điều hướng trước/sau
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentExam.questions.length - 1;
}

// Hàm cập nhật thanh tiến độ
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / currentExam.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Hàm quay lại câu hỏi trước
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        loadQuestion(currentQuestionIndex - 1);
    }
}

// Hàm chuyển đến câu hỏi tiếp theo
function nextQuestion() {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
        loadQuestion(currentQuestionIndex + 1);
    }
}

// Hàm bắt đầu đếm thời gian làm bài
function startTimer() {
    // Lưu thời gian bắt đầu làm bài (đã có examStartTime)
    const examDuration = 50 * 60 * 1000; // 50 phút tính bằng milliseconds
    const examEndTime = new Date(examStartTime.getTime() + examDuration);
    
    // Đồng bộ lần đầu
    syncTimer();
    
    examTimer = setInterval(() => {
        // Sử dụng syncTimer để đảm bảo tính chính xác
        syncTimer();
        
        // Nếu đã nộp bài hoặc hết giờ, dừng timer
        if (examSubmitted || timeRemaining <= 0) {
            clearInterval(examTimer);
            examTimer = null;
        }
    }, 1000);
}

// Hàm nộp bài thi
function submitExam() {
    // Nếu vẫn còn timer (người dùng tự nộp), hỏi xác nhận
    if (examTimer && timeRemaining > 0) {
        // Tính số câu đã làm và chưa làm
        const totalQuestions = currentExam.questions.length;
        const answeredQuestions = Object.keys(userAnswers).length;
        const unansweredQuestions = totalQuestions - answeredQuestions;
        const flaggedCount = Object.keys(flaggedQuestions).filter(key => flaggedQuestions[key]).length;
        
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
            clearInterval(examTimer);
            examSubmitted = true;
            calculateResults();
        }
    } else {
        // Hết giờ hoặc timer đã dừng, nộp tự động không cần xác nhận
        if (examTimer) {
            clearInterval(examTimer);
        }
        examSubmitted = true;
        calculateResults();
    }
}

// Hàm tính toán kết quả bài thi
function calculateResults() {
    const totalQuestions = currentExam.questions.length;
    let correctAnswers = 0;
    
    // Calculate correct answers
    currentExam.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correctAnswers++;
        }
    });
    
    const score = (correctAnswers / totalQuestions) * 10;
    const examEndTime = new Date();
    const timeTakenMs = examEndTime - examStartTime;
    
    // Chuyển đổi milliseconds thành phút và giây
    const timeTakenSeconds = Math.floor(timeTakenMs / 1000);
    const minutes = Math.floor(timeTakenSeconds / 60);
    const seconds = timeTakenSeconds % 60;
    
    // Reload current question để hiển thị đáp án và giải thích
    loadQuestion(currentQuestionIndex);
    
    // Display results
    displayResults(correctAnswers, totalQuestions, score, minutes, seconds);
}

// Hàm hiển thị kết quả bài thi
function displayResults(correct, total, score, minutes, seconds) {
    // Hiển thị kết quả trong exam screen thay vì chuyển màn hình
    showResultsInExamScreen(correct, total, score, minutes, seconds);
    
    // Ẩn timer và nút submit
    timer.style.display = 'none';
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
    const answeredQuestions = Object.keys(userAnswers).length;
    const unansweredQuestions = total - answeredQuestions;
    const flaggedCount = Object.keys(flaggedQuestions).filter(key => flaggedQuestions[key]).length;
    
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
                    <span class="value">${selectedExamCode}</span>
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
}

// Hàm khởi động lại bài thi
function restartExam() {
    // Reset all variables
    currentExam = null;
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions = {}; // Reset các câu đã đánh dấu
    examStartTime = null;
    timeRemaining = 50 * 60; // Reset về 50 phút
    selectedExamCode = null;
    examSubmitted = false; // Reset trạng thái nộp bài
    timeUpAlertShown = false; // Reset trạng thái alert hết giờ
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
    
    // Reset dropdown selection
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('dropdown-list').classList.remove('open');
    document.getElementById('dropdown-header').classList.remove('active');
    
    // Reset timer display
    timer.classList.remove('warning');
    updateTimerDisplay();
    
    // Remove result banner if exists
    const resultBanner = document.getElementById('result-banner');
    if (resultBanner) {
        resultBanner.remove();
    }
    
    // Show submit button again
    const submitBtn = document.getElementById('submit-exam');
    if (submitBtn) {
        submitBtn.style.display = 'block';
    }
    
    // Show welcome screen
    examScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    timer.style.display = 'none';
    
    // Reset any inline styles that might affect positioning
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Scroll to top to center the welcome screen
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
    
    // Check start button state
    checkStartButtonState();
}

// Hàm chọn đề mới
function newExam() {
    // Reset all variables except keeping student info
    currentExam = null;
    currentQuestionIndex = 0;
    userAnswers = {};
    examStartTime = null;
    timeRemaining = 50 * 60; // Reset về 50 phút
    selectedExamCode = null;
    examSubmitted = false; // Reset trạng thái nộp bài
    timeUpAlertShown = false; // Reset trạng thái alert hết giờ
    
    // Keep student name but clear exam selection
    // (Giữ lại tên thí sinh để tiện chọn đề mới)
    
    // Reset dropdown selection
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('dropdown-list').classList.remove('open');
    document.getElementById('dropdown-header').classList.remove('active');
    
    // Reset timer display
    timer.classList.remove('warning');
    updateTimerDisplay();
    
    // Remove result banner if exists
    const resultBanner = document.getElementById('result-banner');
    if (resultBanner) {
        resultBanner.remove();
    }
    
    // Show submit button again
    const submitBtn = document.getElementById('submit-exam');
    if (submitBtn) {
        submitBtn.style.display = 'block';
    }
    
    // Show welcome screen
    resultScreen.style.display = 'none';
    examScreen.style.display = 'none';
    welcomeScreen.style.display = 'block';
    timer.style.display = 'none';
    
    // Reset any inline styles that might affect positioning
    document.body.style.overflow = '';
    document.body.style.position = '';
    
    // Scroll to top to center the welcome screen
    setTimeout(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, 100);
    
    // Check start button state
    checkStartButtonState();
}

// Hàm khởi động lại đề thi hiện tại
function restartCurrentExam() {
    if (!currentExam) return;
    
    // Confirm với user trước khi restart
    if (!confirm("Bạn có chắc chắn muốn làm lại đề này? Tất cả đáp án hiện tại sẽ bị xóa.")) {
        return;
    }
    
    // Reset hoàn toàn tất cả variables
    currentQuestionIndex = 0;
    userAnswers = {};
    flaggedQuestions = {}; // Reset các câu đã đánh dấu
    examStartTime = new Date(); // Set thời gian bắt đầu mới
    timeRemaining = 50 * 60; // Reset về 50 phút (cố định như đề thi thật)
    examSubmitted = false;
    timeUpAlertShown = false; // Reset trạng thái alert hết giờ
    
    // Stop timer hiện tại nếu có
    if (examTimer) {
        clearInterval(examTimer);
        examTimer = null;
    }
    
    // Reset timer display và remove warning class
    timer.classList.remove('warning');
    timer.style.display = 'block';
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
    
    // Load câu hỏi đầu tiên (sẽ tự động clear UI vì userAnswers = {})
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

// Generate dropdown items dynamically from exam data
function generateDropdownItems() {
    const dropdownItems = document.getElementById('dropdown-items');
    
    // Clear existing items (nếu có)
    dropdownItems.innerHTML = '';
    
    // Check if examListData is loaded
    if (!examListData || Object.keys(examListData).length === 0) {
        console.warn('examListData chưa được tải hoặc rỗng');
        return;
    }
    
    // Get exam codes from examListData and sort them
    const examCodes = Object.keys(examListData).sort();
    
    // Generate dropdown items
    examCodes.forEach(code => {
        const examInfo = examListData[code];
        const dropdownItem = document.createElement('div');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.setAttribute('data-code', code);
        dropdownItem.setAttribute('data-search', `${code} ${examInfo.title || ''}`);
        
        dropdownItem.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div>
                <span>Mã đề ${code}</span>
                <small>${examInfo.title || 'ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025'}</small>
            </div>
        `;
        
        // Add click event listener
        dropdownItem.addEventListener('click', function() {
            const examCode = this.dataset.code;
            const examTitle = this.querySelector('span').textContent;
            
            // Update selected exam display
            document.getElementById('selected-exam').textContent = examTitle;
            
            // Close dropdown
            document.getElementById('dropdown-list').classList.remove('open');
            document.getElementById('dropdown-header').classList.remove('active');
            
            // Clear search input
            document.getElementById('exam-search').value = '';
            showAllExamItems();
            
            // Select exam code
            selectExamCode(examCode);
        });
        
        dropdownItems.appendChild(dropdownItem);
    });
    
    // Setup search functionality
    setupExamSearch();
}

// Function to setup search functionality
function setupExamSearch() {
    const searchInput = document.getElementById('exam-search');
    const dropdownItems = document.getElementById('dropdown-items');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterExamItems(searchTerm);
    });
    
    // Prevent dropdown from closing when clicking on search input
    searchInput.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Clear search when dropdown is opened
    document.getElementById('dropdown-header').addEventListener('click', function() {
        if (!document.getElementById('dropdown-list').classList.contains('open')) {
            searchInput.value = '';
            showAllExamItems();
        }
    });
}

// Function to filter exam items based on search term
function filterExamItems(searchTerm) {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    let visibleCount = 0;
    
    dropdownItems.forEach(item => {
        const searchData = item.getAttribute('data-search').toLowerCase();
        const examCode = item.getAttribute('data-code');
        
        // Check if search term matches exam code or title
        const isMatch = searchTerm === '' || 
                       examCode.includes(searchTerm) || 
                       searchData.includes(searchTerm);
        
        if (isMatch) {
            item.style.display = 'flex';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show "no results" message if no items match
    showNoResultsMessage(visibleCount === 0 && searchTerm !== '');
}

// Function to show all exam items
function showAllExamItems() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.style.display = 'flex';
    });
    showNoResultsMessage(false);
}

// Function to show/hide "no results" message
function showNoResultsMessage(show) {
    const dropdownItems = document.getElementById('dropdown-items');
    let noResultsMessage = dropdownItems.querySelector('.no-results-message');
    
    if (show && !noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #666;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <div>Không tìm thấy mã đề phù hợp</div>
                <small>Thử tìm kiếm với từ khóa khác</small>
            </div>
        `;
        dropdownItems.appendChild(noResultsMessage);
    } else if (!show && noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Hiển thị thông báo khi đề thi chưa có nội dung
function showEmptyExamNotification(examCode) {
    const notificationHTML = `
        <div id="empty-exam-notification" class="empty-exam-notification">
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <h3>Mã đề ${examCode}</h3>
                <p class="notification-message">
                    Nội dung mã đề này sẽ sớm được cập nhật.<br>
                    Vui lòng chọn mã đề khác hoặc quay lại sau.
                </p>
                <div class="notification-buttons">
                    <button onclick="closeEmptyExamNotification()" class="btn-select-other">
                        <i class="fas fa-list"></i> Chọn mã đề khác
                    </button>
                    <button onclick="goToHomePage()" class="btn-home">
                        <i class="fas fa-home"></i> Về trang chủ
                    </button>
                </div>
            </div>
            <div class="notification-overlay" onclick="closeEmptyExamNotification()"></div>
        </div>
    `;
    
    // Thêm notification vào body
    document.body.insertAdjacentHTML('beforeend', notificationHTML);
    
    // Show notification with animation
    setTimeout(() => {
        const notification = document.getElementById('empty-exam-notification');
        if (notification) {
            notification.classList.add('show');
        }
    }, 100);
}

// Đóng thông báo và cho phép chọn mã đề khác
function closeEmptyExamNotification() {
    const notification = document.getElementById('empty-exam-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Reset selected exam code
    selectedExamCode = null;
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    checkStartButtonState();
    
    // Tự động mở dropdown để người dùng chọn mã đề mới
    setTimeout(() => {
        const dropdownHeader = document.getElementById('dropdown-header');
        const dropdownList = document.getElementById('dropdown-list');
        
        if (dropdownHeader && dropdownList) {
            dropdownList.classList.add('open');
            dropdownHeader.classList.add('active');
            
            // Focus vào ô tìm kiếm nếu có
            const searchInput = document.getElementById('exam-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }, 400); // Delay để đảm bảo notification đã ẩn
}

// Quay về trang chủ
function goToHomePage() {
    const notification = document.getElementById('empty-exam-notification');
    if (notification) {
        notification.remove();
    }
    
    // Reset toàn bộ form
    selectedExamCode = null;
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
    checkStartButtonState();
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Function để đánh dấu/bỏ đánh dấu câu hỏi
function toggleFlag(questionIndex) {
    if (examSubmitted) return; // Không cho phép đánh dấu sau khi nộp bài
    
    // Toggle flag status
    flaggedQuestions[questionIndex] = !flaggedQuestions[questionIndex];
    
    // Update flag button
    const flagBtn = document.querySelector('.flag-btn');
    const flagText = flagBtn.querySelector('.flag-text');
    
    if (flaggedQuestions[questionIndex]) {
        flagBtn.classList.add('flagged');
        flagBtn.title = 'Bỏ đánh dấu';
        if (flagText) flagText.textContent = 'Đã đánh dấu';
    } else {
        flagBtn.classList.remove('flagged');
        flagBtn.title = 'Đánh dấu câu hỏi';
        if (flagText) flagText.textContent = 'Đánh dấu';
    }
    
    // Update question grid to show flagged questions
    updateQuestionGrid();
}

// Function để chuyển đến câu hỏi đã đánh dấu tiếp theo
function goToNextFlaggedQuestion() {
    const flaggedIndexes = Object.keys(flaggedQuestions)
        .map(Number)
        .filter(index => flaggedQuestions[index])
        .sort((a, b) => a - b);
    
    if (flaggedIndexes.length === 0) {
        alert('Không có câu hỏi nào được đánh dấu!');
        return;
    }
    
    // Tìm câu đánh dấu tiếp theo sau câu hiện tại
    const nextFlagged = flaggedIndexes.find(index => index > currentQuestionIndex);
    
    if (nextFlagged !== undefined) {
        loadQuestion(nextFlagged);
    } else {
        // Nếu không có câu nào sau, quay về câu đánh dấu đầu tiên
        loadQuestion(flaggedIndexes[0]);
    }
}


