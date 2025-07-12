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
    window.AppState.selectedExamCode = null;
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    checkStartButtonState();
    
    // Tự động mở dropdown để người dùng chọn mã đề mới (chỉ khi đã chọn subject)
    if (window.AppState.selectedSubject) {
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
}

// Quay về trang chủ
function goToHomePage() {
    const notification = document.getElementById('empty-exam-notification');
    if (notification) {
        notification.remove();
    }
    
    // Reset toàn bộ form
    window.AppState.selectedExamCode = null;
    window.AppState.selectedSubject = null;
    document.getElementById('selected-exam').textContent = 'Chọn mã đề thi';
    document.getElementById('student-name').value = '';
    document.getElementById('student-id').value = '';
    
    // Reset subject selection UI
    document.querySelectorAll('.subject-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Hide exam selector and exam info
    document.getElementById('exam-selector').style.display = 'none';
    document.getElementById('exam-info').style.display = 'none';
    
    checkStartButtonState();
    
    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}
