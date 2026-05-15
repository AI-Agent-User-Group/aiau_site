import { siteConfig, toAbsoluteUrl } from '../config/site';

export type BreadcrumbItem = {
  name: string;
  item: string;
};

export type PageMetadata = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  type?: 'website' | 'article';
  breadcrumb?: BreadcrumbItem[];
  isHome?: boolean;
};

function resolveAssetUrl(path: string): string {
  return path.startsWith('http://') || path.startsWith('https://') ? path : toAbsoluteUrl(path);
}

export function buildPageMetadata(metadata: PageMetadata) {
  const url = toAbsoluteUrl(metadata.canonicalPath);
  const image = resolveAssetUrl(metadata.ogImage ?? siteConfig.ogImages.default);

  const pageJsonLd = metadata.isHome
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${toAbsoluteUrl('/')}#website`,
        url: toAbsoluteUrl('/'),
        name: siteConfig.name,
        inLanguage: 'ja',
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: metadata.title,
        description: metadata.description,
        inLanguage: 'ja',
        isPartOf: { '@type': 'WebSite', '@id': `${toAbsoluteUrl('/')}#website` },
      };

  const breadcrumbJsonLd =
    metadata.breadcrumb && metadata.breadcrumb.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: metadata.breadcrumb.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
          })),
        }
      : null;

  return {
    url,
    image,
    pageJsonLd: breadcrumbJsonLd ? [pageJsonLd, breadcrumbJsonLd] : pageJsonLd,
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.fullName,
    url: toAbsoluteUrl('/'),
    logo: resolveAssetUrl(siteConfig.ogImages.default),
    sameAs: [siteConfig.communityLinks.x, siteConfig.communityLinks.discord],
  };
}
