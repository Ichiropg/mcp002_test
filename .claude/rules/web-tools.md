# Webツール関連ルール

このファイルはWebスクレイピング・ブラウザ自動化・chrome-devtools-mcpを使用する時のルールです。

## 使用可能なツール

### chrome-devtools-mcp (MCPサーバー)
- **設定済み**: `claude mcp add chrome-devtools npx chrome-devtools-mcp@latest`
- **主な機能**:
  - `take_screenshot` - ページのスクリーンショット
  - `navigate_page` - ページ遷移
  - `click` / `fill` - ブラウザ操作
  - `evaluate_script` - JavaScript実行
  - `performance_analyze_insight` - パフォーマンス分析
  - `list_network_requests` - ネットワーク監視

### Puppeteer (Node.js)
- **インストール済み**: `npm install puppeteer`
- **Chromeパス**: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **サンプルコード**: `screenshot-google.js`, `scrape-headers.js`

## よく使うスニペット

### Puppeteerでスクリーンショット
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### Puppeteerで見出し取得
```javascript
const headings = await page.evaluate(() => {
  const results = [];
  document.querySelectorAll('h1, h2, h3').forEach(el => {
    results.push({ tag: el.tagName, text: el.textContent.trim() });
  });
  return results;
});
```

## 注意点
- `page.waitForTimeout()` は削除された → `new Promise(r => setTimeout(r, ms))` を使用
- スクリーンショット保存先: `./screenshots/` ディレクトリ

## 関連ファイル
- `screenshot-google.js` - Googleスクリーンショット実行例
- `scrape-headers.js` - 見出し取得実行例
- `screenshots/` - 画像保存先
