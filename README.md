## AIAU | AI Agent User Group

コミュニティ公式サイトのソースコードです。Vite + Tailwind CSSでフロントエンドを構築し、Cloudflare Workers（Workers Static Assets）で配信します。Markdownからの静的生成（プライバシーポリシー/行動規範）、SEO向けプレレンダリング、セキュリティヘッダー付与などを備えています。

### 特徴
- **Vite + Tailwind CSS v4**: 軽量・高速なビルドと最新スタイル。
- **Cloudflare Workers 配信**: `ASSETS` バインディングで `dist/` を配信、SPAフォールバックを有効化。
- **プレレンダリング**: `scripts/prerender.mjs` がビルド後に静的HTML、`sitemap.xml`、`robots.txt`、`404.html` を生成し、OG/TwitterカードやJSON-LDを挿入。
- **Markdown ページ**: `md/` の `privacy-policy.md` と `code-of-conduct.md` をサイトに反映。
- **アイコン自動生成**: `scripts/gen-icons.mjs` が `public/favicon.svg` からPWA用PNGを生成。

## セットアップ

### 必要要件
- Node.js 20以上（LTS推奨）
- npm
- Cloudflare Wrangler 3系（`npm i -D wrangler` 済み）

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
- Viteビルド
- プレレンダリング: `scripts/prerender.mjs`

プレレンダリングではサイトURLを `SITE_URL` から参照します（省略時は `https://aiau.group`）。独自ドメインで正しいOG画像URLや `sitemap.xml` を出力したい場合は、ビルド前に環境変数を設定してください。

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
ポートは `5173` を使用します（`vite preview --port 5173`）。

## デプロイ（Cloudflare Workers）
```bash
npm run deploy
```
事前に `wrangler login` 済みであることが前提です。`wrangler.toml` では次を設定しています。
- `main = "src/worker.ts"`: 配信用ワーカーのエントリ。
- `[assets]` セクション: `dist/` を `ASSETS` としてバインドし、`not_found_handling = "single-page-application"` でSPAフォールバックを有効化。

カスタムドメインはCloudflareダッシュボードから設定できます（DNS → Workers Routes）。

## スクリプト一覧
| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバ起動（Vite） |
| `npm run icons` | SVGからPWAアイコンPNGを生成 |
| `npm run build` | アイコン生成 → Viteビルド → プレレンダリング |
| `npm run preview` | ビルド成果物のローカルプレビュー |
| `npm run deploy` | WranglerでCloudflare Workersにデプロイ |

## ディレクトリ構成（主なもの）
- `index.html`: ベースHTML。
- `src/main.ts`: 開発時のSPA描画（本番はプレレンダリング出力を優先）。
- `src/worker.ts`: Static Assets への委譲とセキュリティヘッダー付与。
- `scripts/prerender.mjs`: トップ/各Markdownページの静的HTML生成、`sitemap.xml`/`robots.txt`/`404.html` 出力、`md/` のコピー。
- `scripts/gen-icons.mjs`: `public/favicon.svg` から `public/icons/` にPNG生成。
- `md/`: コンテンツMarkdown（プライバシーポリシー/行動規範）。
- `public/`: 静的アセット（`manifest.webmanifest`、OGPなど）。
- `dist/`: ビルド成果物（デプロイ対象）。
- `wrangler.toml`: Cloudflare Workers 設定。

## SEO/アクセシビリティ
- プレレンダリング時に `title`/`description`/OG/Twitter/JSON-LD を挿入。
- `sitemap.xml` と `robots.txt` を自動生成。
- キーボードフォーカス用「メインへスキップ」リンクやナビの `aria-current` を調整。

## コミュニティ
- X: `https://x.com/ai_agent_ug`
- Discord: `https://discord.gg/GatQE7wGvK`

## ライセンス
本リポジトリは **MIT License** で提供されます。詳細は `LICENSE` を参照してください。

## 貢献
Issue/PR を歓迎します。バグ報告・改善提案・ドキュメント修正など、お気軽にお寄せください。


