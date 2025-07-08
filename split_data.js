const fs = require('fs');
const path = require('path');

// Đọc file exam_data.json
const examData = JSON.parse(fs.readFileSync('exam_data.json', 'utf8'));

// Tạo thư mục data nếu chưa có
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Tách dữ liệu cho từng mã đề
Object.keys(examData).forEach(examCode => {
    const examInfo = examData[examCode];
    const fileName = `data/${examCode}.json`;
    
    // Ghi dữ liệu từng đề vào file riêng
    fs.writeFileSync(fileName, JSON.stringify(examInfo, null, 2));
    console.log(`Created: ${fileName}`);
});

console.log('Data splitting completed!');
