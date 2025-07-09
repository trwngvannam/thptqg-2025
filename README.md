# Hệ Thống Thi Trắc Nghiệm THPTQG Online (Tiếng Anh)

Hệ thống web thi trắc nghiệm THPTQG với 48 mã đề, tối ưu UI dropdown, lazy load dữ liệu, và quản lý explanations động.

## Demo
Mở file `index.html` để xem demo trang web thi trực tuyến.

## Cấu Trúc Dữ Liệu

### 1. Dữ liệu đề thi (data/)
- `exam_list.json`: Metadata của 48 mã đề (1101-1148)
- `1101.json` đến `1148.json`: Dữ liệu câu hỏi cho từng mã đề (40 câu/mã đề)

### 2. Explanations (explanations/)
- `1101.json` đến `1148.json`: Giải thích đáp án cho từng mã đề
- Mỗi file chứa explanations cho 40 câu theo format:
```json
{
  "1": {
    "explanation": "Giải thích ngắn gọn",
    "detailed_explanation": "Giải thích chi tiết",
    "keywords": ["từ khóa", "liên quan"],
    "difficulty": "easy|medium|hard"
  }
}
```

## Tính Năng

- **48 mã đề THPTQG**: Dữ liệu đầy đủ cho tất cả mã đề từ 1101-1148
- **Lazy Loading**: Chỉ tải dữ liệu khi cần thiết, tối ưu hiệu suất
- **Dropdown tìm kiếm**: Lọc mã đề theo số hoặc ký tự bất kỳ
- **Explanations động**: Giải thích đáp án được tải riêng theo từng mã đề
- **UI tối ưu**: Giao diện responsive, thân thiện người dùng

## Hướng Dẫn Sử Dụng

1. **Chạy demo**: Mở file `index.html` bằng trình duyệt web
2. **Chọn mã đề**: Sử dụng dropdown có tìm kiếm để chọn mã đề
3. **Làm bài thi**: Chọn đáp án và nộp bài
4. **Xem giải thích**: Nhấn "Xem giải thích" để xem đáp án chi tiết

## Hướng Dẫn Phát Triển

### Thêm mã đề mới:
1. Tạo file `data/XXXX.json` với 40 câu hỏi
2. Tạo file `explanations/XXXX.json` với explanations
3. Cập nhật `exam_list.json` thêm metadata mã đề mới

### Cấu trúc file đề thi:
```json
{
  "1": {
    "question": "Câu hỏi...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct": "A"
  }
}
```

---
*Hệ thống hoàn chỉnh với 48 mã đề và explanations đầy đủ*
