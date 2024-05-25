//基礎データ入力ホームの各入力欄のオブジェクトを定数に代入する
const $subject = document.getElementById('subject');
const $subjectTerm = document.getElementById('subjectTerm');
const $subjectTime = document.getElementById('subjectTime');
const $teacher = document.getElementById('teacher');
const $teacherTime = document.getElementById('teacherTime');
const $teacherAffiliation = document.getElementById('teacherAffiliation');
const $classroom = document.getElementById('classroom');
const $classroomHR = document.getElementById('classroomHR');
const dataDisplay = document.getElementById('dataDisplay');
const subjectError = document.getElementById('subjectError');
const teacherError = document.getElementById('teacherError');
const classroomError = document.getElementById('classroomError');

//科目・教員・教室それぞれの登録ボタンのオブジェクトを定数に代入する
const $submitSubject = document.getElementById('submitSubject');
const $submitTeacher = document.getElementById('submitTeacher');
const $submitClassroom = document.getElementById('submitClassroom');

//入力ホームで入力された科目・教員・教室の各データはオブジェクトの配列として保存される
let subjects = []; //[(1,subject,subjectterm),(2,subject,subjectterm),・・・・]
let teachers = []; //[(1,teacher,teacherTime,teacherAffilication),(2,teacher,teacherTime,teacherAffilication),・・・・]
let classrooms = []; //[(1,classroom,classroomHR),(2,classroom,classroomHR),・・・・]

//保存したデータを表示するHTML形式のデータ
var subjectHTML = [];
var teacherHTML = [];
var classroomHTML = [];

//↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
//このurlを本番環境用に変更する事ですべてのurlは変更されるけど，ここがわからない
const url = 'http://localhost:3000/';//←←←←←←←←←←←←←←
//↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

//データベースはこのURLから管理される
const subjectURL = url +'fetch-subject';
const teacherURL = url +'fetch-teacher';
const classroomURL = url +'fetch-classroom';
const subjectDeleteURL = url +  'delete-subject/';
const teacherDeleteURL = url +  'delete-teacher/';
const classroomDeleteURL = url +  'delete-classroom/';

//保存されている各データが表示されているか否か
let Onsubject = false;
let Onteacher = false;
let Onclassroom = false;

//最初に配列subjects・teachers・classroomsにデータベースをぶち込んでおく(保存された各項目を表示して削除できるように)
fetch(subjectURL) // サーバーのURLを指定
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // JSON形式のレスポンスを解析する
  })
  .then(data => {
    // 解析されたデータを使用して必要な処理を行う
    subjects.push(...data.comas);
  })
  .catch(error => {
    // エラーハンドリング
    console.error('There was a problem with the fetch operation:', error);
  });

fetch(teacherURL) // サーバーのURLを指定
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // JSON形式のレスポンスを解析する
  })
  .then(data => {
    // 解析されたデータを使用して必要な処理を行う
    teachers.push(...data.comas);
  })
  .catch(error => {
    // エラーハンドリング
    console.error('There was a problem with the fetch operation:', error);
  });

fetch(classroomURL) // サーバーのURLを指定
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // JSON形式のレスポンスを解析する
  })
  .then(data => {
    // 解析されたデータを使用して必要な処理を行う
    classrooms.push(...data.comas);
  })
  .catch(error => {
    // エラーハンドリング
    console.error('There was a problem with the fetch operation:', error);
  });

//DBを表示--------------------------------------------------------------------------------

//DBをゼロから表示しなおす

function displaySubjectDB() {
  dataHTML = [];
  dataHTML.push(`  
    <h2 class="text-center text-info m-4">科目データ</h2>
    `);
  subjects.forEach(function (currentValue, index, array) {
    let tmp = array.length - 1 - index;
    dataHTML.push(`
    <div class="border p-3 mb-3 data-row">
      <div>
        <p><strong>科目名:</strong> ${array[tmp]["科目名"]}</p>
      </div>
      <div>
        <p><strong>コマ数:</strong> ${array[tmp]["コマ数"]}</p>
      </div>
      <div>
        <p><strong>常勤・非常勤:</strong> ${array[tmp]["期間"]}</p>
      </div>
      <div class="delete-subjectButton">
        <button class="btn btn-secondary" id="subjectDelete`+ array[tmp]["科目ID"] + `">削除</button>
      </div>
    </div>
    `);
  });
  dataHTML.push(`
  <div class="row ">
  <div class="col-md-4 mb-3">
    <button onclick="showDown()" class="btn btn-outline-primary btn-lg">閉じる</button>
  </div>
  </div>
  `);

  dataDisplay.innerHTML = '';
  for (var i = 0; i < dataHTML.length; i++) {
    dataDisplay.innerHTML += dataHTML[i];
  }
  addSubjectDeleteEvent();
}

