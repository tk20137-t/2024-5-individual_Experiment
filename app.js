const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.get('/fetch-classroom', (req, res) => {
  console.log('Received request for /fetch-classroom');
  const query2 = {
    text: "SELECT * FROM 教室表"
  };
  console.log('query2:', query2);

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

// データを削除するエンドポイント
app.delete('/delete-subject/:id', (req, res) => {
  const subjectID = req.params.id;
  const query3 = {
    text: "DELETE FROM 科目表 WHERE subject_id = $1" 
  };

  client.query(query3, [subjectID])
    .then(result => {
      res.json({ message: 'Subject deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.delete('/delete-teacher/:id', (req, res) => {
  const teacherID = req.params.id;
  const query4 = {
    text :"DELETE FROM 教員表 WHERE teacher_id = $1" 
  };

  client.query(query4, [teacherID])
    .then(result => {
      res.json({ message: 'Teacher deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.delete('/delete-classroom/:id', (req, res) => {
  const classroomID = req.params.id;
  const query5 = {
    text: "DELETE FROM 教室表 WHERE classroom_id = $1"
  };

  client.query(query5, [classroomID])
    .then(result => {
      res.json({ message: 'Classroom deleted successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

// 新しいデータを追加するエンドポイント
app.post('/fetch-subject', (req, res) => {
  const { 科目ID, 科目名, 期間, コマ数 } = req.body;
  const query6 = {
    text: "INSERT INTO 科目表 (subject_id, subject_name, period, koma_count) VALUES ($1, $2, $3, $4)"
  };

  client.query(query6, [科目ID, 科目名, 期間, コマ数])
    .then(result => {
      res.json({ message: 'Subject added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/fetch-teacher', (req, res) => {
  const { 教員ID, 教員名, "常勤・非常勤": 所属 } = req.body;
  const query7 = {
    text: "INSERT INTO 教室表 (teacher_id, teacher_name, full_time, affiliation) VALUES ($1, $2, $3, $4)"
  };

  client.query(query7, [教員ID, 教員名, "常勤・非常勤", 所属])
    .then(result => {
      res.json({ message: 'Teacher added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

app.post('/fetch-classroom', (req, res) => {
  const { 教室ID, "HR・特別教室": 教室名 } = req.body;
  const query8 = {
    text: "INSERT INTO 教室表 (classroom_id, hr_special_classroom, classroom_name) VALUES ($1, $2, $3)"
  };

  client.query(query8, [教室ID, "HR・特別教室", 教室名])
    .then(result => {
      res.json({ message: 'Classroom added successfully' });
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
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
