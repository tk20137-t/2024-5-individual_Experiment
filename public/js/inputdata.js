// 基礎データ入力ホームの各入力欄のオブジェクトを定数に代入する
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

// 科目・教員・教室それぞれの登録ボタンのオブジェクトを定数に代入する
const $submitSubject = document.getElementById('submitSubject');
const $submitTeacher = document.getElementById('submitTeacher');
const $submitClassroom = document.getElementById('submitClassroom');

// 入力ホームで入力された科目・教員・教室の各データはオブジェクトの配列として保存される
let subjects = []; // [(1,subject,subjectterm),(2,subject,subjectterm),・・・・]
let teachers = []; // [(1,teacher,teacherTime,teacherAffilication),(2,teacher,teacherTime,teacherAffilication),・・・・]
let classrooms = []; // [(1,classroom,classroomHR),(2,classroom,classroomHR),・・・・]

// 保存したデータを表示するHTML形式のデータ
var subjectHTML = [];
var teacherHTML = [];
var classroomHTML = [];

// 保存されている各データが表示されているか否か
let Onsubject = false;
let Onteacher = false;
let Onclassroom = false;

let dataHTML =  [];

// DBを表示--------------------------------------------------------------------------------

// DBをゼロから表示しなおす

function displaySubjectDB() {
  fetch('/fetch-subject')
    .then(response => response.json())
    .then(data => {
      console.log("data.subject_comas表示:", data.comas);
      dataHTML = [];
      dataHTML.push(`<h2 class="text-center text-info m-4">科目データ</h2>`);
      data.comas.forEach(subject => {
        dataHTML.push(`
          <div class="border p-3 mb-3 data-row">
            <div>
              <p><strong>科目名:</strong> ${subject.科目名}</p>
            </div>
            <div>
              <p><strong>コマ数:</strong> ${subject.コマ数}</p>
            </div>
            <div>
              <p><strong>期間:</strong> ${subject.期間}</p>
            </div>
            <div class="delete-subjectButton">
              <button class="btn btn-secondary" id="subjectDelete${subject.科目ID}">削除</button>
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
      dataDisplay.innerHTML = dataHTML.join('');
      
      // 削除ボタンのイベントリスナーを追加
      addSubjectDeleteEvent(data);
    })
    .catch(error => {
      console.error('Error fetching subject data:', error);
  });
}

function displayTeacherDB() {
  fetch('/fetch-teachers') // 教員データを取得するAPIのエンドポイントを指定する必要があります
    .then(response => response.json())
    .then(data => {
      console.log("data.teachers_comas表示:", data.comas);
      dataHTML = [];
      dataHTML.push(`<h2 class="text-center text-info m-4">教員データ</h2>`);
      data.comas.forEach(teacher => {
        dataHTML.push(`
          <div class="border p-3 mb-3 data-row">
            <div>
              <p><strong>教員名:</strong> ${teacher.教員名}</p>
            </div>
            <div>
              <p><strong>所属:</strong> ${teacher.所属}</p>
            </div>
            <div>
              <p><strong>常勤・非常勤:</strong> ${teacher["常勤・非常勤"]}</p>
            </div>
            <div class="delete-teacherButton">
              <button class="btn btn-secondary" id="teacherDelete${teacher.教員ID}">削除</button>
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
      dataDisplay.innerHTML = dataHTML.join('');
      
      // 削除ボタンのイベントリスナーを追加
      addTeacherDeleteEvent();
    })
    .catch(error => {
      console.error('Error fetching teacher data:', error);
  });
}

function displayClassroomDB() {
  fetch('/fetch-classroom') // ここで教室データを取得するAPIのエンドポイントを指定する必要があります
    .then(response => response.json())
    .then(data => {
      console.log("data.classroom_comas表示:", data.comas);
      dataHTML = [];
      dataHTML.push(`<h2 class="text-center text-info m-4">教室データ</h2>`);
      data.comas.forEach(classroom => {
        dataHTML.push(`
          <div class="border p-3 mb-3 data-row">
            <div>
              <p><strong>教室名:</strong> ${classroom.教室名}</p>
            </div>
            <div>
              <p><strong>HR・特別教室:</strong> ${classroom["HR・特別教室"]}</p>
            </div>
            <div class="delete-classroomButton">
              <button class="btn btn-secondary" id="classroomDelete${classroom.教室ID}">削除</button>
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
      dataDisplay.innerHTML = dataHTML.join('');
      
      // 削除ボタンのイベントリスナーを追加
      addClassroomDeleteEvent();
    })
    .catch(error => {
      console.error('Error fetching classroom data:', error);
  });
}

// 登録ボタンが押されたときに呼び出される関数．---------------------------------------------------
// 科目の保存ボタンが押されたら
$submitSubject.addEventListener('click', (e) => {
  e.preventDefault(); // これを入れないとボタンを押したときに自動でwebが再読み込みされる
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

  Onsubject = true;
  Onteacher = false;
  Onclassroom = false;
  displaySubjectDB();
  // フォームの入力値をリセット
  $subject.value = '';
});

// 教員の保存ボタンが押されたら
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

  Onsubject = false;
  Onteacher = true;
  Onclassroom = false;
  displayTeacherDB();

  $teacher.value = '';

});

// 教室の保存ボタンが押されたら
$submitClassroom.addEventListener('click', (e) => {
  e.preventDefault();
  errorCancell()
  if (!$classroom.value || $classroom.value.trim() === "") {
    classroomError.innerHTML = `<p class="text-danger">入力してください</p>`;
    return;
  }

  // 新しい教室データのIDを取得
  let newClassroomId;
  for (let i = 1, t = true; i <= classrooms.length; i++) {
    t = true;
    classrooms.forEach(function (currentValue, index, array) {
      if (array[index]["教室ID"] == i)
        t = false;
    });
    if (t) {
      newClassroomId = i;
      break;
    }
  }

  classrooms.push({
    教室ID: newClassroomId,
    教室名: $classroom.value,
    "HR・特別教室": $classroomHR.value
  });

  Onsubject = false;
  Onteacher = false;
  Onclassroom = true;
  displayClassroomDB();

  $classroom.value = '';

});

// 削除ボタンが押されたときに呼び出される関数．----------------------------------------------
function addSubjectDeleteEvent(data) {
  data.comas.forEach(subject => {
    document.getElementById("subjectDelete" + subject.科目ID).addEventListener('click', (e) => {
      console.log('subject.科目ID', subject.科目ID);
      // 削除リクエストをサーバーに送信
      fetch(`/delete-subject/${subject.科目ID}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          displaySubjectDB(); // データを再取得して表示
        } else {
          console.error('Failed to delete subject');
        }
      })
      .catch(error => {
        console.error('Error deleting subject:', error);
      });
    });
  });
}

function addTeacherDeleteEvent() {
  teachers.forEach(function (currentValue, index, array) {
    document.getElementById("teacherDelete" + array[index]["教員ID"]).addEventListener('click', (e) => {
      // 削除リクエストをサーバーに送信
      fetch(`/delete-teacher/${array[index]["教員ID"]}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          displayTeacherDB(); // データを再取得して表示
        } else {
          console.error('Failed to delete teacher');
        }
      })
      .catch(error => {
        console.error('Error deleting teacher:', error);
      });
    });
  });
}

function addClassroomDeleteEvent() {
  classrooms.forEach(function (currentValue, index, array) {
    document.getElementById("classroomDelete" + array[index]["教室ID"]).addEventListener('click', (e) => {
      // 削除リクエストをサーバーに送信
      fetch(`/delete-classroom/${array[index]["教室ID"]}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          displayClassroomDB(); // データを再取得して表示
        } else {
          console.error('Failed to delete classroom');
        }
      })
      .catch(error => {
        console.error('Error deleting classroom:', error);
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

function errorCancell() {
  subjectError.innerHTML = "";
  teacherError.innerHTML = "";
  classroomError.innerHTML = "";
}

// 表示されている各データの表示を終了する
function showDown() {
  dataDisplay.innerHTML = '';
}