function displayTeacherDB() {
  dataHTML = [];
  dataHTML.push(`  
  <h2 class="text-center text-info m-4">教員データ</h2>
  `);
  teachers.forEach(function (currentValue, index, array) {
    let tmp = array.length - 1 - index;
    dataHTML.push(`
    <div class="border p-3 mb-3 data-row">
      <div>
        <p><strong>教員名:</strong> ${array[tmp]["教員名"]}</p>
      </div>
      <div>
        <p><strong>所属:</strong> ${array[tmp]["所属"]}</p>
      </div>
      <div>
        <p><strong>常勤・非常勤:</strong> ${array[tmp]["常勤・非常勤"]}</p>
      </div>
      <div class="delete-teacherButton">
        <button class="btn btn-secondary" id="teacherDelete`+ array[tmp]["教員ID"] + `">削除</button>
      </div>
    </div>
    `);
  });
  dataHTML.push(`
  <div class="row ">
  <div class="col-md-4 mb-3">
    <button onclick="showDown()" class="btn btn-outline-primary btn-lg">閉じる</button>
  </div>
  </div>
  `);
  dataDisplay.innerHTML = '';
  for (var i = 0; i < dataHTML.length; i++) {
    dataDisplay.innerHTML += dataHTML[i];
  }
  addTeacherDeleteEvent();
}

function displayClassroomDB() {
  dataHTML = [];
  dataHTML.push(`  
  <h2 class="text-center text-info m-4">教室データ</h2>
  `);
  classrooms.forEach(function (currentValue, index, array) {
    let tmp = array.length - 1 - index;
    dataHTML.push(`
    <div class="border p-3 mb-3 data-row">
      <div>
        <p><strong>科目名:</strong> ${array[tmp]["教室名"]}</p>
      </div>
      <div>
        <p><strong>コマ数:</strong> ${array[tmp]["HR・特別教室"]}</p>
      </div>
      <div class="delete-classroomButton">
        <button class="btn btn-secondary" id="classroomDelete`+ array[tmp]["教室ID"] + `">削除</button>
      </div>
    </div>
    `);
  });
  dataHTML.push(`
  <div class="row ">
  <div class="col-md-4 mb-3">
    <button onclick="showDown()" class="btn btn-outline-primary btn-lg">閉じる</button>
  </div>
  </div>
  `);
  dataDisplay.innerHTML = '';
  for (var i = 0; i < dataHTML.length; i++) {
    dataDisplay.innerHTML += dataHTML[i];
  }
  addClassroomDeleteEvent();
}



//登録ボタンが押されたときに呼び出される関数．---------------------------------------------------
//科目の保存ボタンが押されたら
$submitSubject.addEventListener('click', (e) => {
  e.preventDefault(); //これを入れないとボタンを押したときに自動でwebが再読み込みされる
  errorCancell()
  if (!$subject.value || $subject.value.trim() === "") {
    subjectError.innerHTML = `<p class="text-danger">入力してください</p>`;
    return;
  }

  // 新しい科目データのIDを取得
  let newSubjectID;
  for (let i = 1, t = true; i <= subjects.length; i++) {
    t = true;
    subjects.forEach(function (currentValue, index, array) {
      if (array[index]["科目ID"] == i)
        t = false;
    });
    if (t) {
      newSubjectID = i;
      break;
    }
  }

  subjects.push({
    科目ID: newSubjectID,
    科目名: $subject.value,
    期間: $subjectTerm.value,
    コマ数: $subjectTime.value
  });
  // サーバーにデータを送信
  fetch(subjectURL, {  // 正しく変数名を使う
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      科目ID: newSubjectID,
      科目名: $subject.value,
      期間: $subjectTerm.value,
      コマ数: $subjectTime.value
    })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.details);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("User added successfully:", data);
    })
    .catch(error => {
      console.error("Error adding user:", error);
    });
  Onsubject = true;
  Onteacher = false;
  Onclassroom = false;
  displaySubjectDB();
  // フォームの入力値をリセット
  $subject.value = '';
});

//教員の保存ボタンが押されたら
$submitTeacher.addEventListener('click', (e) => {
  e.preventDefault();
  errorCancell()
  if (!$teacher.value || $teacher.value.trim() === "") {
    teacherError.innerHTML = `<p class="text-danger">入力してください</p>`;
    return;
  }

  // 新しい先生データのIDを取得
  let newTeacherId;
  for (let i = 1, t = true; i <= teachers.length; i++) {
    t = true;
    teachers.forEach(function (currentValue, index, array) {
      if (array[index]["教員ID"] == i)
        t = false;
    });
    if (t) {
      newTeacherId = i;
      break;
    }
  }

  teachers.push({
    教員ID: newTeacherId,
    教員名: $teacher.value,
    "常勤・非常勤": $teacherTime.value == '常勤',
    所属: $teacherAffiliation.value
  });
  // サーバーにデータを送信
  fetch(teacherURL, {  // 正しく変数名を使う
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      教員ID: newTeacherId,
      教員名: $teacher.value,
      "常勤・非常勤": true,
      所属: $teacherAffiliation.value
    })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.details);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("User added successfully:", data);
    })
    .catch(error => {
      console.error("Error adding user:", error);
    });

  Onsubject = false;
  Onteacher = true;
  Onclassroom = false;
  displayTeacherDB();

  $teacher.value = '';

});

