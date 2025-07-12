// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadExamListData();
    initializeApp();
});

// Khởi tạo ứng dụng
function initializeApp() {
    setupEventListeners();
    updateTimerDisplay();
}

// Setup event listeners
function setupEventListeners() {
    // Subject selection
    setupSubjectSelection();
    
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
    if (!document.hidden && window.AppState.examTimer && window.AppState.examStartTime) {
        // User quay lại tab, đồng bộ lại timer
        syncTimer();
    }
});
