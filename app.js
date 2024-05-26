const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;
app.use(cors());
app.use(express.json()); // JSONパーシングミドルウェア

// データベースに接続
const client = new Client({
  user: "nittc2024_j5exp_21",
  host: "dpg-cofnc2f79t8c73c6v0q0-a.singapore-postgres.render.com",
  database: "nittc2024_j5exp_21",
  password: "GEhpFFeayHeogc15345Giu8e3WdOGi40",
  port: 5432,
  ssl: {
    rejectUnauthorized: false // 試験的な目的のみで使用する場合。
  }
});

client.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((e) => console.error("Database connection error", e.stack));

// 静的ファイルを提供するためのミドルウェアを追加
app.use(express.static(path.join(__dirname, 'public')));

// ルート
app.get('/', (req, res) => {
  console.log('__dirname:', __dirname);
  res.sendFile(path.join(__dirname, 'public', 'inputdata.html'));
});

// データを取得するエンドポイント
app.get('/fetch-data', (req, res) => {
  console.log('Received request for /fetch-data');
  const query1 = {
    text: "SELECT * FROM コマ表"
  };

  client.query(query1)
    .then(result => {
      console.log('result.rows:', result.rows);
      res.json({ comas: result.rows });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.get('/fetch-subject', (req, res) => {
  console.log('Received request for /fetch-subject');
  const query2 = {
    text: "SELECT * FROM 科目表"
  };

  client.query(query2)
    .then(result => {
      console.log('result.rows:', result.rows);
      res.json({ comas: result.rows });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/fetch-teachers', (req, res) => {
  console.log('Received request for /fetch-teachers');
  const query3 = {
    text: "SELECT * FROM 教員表"
  };
  console.log('query3:', query3);

  client.query(query3)
    .then(result => {
      console.log('result.rows:', result.rows);
      res.json({ comas: result.rows });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/fetch-classroom', (req, res) => {
  console.log('Received request for /fetch-classroom');
  const query4 = {
    text: "SELECT * FROM 教室表"
  };
  console.log('query4:', query4);

  client.query(query4)
    .then(result => {
      console.log('result.rows:', result.rows);
      res.json({ comas: result.rows });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// データを削除するエンドポイント
app.delete('/delete-subject/:id', (req, res) => {
  const subjectID = req.params.id;
  console.log(`Deleting subject with ID: ${subjectID}`); // デバッグログ追加
  const query5 = {
    text: 'DELETE FROM 科目表 WHERE "科目ID" = $1'
  };

  client.query(query5, [subjectID])
    .then(result => {
      //console.log('Query result:', result); // デバッグログ追加
      res.json({ message: 'Subject deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.delete('/delete-teacher/:id', (req, res) => {
  const teacherID = req.params.id;
  console.log(`Deleting teacher with ID: ${teacherID}`); // デバッグログ追加
  const query6 = {
    text :'DELETE FROM 教員表 WHERE "教員ID" = $1' 
  };

  client.query(query6, [teacherID])
    .then(result => {
      //console.log('Query result:', result); // デバッグログ追加
      res.json({ message: 'Teacher deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.delete('/delete-classroom/:id', (req, res) => {
  const classroomID = req.params.id;
  console.log(`Deleting classroom with ID: ${classroomID}`); // デバッグログ追加
  const query7 = {
    text: 'DELETE FROM 教室表 WHERE "教室ID" = $1'
  };

  client.query(query7, [classroomID])
    .then(result => {
      //console.log('Query result:', result); // デバッグログ追加
      res.json({ message: 'Classroom deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// 新しいデータを追加するエンドポイント
app.post('/save-subject', (req, res) => {
  // 最大の科目IDを取得するクエリ
  const queryMaxID = {
    text: 'SELECT MAX("科目ID") AS max_id FROM "科目表"'
  };
  // 最大の科目IDを取得して新しいIDを生成し、そのIDでデータを追加する処理
  client.query(queryMaxID)
    .then(result => {
      const maxID = result.rows[0].max_id || 0; // 最大IDを取得し、存在しない場合は0をセット
      const newSubjectID = maxID + 1; // 新しいIDを計算

      // 新しいデータを追加するクエリ
      const { 科目名, 期間, コマ数 } = req.body;
      const queryAddSubject = {
        text: 'INSERT INTO "科目表" ("科目ID", "科目名", "期間", "コマ数") VALUES ($1, $2, $3, $4)',
        values: [newSubjectID, 科目名, 期間, コマ数]
      };

      // 新しいデータをデータベースに追加
      return client.query(queryAddSubject);
    })
    .then(() => {
      res.json({ message: 'Subject added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/save-teacher', (req, res) => {
  // 最大の教員IDを取得するクエリ
  const queryMaxID = {
    text: 'SELECT MAX("教員ID") AS max_id FROM "教員表"'
  };

  // 最大の教員IDを取得して新しいIDを生成し、そのIDでデータを追加する処理
  client.query(queryMaxID)
    .then(result => {
      const maxID = result.rows[0].max_id || 0; // 最大IDを取得し、存在しない場合は0をセット
      const newTeacherID = maxID + 1; // 新しいIDを計算

      // 新しいデータを追加するクエリ
      const { 教員名, 勤務形態, 所属 } = req.body;
      const queryAddTeacher = {
        text: 'INSERT INTO "教員表" ("教員ID", "教員名", "勤務形態", "所属") VALUES ($1, $2, $3, $4)',
        values: [newTeacherID, 教員名, 勤務形態, 所属]
      };

      // 新しいデータをデータベースに追加
      return client.query(queryAddTeacher);
    })
    .then(() => {
      res.json({ message: 'Teacher added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/save-classroom', (req, res) => {
  // 最大の教室IDを取得するクエリ
  const queryMaxID = {
    text: 'SELECT MAX("教室ID") AS max_id FROM "教室表"'
  };

  // 最大の教室IDを取得して新しいIDを生成し、そのIDでデータを追加する処理
  client.query(queryMaxID)
    .then(result => {
      const maxID = result.rows[0].max_id || 0; // 最大IDを取得し、存在しない場合は0をセット
      const newClassroomID = maxID + 1; // 新しいIDを計算

      // 新しいデータを追加するクエリ
      const { 教室名, 教室設定 } = req.body;
      const queryAddClassroom = {
        text: 'INSERT INTO "教室表" ("教室ID", "教室名", "教室設定") VALUES ($1, $2, $3)',
        values: [newClassroomID, 教室名, 教室設定]
      };

      // 新しいデータをデータベースに追加
      return client.query(queryAddClassroom);
    })
    .then(() => {
      res.json({ message: 'Classroom added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.get('/api/teacher', async (req, res) => {
  try {
    const teacher = await client.query('SELECT "教員名" FROM "教員表"');
    res.json(teacher.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/subject', async (req, res) => {
  try {
    const subject = await client.query('SELECT "科目名" FROM "科目表"');
    res.json(subject.rows);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/classroom', async (req, res) => {
  try {
    const classroom = await client.query('SELECT "教室名" FROM "教室表"');
    res.json(classroom.rows);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/komas', async (req, res) => {
  try {
    const komas = await client.query('SELECT * FROM "コマ表"');
    res.json(komas.rows);
  } catch (error) {
    console.error('Error fetching komas:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/registerClass', async (req, res) => {
  try {
    const { registeredClasses, registeredKomas } = req.body;

    await client.query('DELETE FROM "コマ表"');

    const allClasses = [...registeredClasses, ...registeredKomas];

    for (const registeredClass of allClasses) {
      const {
        subjectName,
        teacherName,
        classValue,
        classroomName,
        timeValue,
        dayValue,
        priorityValue
      } = registeredClass;

      // 科目名からコマ数を取得
      const komasuResult = await client.query(
        'SELECT "コマ数" FROM "科目表" WHERE "科目名" = $1',
        [subjectName]
      );

      // 科目が存在するか確認し、コマ数を取得
      if (komasuResult.rows.length > 0) {
        const komasuValue = komasuResult.rows[0].コマ数;

        // 最大のコマIDを取得
        const maxIdResult = await client.query('SELECT MAX("コマID") FROM "コマ表"');
        const maxId = maxIdResult.rows[0].max || 0;
        const newId = maxId + 1;

        // データベースにデータを挿入
        await client.query(
          'INSERT INTO "コマ表" ("コマID", "科目名", "教員名", "クラス", "教室名", "実施時間", "コマ数", "コマ優先度", "曜日") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
          [newId, subjectName, teacherName, classValue, classroomName, timeValue, komasuValue, priorityValue, dayValue]
        );
      } else {
        throw new Error(`指定された科目が見つかりません: ${subjectName}`);
      }
    }

    res.json({ success: true, message: '授業が登録されました' });
  } catch (error) {
    console.error('Error registering class:', error.message);
    res.status(500).json({ success: false, message: '授業の登録中にエラーが発生しました', error: error.message });
  }
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// サーバー起動
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
