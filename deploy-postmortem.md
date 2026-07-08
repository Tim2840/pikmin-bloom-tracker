# PikLog GitHub Pages 部署事後報告

**日期**：2026-06-12 ～ 2026-06-14  
**狀態**：已解決 ✅

---

## 一、本次發生了什麼

### 問題時間線

| 時間 | 問題 |
|------|------|
| 6/12 | 建立 deploy.yml、設定 basename，但 CalendarPage.tsx 從未 commit |
| 6/12 | Token 設 1 天過期，當天 push 成功後 token 即將失效 |
| 6/14 | 首次 RE-RUN → build 失敗（CalendarPage 找不到） |
| 6/14 | 換新 token 再 push 修正檔，但沙盒讀 Windows 掛載檔案系統有截斷問題，傳上去的檔案殘缺 |
| 6/14 | 再次 build 失敗（JSX 未閉合、date-fns 沒裝、dateUtils 函式缺漏） |
| 6/14 | 改用 Windows 原始路徑讀檔、本地 build 驗證後才 push → 成功 |

### 根本原因清單

1. **CalendarPage.tsx 從未 commit**  
   App.tsx 已加入 import，但 `git add` 時遺漏了這個新檔案。

2. **date-fns 沒加到 package.json**  
   dateUtils.ts 使用 date-fns，但只安裝在本機 node_modules，沒有執行 `npm install date-fns --save` 同步更新 package.json 與 package-lock.json。

3. **vite.config.ts 缺少 base path**  
   GitHub Pages 部署在子路徑 `/pikmin-bloom-tracker/`，若 vite build 沒設 `base`，產出的 JS/CSS 路徑會是 `/assets/...` 而非 `/pikmin-bloom-tracker/assets/...`，頁面白屏。

4. **Token 設了過短的有效期**  
   1 天 Token 在跨日後就失效，後續 push 全部失敗，浪費大量排查時間。

5. **沙盒檔案系統截斷問題**  
   我的 Linux 沙盒掛載 Windows 檔案系統時，大型檔案會被截斷（HomePage.tsx 343 行、package-lock.json 7147 行都被切斷）。直接 rsync 複製的是壞檔案，必須改用 Windows 原始路徑讀取。

---

## 二、下次如何防範

### 防範 1：commit 前必跑 `git status` 確認所有新檔案

```bash
git status
# 確認 "Untracked files" 裡沒有漏掉的 .tsx / .ts
git add -A   # 或明確 add 每個新檔
```

**觸發時機**：任何新建檔案（新 page、新 component、新 util）都要確認有進 staging。

---

### 防範 2：新套件立刻 `npm install --save`，不只是 `npm i`

```bash
# 正確做法（會同步更新 package.json + package-lock.json）
npm install date-fns

# 然後立刻 commit 這兩個檔案
git add package.json package-lock.json
git commit -m "chore: 加入 date-fns 依賴"
```

**觸發時機**：任何新的 `import 'xxx'` 出現時，先確認 package.json 有沒有這個套件。

---

### 防範 3：部署前本地跑 `npm run build` 驗證

```bash
npm run build
# 看到 "✓ built in X.XXs" 才 push
```

這個步驟直接攔截 95% 的 CI 失敗。TypeScript 報錯、缺套件、路徑錯誤全部在這一步就會炸。

---

### 防範 4：GitHub Pages 部署必須的 vite.config.ts 設定

```ts
// vite.config.ts
export default defineConfig({
  base: '/pikmin-bloom-tracker/',   // ← 這行不能少
  // ...
})
```

**搭配 react-router-dom**：

```tsx
// App.tsx
<Router basename="/pikmin-bloom-tracker">
```

兩個必須一致，少一個就會白屏或路由全 404。

---

### 防範 5：Token 不設過期（或設 90 天以上）

GitHub PAT 設 1 天在開發流程裡幾乎是自找麻煩。建議：

- 一般部署用 token：**No expiration** 或 **90 天**
- 需要撤銷時手動到 `github.com/settings/tokens` 刪除
- Token 只給必要 scope：`repo` + `workflow`

---

### 防範 6：沙盒讀檔改用 Read tool，不用 bash rsync

Linux 沙盒掛載 Windows 路徑（`/sessions/.../mnt/`）讀大檔案會截斷。  
正確做法：

```
Read tool → C:\Users\user\Desktop\... （Windows 原始路徑）  ✅
bash cat / rsync from /sessions/.../mnt/                    ❌
```

---

## 三、給你的操作 SOP（下次部署新功能前）

1. `git status` → 確認所有新檔案都在 staged
2. `npm run build` → 本地 build 過才算完成
3. `git diff HEAD` → 確認沒有遺漏的改動
4. `git push` → 推上去
5. 看 GitHub Actions 跑完（綠勾）→ 開網址驗收

這五步如果都過，CI 失敗的機率接近零。
