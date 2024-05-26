// 時間割表に挿入された非固定コマの情報を保存する配列
let insertedComasData = [];
// 固定コマの情報を保存するオブジェクト
let fixedComasInfo = {};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn1').addEventListener('click', function () {
        resetTableState(); // テーブルをリセット
        fetch('https://two024-5-individual-experiment.onrender.com/fetch-data')
        .then(response => {
            if (!response.ok) {
                // レスポンスが成功しなかった場合
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            alert('時間割を編成しました。');//動作確認用
            const table = document.getElementById('data-table');
            console.log('table:', table);
            const tbody = table.querySelector('tbody');
            
            if(data.comas) {
                //固定コマとそれ以外のコマの分類
                const fixedComas = data.comas.filter(comasData => comasData['コマ優先度'] === 1);
                const otherComas = data.comas.filter(comasData => comasData['コマ優先度'] !== 1);

                
                const dayToIndex = {
                    '月曜日': 1,
                    '火曜日': 5,
                    '水曜日': 9,
                    '木曜日': 13,
                    '金曜日': 17
                };

                // 保存された固定コマの情報を保持するオブジェクト
                const fixedComasInfo = [];

                //固定コマを最初に挿入
                fixedComas.forEach(comasData => {
                    insertComas(comasData, dayToIndex, table);
                    // 固定コマの情報をオブジェクトに追加
                    fixedComasInfo.push({
                        class: comasData['クラス'],
                        subject: comasData['科目名'],
                        day: comasData['曜日'],
                        startTime: parseInt(comasData['実施時間'].split('-')[0]),
                        finishTime: parseInt(comasData['実施時間'].split('-')[1])
                    });
                
                });

                // すでに挿入されている固定コマの情報と比較
                let firstFlag = true;
                
                //残りのコマを挿入
                otherComas.forEach(comasData => {
                    let MaxCount = 0; // 追加: 試行回数のカウンター
                    let success = false;

                    let randomStartTime = Math.floor(Math.random() * 4) * 2 + 1;// 1-2, 3-4, 5-6, or 7-8
                    comasData['実施時間'] = `${randomStartTime}-${randomStartTime + 1}`;
                    let randomDayIndex = [1, 5, 9, 13, 17][Math.floor(Math.random() * 5)]; // 1-5 (Monday to Friday)
                    let randomDay = Object.keys(dayToIndex).find(key => dayToIndex[key] === randomDayIndex);
                    comasData['曜日'] = randomDay;
                    
                    let conflict = false;

                        // 同じ教員や教室が同じ時間に使われていないかをチェック
                        for (let i = 0; i < insertedComasData.length; i++) {
                            if (
                                (insertedComasData[i].teacher === comasData['教員名'] ||
                                 insertedComasData[i].room === comasData['教室名']) &&
                                insertedComasData[i].day === comasData['曜日'] &&
                                insertedComasData[i].startTime === parseInt(comasData['実施時間'].split('-')[0])
                            ) {
                                conflict = true;
                                break;
                            }
                        }

                        // 固定コマとも連続しないかをチェック
                        if (!conflict) {
                            for (let i = 0; i < fixedComasInfo.length; i++) {
                                if (
                                    (fixedComasInfo[i].teacher === comasData['教員名'] ||
                                     fixedComasInfo[i].room === comasData['教室名']) &&
                                    fixedComasInfo[i].day === comasData['曜日'] &&
                                    (fixedComasInfo[i].startTime === randomStartTime || 
                                     fixedComasInfo[i].finishTime === randomStartTime)
                                ) {
                                    conflict = true;
                                    break;
                                }
                            }
                        }

                    for (let i = 0; i < insertedComasData.length; i++) {
                        if(MaxCount >= 2000){
                            alert('時間割の編成に問題が発生しました。再度実行してください。');
                            resetTableState();
                            location.reload(); // ページをリロードして再実行
                            break;
                        }
                        if (insertedComasData[i].class === comasData['クラス'] &&
                            insertedComasData[i].day === comasData['曜日'] &&
                            insertedComasData[i].startTime === parseInt(comasData['実施時間'].split('-')[0] ||
                            ((fixedComasInfo[i].teacher === comasData['教員名'] &&
                            fixedComasInfo[i].room === comasData['教室名']) &&
                            fixedComasInfo[i].day === comasData['曜日'] &&
                           (fixedComasInfo[i].startTime === randomStartTime || 
                            fixedComasInfo[i].finishTime === randomStartTime))) )
                            {
                            console.error('重複したコマが見つかりました。');
                            console.log('insertedComasData[i].Class', insertedComasData[i].class);
                            console.log('insertedComasData[i].subject:', insertedComasData[i].subject,'insertedComasData[i]:', comasData['科目名']);
                            console.log('insertedComasData[i].startTime:',insertedComasData[i].startTime); //確認用
                            console.log('insertedComasData[i].finishTime:',insertedComasData[i].finishTime); //確認用

                            if(firstFlag){
                                firstFlag = false;
                                let randomStartTime = 1;//一旦初期化1-3-5-7
                                console.log('一旦初期化randomStartTime:', randomStartTime); //確認用
                                randomDayIndex = 5 // 1-5-9-13-17 (Monday to Friday)
                                i = -1;
                            }
                            else{
                                for (let j = 0; j < insertedComasData.length; j++) {
                                    if(
                                        randomStartTime >= insertedComasData[j].startTime &&
                                        randomStartTime <= insertedComasData[j].finishTime &&
                                        insertedComasData[j].day === comasData['曜日']){
                                        randomStartTime += 2
                                        console.log('randomStartTime+=2:',randomStartTime); //確認用
                                        if(randomStartTime >= 7){
                                            randomDayIndex += 4;
                                            randomStartTime = 1;
                                            if(randomDayIndex > 17){
                                                randomDayIndex = 1;// 1-5-9-13-17 (Monday to Friday)
                                            }
                                        }
                                        // ここで i を再設定してループを継続する
                                        i = -1;
                                        continue;
                                    }
                                }
                            }
                            randomDay = Object.keys(dayToIndex).find(key => dayToIndex[key] === randomDayIndex);
                            comasData['実施時間'] = `${randomStartTime}-${randomStartTime + 1}`;
                            comasData['曜日'] = randomDay;
                            
                        }
                        for(let i = 0; i < fixedComasInfo.length; i++) {
                            if(fixedComasInfo[i].class === comasData['クラス'] &&
                            fixedComasInfo[i].day === comasData['曜日'] &&
                            fixedComasInfo[i].startTime <= parseInt(comasData['実施時間'].split('-')[0] ||
                            fixedComasInfo[i].finishTime >= parseInt(comasData['実施時間'].split('-')[0]))){
                                randomStartTime += 2
                                if(randomStartTime >= 7){
                                    randomDayIndex += 4;
                                    randomStartTime = 1;
                                    if(randomDayIndex > 17){
                                        randomDayIndex = 1;// 1-5-9-13-17 (Monday to Friday)
                                    }
                                    randomDay = Object.keys(dayToIndex).find(key => dayToIndex[key] === randomDayIndex);
                                    comasData['実施時間'] = `${randomStartTime}-${randomStartTime + 1}`;
                                    comasData['曜日'] = randomDay;
                                }
                                break;
                            }
                        }
                    MaxCount++;
                    }
                    insertComas(comasData, dayToIndex, table);
                    
                });
                firstFlag = false;
            }   
            else {
                console.error('comas is undefined');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    //コマを挿入する関数
    function insertComas(comasData, dayToIndex, table){        
        // コマの情報から行番号と列番号を計算
        const [grade, classNumber] = comasData['クラス'].split('-');
        const rowNumber = (parseInt(grade) - 1) * 5 + parseInt(classNumber) + 2;
        if(rowNumber == 36){
            rowNumber = 35;
        }
        const startTime = parseInt(comasData['実施時間'].split('-')[0]);//1か3か5か7
        const finishTime = parseInt(comasData['実施時間'].split('-')[1]);
        const dayIndex = dayToIndex[comasData['曜日']];
        let colNumber = 0;
        switch(startTime){
            case 1:
                colNumber = dayIndex;
                break;
            case 3:
                colNumber = dayIndex + 1;
                break;
            case 5:
                colNumber = dayIndex + 2;
                break;
            case 7:
                colNumber = dayIndex + 3;
                break;
            default:
                console.error('無効な曜日:', comasData['曜日']);
                return; // 無効な曜日の場合、次のコマに進む
        }

        if(classNumber == 1){
            colNumber ++;
        }

        // 対象のセルを取得
        if (rowNumber >= table.rows.length || colNumber >= table.rows[rowNumber].cells.length) {
            console.error(`無効なセル位置。行番号: ${rowNumber}, 列番号: ${colNumber}`);
            return;
        }
        console.log("rowNumber:", rowNumber);
        const cell = table.rows[rowNumber].cells[colNumber];

        const periodTime = finishTime - startTime + 1;
        //console.log('periodTime:', periodTime);//確認用

        if(periodTime > 2){//コマ数が3以上なので、startTimeは1か5のみ(たぶん)
             // 結合するセルの数を計算
            const colspan = finishTime - startTime + 1;

            // 結合されるセルにcolspan属性を追加
            cell.colSpan = colspan;

            // 結合したセルの右側のセルを非表示にする
            let nextCell = table.rows[rowNumber].cells[colNumber + 1];
            if(colspan === 3){
                // 3コマを結合した場合、その右隣のセルを10px幅にする
                nextCell = table.rows[rowNumber].insertCell(colNumber + 1);
                nextCell.style.width = '30px'; // 次のセルを半分の幅に設定
                nextCell.style.display = ''; // 次のセルを表示
                // 3コマを結合した場合、右端の余分なセルを削除
                const lastCellIndex = table.rows[rowNumber].cells.length - 1;
                table.rows[rowNumber].deleteCell(lastCellIndex);
            }
            else if (nextCell) {
                nextCell.style.display = 'none';
            } else {
                console.error(`セルが見つかりません。行番号: ${rowNumber}, 列番号: ${colNumber + 1}`);
            }

        }

        console.log('comasData', comasData['科目名']);//確認用
        console.log('comasData', comasData['教員名']);//確認用
        console.log('startTime:', startTime);//確認用
        console.log('finishTime:', finishTime);//確認用
        console.log('grade:', grade);//確認用
        console.log('classNumber:', classNumber);//確認用
        console.log('コマを割り当てました。');//確認用
        if (cell) { // セルが存在する場合のみ挿入
        //セルにデータを挿入
        cell.innerHTML += `
            <!-- <div>${comasData['コマID']}</div> -->
            <div>${comasData['科目名']}</div>
            <div>${comasData['教員名']}</div>
            <!-- <div>${comasData['クラス']}</div> -->
            <div>${comasData['教室名']}</div>
            <!-- <div>${comasData['実施期間']}</div> -->
            <!-- <div>${comasData['コマ数']}</div> -->
            <!-- <div>${comasData['コマ優先度']}</div>  -->
        `;
        // 非固定コマが挿入された後に、その行の値と曜日・実施時間を取得して保存
        insertedComasData.push( {
            class: comasData['クラス'],
            subject: comasData['科目名'],
            teacher: comasData['教員名'],
            day: comasData['曜日'],
            startTime: startTime,
            finishTime: finishTime
        }
    );  
        
        } else {
            console.error(`セルが見つかりません。行番号: ${rowNumber}, 列番号: ${colNumber}`);
        }
    }

    function resetTableState(table) {
        // テーブルのボディをクリア
        var tableBody = document.getElementById('data-body');
        tableBody.innerHTML = '';

        // テーブルを再生成
        var tableContent = '';
        for (var grade = 1; grade <= 7; grade++) {
            var firstClass = true;
            for (var classNum = 1; classNum <= (grade >= 6 ? 4 : 5); classNum++) {
                tableContent += '<tr>';
                if (firstClass) {
                    tableContent += '<td rowspan="' + (grade >= 6 ? 4 : 5) + '">' + grade + '学年</td>';
                    firstClass = false;
                }
                tableContent += '<td>' + classNum + '組</td>';
                for (var day = 0; day < 5; day++) {
                    for (var period = 0; period < 8; period += 2) {
                        tableContent += '<td colspan="2" width="20"></td>';
                    }
                }
                tableContent += '</tr>';
            }
        }
        tableBody.innerHTML = tableContent;

        // 挿入された非固定コマの情報をクリア
        insertedComasData = [];
    }
});

// テーブルのデータをCSV形式に変換する関数
function tableToCsv() {
    const table = document.getElementById('data-table');
    const rows = table.rows;
    let csvContent = '';

    // 曜日や学年・組の見出し行を追加
    const headerRow = ['学年', '組'];
    const days = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'];
    for (let i = 0; i < days.length; i++) {
        for (let j = 1; j <= 8; j++) {
            headerRow.push(days[i]);
        }
    }
    csvContent += headerRow.join(',') + '\n';

    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].cells;
        let rowContent = [];
        // 学年と組のデータを追加
        if (i % 6 === 0) {
            const grade = Math.floor(i / 6) + 1;
            rowContent.push(grade);
        } else {
            rowContent.push('');
        }
        const classNum = (i % 6) + 1;
        rowContent.push(classNum);

        // セルの内容を追加
        for (let j = 0; j < cols.length; j++) {
            const cellContent = Array.from(cols[j].children).map(child => child.innerText).join(', ');
            rowContent.push(cellContent);
        }
        csvContent += rowContent.join(',') + '\n';
    }
    return csvContent;
}

// CSV形式からExcel形式に変換する関数
function csvToExcel(csvContent) {
    const lines = csvContent.split('\n');
    const data = [];
    lines.forEach(line => {
        data.push(line.split(','));
    });
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    return workbook;
}

// Excelファイルをダウンロードする関数
function downloadExcel(workbook, filename) {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('export-btn').addEventListener('click', function () {
        const csvContent = tableToCsv();
        const workbook = csvToExcel(csvContent);
        downloadExcel(workbook, 'timetable.xlsx');
    });
});
