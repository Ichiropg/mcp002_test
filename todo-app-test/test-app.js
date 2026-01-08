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
  await page.setViewport({ width: 1200, height: 800 });

  // アプリに移動
  console.log('TODOアプリに移動中...');
  await page.goto('http://localhost:8080', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // 初期状態のスクリーンショット
  console.log('初期状態のスクリーンショットを撮影...');
  await page.screenshot({ path: './screenshots/todo-initial.png', fullPage: false });

  // タイトルを取得
  const title = await page.title();
  console.log(`ページタイトル: ${title}`);

  // タスクを追加してみる
  console.log('タスクを追加中...');
  await page.type('#todoInput', 'chrome-devtools-mcpのテスト');
  await page.click('#addBtn');
  await new Promise(resolve => setTimeout(resolve, 500));

  await page.type('#todoInput', 'スクリーンショット撮影');
  await page.click('#addBtn');
  await new Promise(resolve => setTimeout(resolve, 500));

  await page.type('#todoInput', 'フォーム入力テスト');
  await page.click('#addBtn');
  await new Promise(resolve => setTimeout(resolve, 500));

  // タスク追加後のスクリーンショット
  console.log('タスク追加後のスクリーンショットを撮影...');
  await page.screenshot({ path: './screenshots/todo-with-tasks.png', fullPage: false });

  // 1つ目のタスクを完了にする
  console.log('タスクを完了に...');
  const firstCheckbox = await page.$('.todo-checkbox');
  if (firstCheckbox) {
    await firstCheckbox.click();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 完了後のスクリーンショット
  console.log('完了後のスクリーンショットを撮影...');
  await page.screenshot({ path: './screenshots/todo-completed.png', fullPage: false });

  // 統計情報を取得
  const stats = await page.evaluate(() => {
    return {
      total: document.getElementById('totalCount').textContent,
      completed: document.getElementById('completedCount').textContent,
      pending: document.getElementById('pendingCount').textContent
    };
  });

  console.log('\n=== 統計情報 ===');
  console.log(stats);

  // 全タスクを取得
  const todos = await page.evaluate(() => {
    const items = document.querySelectorAll('.todo-item');
    return Array.from(items).map(item => ({
      text: item.querySelector('.todo-text').textContent,
      completed: item.classList.contains('completed')
    }));
  });

  console.log('\n=== タスク一覧 ===');
  todos.forEach((todo, i) => {
    console.log(`${i + 1}. [${todo.completed ? '✓' : ' '}] ${todo.text}`);
  });

  await browser.close();
  console.log('\nテスト完了！');
})();
