const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;

// 静的ファイルを提供するためのミドルウェアを追加
app.use(express.static(path.join(__dirname, 'public')));

app.get("/fetch-data", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

