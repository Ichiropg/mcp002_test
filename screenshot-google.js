const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('Chromeを起動中...');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // ビューポートを設定
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Googleに移動中...');
  await page.goto('https://www.google.com', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // 少し待機してページが完全に読み込まれるのを待つ
  await new Promise(resolve => setTimeout(resolve, 2000));

  const screenshotPath = path.join(__dirname, 'screenshots', 'google-homepage.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`スクリーンショットを保存しました: ${screenshotPath}`);

  // ページタイトルも取得
  const title = await page.title();
  console.log(`ページタイトル: ${title}`);

  await browser.close();
})();
