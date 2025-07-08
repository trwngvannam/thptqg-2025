# Trang Web Thi Tiếng Anh THPTQG Online

## Mô tả
Đây là một trang web thi Tiếng Anh THPTQG trực tuyến với giao diện hiện đại và đầy đủ tính năng.

## Tính năng chính

### 🎯 Chọn mã đề thi
- Hỗ trợ 48 mã đề: từ 1101 đến 1148 (tự động tạo từ dữ liệu JSON)
- Giao diện chọn đề trực quan và dễ sử dụng với thanh cuộn
- Tự động tải câu hỏi theo mã đề được chọn
- Dropdown được tạo động từ dữ liệu, dễ mở rộng

### ⏰ Đồng hồ đếm ngược
- Thời gian làm bài: 50 phút (như đề thi thật)
- Hiển thị thời gian còn lại ở góc phải trên
- Cảnh báo khi còn 10 phút (đổi màu đỏ và nhấp nháy)
- Tự động nộp bài khi hết giờ

### 📝 Làm bài trực tuyến
- Câu hỏi thực tế trích xuất từ đề thi THPTQG 2025
- Các dạng câu hỏi: Reading comprehension, vocabulary, grammar, sentence arrangement
- Hiển thị đoạn văn và context một cách rõ ràng
- Điều hướng dễ dàng giữa các câu hỏi
- Lưu đáp án tự động
- Hiển thị trạng thái đã làm/chưa làm

### 🎨 Giao diện đẹp mắt
- Thiết kế hiện đại, responsive
- Gradient màu sắc bắt mắt
- Animation mượt mà
- Hỗ trợ mobile và tablet

### 📊 Chấm điểm và thống kê
- Tự động chấm điểm sau khi nộp bài
- Hiển thị số câu đúng/sai
- Tính điểm theo thang 10
- Thống kê thời gian làm bài

## 🎯 **Tối ưu hóa dữ liệu và hiệu năng**

### **Kiến trúc dữ liệu mới (Lazy Loading):**
- ✅ **Tách dữ liệu**: Mỗi mã đề một file riêng (`data/1101.json`, `data/1102.json`, ...)
- ✅ **Metadata riêng**: File `exam_list.json` chứa thông tin cơ bản của 48 mã đề
- ✅ **Lazy Loading**: Chỉ tải dữ liệu đề thi khi người dùng chọn mã đề cụ thể
- ✅ **Hiệu năng cao**: Trang tải nhanh hơn, chỉ download khi cần thiết
- ✅ **Dễ mở rộng**: Thêm mã đề mới chỉ cần tạo file JSON tương ứng

### **Cách thức hoạt động:**
```javascript
// 1. Load metadata của tất cả đề thi
async function loadExamListData() {
    const response = await fetch('exam_list.json');
    examListData = await response.json();
}

// 2. Tạo dropdown động từ metadata
function generateDropdownItems() {
    const examCodes = Object.keys(examListData).sort();
    // Tạo dropdown items từ examListData
}

// 3. Load dữ liệu chi tiết khi chọn đề (lazy loading)
async function loadSpecificExamData(examCode) {
    const response = await fetch(`data/${examCode}.json`);
    return await response.json();
}
```

## 🎯 **Dropdown tự động và tối ưu UI**

Thay vì hardcode 48 mã đề trong HTML, hệ thống sử dụng JavaScript để tạo dropdown động:

### **JavaScript Dynamic Generation:**
- ✅ **Tự động tạo dropdown**: Từ dữ liệu `exam_list.json`
- ✅ **Code gọn gàng**: Loại bỏ 300+ dòng HTML lặp lại
- ✅ **Dễ mở rộng**: Chỉ cần thêm mã đề vào JSON là dropdown tự cập nhật
- ✅ **Sắp xếp tự động**: Các mã đề được sắp xếp theo thứ tự tăng dần
- ✅ **UI tối ưu**: Dropdown có thanh cuộn, max-height để không chiếm quá nhiều màn hình

### **Cấu trúc dữ liệu exam_list.json:**
```json
{
  "exams": {
    "1101": {
      "title": "ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề 1101",
      "file": "data/1101.json"
    },
    "1102": {
      "title": "ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề 1102", 
      "file": "data/1102.json"
    }
    // ... 46 mã đề khác
  }
}
```

