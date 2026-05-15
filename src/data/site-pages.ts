import type { PageMetadata } from '../lib/seo';
import { siteConfig, toAbsoluteUrl } from '../config/site';

export type SitemapEntry = {
  path: string;
  priority: number;
  changefreq: 'weekly' | 'yearly';
};

export const homePageMetadata: PageMetadata = {
  title: siteConfig.fullName,
  description: siteConfig.homeDescription,
  canonicalPath: '/',
  ogImage: siteConfig.ogImages.default,
  type: 'website',
  isHome: true,
};

export const mannersPageMetadata: PageMetadata = {
  title: 'イベントを楽しむためのマナー | AIAU',
  description: 'AIAUのイベントを安全・快適に楽しむための実践ガイド。撮影・SNS、飲食、勧誘、通報先など。',
  canonicalPath: '/manners/',
  ogImage: siteConfig.ogImages.default,
  type: 'article',
  breadcrumb: [
    { name: 'TOP', item: toAbsoluteUrl('/') },
    { name: 'マナー', item: toAbsoluteUrl('/manners/') },
  ],
};

export const notFoundPageMetadata: PageMetadata = {
  title: '404 Not Found | AIAU',
  description: 'ページが見つかりません。',
  canonicalPath: '/404.html',
  ogImage: siteConfig.ogImages.default,
  type: 'website',
};

export const homePolicyLinks = [
  {
    href: '/privacy-policy',
    label: 'プライバシーポリシー',
    variant: 'primary',
  },
  {
    href: '/code-of-conduct',
    label: '行動規範',
    variant: 'secondary',
  },
  {
    href: '/anti-harassment-policy',
    label: 'アンチハラスメント',
    variant: 'secondary',
  },
  {
    href: '/manners',
    label: 'マナー',
    variant: 'secondary',
  },
] as const;

export const staticSitemapEntries: SitemapEntry[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/manners/', priority: 0.4, changefreq: 'yearly' },
];
