export interface TutorialStep {
  /** CSS selector for spotlight target; undefined = centered overlay */
  selector?: string
  title: string
  content: string
}

export const TUTORIAL_STEPS: Record<string, TutorialStep[]> = {
  home: [
    {
      title: '嗨，歡迎來到 PikLog！🍄',
      content: '你好啊，隊長！這裡是皮克敏互動紀錄大本營，讓我快速帶你認識一下這個小工具～',
    },
    {
      selector: '[data-tutorial="home-quick"]',
      title: '⚡ 快速紀錄區',
      content: '這裡可以一鍵記下常用互動！設定好快捷動作之後，每次按一下就完成記錄，超省力的 🎉',
    },
    {
      selector: '[data-tutorial="home-add-btn"]',
      title: '📮 手動新增紀錄',
      content: '沒有設快捷動作也沒關係，按這顆藍色按鈕可以手動選好友和互動類型，一樣好記！',
    },
    {
      selector: '[data-tutorial="home-today"]',
      title: '🌱 今日互動',
      content: '今天記了什麼，都會顯示在這裡。一目了然，就像皮克敏每天的探險日誌 🍂',
    },
    {
      selector: '[data-tutorial="home-features"]',
      title: '📚 其他功能入口',
      content: '點這三張卡片可以進入人物管理、互動紀錄和統計分析，以後慢慢探索！',
    },
  ],

  people: [
    {
      title: '👥 人物管理',
      content: '要記錄互動，得先把好友加進來！這裡就是你的皮克敏隊員名冊 🌸',
    },
    {
      selector: '[data-tutorial="people-form"]',
      title: '✏️ 建立新人物',
      content: '填入好友名字，選一個代表色和圖樣，按「建立新人物」就加進去了！超簡單的 😊',
    },
    {
      selector: '[data-tutorial="people-colors"]',
      title: '🎨 選代表顏色',
      content: '每位好友有自己的顏色！之後首頁的快速紀錄按鈕就會顯示這個顏色，一眼就認得出來 🌈',
    },
    {
      selector: '[data-tutorial="people-list"]',
      title: '📋 好友名冊',
      content: '加好的好友都出現在這裡～按鉛筆圖示可以編輯，按垃圾桶可以刪除（刪前會再問你一次，不用擔心誤觸！）',
    },
    {
      selector: '[data-tutorial="people-qa-btn"]',
      title: '⚡ 快捷動作設定',
      content: '加好好友後，按這裡去設定快捷動作！設完後首頁會多出彩色的一鍵紀錄按鈕，記錄從此超快速 🚀',
    },
  ],

  quickActions: [
    {
      title: '⚡ 快捷動作設定',
      content: '這裡可以設定你最常用的互動組合！設好之後，回首頁就能一鍵記錄，再也不用每次都填表單啦 🍄',
    },
    {
      selector: '[data-tutorial="qa-add-btn"]',
      title: '➕ 新增快捷動作',
      content: '按這裡新增一個快捷動作，選好友 + 選互動類型 + 選方向，就完成了！可以加很多個喔～',
    },
    {
      selector: '[data-tutorial="qa-list"]',
      title: '📋 目前的快捷動作',
      content: '設定好的快捷動作都在這裡，可以隨時新增或刪除。設完後回首頁就能看到彩色按鈕！',
    },
  ],

  records: [
    {
      title: '📜 互動紀錄',
      content: '這裡是你所有互動的歷史清單！每一筆都找得到、改得了，就像皮克敏探險的記帳本 📝',
    },
    {
      selector: '[data-tutorial="records-filter"]',
      title: '🔍 篩選功能',
      content: '想找特定好友或特定類型的紀錄？用這裡的篩選欄來縮小範圍，馬上找到！',
    },
    {
      selector: '[data-tutorial="records-list"]',
      title: '📝 紀錄清單',
      content: '所有互動從最新的排到最舊。點任何一筆可以編輯或刪除，記錯了也不怕 😌',
    },
  ],

  calendar: [
    {
      title: '📅 月曆檢視',
      content: '用月曆的方式看看哪幾天有互動！點日期就能查看當天的記錄明細 🗓️',
    },
    {
      selector: '[data-tutorial="cal-nav"]',
      title: '◀ ▶ 切換月份',
      content: '按左右箭頭切換上個月或下個月。想回到今天，按「今天」就能立刻跳回來！',
    },
    {
      selector: '[data-tutorial="cal-grid"]',
      title: '🌸 彩色圓點',
      content: '有互動的日期上面會出現彩色圓點，顏色對應好友的代表色。哪幾天最熱鬧一眼就看出來！',
    },
    {
      selector: '[data-tutorial="cal-detail"]',
      title: '👇 點日期看明細',
      content: '點任何一天，下方就會展開當天的互動清單。今天是哪些好友見面了呢？🍄',
    },
  ],

  stats: [
    {
      title: '📊 統計分析',
      content: '看看你跟每個好友的互動有多頻繁！數字說話，看誰是你最親密的皮克敏夥伴 💪',
    },
    {
      selector: '[data-tutorial="stats-range"]',
      title: '📆 時間範圍',
      content: '選「本月」、「近 30 天」或「全部」，統計數字會自動跟著更新！',
    },
    {
      selector: '[data-tutorial="stats-list"]',
      title: '🏆 互動排行',
      content: '互動次數最多的好友排在最前面～快來看看誰是你最常聯絡的皮克敏好友 🎖️',
    },
  ],
}

export const TUTORIAL_COMPLETE: Record<string, { title: string; content: string }> = {
  home: {
    title: '首頁導覽完成！🎉',
    content: '已經認識首頁啦！之後不清楚的話，按右下角的小 ？ 隨時重看說明喔～',
  },
  people: {
    title: '人物管理搞定！🍄',
    content: '加好好友之後，記得去設定快捷動作，讓記錄更輕鬆！有問題隨時按 ？ 回來看說明。',
  },
  quickActions: {
    title: '快捷動作設定完成！⚡',
    content: '設好之後回首頁就能看到彩色的一鍵按鈕啦！有不清楚的按 ？ 隨時重看 🍄',
  },
  records: {
    title: '紀錄頁面了解了！📮',
    content: '記錄都在這裡，隨時找得到。若有需要按 ？ 重看說明喔！',
  },
  calendar: {
    title: '月曆通了！📅',
    content: '現在知道怎麼用月曆查互動了！有問題按 ？ 隨時復習 🌸',
  },
  stats: {
    title: '統計看懂了！📊',
    content: '多跟好友互動，讓排行更豐富吧！若有問題隨時按 ？ 喔 🍄',
  },
}