### **Cấu trúc dữ liệu từng mã đề (data/1101.json):**
```json
{
  "title": "ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề 1101",
  "subject": "TIẾNG ANH",
  "time_limit": 50,
  "total_questions": 50,
  "questions": [
    {
      "id": 1,
      "instruction": "Read the following passage and mark the letter A, B, C or D...",
      "passage": "All holidays involve some element of risk...",
      "text": "Question 1.",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": 3
    }
    // ... 49 câu hỏi khác
  ]
}
```

### **Mã đề 1101 - Nội dung chi tiết:**

**📖 Phần 1: Reading Comprehension (Câu 1-5)**
- **Instruction**: "Read the following passage and mark the letter A, B, C or D on your answer sheet to indicate the option that best fits each of the numbered blanks from 1 to 5."
- **Passage**: Đoạn văn về Tourism và Risk Management
- **Yêu cầu**: Điền từ/cụm từ vào chỗ trống (1) đến (5)

**📖 Phần 2: Reading Comprehension (Câu 6-13)**  
- **Instruction**: "Read the passage and mark the letter A, B, C or D on your answer sheet to indicate the best answer to each of the following questions from 6 to 13."
- **Passage**: Đoạn văn về Project Farming và Modern Technology
- **Yêu cầu**: Trả lời câu hỏi về nội dung đoạn văn

**🔄 Phần 3: Sentence Arrangement (Câu 14-18)**
- **Instruction**: "Mark the letter A, B, C or D on your answer sheet to indicate the best arrangement of utterances or sentences to make a cohesive and coherent exchange or text..."
- **Context**: Các câu cần sắp xếp về Urban Development
- **Yêu cầu**: Sắp xếp thành đoạn văn logic

### **Tính năng hiển thị nâng cao:**
- 🎨 **Instruction box**: Nền xanh dương, rõ ràng hướng dẫn
- 📖 **Passage box**: Nền xám nhạt, dễ đọc với font size lớn hơn
- 📝 **Context box**: Nền vàng nhạt cho câu sắp xếp
- ✨ **Responsive**: Tự động điều chỉnh trên mọi thiết bị

## 📚 **Cấu trúc dữ liệu giải thích đáp án**

Trang web sử dụng file `explanations.json` để lưu trữ giải thích chi tiết cho từng câu hỏi:

### **Cấu trúc file explanations.json:**
```json
{
  "1105": {
    "1": {
      "question": "Question 1:",
      "options": ["A. whose", "B. whom", "C. who", "D. which"],
      "correct": "D. which",
      "explanation": {
        "reason": "Lý do chính...",
        "points": ["Điểm 1", "Điểm 2"],
        "wrongAnswers": ["Giải thích A sai vì...", "Giải thích B sai vì..."]
      }
    }
  }
}
```

### **Tính năng giải thích đáp án:**
- ✅ **Hiển thị sau khi nộp bài**: Giải thích chi tiết xuất hiện ngay dưới mỗi câu hỏi
- ✅ **Đáp án đúng**: Hiển thị rõ ràng đáp án chính xác
- ✅ **Lý do**: Giải thích tại sao đáp án này đúng
- ✅ **Phân tích các đáp án sai**: Giải thích tại sao các đáp án còn lại không phù hợp
- ✅ **Dễ mở rộng**: Có thể thêm giải thích cho tất cả các mã đề

## Cấu trúc file

```
THPTQG/
├── index.html          # File HTML chính
├── styles.css          # File CSS cho giao diện  
├── script.js           # File JavaScript xử lý logic
├── exam_list.json      # Metadata của 48 mã đề (1101-1148)
├── explanations.json   # Giải thích đáp án chi tiết
├── README.md           # File hướng dẫn này
├── data/               # Thư mục chứa dữ liệu từng mã đề
│   ├── 1101.json       # Dữ liệu đề thi mã 1101
│   ├── 1102.json       # Dữ liệu đề thi mã 1102
│   ├── ...             # ... 
│   └── 1148.json       # Dữ liệu đề thi mã 1148
├── backup/             # Thư mục backup (không cần thiết cho production)
│   ├── exam_data.json  # File dữ liệu gốc (đã tách)
│   └── split_data.js   # Script tách dữ liệu (đã sử dụng)
└── exam/               # Thư mục chứa đề thi PDF gốc
    ├── ma-de-1101.pdf
    ├── ma-de-1102.pdf
    └── ma-de-1105.pdf
```

## Hướng dẫn thêm mã đề mới

### Cách 1: Thêm thủ công (Khuyến nghị)
1. **Tạo file dữ liệu mới**: `data/1149.json` với cấu trúc tương tự các file khác
2. **Cập nhật exam_list.json**: Thêm metadata cho mã đề 1149
```json
{
  "exams": {
    "1149": {
      "title": "ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề 1149",
      "file": "data/1149.json"
    }
  }
}
```
3. **Hệ thống tự động cập nhật**: Dropdown sẽ tự động hiển thị mã đề mới

