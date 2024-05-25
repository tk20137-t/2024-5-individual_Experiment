const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

//データベースに接続
const { Client } = require("pg");
const client = new Client({
  user: "nittc2024_j5exp_21",
  host: "dpg-cofnc2f79t8c73c6v0q0-a.singapore-postgres.render.com",
  database: "nittc2024_j5exp_21",
  password: "GEhpFFeayHeogc15345Giu8e3WdOGi40",
  port: 5432,
  // ssl: {
  //   rejectUnauthorized: false // 試験的な目的のみで使用する場合。
  // }
});

// データベースに接続
client.connect()
  .then(() => console.log("Database connected successfully"))
  .catch((e) => console.error("Database connection error", e.stack));

// 静的ファイル配信
app.use(express.static('public'));

// ルート
app.get('/', (req, res) => {
  console.log('__dirname:', __dirname);
  res.join(__dirname, 'public', 'index.html');
});

// データを取得するエンドポイント
app.get('https://two024-5-individual-experiment.onrender.com/fetch-data', (req, res) => {
  console.log('Received request for /fetch-data'); // リクエストをログに記録
  const query1 = {
    text: "SELECT * FROM コマ表",
  };

  app.use((req, res, next) => {
    res.status(404).send('Sorry, that route doesn\'t exist.');
  });

  client.query(query1)
    .then(result => {
      console.log('result.rows:', result.rows); // クエリ結果をログに出力して確認
      res.json({comas: result.rows });
  })
  .catch((e) => {
      console.error(e.stack);
      res.status(500).json({ error: 'Internal Server Error' });
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// サーバー起動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
