const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const url = 'https://wachapi-music.hatenablog.jp/entry/2022/02/15/205923';

  console.log('Chromeを起動中...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('ページに移動中...');
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  // ページタイトル
  const title = await page.title();
  console.log('\n=== ページタイトル ===');
  console.log(title);

  // 見出しを取得
  const headings = await page.evaluate(() => {
    const results = [];
    const headingTags = ['h1', 'h2', 'h3'];

    headingTags.forEach(tag => {
      const elements = document.querySelectorAll(tag);
      elements.forEach((el, index) => {
        results.push({
          tag: tag.toUpperCase(),
          text: el.textContent.trim(),
          level: parseInt(tag[1])
        });
      });
    });

    return results;
  });

  console.log('\n=== 見出し一覧 ===');
  headings.forEach(h => {
    const indent = '  '.repeat(h.level - 1);
    console.log(`${indent}[${h.tag}] ${h.text}`);
  });

  // スクリーンショットも撮る
  const screenshotPath = './screenshots/hatena-blog.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\nスクリーンショット: ${screenshotPath}`);

  // 結果をJSONでも保存
  const result = {
    url: url,
    title: title,
    headings: headings
  };
  fs.writeFileSync('./screenshots/hatena-blog-headers.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('JSONファイル: ./screenshots/hatena-blog-headers.json');

  await browser.close();
})();