//教室の保存ボタンが押されたら
$submitClassroom.addEventListener('click', (e) => {
  e.preventDefault();
  errorCancell()
  if (!$classroom.value || $classroom.value.trim() === "") {
    classroomError.innerHTML = `<p class="text-danger">入力してください</p>`;
    return;
  }

  let newClassroomID;
  // 新しい教室データのIDを取得
  for (let i = 1, t = true; i <= classrooms.length; i++) {
    t = true;
    classrooms.forEach(function (currentValue, index, array) {
      if (array[index]["教室ID"] == i)
        t = false;
    });
    if (t) {
      newClassroomID = i;
      break;
    }
  }

  // 教室データを追加
  classrooms.push({
    教室ID: newClassroomID,
    "HR・特別教室": $classroomHR.value,
    教室名: $classroom.value
  });

  // サーバーにデータを送信
  fetch(classroomURL, {  // 正しく変数名を使う
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      教室ID: newClassroomID,
      "HR・特別教室": $classroomHR.value,
      教室名: $classroom.value
    })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(error => {
          throw new Error(error.details);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log("User added successfully:", data);
    })
    .catch(error => {
      console.error("Error adding user:", error);
    });

  Onsubject = false;
  Onteacher = false;
  Onclassroom = true;
  displayClassroomDB();
  // フォームの入力値をリセット
  $classroom.value = '';

});

//すべての削除ボタンについて押されたときの処理を定義する--------------------------------------------------
function addSubjectDeleteEvent() {
  const deleteButtons = document.querySelectorAll('.delete-subjectButton button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const item = e.target.closest('.data-row');
      const onlyNumbers = e.target.id.replace(/\D/g, "");
      subjects = subjects.filter(subject => {
        return subject.科目ID !== +onlyNumbers;
      });
      item.remove();
      fetch(subjectDeleteURL + `${onlyNumbers}`, {
        method: "DELETE"
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.details);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log("Subject deleted successfully:", data);
          subjects.splice(onlyNumbers, 1);
          item.remove();
        })
        .catch(error => {
          console.error("Error deleting subject:", error.message);
        });
    });
  });
}

function addTeacherDeleteEvent() {
  const deleteButtons = document.querySelectorAll('.delete-teacherButton button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const item = e.target.closest('.data-row');
      const onlyNumbers = e.target.id.replace(/\D/g, "");
      teachers = teachers.filter(teacher => { return teacher.教員ID !== +onlyNumbers });
      item.remove();
      fetch(teacherDeleteURL + `${onlyNumbers}`, {
        method: "DELETE"
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.details);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log("Subject deleted successfully:", data);
          subjects.splice(onlyNumbers, 1);
          item.remove();
        })
        .catch(error => {
          console.error("Error deleting subject:", error.message);
        });
    });
  });
}

function addClassroomDeleteEvent() {
  const deleteButtons = document.querySelectorAll('.delete-classroomButton button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const item = e.target.closest('.data-row');
      const onlyNumbers = e.target.id.replace(/\D/g, "");
      console.log(classrooms);
      classrooms = classrooms.filter(classroom => { return classroom.教室ID !== +onlyNumbers });
      item.remove();
      fetch(classroomDeleteURL + `${onlyNumbers}`, {
        method: "DELETE"
      })
        .then(response => {
          if (!response.ok) {
            return response.json().then(error => {
              throw new Error(error.details);
            });
          }
          return response.json();
        })
        .then(data => {
          console.log("Subject deleted successfully:", data);
          subjects.splice(onlyNumbers, 1);
          item.remove();
        })
        .catch(error => {
          console.error("Error deleting subject:", error.message);
        });
    });
  });
}

//保存されたデータの表示・非表示の切り替え
function showSavedSubjects() {
  errorCancell()
  dataDisplay.innerHTML = '';
  Onsubject = !Onsubject;
  Onteacher = false;
  Onclassroom = false;
  if (Onsubject) {
    displaySubjectDB();
  }
}

function showSavedTeachers() {
  errorCancell()
  dataDisplay.innerHTML = '';
  Onteacher = !Onteacher;
  Onsubject = false;
  Onclassroom = false;
  if (Onteacher) {
    displayTeacherDB();
  }
}

function showSavedClassrooms() {
  errorCancell()
  dataDisplay.innerHTML = '';
  Onclassroom = !Onclassroom;
  Onsubject = false;
  Onteacher = false;
  if (Onclassroom) {
    displayClassroomDB();
  }
}

function showDown() {
  dataDisplay.innerHTML = '';
  Onsubject = false;
  Onteacher = false;
  Onclassroom = false;
}

function errorCancell() {
  subjectError.innerHTML = ``
  teacherError.innerHTML = ``
  classroomError.innerHTML = ``
}


addSubjectDeleteEvent();
addTeacherDeleteEvent();
addClassroomDeleteEvent();