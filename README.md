## AIAU | AI Agent User Group

コミュニティ公式サイトのソースコードです。Astro + Tailwind CSS v4 で静的サイトを構築し、Cloudflare Workers Static Assets で配信します。コンテンツはAstro Content Collectionsで管理し、Cloudflare Worker はセキュリティヘッダー付与と静的アセット配信に責務を限定しています。

### 特徴
- **Astro**: `src/pages/` と `src/layouts/` を中心に静的サイトを生成。
- **Tailwind CSS v4**: PostCSS経由で読み込み、既存デザインを維持。
- **Cloudflare Workers 配信**: `ASSETS` バインディングで `dist/` を配信し、Worker が CSP / HSTS などのヘッダーを付与。
- **Content Collections**: `src/content/policies/` のMarkdownを型付きで管理。
- **SEO出力**: canonical / OGP / Twitter Card / JSON-LD / `sitemap.xml` / `robots.txt` / `404.html` をAstro側で生成。
- **Astro公式検証**: `astro check` をビルドフローに組み込み、Astro/TypeScriptの整合性を事前に検証。
- **アイコン自動生成**: `scripts/gen-icons.mjs` が `public/favicon.svg` からPWA用PNGを生成。

## セットアップ

### 必要要件
- Node.js 20以上（LTS推奨）
- npm
- Cloudflare Wrangler 4系（`npm i -D wrangler` 済み）

### 依存関係のインストール
```bash
npm ci
# もしくは
npm install
```

## 開発
```bash
npm run dev
```
ブラウザで `http://localhost:5173` を開きます。

## ビルド
```bash
npm run build
```
ビルド時に以下が自動実行されます。
- アイコン生成: `scripts/gen-icons.mjs`
- Astroビルド

`SITE_URL` を指定すると、canonical URL や OGP URL、`sitemap.xml` の出力先URLが切り替わります（省略時は `https://aiau.group`）。

- PowerShell（Windows）
```powershell
$env:SITE_URL = "https://example.com"
npm run build
```
- bash/zsh（macOS/Linux）
```bash
SITE_URL="https://example.com" npm run build
```

## プレビュー
```bash
npm run preview
```
ポートは `5173` を使用します（`astro preview --port 5173`）。

## デプロイ（Cloudflare Workers）
```bash
npm run deploy
```
事前に `wrangler login` 済みであることが前提です。`wrangler.toml` では次を設定しています。
- `main = "src/worker.ts"`: セキュリティヘッダー付与と静的アセット配信を行うワーカーのエントリ。
- `[assets]` セクション: Astro が生成した `dist/` を `ASSETS` としてバインド。

カスタムドメインはCloudflareダッシュボードから設定できます（DNS → Workers Routes）。

## スクリプト一覧
| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバ起動（Astro） |
| `npm run check` | Astro公式の型・コンテンツ整合チェック |
| `npm run icons` | SVGからPWAアイコンPNGを生成 |
| `npm run build` | アイコン生成 → `astro check` → Astroビルド |
| `npm run preview` | Astro生成物のローカルプレビュー |
| `npm run deploy` | WranglerでCloudflare Workersにデプロイ |

## ディレクトリ構成（主なもの）
- `astro.config.mjs`: Astroビルド設定。
- `src/layouts/BaseLayout.astro`: head / header / footer / 共通SEO定義。
- `src/components/SiteHeader.astro`: 共通ナビゲーション。
- `src/pages/`: ルート定義（`index.astro`, `manners.astro`, `[slug].astro`, `404.astro`, `sitemap.xml.ts`, `robots.txt.ts`）。
- `src/content/policies/`: ポリシー系Markdownコンテンツ。
- `src/content.config.ts`: Content Collectionsの定義。
- `src/worker.ts`: Static Assets への委譲、セキュリティヘッダー付与、`/_astro/` 向けキャッシュ制御。
- `scripts/gen-icons.mjs`: `public/favicon.svg` から `public/icons/` にPNG生成。
- `public/`: 静的アセット（`manifest.webmanifest`、OGP、ナビゲーション用スクリプトなど）。
- `dist/`: ビルド成果物（デプロイ対象）。
- `wrangler.toml`: Cloudflare Workers 設定。

## SEO/アクセシビリティ
- Astroレイアウトで `title` / `description` / OGP / Twitter Card / JSON-LD / canonical を出力。
- `sitemap.xml` と `robots.txt` をAstroの静的ルートとして生成。
- キーボードフォーカス用「メインへスキップ」リンク、現在地付きナビ、モバイルメニューのアクセシビリティを維持。

## コミュニティ
- X: `https://x.com/ai_agent_ug`
- Discord: `https://discord.gg/RNaAgXZngh`

## ライセンス
本リポジトリは **MIT License** で提供されます。詳細は `LICENSE` を参照してください。

## 貢献
Issue/PR を歓迎します。バグ報告・改善提案・ドキュメント修正など、お気軽にお寄せください。


