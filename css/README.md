# CSS Modules Structure

Dự án THPTQG 2025 đã được tách CSS thành các module riêng biệt để dễ quản lý và bảo trì.

## Cấu trúc thư mục CSS

```
css/
├── main.css           # File chính import tất cả modules
├── base.css           # Reset CSS và Global styles
├── header.css         # Header, Logo và Timer
├── welcome.css        # Welcome screen và Dropdown
├── components.css     # Buttons và Components
├── exam.css          # Exam screen và Questions  
├── results.css       # Results và Review screens
└── responsive.css    # Media queries cho responsive
```

## Mô tả các modules

### 📄 `main.css`
- File chính import tất cả modules khác
- Chứa Google Fonts import
- Sử dụng file này trong HTML: `<link rel="stylesheet" href="css/main.css">`

### 🎯 `base.css`
- CSS Reset (`* { margin: 0; padding: 0; }`)
- Global styles cho body, container
- Animation keyframes cơ bản
- MathJax styling cho công thức toán

### 🏠 `header.css`
- Styles cho header chính
- Logo và branding
- Timer component
- Home button

### 👋 `welcome.css`
- Welcome screen layout
- Subject selector (English/Math)
- Exam dropdown menu
- Student info form
- Exam information display

### 🔘 `components.css`
- Tất cả các loại buttons (start, nav, submit, flag, etc.)
- Progress bar
- Notification modals
- Empty exam notifications

### 📝 `exam.css`
- Exam header và info bar
- Question sidebar và navigation grid
- Question area và content
- Question types styling (instruction, passage, context)
- Option styles và states
- Answer highlighting sau khi submit

### 🏆 `results.css`
- Result screen layout
- Result banner trong exam
- Review modal
- Answer explanations
- Score display

### 📱 `responsive.css`
- Media queries cho tablet/mobile
- Breakpoints: 768px, 480px, 600px
- Print styles
- High DPI display optimization

## Cách sử dụng

### Import vào HTML
```html
<link rel="stylesheet" href="css/main.css">
```

### Hoặc import từng module riêng lẻ
```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/header.css">
<link rel="stylesheet" href="css/welcome.css">
<!-- ... -->
```

## Lợi ích của việc tách modules

✅ **Dễ bảo trì**: Mỗi module chỉ chứa CSS cho một phần cụ thể  
✅ **Tìm kiếm nhanh**: Biết chính xác file nào chứa style cần sửa  
✅ **Tránh xung đột**: Các module được tổ chức logic, ít xung đột  
✅ **Tái sử dụng**: Có thể import chỉ những module cần thiết  
✅ **Team work**: Nhiều người có thể làm việc trên các module khác nhau  

## Migration từ file cũ

File `styles.css` cũ đã được backup thành `styles.css.backup` và được thay thế bằng file đơn giản chỉ import `css/main.css` để đảm bảo tương thích ngược.

## Best Practices

1. **Thêm style mới**: Đặt vào module phù hợp hoặc tạo module mới nếu cần
2. **Naming**: Sử dụng comment headers để phân chia sections trong mỗi module  
3. **Testing**: Test responsive trên mobile sau khi thay đổi
4. **Documentation**: Cập nhật README này khi thêm module mới
