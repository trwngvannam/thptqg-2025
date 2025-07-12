// Generate dropdown items for specific subject
function generateDropdownItemsForSubject(subject) {
    const dropdownItems = document.getElementById('dropdown-items');
    
    // Clear existing items
    dropdownItems.innerHTML = '';
    
    // Check if examListData is loaded
    if (!window.AppState.examListData || Object.keys(window.AppState.examListData).length === 0) {
        console.warn('examListData chưa được tải hoặc rỗng');
        return;
    }
    
    // Filter exam codes based on subject and sort them
    const examCodes = Object.keys(window.AppState.examListData).filter(code => {
        const examInfo = window.AppState.examListData[code];
        if (subject === 'english') {
            return code.startsWith('11') || (examInfo.subject && examInfo.subject.toLowerCase().includes('tiếng anh'));
        } else if (subject === 'math') {
            return code.startsWith('01') || (examInfo.subject && examInfo.subject.toLowerCase().includes('toán'));
        }
        return false;
    }).sort();
    
    if (examCodes.length === 0) {
        dropdownItems.innerHTML = `
            <div class="no-exams-message">
                <div style="padding: 2rem; text-align: center; color: #666;">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <div>Chưa có đề thi nào cho môn này</div>
                    <small>Vui lòng chọn môn khác</small>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate dropdown items
    examCodes.forEach(code => {
        const examInfo = window.AppState.examListData[code];
        const dropdownItem = document.createElement('div');
        dropdownItem.className = 'dropdown-item';
        dropdownItem.setAttribute('data-code', code);
        dropdownItem.setAttribute('data-search', `${code} ${examInfo.title || ''}`);
        
        // Determine subject icon
        const subjectIcon = subject === 'english' ? 'fas fa-globe' : 'fas fa-calculator';
        
        dropdownItem.innerHTML = `
            <i class="${subjectIcon}"></i>
            <div class="dropdown-item-content">
                <div class="dropdown-item-code">Mã đề ${code}</div>
                <div class="dropdown-item-title">THPTQG 2025</div>
            </div>
        `;
        
        // Add click event listener
        dropdownItem.addEventListener('click', function() {
            const examCode = this.dataset.code;
            const examTitle = this.querySelector('.dropdown-item-code').textContent;
            
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
