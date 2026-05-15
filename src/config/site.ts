export const siteConfig = {
  name: 'AIAU',
  fullName: 'AIAU | AI Agent User Group',
  siteUrl: import.meta.env.SITE_URL ?? 'https://aiau.group',
  homeDescription: 'AIエージェントの知見共有と交流のためのコミュニティ。イベント情報、行動規範、プライバシーポリシーを掲載。',
  twitterDescription: 'AIエージェントの知見共有と交流のためのコミュニティ AIAU。',
  ogImages: {
    default: '/OGP.jpg',
    privacy: '/OGP_PP.jpg',
    conduct: '/OGP_COC.jpg',
    antiHarassment: '/OGP_AH.jpg',
  },
  communityLinks: {
    x: 'https://x.com/ai_agent_ug',
    discord: 'https://discord.gg/RNaAgXZngh',
    connpass: 'https://aiau.connpass.com/',
    reportForm:
      'https://docs.google.com/forms/d/e/1FAIpQLSdKUEXBcYdfbCnZ-KMCnJW7G9aWuHEhNByzci3UXlBlJjTdnw/viewform',
    lumaCalendar: 'https://luma.com/embed/calendar/cal-SPkxwYab1fnvYMe/events',
  },
  navLinks: [
    { href: '/', label: 'TOP' },
    { href: '/guidelines', label: 'ポリシー・行動規範まとめ' },
  ],
} as const;

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

export function normalizePathname(pathname: string): string {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname || '/';
}

export function toAbsoluteUrl(path: string): string {
  return new URL(path, ensureTrailingSlash(siteConfig.siteUrl)).toString();
}
