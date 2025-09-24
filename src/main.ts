import { marked } from 'marked';
import './styles.css';

const app = document.getElementById('app') as HTMLElement;
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

type Route = 'home' | 'privacy' | 'conduct';
const isDev = import.meta.env.DEV;

function currentRoute(): Route {
  const p = location.pathname || '/';
  if (p.startsWith('/privacy-policy')) return 'privacy';
  if (p.startsWith('/code-of-conduct')) return 'conduct';
  return 'home';
}

async function render() {
  const route = currentRoute();
  if (!isDev) {
    // In production, rely on prerendered static HTML for subpages
    if (route === 'privacy' || route === 'conduct') {
      updateAriaCurrent();
      return;
    }
  }
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
  updateAriaCurrent();
}

function renderHome() {
  document.title = 'AIAU | AI Agent User Group';
  app.innerHTML = `
    <section>
      <blockquote class="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 dark:border-neutral-800 dark:text-neutral-200">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight">AI Agent User Group</h1>
      <p class="mt-8 text-gray-600 dark:text-neutral-300">AIエージェントに関する知見の共有と交流のためのコミュニティ。</p>
        <p>AIエージェントを一人で探求する時代は、もう終わり。<br/>だって、その面白さ、一人で味わうなんて、もったいない！</p>
        <p class="mt-8">「このプロンプト、神かも！」って閃いた瞬間。 「こんな使い方、ヤバい！」って発見した興奮。</p>
        <p class="mt-2">そんな熱量を、誰かに「聞いて！」って言いたくなりませんか？</p>
        <p class="mt-2">ここは、AIエージェントの「面白い！」をシェアして、100倍楽しむための遊び場です。 最新ツールに一緒に驚いたり、自作エージェントを自慢しあったり。</p>
        <p class="mt-2">必要なのは専門知識より「AIが好き！」って気持ちだけ。 さあ、あなたの熱量を、ここで思いっきり解放してください！</p>


        <a href="https://discord.gg/GatQE7wGvK" target="_blank" rel="noreferrer" class="mt-6 inline-flex items-center gap-2 rounded-md bg-[#5865F2] px-4 py-2 text-white hover:bg-[#4752C4]">
          <i class="fa-brands fa-discord text-[16px]" aria-hidden="true"></i>
          <span>コミュニティに参加</span>
        </a>
      </blockquote>
    </section>
    <section class="mt-10 grid gap-6">
      <div class="rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
        <h2 class="text-xl font-semibold">最新情報</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">X: <a class="underline" href="https://x.com/ai_agent_ug" target="_blank" rel="noopener noreferrer">@ai_agent_ug</a></p>
        <p class="mt-2 text-sm text-gray-600 dark:text-neutral-300">Connpass: <a class="underline" href="https://aiau.connpass.com/" target="_blank" rel="noopener noreferrer">AIAU</a></p>
      </div>
    </section>
    <section class="mt-10 rounded-lg border border-gray-200 p-6 dark:border-neutral-800">
      <h2 class="text-xl font-semibold">イベントカレンダー</h2>
      <div class="mt-4">
        <iframe loading="lazy"
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
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdKUEXBcYdfbCnZ-KMCnJW7G9aWuHEhNByzci3UXlBlJjTdnw/viewform" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white" aria-label="快適な活動環境づくりのご報告フォームを開く（新しいタブ）">
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

function updateAriaCurrent() {
  try {
    const nav = document.getElementById('site-nav');
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll('a[href^="/"]')) as HTMLAnchorElement[];
    const normalize = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);
    const current = normalize(location.pathname || '/');
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      const match = normalize(href) === current;
      if (match) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    }
  } catch {}
}

// Intercept click on internal links for SPA navigation
document.addEventListener('click', (e) => {
  if (!isDev) return; // In production, let browser do full navigation
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

// Mobile nav toggle with transition classes
const menuButton = document.getElementById('menu-button');
const siteNav = document.getElementById('site-nav');
if (menuButton && siteNav) {
  const closedClasses = ['opacity-0', 'pointer-events-none', '-translate-y-2', 'scale-95'];

  const openMenu = () => {
    siteNav.classList.remove(...closedClasses);
    menuButton.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    siteNav.classList.add(...closedClasses);
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      siteNav.classList.remove('hidden');
      requestAnimationFrame(openMenu);
    }
  });

  // Close when clicking outside on small screens
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    const withinHeader = target.closest('header');
    if (!withinHeader && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  // Ensure closed state initially on small screens
  closeMenu();
}


