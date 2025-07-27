import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname を ESModules で使えるように
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ポートと基準ディレクトリ
const PORT = process.env.PORT || 3000;
const baseDir = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  try {
    // URL デコード + 初期パス設定
    const reqPath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
    const filePath = path.join(baseDir, reqPath);

    // distフォルダ外アクセスの防止
    if (!filePath.startsWith(baseDir)) {
      res.writeHead(403);
      res.end('403 Forbidden');
      return;
    }

    // ファイル読み込み
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);

  } catch (err) {
    res.writeHead(404);
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