### Cách 2: Sử dụng backup files (nếu cần)
1. **Phục hồi tool**: Copy `backup/split_data.js` và `backup/exam_data.json` ra ngoài
2. **Cập nhật exam_data.json**: Thêm dữ liệu mã đề mới vào file này
3. **Chạy script tách dữ liệu**:
```bash
node split_data.js
```
4. **Di chuyển tool về backup**: Move lại vào thư mục backup sau khi xong

## Hướng dẫn sử dụng

### Cho học sinh:
1. Mở file `index.html` trong trình duyệt web
2. Nhập họ tên (bắt buộc) và số báo danh (tùy chọn)
3. Chọn mã đề thi muốn làm
4. Nhấn "Bắt đầu thi"
5. Làm bài trong thời gian quy định
6. Nhấn "Nộp bài" hoặc đợi tự động nộp khi hết giờ
7. Xem kết quả chi tiết

### Cho giáo viên:
- Có thể thêm câu hỏi mới trong file `script.js`
- Tùy chỉnh thời gian thi bằng cách sửa biến `timeRemaining`
- Thay đổi số câu hỏi bằng cách điều chỉnh logic trong hàm `generateFullExam`

## Tính năng nâng cao

### 🔄 Tạo câu hỏi động
- Hệ thống tự động tạo thêm câu hỏi để đủ 50 câu
- Ngân hàng câu hỏi mẫu có thể mở rộng
- Trộn ngẫu nhiên câu hỏi

### 📱 Responsive Design
- Tối ưu cho điện thoại, tablet và máy tính
- Giao diện tự động điều chỉnh theo màn hình
- Trải nghiệm mượt mà trên mọi thiết bị

### 🎯 UX/UI hiện đại
- Hiệu ứng hover và animation
- Màu sắc nhất quán theo Material Design
- Icon Font Awesome
- Typography tối ưu với Google Fonts

## Cài đặt và chạy

1. **Không cần cài đặt server**: Mở trực tiếp file `index.html`
2. **Chạy với Live Server** (khuyến nghị cho phát triển):
   ```bash
   # Cài đặt Live Server extension trong VS Code
   # Hoặc sử dụng Python
   python -m http.server 8000
   ```
3. **Deploy lên web**: Upload tất cả file lên hosting

## Tùy chỉnh

### Thêm câu hỏi mới:
**Cách khuyến nghị: Chỉnh sửa trực tiếp file JSON**
```json
// Tạo file data/1149.json mới
{
  "title": "ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề 1149",
  "subject": "TIẾNG ANH", 
  "time_limit": 50,
  "total_questions": 50,
  "questions": [
    {
      "id": 1,
      "text": "Câu hỏi của bạn...",
      "options": [
        "A. Đáp án A",
        "B. Đáp án B",
        "C. Đáp án C", 
        "D. Đáp án D"
      ],
      "correct": 0 // Index của đáp án đúng (0-3)
    }
  ]
}
```

**Cách khác: Sử dụng backup tool (nếu cần thêm nhiều đề)**
```bash
# 1. Copy tool từ backup
cp backup/split_data.js backup/exam_data.json .

# 2. Cập nhật exam_data.json với dữ liệu mới
# 3. Chạy script
node split_data.js

# 4. Di chuyển tool về backup
mv split_data.js exam_data.json backup/
```

### Thay đổi thời gian thi:
```javascript
// Trong file script.js, sửa dòng
let timeRemaining = 90 * 60; // 90 phút
// Thành
let timeRemaining = 120 * 60; // 120 phút
```

### Tùy chỉnh màu sắc:
```css
/* Trong file styles.css, thay đổi các biến gradient */
background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
```

## Trình duyệt hỗ trợ

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Lưu ý

- Đây là bản demo với câu hỏi mẫu
- Để sử dụng thực tế, cần bổ sung đầy đủ ngân hàng câu hỏi
- Có thể tích hợp với database để lưu kết quả
- Cần thêm tính năng xác thực nếu sử dụng trong môi trường chính thức

## Liên hệ hỗ trợ

Nếu cần hỗ trợ kỹ thuật hoặc tùy chỉnh thêm, vui lòng liên hệ để được hỗ trợ.

---

**Phiên bản**: 1.0  
**Ngày cập nhật**: 2024  
**Công nghệ**: HTML5, CSS3, JavaScript ES6
