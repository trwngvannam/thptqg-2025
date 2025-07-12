# JavaScript Module Structure

Dự án đã được tách thành nhiều module nhỏ để dễ quản lý và bảo trì. Mỗi file chứa 2-3 function có liên quan đến nhau.

## Cấu trúc các file:

### 1. `config.js` - Cấu hình và biến toàn cục
- `window.AppState`: Object chứa tất cả state của ứng dụng
- `window.DOMElements`: Object chứa references đến các DOM elements
- Khởi tạo DOM references khi page load

### 2. `data-loader.js` - Xử lý tải dữ liệu
- `loadExamListData()`: Tải danh sách đề thi
- `loadSpecificExamData()`: Tải dữ liệu đề thi cụ thể
- `loadExplanationsData()`: Tải giải thích đáp án

### 3. `timer.js` - Quản lý timer
- `syncTimer()`: Đồng bộ timer với thời gian thực
- `updateTimerDisplay()`: Cập nhật hiển thị thời gian
- `startTimer()`: Bắt đầu đếm thời gian

### 4. `ui-helpers.js` - Các helper functions cho UI
- `updateQuestionGrid()`: Cập nhật lưới câu hỏi
- `updateNavigationButtons()`: Cập nhật nút điều hướng
- `updateProgressBar()`: Cập nhật thanh tiến độ
- `previousQuestion()`, `nextQuestion()`: Điều hướng câu hỏi

### 5. `subject-manager.js` - Quản lý môn học
- `setupSubjectSelection()`: Setup chọn môn học
- `selectSubject()`: Chọn môn học
- `updateExamInfo()`: Cập nhật thông tin đề thi theo môn

### 6. `dropdown-manager.js` - Quản lý dropdown và search
- `generateDropdownItemsForSubject()`: Tạo dropdown items
- `setupExamSearch()`: Setup tìm kiếm
- `filterExamItems()`: Lọc các item trong dropdown
- `showAllExamItems()`, `showNoResultsMessage()`: Hiển thị kết quả

### 7. `question-manager.js` - Quản lý câu hỏi
- `createQuestionGrid()`: Tạo lưới câu hỏi
- `loadQuestion()`: Tải câu hỏi
- `selectAnswer()`: Chọn đáp án

### 8. `exam-manager.js` - Quản lý bài thi
- `startExam()`: Bắt đầu làm bài
- `submitExam()`: Nộp bài thi
- `calculateResults()`: Tính toán kết quả

### 9. `results-manager.js` - Quản lý kết quả
- `displayResults()`: Hiển thị kết quả
- `showResultsInExamScreen()`: Hiển thị kết quả trong màn hình thi
- `generateExplanationHTML()`: Tạo HTML giải thích đáp án

### 10. `exam-controls.js` - Các chức năng điều khiển
- `restartExam()`: Khởi động lại hoàn toàn
- `newExam()`: Chọn đề mới
- `toggleFlag()`: Đánh dấu câu hỏi

### 11. `utils.js` - Các utility functions
- `selectExamCode()`: Chọn mã đề
- `checkStartButtonState()`: Kiểm tra trạng thái nút bắt đầu
- `restartCurrentExam()`: Làm lại đề hiện tại

### 12. `notifications.js` - Xử lý thông báo
- `showEmptyExamNotification()`: Hiển thị thông báo đề trống
- `closeEmptyExamNotification()`: Đóng thông báo
- `goToHomePage()`: Quay về trang chủ

### 13. `event-handlers.js` - Xử lý events và khởi tạo
- `initializeApp()`: Khởi tạo ứng dụng
- `setupEventListeners()`: Setup các event listeners
- Global event handlers (home button, visibility change)

### 14. `main.js` - File chính
- File này đảm bảo tất cả modules được load đúng thứ tự

## Thứ tự load các file:

Các file được load theo thứ tự trong `index.html`:
1. config.js (biến toàn cục)
2. data-loader.js (functions async)
3. timer.js (timer functions)
4. ui-helpers.js (UI helpers)
5. subject-manager.js & dropdown-manager.js (quản lý UI)
6. question-manager.js & exam-manager.js (logic chính)
7. results-manager.js (kết quả)
8. exam-controls.js (điều khiển)
9. utils.js (utilities)
10. notifications.js (thông báo)
11. event-handlers.js (khởi tạo)
12. main.js (file chính)

## Lợi ích của cấu trúc mới:

1. **Dễ bảo trì**: Mỗi file chứa ít functions, dễ tìm và sửa
2. **Tái sử dụng**: Các functions có thể được tái sử dụng dễ dàng
3. **Debug dễ dàng**: Dễ xác định file chứa bug
4. **Phát triển song song**: Nhiều người có thể làm việc trên các file khác nhau
5. **Loading tối ưu**: Có thể lazy load hoặc bundle theo nhu cầu
6. **Đọc code dễ hơn**: Logic được phân chia rõ ràng theo chức năng
