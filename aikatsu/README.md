# アイカツ！アンコール 店舗一覧

`/aikatsu/` に配置する、ビルド不要の静的ページです。

- `shops.json`: 公式PDFから転記した店舗名・都道府県・住所と日付。
- `index.html` / `styles.css` / `app.js`: 表示と検索。

出典: https://dcd.aikatsu.com/encore/pdf/shoplist.pdf

2026年10月21日時点のPDF全21ページから1,380店舗（47都道府県）を転記。表記はPDFに従い、改行・連続空白のみ整理しています。稼働状況やカード在庫を示すものではありません。実行時にPDFを取得・解析する処理はありません。

## 更新

1. 公式PDFと照合し、`shops.json` の店舗データを更新します。PDFの掲載順（都道府県順）を維持してください。
2. `sourceAsOf` をPDFの情報基準日、`updatedAt` を転記・確認日に更新します（YYYY-MM-DD）。
3. `index.html` の日付も更新します。JavaScript読み込み前の表示に使われます。
4. ページをHTTPで開き、件数と検索を確認してください。

検索条件は `?prefecture=東京都&q=秋葉原` のようにURLで共有できます。
