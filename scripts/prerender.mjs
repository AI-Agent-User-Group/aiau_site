// Generate static HTML for better SEO after Vite build
import { readFile, writeFile, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { marked } from 'marked';

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, 'dist');
const SITE_URL = process.env.SITE_URL || 'https://aiau.group';
const ABS_OG_IMAGE = `${SITE_URL}/OGP.jpg`;
// Page specific OGP images
const ABS_OG_IMAGE_PP = `${SITE_URL}/OGP_PP.jpg`;
const ABS_OG_IMAGE_COC = `${SITE_URL}/OGP_COC.jpg`;
const ABS_OG_IMAGE_AH = `${SITE_URL}/OGP_AH.jpg`;
const ABS_OG_IMAGE_MN = `${SITE_URL}/OGP_MANNERS.jpg`;

function stripFrontMatter(md) {
  if (md.startsWith('---')) {
    const parts = md.split(/^---\s*$/m);
    if (parts.length >= 3) {
      return parts.slice(2).join('---\n').replace(/^\s+/, '');
    }
  }
  return md;
}

async function loadShell() {
  const html = await readFile(resolve(distDir, 'index.html'), 'utf8');
  const mainOpenMatch = html.match(/<main[^>]*id=["']app["'][^>]*>/i);
  if (!mainOpenMatch) throw new Error('Cannot find <main id="app"> in dist/index.html');
  const mainOpenTag = mainOpenMatch[0];
  return { html, mainOpenTag };
}

function upsertTag(html, regex, tagString) {
  if (regex.test(html)) return html.replace(regex, tagString);
  return html.replace(/<\/head>/i, `  ${tagString}\n  </head>`);
}

function applyHeadMeta(shellHtml, meta) {
  let html = shellHtml;

  if (meta.title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);
  }

  if (meta.description) {
    html = upsertTag(
      html,
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${meta.description}" />`
    );
  }

  if (meta.url) {
    html = upsertTag(
      html,
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${meta.url}" />`
    );
  }

  const og = {
    site_name: 'AIAU',
    type: meta.type || 'website',
    title: meta.title,
    description: meta.description,
    url: meta.url,
    image: meta.ogImage || ABS_OG_IMAGE,
    locale: 'ja_JP',
  };

  html = upsertTag(html, /<meta\s+property=["']og:site_name["'][^>]*>/i, `<meta property="og:site_name" content="${og.site_name}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${og.type}" />`);
  if (og.title) html = upsertTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${og.title}" />`);
  if (og.description) html = upsertTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${og.description}" />`);
  if (og.url) html = upsertTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${og.url}" />`);
  if (og.image) html = upsertTag(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${og.image}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${og.locale}" />`);

  const tw = {
    card: 'summary_large_image',
    title: meta.title,
    description: meta.description,
    image: meta.ogImage || ABS_OG_IMAGE,
  };
  html = upsertTag(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, `<meta name="twitter:card" content="${tw.card}" />`);
  if (tw.title) html = upsertTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${tw.title}" />`);
  if (tw.description) html = upsertTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${tw.description}" />`);
  if (tw.image) html = upsertTag(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${tw.image}" />`);

  // JSON-LD
  const ldScripts = [];
  if (meta.isHome) {
    ldScripts.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'AIAU',
      inLanguage: 'ja',
    });
  } else {
    ldScripts.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${meta.url}#webpage`,
      url: meta.url,
      name: meta.title,
      description: meta.description,
      inLanguage: 'ja',
      isPartOf: { '@type': 'WebSite', '@id': `${SITE_URL}/#website` },
    });
    if (meta.breadcrumb && Array.isArray(meta.breadcrumb) && meta.breadcrumb.length > 0) {
      ldScripts.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: meta.breadcrumb.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.item,
        })),
      });
    }
  }

  const ldTag = `<script type="application/ld+json" id="ld-webpage">${JSON.stringify(ldScripts.length === 1 ? ldScripts[0] : ldScripts)}</script>`;
  html = upsertTag(html, /<script[^>]*id=["']ld-webpage["'][^>]*>[\s\S]*?<\/script>/i, ldTag);

  return html;
}

function injectContent(shellHtml, mainOpenTag, content, meta) {
  let replaced = shellHtml.replace(/<main[^>]*id=["']app["'][^>]*>[\s\S]*?<\/main>/i, `${mainOpenTag}\n${content}\n</main>`);
  if (meta) {
    replaced = applyHeadMeta(replaced, meta);
  }
  return replaced;
}

function homeContent() {
  return `
    <section class="py-8">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight">AI Agent User Group</h1>
      <p class="mt-3 text-gray-600 dark:text-neutral-300">AIエージェントに関する知見の共有と交流のためのコミュニティ。</p>
      <blockquote class="mt-6 rounded-lg border border-gray-200 p-4 text-sm text-gray-700 dark:border-neutral-800 dark:text-neutral-200">
        <p>AIエージェントを一人で探求する時代は、もう終わり。<br/>だって、その面白さ、一人で味わうなんて、もったいない！</p>
        <p class="mt-2">「このプロンプト、神かも！」って閃いた瞬間。 「こんな使い方、ヤバい！」って発見した興奮。</p>
        <p class="mt-2">そんな熱量を、誰かに「聞いて！」って言いたくなりませんか？</p>
        <p class="mt-2">ここは、AIエージェントの「面白い！」をシェアして、100倍楽しむための遊び場です。 最新ツールに一緒に驚いたり、自作エージェントを自慢しあったり。</p>
        <p class="mt-2">必要なのは専門知識より「AIが好き！」って気持ちだけ。 さあ、あなたの熱量を、ここで思いっきり解放してください！</p>
      </blockquote>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="/privacy-policy" class="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white">プライバシーポリシー</a>
        <a href="/code-of-conduct" class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-900">行動規範</a>
        <a href="/anti-harassment-policy" class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-900">アンチハラスメント</a>
        <a href="/manners" class="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-900">マナー</a>
        <a href="https://discord.gg/RNaAgXZngh" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-white hover:bg-[#4752C4]">
          <i class="fa-brands fa-discord text-[16px]" aria-hidden="true"></i>
          <span>コミュニティに参加</span>
        </a>
      </div>
    </section>
    <section class="mt-10 grid gap-6">
      <div class="rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
        <h2 class="text-xl font-semibold">最新情報</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">X: <a class="underline" href="https://x.com/ai_agent_ug" target="_blank" rel="noreferrer">@ai_agent_ug</a></p>
      </div>
    </section>
    <section class="mt-10 rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
      <h2 class="text-xl font-semibold">イベントカレンダー</h2>
      <div class="mt-4">
        <iframe
          src="https://luma.com/embed/calendar/cal-SPkxwYab1fnvYMe/events"
          width="100%"
          height="450"
          frameborder="0"
          style="border: 1px solid #bfcbda88; border-radius: 4px;"
          allowfullscreen
          aria-hidden="false"
          tabindex="0"
        ></iframe>
      </div>
    </section>
    <section class="mt-10 rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
      <h2 class="text-xl font-semibold">快適な活動環境づくりのご報告フォーム</h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">
        AIAUのコミュニティをすべての人にとって快適で安全な学びの場とするため、皆様からの情報提供をお願いします。
      </p>
      <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">
        怪しい動き、ハラスメント、営業・交流目的など勉強の妨げとなる行為を見かけたり、何か不快に感じることをされたりした場合は、小さなことでもお気軽にご共有ください。内容を精査し、厳正に対処いたします。
      </p>
      <div class="mt-4">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdKUEXBcYdfbCnZ-KMCnJW7G9aWuHEhNByzci3UXlBlJjTdnw/viewform" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white" aria-label="快適な活動環境づくりのご報告フォームを開く（新しいタブ）">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 3v8h8v2h-8v8h-2v-8H3V11h8V3h2Z"/></svg>
          <span>フォームから報告（匿名可）</span>
        </a>
      </div>
    </section>
  `;
}

function mannersContent() {
  return `
    <section class="py-6">
      <div class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        <i class="fa-solid fa-book-open" aria-hidden="true"></i>
        <span>イベント参加者へ</span>
      </div>
      <h1 class="mt-4 text-3xl md:text-4xl font-bold tracking-tight">会場マナーガイド</h1>
      <p class="mt-3 text-lg text-gray-600 dark:text-neutral-300">初めてでも迷わないように、会場でのふるまいを場面別にまとめました。</p>
    </section>

    <!-- 来場前チェック - 目立つ配置 -->
    <section class="mt-8 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 rounded-full bg-blue-600 p-3 text-white dark:bg-blue-500">
          <i class="fa-regular fa-square-check text-2xl" aria-hidden="true"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">来場前チェック</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">家を出る前に確認しましょう</p>
        </div>
      </div>
      <ul class="mt-6 space-y-3">
        <li class="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-neutral-900/50">
          <i class="fa-regular fa-circle-check mt-0.5 text-xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
          <span class="text-gray-800 dark:text-neutral-200">体調は良好（体調不良時は無理せず参加見合わせ）</span>
        </li>
        <li class="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-neutral-900/50">
          <i class="fa-regular fa-circle-check mt-0.5 text-xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
          <span class="text-gray-800 dark:text-neutral-200">受付方法・開始時刻の確認（Connpass/Lumaなど）</span>
        </li>
        <li class="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-neutral-900/50">
          <i class="fa-regular fa-circle-check mt-0.5 text-xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
          <span class="text-gray-800 dark:text-neutral-200">ノートPC/充電器/モバイルバッテリー/イヤホン（必要な方）</span>
        </li>
        <li class="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-neutral-900/50">
          <i class="fa-regular fa-circle-check mt-0.5 text-xl text-blue-600 dark:text-blue-400" aria-hidden="true"></i>
          <span class="text-gray-800 dark:text-neutral-200">撮影・SNS方針を確認（下部の関連リンクを参照）</span>
        </li>
      </ul>
    </section>

    <!-- ステップバイステップガイド -->
    <section class="mt-10">
      <h2 class="text-2xl font-bold mb-6">イベント当日の流れ</h2>
      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">1</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-door-open text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">受付〜入室</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>受付列は静かに待機</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>荷物は足元や荷物置きへ</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>通路・出入口はふさがない</span></li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">2</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-chalkboard-user text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">セッション中</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>通知オフ、私語・通話は控えめに</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>質問は簡潔に1つずつ</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>発表の妨害はしない（<a class="underline" href="/code-of-conduct">規範</a>）</span></li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">3</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-road text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">移動・休憩</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>通路・避難口は常に確保</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>席移動は休憩時間に</span></li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">4</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-camera text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">写真・SNS</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>個人が写る写真はOKをもらってから</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>撮影NGの表示は守る</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>個人情報は写さない（<a class="underline" href="/privacy-policy">PP</a>）</span></li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">5</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-people-arrows text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">交流タイム</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>名刺・SNS交換は相手のOKをもらってから</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>距離感を大切に</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>場と時間を選んで交流</span></li>
          </ul>
        </div>

        <div class="rounded-xl border border-gray-200 p-6 dark:border-neutral-800">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl font-bold text-gray-700 dark:bg-neutral-800 dark:text-neutral-300">6</div>
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-neutral-900">
              <i class="fa-solid fa-utensils text-2xl text-gray-600 dark:text-neutral-400" aria-hidden="true"></i>
            </div>
          </div>
          <h3 class="text-lg font-bold">飲食・その他</h3>
          <ul class="mt-3 space-y-2 text-sm text-gray-700 dark:text-neutral-300">
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>飲食はほどほどに。泥酔はNG</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>ゴミは分別して処分</span></li>
            <li class="flex gap-2"><span class="text-gray-500 dark:text-neutral-400">•</span><span>貴重品は自分で管理</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 勧誘・営業の線引き -->
    <section class="mt-10 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-6 dark:border-yellow-700 dark:bg-yellow-950/20">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 rounded-full bg-yellow-400 p-3 text-yellow-900">
          <i class="fa-solid fa-bullhorn text-2xl" aria-hidden="true"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-yellow-900 dark:text-yellow-300">勧誘・営業の線引き</h2>
          <ul class="mt-3 space-y-2 text-sm text-yellow-900 dark:text-yellow-200">
            <li class="flex gap-2"><span>•</span><span>運営の許可なく宣伝・勧誘・採用活動をしたり、しつこくDMを送るのはNG（<a class="underline font-semibold" href="/code-of-conduct">行動規範</a>）</span></li>
            <li class="flex gap-2"><span>•</span><span>断られたらすぐやめる。相手の意思を最優先に</span></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- みんなが安心して参加できるために -->
    <section class="mt-10 rounded-xl border-2 border-red-300 bg-red-50 p-6 md:p-8 dark:border-red-800 dark:bg-red-950/20">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 rounded-full bg-red-600 p-3 text-white dark:bg-red-700">
          <i class="fa-solid fa-heart-crack text-3xl" aria-hidden="true"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-red-900 dark:text-red-300">みんなが安心して参加できるために</h2>
          <p class="mt-2 text-sm text-red-800 dark:text-red-200">こんなことがあったら、遠慮なくスタッフに教えてください</p>
          <ul class="mt-4 space-y-3 text-red-900 dark:text-red-200">
            <li class="flex gap-3 rounded-lg bg-white/60 p-3 dark:bg-red-900/20">
              <i class="fa-solid fa-xmark mt-0.5 text-xl text-red-600" aria-hidden="true"></i>
              <div>
                <div class="font-semibold">見た目や属性で判断されたり、傷つく言葉</div>
                <div class="mt-1 text-xs">性別、外見、国籍、年齢などを理由にした心ない発言や扱い</div>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg bg-white/60 p-3 dark:bg-red-900/20">
              <i class="fa-solid fa-xmark mt-0.5 text-xl text-red-600" aria-hidden="true"></i>
              <div>
                <div class="font-semibold">怖い・威圧的な態度や言動</div>
                <div class="mt-1 text-xs">脅すような態度、人格を否定する言葉、勝手に体に触れる</div>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg bg-white/60 p-3 dark:bg-red-900/20">
              <i class="fa-solid fa-xmark mt-0.5 text-xl text-red-600" aria-hidden="true"></i>
              <div>
                <div class="font-semibold">不快な発言や、しつこい連絡先の交換</div>
                <div class="mt-1 text-xs">性的な話題、相手が嫌がっているのに連絡先を聞き続ける</div>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg bg-white/60 p-3 dark:bg-red-900/20">
              <i class="fa-solid fa-xmark mt-0.5 text-xl text-red-600" aria-hidden="true"></i>
              <div>
                <div class="font-semibold">勝手な撮影や、個人情報の公開</div>
                <div class="mt-1 text-xs">許可なく写真・動画を撮る、SNSで個人情報を晒す、つきまとい</div>
              </div>
            </li>
            <li class="flex gap-3 rounded-lg bg-white/60 p-3 dark:bg-red-900/20">
              <i class="fa-solid fa-xmark mt-0.5 text-xl text-red-600" aria-hidden="true"></i>
              <div>
                <div class="font-semibold">発表を邪魔したり、場にふさわしくない行為</div>
                <div class="mt-1 text-xs">学習の妨げになる行為、不適切な内容の投稿、出会い目的の行動</div>
              </div>
            </li>
          </ul>
          <p class="mt-4 text-sm text-red-800 dark:text-red-300">くわしくは <a class="font-semibold underline" href="/anti-harassment-policy">アンチハラスメントポリシー</a> と <a class="font-semibold underline" href="/code-of-conduct">行動規範</a> をご確認ください。</p>
        </div>
      </div>
    </section>

    <!-- 困ったらセクション - コールアウト -->
    <section class="mt-10 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 md:p-8 dark:border-blue-800 dark:from-blue-950/30 dark:to-cyan-950/30">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 rounded-full bg-blue-600 p-3 text-white">
          <i class="fa-solid fa-circle-info text-3xl" aria-hidden="true"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-blue-900 dark:text-blue-200">困ったら（通報・相談）</h2>
          <p class="mt-2 text-blue-800 dark:text-blue-300">会場スタッフへすぐお声がけ、またはオンラインから通報できます</p>
          <div class="mt-5 flex flex-wrap gap-3">
            <a href="https://x.com/ai_agent_ug" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white dark:bg-white dark:text-black" aria-label="XのDMを開く（新しいタブ）">
              <i class="fa-brands fa-x-twitter text-xl" aria-hidden="true"></i>
              <span>公式X（DM）</span>
            </a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdKUEXBcYdfbCnZ-KMCnJW7G9aWuHEhNByzci3UXlBlJjTdnw/viewform" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white dark:bg-blue-500" aria-label="報告フォームを開く（新しいタブ）">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 3v8h8v2h-8v8h-2v-8H3V11h8V3h2Z"/></svg>
              <span>フォームから報告（匿名可）</span>
            </a>
          </div>
          <p class="mt-4 text-xs text-blue-700 dark:text-blue-300">通報者・被害者のプライバシーは最優先で保護します（<a class="font-semibold underline" href="/privacy-policy">プライバシーポリシー</a>）</p>
        </div>
      </div>
    </section>

    <section class="mt-10 rounded-lg border border-gray-200 p-6 text-sm text-gray-600 dark:border-neutral-800 dark:text-neutral-300">
      <p class="flex items-start gap-2"><i class="fa-solid fa-cloud-showers-heavy mt-0.5" aria-hidden="true"></i><span>開催について：悪天候などで内容が変更・中止になることがあります（<a class="underline" href="/code-of-conduct">行動規範 第4条</a>）</span></p>
      <p class="mt-3 flex items-start gap-2"><i class="fa-solid fa-book mt-0.5" aria-hidden="true"></i><span>関連ページ： <a class="underline" href="/code-of-conduct">行動規範</a> / <a class="underline" href="/anti-harassment-policy">アンチハラスメントポリシー</a> / <a class="underline" href="/privacy-policy">プライバシーポリシー</a></span></p>
    </section>
  `;
}

async function mdPageContent(mdPath) {
  const md = await readFile(resolve(projectRoot, mdPath), 'utf8');
  const html = marked.parse(stripFrontMatter(md));
  return `<article class="prose prose-zinc max-w-none dark:prose-invert">${html}</article>`;
}

async function ensureDir(p) {
  if (!existsSync(p)) await mkdir(p, { recursive: true });
}

async function main() {
  const { html: shellHtml, mainOpenTag } = await loadShell();

  // 1) Home
  {
    const content = homeContent();
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: 'AIAU | AI Agent User Group',
      description: 'AIエージェントの知見共有と交流のためのコミュニティ。イベント情報、行動規範、プライバシーポリシーを掲載。',
      url: `${SITE_URL}/`,
      ogImage: ABS_OG_IMAGE,
      type: 'website',
      isHome: true,
    });
    await writeFile(resolve(distDir, 'index.html'), page, 'utf8');
  }

  // 2) Privacy Policy
  {
    const content = await mdPageContent('md/privacy-policy.md');
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: 'プライバシーポリシー | AIAU',
      description: 'AIAUのプライバシーポリシー。個人情報の取り扱い方針についてご説明します。',
      url: `${SITE_URL}/privacy-policy/`,
      ogImage: ABS_OG_IMAGE_PP,
      type: 'article',
      breadcrumb: [
        { name: 'TOP', item: `${SITE_URL}/` },
        { name: 'プライバシーポリシー', item: `${SITE_URL}/privacy-policy/` },
      ],
    });
    const outDir = resolve(distDir, 'privacy-policy');
    await ensureDir(outDir);
    await writeFile(resolve(outDir, 'index.html'), page, 'utf8');
  }

  // 3) Code of Conduct
  {
    const content = await mdPageContent('md/code-of-conduct.md');
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: '行動規範 | AIAU',
      description: 'AIAUコミュニティの行動規範。誰もが安心して参加できるためのルールとガイドライン。',
      url: `${SITE_URL}/code-of-conduct/`,
      ogImage: ABS_OG_IMAGE_COC,
      type: 'article',
      breadcrumb: [
        { name: 'TOP', item: `${SITE_URL}/` },
        { name: '行動規範', item: `${SITE_URL}/code-of-conduct/` },
      ],
    });
    const outDir = resolve(distDir, 'code-of-conduct');
    await ensureDir(outDir);
    await writeFile(resolve(outDir, 'index.html'), page, 'utf8');
  }

  // 4) Anti-Harassment Policy
  {
    const content = await mdPageContent('md/anti-harassment-policy.md');
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: 'アンチハラスメントポリシー | AIAU',
      description: 'AIAUのアンチハラスメントポリシー。安全で敬意ある環境のための方針。',
      url: `${SITE_URL}/anti-harassment-policy/`,
      ogImage: ABS_OG_IMAGE_AH,
      type: 'article',
      breadcrumb: [
        { name: 'TOP', item: `${SITE_URL}/` },
        { name: 'アンチハラスメントポリシー', item: `${SITE_URL}/anti-harassment-policy/` },
      ],
    });
    const outDir = resolve(distDir, 'anti-harassment-policy');
    await ensureDir(outDir);
    await writeFile(resolve(outDir, 'index.html'), page, 'utf8');
  }

  // 5) Manners
  {
    const content = mannersContent();
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: 'イベントを楽しむためのマナー | AIAU',
      description: 'AIAUのイベントを安全・快適に楽しむための実践ガイド。撮影・SNS、飲食、勧誘、通報先など。',
      url: `${SITE_URL}/manners/`,
      ogImage: ABS_OG_IMAGE_MN,
      type: 'article',
      breadcrumb: [
        { name: 'TOP', item: `${SITE_URL}/` },
        { name: 'マナー', item: `${SITE_URL}/manners/` },
      ],
    });
    const outDir = resolve(distDir, 'manners');
    await ensureDir(outDir);
    await writeFile(resolve(outDir, 'index.html'), page, 'utf8');
  }

  // 6) Guidelines
  {
    const content = await mdPageContent('md/guidelines.md');
    const page = injectContent(shellHtml, mainOpenTag, content, {
      title: 'ポリシー・行動規範まとめ | AIAU',
      description: 'AIAUコミュニティのポリシー、行動規範、マナーガイド、プライバシーポリシーへのリンクと要約。',
      url: `${SITE_URL}/guidelines/`,
      ogImage: ABS_OG_IMAGE,
      type: 'article',
      breadcrumb: [
        { name: 'TOP', item: `${SITE_URL}/` },
        { name: 'ポリシー・行動規範まとめ', item: `${SITE_URL}/guidelines/` },
      ],
    });
    const outDir = resolve(distDir, 'guidelines');
    await ensureDir(outDir);
    await writeFile(resolve(outDir, 'index.html'), page, 'utf8');
  }

  // 7) sitemap.xml & robots.txt
  const urls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/privacy-policy/`, priority: '0.3', changefreq: 'yearly' },
    { loc: `${SITE_URL}/code-of-conduct/`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${SITE_URL}/anti-harassment-policy/`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${SITE_URL}/manners/`, priority: '0.4', changefreq: 'yearly' },
    { loc: `${SITE_URL}/guidelines/`, priority: '0.5', changefreq: 'yearly' },
  ];
  const lastmod = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;
  await writeFile(resolve(distDir, 'sitemap.xml'), sitemap, 'utf8');

  const robots = `User-agent: *\nAllow: /\nDisallow: /md/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFile(resolve(distDir, 'robots.txt'), robots, 'utf8');

  // 8) 404 page
  const notFoundHtml = injectContent(
    shellHtml,
    mainOpenTag,
    `
    <section class="py-16 text-center">
      <h1 class="text-3xl font-bold">ページが見つかりません</h1>
      <p class="mt-3 text-gray-600 dark:text-neutral-300">URLをご確認ください。TOPへお戻りください。</p>
      <div class="mt-6">
        <a href="/" class="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white">TOPへ戻る</a>
      </div>
    </section>
    `,
    {
      title: '404 Not Found | AIAU',
      description: 'ページが見つかりません。',
      url: `${SITE_URL}/404.html`,
      ogImage: ABS_OG_IMAGE,
      type: 'website',
    }
  );
  await writeFile(resolve(distDir, '404.html'), notFoundHtml, 'utf8');

  // 9) Copy markdown sources for CSR fallback (so /md/* can be fetched by the SPA)
  const srcMd = resolve(projectRoot, 'md');
  if (existsSync(srcMd)) {
    await cp(srcMd, resolve(distDir, 'md'), { recursive: true });
  }

  // 10) _headers for static assets (Workers Static Assets custom headers)
  // - Harden security for static HTML responses
  // - Aggressive cache for hashed assets under /assets/
  const headersTxt = `
/*
  Referrer-Policy: no-referrer-when-downgrade
  X-Content-Type-Options: nosniff
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=31556952, immutable
`;
  await writeFile(resolve(distDir, '_headers'), headersTxt.trimStart(), 'utf8');
}

main().catch((err) => {
  console.error('[prerender] failed', err);
  process.exit(1);
});

