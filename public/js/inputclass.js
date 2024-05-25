function saveSubjectsToLocalStorage(subjects) {
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

function loadSubjectsFromLocalStorage() {
    const subjects = localStorage.getItem('subjects');
    return subjects ? JSON.parse(subjects) : [];
}

function saveKomasToLocalStorage(komas) {
    localStorage.setItem('komas', JSON.stringify(komas));
}

function loadKomasFromLocalStorage() {
    const komas = localStorage.getItem('komas');
    return komas ? JSON.parse(komas) : [];
}

function updateLocalStorage() {
    const subjects = Array.from(sortable.children).map((subjectItem, index) => ({
        subjectName: subjectItem.textContent.replace(/[×↓↑]/g, '').trim(),
        teacherName1: subjectItem.dataset.teacherName1,
        teacherName2: subjectItem.dataset.teacherName2,
        classValue: subjectItem.dataset.classValue,
        classroomName: subjectItem.dataset.classroomName,
        timeValue1: subjectItem.dataset.timeValue1,
        timeValue2: subjectItem.dataset.timeValue2,
        dayValue: subjectItem.dataset.dayValue,
        priorityValue: index + 1
    }));

    saveSubjectsToLocalStorage(subjects);
}


document.addEventListener('DOMContentLoaded', async (event) => {
    function addOption(selectElement, text, value, disabled = false, selected = false) {
        const option = document.createElement('option');
        option.textContent = text;
        option.value = value;
        if (disabled) option.disabled = true;
        if (selected) option.selected = true;
        selectElement.appendChild(option);
    }

    const subjectSelect = document.getElementById('subject');
    const teacherSelect1 = document.getElementById('teacherList1');
    const teacherSelect2 = document.getElementById('teacherList2');
    const timeInput1 = document.getElementById('time');
    const timeInput2 = document.getElementById('time2');
    const classSelect = document.getElementById('class');
    const classroomSelect = document.getElementById('classroom');
    const dayOfWeekSelect = document.getElementById('dayOfWeek');
    const sortable = document.getElementById('sortable');
    const registerBtn = document.getElementById('registerBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    async function fetchTeachers() {
        try {
            const response = await fetch('/api/teacher');
            if (!response.ok) {
                throw new Error('ネットワークの応答が正常ではありません: ' + response.statusText);
            }
            const data = await response.json();
            console.log('Teachers fetched:', data);
            return data.map(teacher => teacher.教員名);
        } catch (error) {
            console.error('教員データの取得に失敗しました:', error.message, error.stack);
            return [];
        }
    }

    async function fetchSubjects() {
        try {
            const response = await fetch('/api/subject');
            if (!response.ok) {
                throw new Error('ネットワークの応答が正常ではありません: ' + response.statusText);
            }
            const data = await response.json();
            console.log('Subjects fetched:', data);
            return data.map(subject => subject.科目名);
        } catch (error) {
            console.error('科目データの取得に失敗しました:', error.message, error.stack);
            return [];
        }
    }

    async function fetchClassrooms() {
        try {
            const response = await fetch('/api/classroom');
            if (!response.ok) {
                throw new Error('ネットワークの応答が正常ではありません: ' + response.statusText);
            }
            const data = await response.json();
            console.log('Classrooms fetched:', data);
            return data.map(classroom => classroom.教室名);
        } catch (error) {
            console.error('教室データの取得に失敗しました:', error.message, error.stack);
            return [];
        }
    }

    async function fetchKomas() {
        try {
            const response = await fetch('/api/komas');
            if (!response.ok) {
                throw new Error('ネットワークの応答が正常ではありません: ' + response.statusText);
            }
            const data = await response.json();
            console.log('Komas fetched:', data);
            return data;
        } catch (error) {
            console.error('コマデータの取得に失敗しました:', error.message, error.stack);
            return [];
        }
    }

    async function populateSelects() {
        // 各SELECT要素にデフォルトの無効かつ選択されたオプションを追加
        addOption(subjectSelect, '選択してください', '', true, true);
        addOption(teacherSelect1, '選択してください', '', true, true);
        addOption(teacherSelect2, '選択してください', '', true, true);
        addOption(classSelect, '選択してください', '', true, true);
        addOption(classroomSelect, '選択してください', '', true, true);
        addOption(dayOfWeekSelect, '選択してください', '', true, true);


        const teachers = await fetchTeachers();
        console.log('Populating teachers:', teachers);
        teachers.forEach(teacher => {
            addOption(teacherSelect1, teacher, teacher);
            addOption(teacherSelect2, teacher, teacher);
        });

        const subjects = await fetchSubjects();
        console.log('Populating subjects:', subjects);
        subjects.forEach(subject => addOption(subjectSelect, subject, subject));

        const classrooms = await fetchClassrooms();
        console.log('Populating classrooms:', classrooms);
        classrooms.forEach(classroom => addOption(classroomSelect, classroom, classroom));
    }

    async function initializeKomas() {
        const komas = await fetchKomas();
        console.log('InitializingKomas()時のkomas:', komas);

        // ローカルストレージに保存
        saveSubjectsToLocalStorage(komas);

        // UIに反映
        komas.forEach(koma => {
            if (koma.実施時間 && koma.曜日) {
                addKoteiKoma(koma);
            } else {
                addSubject(koma);
            }
        });
    }

    // 実施時間と曜日の両方に値が入っている場合の授業コマを追加
    async function addKoteiKoma(koma) {
        const koteiItem = document.createElement('div');
        koteiItem.textContent = koma.科目名;
        
        // データセットに値を設定
        koteiItem.dataset.teacherName = koma.教員名;
        koteiItem.dataset.classValue = koma.クラス;
        koteiItem.dataset.classroomName = koma.教室名;
        koteiItem.dataset.timeValue = koma.実施時間;
        koteiItem.dataset.dayValue = koma.曜日;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => {
            koteiItem.remove();
            // ローカルストレージを更新
            const komas = Array.from(kotei.children).map(koteiItem => ({
                name: koteiItem.textContent.replace('×', '').trim(),
                teacherName: koteiItem.dataset.teacherName,
                classValue: koteiItem.dataset.classValue,
                classroomName: koteiItem.dataset.classroomName,
                timeValue: koteiItem.dataset.timeValue,
                dayValue: koteiItem.dataset.dayValue
            }));
            saveSubjectsToLocalStorage(komas);
        });
        koteiItem.appendChild(closeButton);
        
        koteiItem.draggable = true;
        koteiItem.classList.add('kotei-item');
        kotei.appendChild(koteiItem); // 固定コマを #kotei 要素に追加する
    }

    populateSelects();

    function moveUp(item) {
        const previousItem = item.previousElementSibling;
        if (previousItem) {
            item.parentNode.insertBefore(item, previousItem);
            updateLocalStorage();
        }
    }

    function moveDown(item) {
        const nextItem = item.nextElementSibling;
        if (nextItem) {
            item.parentNode.insertBefore(nextItem, item);
            updateLocalStorage();
        }
    }

    function addSubject(koma) {
        // koma オブジェクトの内容をログ出力
        console.log('addsubject()関数に渡されたkoma:', koma);
        
        const subjectItem = document.createElement('div');
        subjectItem.textContent = koma.科目名;
    
        // データセットに値を設定
        subjectItem.dataset.teacherName = koma.教員名;
        subjectItem.dataset.classValue = koma.クラス;
        subjectItem.dataset.classroomName = koma.教室名;
        subjectItem.dataset.timeValue = koma.実施時間;
        subjectItem.dataset.dayValue = koma.曜日;

        // デバッグ用ログの追加
        console.log('addSubject()時のデータセット:', {
            teacherName: koma.教員名,
            classValue: koma.クラス,
            classroomName: koma.教室名,
            timeValue1: koma.実施時間,
            dayValue: koma.曜日,
        });


        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => {
            subjectItem.remove();
            // ローカルストレージを更新
            const subjects = Array.from(sortable.children).map(subjectItem => ({
                name: subjectItem.textContent.replace(/[×↓↑]/g, '').trim(),
                priority: subjectItem.dataset.priority,
                teacherName: subjectItem.dataset.teacherName,
                classValue: subjectItem.dataset.classValue,
                classroomName: subjectItem.dataset.classroomName,
                timeValue: subjectItem.dataset.timeValue,
                dayValue: subjectItem.dataset.dayValue
            }));
            saveSubjectsToLocalStorage(subjects);
        });
        subjectItem.appendChild(closeButton);

        const moveUpButton = document.createElement('button');
        moveUpButton.textContent = '↑';
        moveUpButton.classList.add('move-up-button');
        moveUpButton.addEventListener('click', () => moveUp(subjectItem));
    
        const moveDownButton = document.createElement('button');
        moveDownButton.textContent = '↓';
        moveDownButton.classList.add('move-down-button');
        moveDownButton.addEventListener('click', () => moveDown(subjectItem));
    
        subjectItem.appendChild(moveUpButton);
        subjectItem.appendChild(moveDownButton);

        subjectItem.draggable = true;
        subjectItem.classList.add('subject-item');
        sortable.appendChild(subjectItem);
    }
    
    registerBtn.addEventListener('click', () => {
        const subject = subjectSelect.value.trim();
        const teacher1 = teacherSelect1.value.trim();
        const teacher2 = teacherSelect2.value.trim();
        const classValue = classSelect.value.trim();
        const classroom = classroomSelect.value.trim();
        const time1 = timeInput1.value.trim();
        const time2 = timeInput2.value.trim();
        const dayOfWeek = dayOfWeekSelect.value.trim();

    
        if (subject !== '') {
            const koma = {
                科目名: subject,
                教員名 : teacher2 ? `${teacher1} ${teacher2}` : teacher1,
                クラス: classValue,
                教室名: classroom,
                実施時間 : time2 ? `${time1}-${time2}` : time1,
                曜日: dayOfWeek
            };
            console.log('登録ボタンが押された時のkoma:', koma);

            if (time1 && time2 && dayOfWeek) {
                addKoteiKoma(koma);
            } else {
                addSubject(koma);
            }
    
            // 現在のsubjectsを取得し、ローカストレージに保存
            const subjects = Array.from(sortable.children).map((subjectItem, index) => ({
                name: subjectItem.textContent.replace(/[×↓↑]/g, '').trim(),

                priority: index + 1,
                // ここで科目ごとに異なる情報を追加
                teacherName: subjectItem.dataset.teacherName,
                classValue: subjectItem.dataset.classValue,
                classroomName: subjectItem.dataset.classroomName,
                timeValue: subjectItem.dataset.timeValue,
                dayValue: subjectItem.dataset.dayValue
            }));
    
            // ローカルデータをログとして出力
            console.log('ローカルデータ:', subjects);
    
            saveSubjectsToLocalStorage(subjects);
    
            subjectSelect.value = '';
            teacherSelect1.value = '';
            teacherSelect2.value = '';
            classSelect.value = '';
            classroomSelect.value = '';
            timeInput1.value = '';
            timeInput2.value = '';
            dayOfWeekSelect.selectedIndex = 0;
        }
    });
    

    function getRegisteredClasses() {
        console.log('getRegisteredClassesが呼び出されました');
        if (!sortable) {
            console.error('sortable要素が見つかりません');
            return [];
        }
        const registeredClasses = Array.from(sortable.children).map((subjectItem, index) => {
            console.log('subjectItem:', subjectItem);
            console.log('subjectItem.dataset:', subjectItem.dataset);

            const subjectName = subjectItem.textContent.replace(/[×↓↑]/g, '').trim();
            const teacherName = subjectItem.dataset.teacherName;
            const classValue = subjectItem.dataset.classValue;
            const classroomName = subjectItem.dataset.classroomName;
            const timeValue = subjectItem.dataset.timeValue;
            const dayValue = subjectItem.dataset.dayValue;
    
            console.log('getRegisteredClasses:', {
                subjectName,
                teacherName,
                classValue,
                classroomName,
                timeValue,
                dayValue,
                priorityValue: index + 2
            });
    
            return {
                subjectName,
                teacherName,
                classValue,
                classroomName,
                timeValue,
                dayValue,
                priorityValue: index + 2
            };
        });
        return registeredClasses;
    }
    
    
    function getregisteredKomas() {
        const registeredKomas = Array.from(kotei.children).map((koteiItem, index) => {
            const subjectName = koteiItem.textContent.replace('×', '').trim();
            const teacherName = koteiItem.dataset.teacherName;
            const classValue = koteiItem.dataset.classValue;
            const classroomName = koteiItem.dataset.classroomName;
            const timeValue = koteiItem.dataset.timeValue;
            const dayValue = koteiItem.dataset.dayValue;
/*
            const subjectName = koteiItem.textContent.replace('×', '').trim();

            const teacherName1 = koteiItem.dataset.teacherName1;
            const teacherName2 = koteiItem.dataset.teacherName2;
            const teacherName = teacherName2 ? `${teacherName1}-${teacherName2}` : teacherName1;
            const classValue = koteiItem.dataset.classValue;
            const classroomName = koteiItem.dataset.classroomName;
            const timeValue1 = koteiItem.dataset.timeValue1;
            const timeValue2 = koteiItem.dataset.timeValue2;
            const timeValue = timeValue2 ? `${timeValue1}-${timeValue2}` : timeValue1;
            const dayValue = koteiItem.dataset.dayValue;
*/
    
            console.log('getregisteredKomas時のregisteredKomas:', {
                subjectName,
                teacherName,
                classValue,
                classroomName,
                timeValue,
                dayValue,
                priorityValue: 1
            });
    
            return {
                subjectName,
                teacherName,
                classValue,
                classroomName,
                timeValue,
                dayValue,
                priorityValue: 1
            };
        });
        return registeredKomas;
    }
    

    confirmBtn.addEventListener('click', async () => {
        try {
            const registeredClasses = getRegisteredClasses(); // 登録した授業コマのデータを取得
            const registeredKomas = getregisteredKomas(); // 登録した固定コマのデータを取得
    
            console.log('送信データ (授業コマ):', registeredClasses);
            console.log('送信データ (固定コマ):', registeredKomas);
    
            const response = await fetch('/api/registerClass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    registeredClasses,
                    registeredKomas 
                }) // 送信データに登録した授業コマと固定コマのデータを追加
            });
    
            if (!response.ok) {
                throw new Error('データベースへの送信が失敗しました');
            }
    
            const result = await response.json();
            console.log('サーバー応答:', result);
            alert('授業コマと固定コマが確定されました！');
        } catch (error) {
            console.error('データベースへの送信エラー:', error.message, error.stack);
            alert('授業コマと固定コマの確定中にエラーが発生しました');
        }
    });
    
    /*
    sortable.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.textContent);
        event.target.classList.add('dragging');
    });

    sortable.addEventListener('dragover', (event) => {
        event.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const boundingRect = event.target.getBoundingClientRect();
        const offsetY = event.clientY - boundingRect.top;
        const priority = Math.round((offsetY / boundingRect.height) * 100);
        draggingElement.dataset.priority = priority;
        const placeAbove = offsetY < boundingRect.height / 2;
        if (placeAbove) {
            event.target.parentNode.insertBefore(draggingElement, event.target);
        } else {
            event.target.parentNode.insertBefore(draggingElement, event.target.nextSibling);
        }
    
        // 優先順位の変更に伴ってコマの情報を更新
        const allItems = Array.from(sortable.children);
        allItems.forEach((item, index) => {
            item.dataset.priority = index + 2;
        });
    });
    
    // 優先順位の変更に伴ってコマの情報を更新
    sortable.addEventListener('dragend', (event) => {
        const allItems = Array.from(sortable.children);
        allItems.forEach(item => {
            const subjectItem = item.querySelector('.subject-item');
            if (subjectItem) {
                subjectItem.dataset.priority = item.dataset.priority;
            }
        });
    });
    */
    

    // 起動時にコマ表のデータを取得して登録済みコマとして表示
    await initializeKomas();
});