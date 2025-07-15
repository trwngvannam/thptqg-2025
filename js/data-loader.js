// Load exam list metadata from optimized JSON file
async function loadExamListData() {
    try {
        const response = await fetch('exam_list.json');
        if (!response.ok) {
            throw new Error('Không thể tải danh sách đề thi');
        }
        const data = await response.json();
        
        // Convert optimized format to original format for backward compatibility
        const examListData = {};
        
        Object.keys(data.subjects).forEach(subjectKey => {
            const subject = data.subjects[subjectKey];
            Object.keys(subject.exams).forEach(examCode => {
                examListData[examCode] = {
                    title: `ĐỀ THI TỐT NGHIỆP TRUNG HỌC PHỔ THÔNG NĂM 2025 - Mã đề ${examCode}`,
                    subject: subject.name,
                    time_limit: subject.time_limit,
                    total_questions: subject.total_questions,
                    has_content: subject.exams[examCode],
                    file: `data/${subjectKey}/${examCode}.json`
                };
            });
        });
        
        window.AppState.examListData = examListData;
    } catch (error) {
        console.error('Lỗi khi tải danh sách đề thi:', error);
        alert('Không thể tải danh sách đề thi. Vui lòng kiểm tra kết nối mạng.');
    }
}

// Load specific exam data (lazy loading)
async function loadSpecificExamData(examCode) {
    try {
        // Determine subject folder based on selected subject or exam code
        let subjectFolder = window.AppState.selectedSubject;
        if (!subjectFolder) {
            // Fallback to exam code detection
            if (examCode.startsWith('11')) {
                subjectFolder = 'english';
            } else if (examCode.startsWith('01')) {
                subjectFolder = 'math';
            }
        }
        
        const response = await fetch(`data/${subjectFolder}/${examCode}.json`);
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
        // Determine subject folder based on selected subject or exam code
        let subjectFolder = window.AppState.selectedSubject;
        if (!subjectFolder) {
            // Fallback to exam code detection
            if (examCode.startsWith('11')) {
                subjectFolder = 'english';
            } else if (examCode.startsWith('01')) {
                subjectFolder = 'math';
            }
        }
        
        const response = await fetch(`explanations/${subjectFolder}/${examCode}.json`);
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
