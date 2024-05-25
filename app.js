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
  port: 5432
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
