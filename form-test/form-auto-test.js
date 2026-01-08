// フォーム自動入力テスト
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== フォーム自動入力テスト開始 ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1000 });

  const screenshotsDir = './form-test/screenshots/';

  // テストデータ
  const testCases = [
    {
      name: '正常系：全項目入力',
      data: {
        name: '山田 太郎',
        email: 'yamada.taro@example.com',
        tel: '090-1234-5678',
        type: 'product',
        reply: 'yes',
        privacy: true,
        message: '製品についての問い合わせです。\n詳細を教えてください。'
      },
      shouldSucceed: true
    },
    {
      name: '異常系：必須項目未入力',
      data: {
        name: '',
        email: 'invalid-email',
        tel: '',
        type: '',
        reply: 'yes',
        privacy: false,
        message: ''
      },
      shouldSucceed: false
    },
    {
      name: '正常系：しんちゃんのテスト',
      data: {
        name: 'しんちゃん',
        email: 'shinchan@example.com',
        tel: '080-8888-9999',
        type: 'other',
        reply: 'yes',
        privacy: true,
        message: 'chrome-devtools-mcpのテストです！\nイェーイイェーイ！😸'
      },
      shouldSucceed: true
    }
  ];

  let testNumber = 1;

  for (const testCase of testCases) {
    console.log(`\n--- テスト ${testNumber}: ${testCase.name} ---`);

    // フォームを開く
    await page.goto('file:///' + path.resolve(__dirname, 'contact-form.html'));
    await new Promise(resolve => setTimeout(resolve, 500));

    // 入力前のスクリーンショット
    await page.screenshot({
      path: screenshotsDir + `test${testNumber}-01-before.png`,
      fullPage: false
    });
    console.log('📸 入力前のスクリーンショットを撮影');

    // フォームに入力
    console.log('⌨️  フォーム入力中...');

    // お名前
    if (testCase.data.name) {
      await page.type('#name', testCase.data.name, { delay: 50 });
    }

    // メールアドレス
    if (testCase.data.email) {
      await page.type('#email', testCase.data.email, { delay: 50 });
    }

    // 電話番号
    if (testCase.data.tel) {
      await page.type('#tel', testCase.data.tel, { delay: 50 });
    }

    // お問い合わせ種類
    if (testCase.data.type) {
      await page.select('#type', testCase.data.type);
    }

    // 返信希望ラジオボタン
    if (testCase.data.reply === 'no') {
      await page.click('input[name="reply"][value="no"]');
    }

    // プライバシーチェックボックス
    if (testCase.data.privacy) {
      await page.click('#privacy');
    }

    // お問い合わせ内容
    if (testCase.data.message) {
      await page.type('#message', testCase.data.message, { delay: 30 });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // 入力後のスクリーンショット
    await page.screenshot({
      path: screenshotsDir + `test${testNumber}-02-filled.png`,
      fullPage: false
    });
    console.log('📸 入力後のスクリーンショットを撮影');

    // 送信ボタンクリック
    console.log('🖱️  送信ボタンをクリック...');
    await page.click('.submit-btn');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 結果のスクリーンショット
    await page.screenshot({
      path: screenshotsDir + `test${testNumber}-03-result.png`,
      fullPage: false
    });
    console.log('📸 結果のスクリーンショットを撮影');

    // 結果の検証
    const successMessage = await page.$('.result.success');
    const hasErrors = await page.$('.error.show');

    if (testCase.shouldSucceed) {
      if (successMessage) {
        console.log('✅ テスト成功：送信完了メッセージが表示されました');

        // 送信されたデータを取得
        const submittedData = await page.evaluate(() => {
          const resultItems = document.querySelectorAll('.result-item');
          const data = {};
          resultItems.forEach(item => {
            const label = item.querySelector('.result-label').textContent.replace(':', '');
            const value = item.querySelector('.result-value').textContent;
            data[label] = value;
          });
          return data;
        });

        console.log('📋 送信されたデータ:');
        console.log(`   お名前: ${submittedData['お名前']}`);
        console.log(`   メール: ${submittedData['メール']}`);
        console.log(`   種類: ${submittedData['種類']}`);
      } else {
        console.log('❌ テスト失敗：送信完了メッセージが表示されませんでした');
      }
    } else {
      if (hasErrors) {
        console.log('✅ テスト成功：バリデーションエラーが正しく表示されました');

        // エラーメッセージを取得
        const errors = await page.evaluate(() => {
          const errorEls = document.querySelectorAll('.error.show');
          return Array.from(errorEls).map(el => el.textContent);
        });
        console.log('⚠️  エラーメッセージ:', errors.join(', '));
      } else {
        console.log('❌ テスト失敗：バリデーションが機能しませんでした');
      }
    }

    testNumber++;
  }

  // まとめテスト：複数連続入力
  console.log('\n--- ボーナステスト：連続入力 ---');

  await page.goto('file:///' + path.resolve(__dirname, 'contact-form.html'));

  const quickTasks = [
    { name: 'タスク1: レビュー確認', message: '最新のレビューを確認してください' },
    { name: 'タスク2: バグ報告', message: 'ログイン時にエラーが発生します' },
    { name: 'タスク3: 機能要望', message: 'ダークモードを追加してほしい' }
  ];

  for (let i = 0; i < quickTasks.length; i++) {
    const task = quickTasks[i];
    console.log(`⌨️  ${task.name}を入力...`);

    await page.goto('file:///' + path.resolve(__dirname, 'contact-form.html'));
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.type('#name', `テストユーザー${i + 1}`);
    await page.type('#email', `user${i + 1}@test.com`);
    await page.select('#type', 'support');
    await page.click('#privacy');
    await page.type('#message', task.message);

    await new Promise(resolve => setTimeout(resolve, 300));
    await page.screenshot({
      path: screenshotsDir + `quick-task-${i + 1}.png`,
      fullPage: false
    });
  }

  console.log('📸 クイックタスクのスクリーンショットを撮影完了');

  await browser.close();

  console.log('\n=== 全テスト完了 ===');
  console.log(`📁 スクリーンショット保存先: ${screenshotsDir}`);
})();
