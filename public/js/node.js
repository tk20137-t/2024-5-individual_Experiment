const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;
app.use(express.json());

// データベース接続情報
const client = new Client({
  user: "nittc2024_j5exp_21",
  host: "dpg-cofnc2f79t8c73c6v0q0-a.singapore-postgres.render.com",
  database: "nittc2024_j5exp_21",
  password: "GEhpFFeayHeogc15345Giu8e3WdOGi40",
  port: 5432,
  ssl:{
    rejectUnauthorized: false
  }
});

client.connect();

app.use(cors()); // CORSを有効にする

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
        teacherName1,
        teacherName2,
        classValue,
        classroomName,
        timeValue,
        dayValue,
        priorityValue
      } = registeredClass;

      const fullTeacherName = `${teacherName1} ${teacherName2}`;

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
          [newId, subjectName, fullTeacherName, classValue, classroomName, timeValue, komasuValue, priorityValue, dayValue]
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




// 静的ファイルを提供
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
