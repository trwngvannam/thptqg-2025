// Application state và biến toàn cục
window.AppState = {
    // Data
    examListData: {},
    currentExamData: null,
    
    // Exam state
    currentExam: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    flaggedQuestions: {},
    
    // Timer state
    examStartTime: null,
    examTimer: null,
    timeRemaining: 50 * 60, // 50 phút mặc định
    
    // UI state
    selectedExamCode: null,
    selectedSubject: null,
    examSubmitted: false,
    timeUpAlertShown: false
};

// DOM elements references
window.DOMElements = {
    welcomeScreen: null,
    examScreen: null,
    resultScreen: null,
    timer: null,
    timeDisplay: null
};

// Initialize DOM references when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.DOMElements.welcomeScreen = document.getElementById('welcome-screen');
    window.DOMElements.examScreen = document.getElementById('exam-screen');
    window.DOMElements.resultScreen = document.getElementById('result-screen');
    window.DOMElements.timer = document.getElementById('timer');
    window.DOMElements.timeDisplay = document.getElementById('time-display');
});
