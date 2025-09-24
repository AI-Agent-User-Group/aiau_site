import { marked } from 'marked';
import './styles.css';

const app = document.getElementById('app') as HTMLElement;
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

type Route = 'home' | 'privacy' | 'conduct';

function currentRoute(): Route {
  const p = location.pathname || '/';
  if (p.startsWith('/privacy-policy')) return 'privacy';
  if (p.startsWith('/code-of-conduct')) return 'conduct';
  return 'home';
}

async function render() {
  const route = currentRoute();
  switch (route) {
    case 'privacy':
      await renderMarkdownPage('プライバシーポリシー', '/md/privacy-policy.md');
      break;
    case 'conduct':
      await renderMarkdownPage('行動規範 (Code of Conduct)', '/md/code-of-conduct.md');
      break;
    default:
      renderHome();
  }
}

function renderHome() {
  document.title = 'AIAU | AI Agent User Group';
  app.innerHTML = `
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
        <a href="https://discord.gg/GatQE7wGvK" target="_blank" rel="noreferrer" class="inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-white hover:bg-[#4752C4]">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.08.08 0 0 0-.08.038c-.212.375-.444.864-.607 1.249-1.844-.277-3.68-.277-5.486 0-.165-.394-.405-.874-.618-1.249a.08.08 0 0 0-.08-.038 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.028C2.78 8.399 2.123 12.245 2.333 16.059a.08.08 0 0 0 .03.057 19.9 19.9 0 0 0 5.994 3.03.08.08 0 0 0 .084-.029c.461-.63.873-1.294 1.226-1.993a.08.08 0 0 0-.042-.105 12.28 12.28 0 0 1-1.872-.892.08.08 0 0 1-.007-.127c.126-.1.252-.198.372-.293a.07.07 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .077.01c.12.095.246.193.372.292a.08.08 0 0 1-.006.127c-.6.35-1.221.652-1.873.893a.08.08 0 0 0-.04.105c.36.699.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028 19.876 19.876 0 0 0 5.994-3.03.08.08 0 0 0 .031-.056c.5-8.245-3.019-12.085-8.615-11.662ZM9.86 13.104c-1.182 0-2.156-1.085-2.156-2.419 0-1.333.956-2.418 2.156-2.418 1.21 0 2.175 1.093 2.156 2.419 0 1.333-.956 2.418-2.156 2.418Zm7.323 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.156-2.418 1.211 0 2.176 1.093 2.157 2.419 0 1.333-.946 2.418-2.156 2.418Z"/></svg>
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
          allowfullscreen=""
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

function stripFrontMatter(md: string): string {
  // Remove YAML front matter starting with --- lines at the beginning
  if (md.startsWith('---')) {
    const parts = md.split(/^---\s*$/m);
    if (parts.length >= 3) {
      // parts[0] is empty before first --- when split with ^ anchor
      return parts.slice(2).join('---\n').replace(/^\s+/, '');
    }
  }
  return md;
}

async function renderMarkdownPage(title: string, path: string) {
  document.title = `${title} | AIAU`;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load: ${path}`);
    const mdRaw = await res.text();
    const md = stripFrontMatter(mdRaw);
    const html = marked.parse(md);
    app.innerHTML = `
      <article class="prose prose-zinc max-w-none dark:prose-invert">
        ${html}
      </article>
    `;
  } catch (err) {
    app.innerHTML = `<div class="text-red-600 dark:text-red-400">読み込みに失敗しました。(${String(err)})</div>`;
  }
}

// Intercept click on internal links for SPA navigation
document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  const anchor = target.closest('a') as HTMLAnchorElement | null;
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href) return;
  if (href.startsWith('http') || href.startsWith('https:') || href.startsWith('mailto:')) return;
  if (!href.startsWith('/')) return;
  e.preventDefault();
  if (location.pathname !== href) {
    history.pushState({}, '', href);
    render();
  }
});

window.addEventListener('popstate', render);
render();


