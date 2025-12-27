/**
 * Schema Markup Generator
 * Generates JSON-LD structured data for SEO
 * Critical for rich snippets and Google features
 */

import type { GeneratedContent } from '@/lib/types/domain';

export interface ArticleSchemaOptions {
  title: string;
  content: string;
  metaDescription: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  imageUrl?: string;
  organizationName: string;
  organizationLogo?: string;
}

export interface OrganizationSchemaOptions {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
  sameAs?: string[]; // Social media URLs
}

export interface ReviewSchemaOptions {
  itemName: string;
  reviewBody: string;
  author: string;
  datePublished: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
}

export interface FAQSchemaOptions {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchemaOptions {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generate Article schema (JSON-LD)
 * Use for all blog posts and articles
 */
export function generateArticleSchema(options: ArticleSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.metaDescription,
    author: {
      '@type': 'Person',
      name: options.author,
    },
    datePublished: options.datePublished,
    dateModified: options.dateModified || options.datePublished,
    url: options.url,
    ...(options.imageUrl && {
      image: {
        '@type': 'ImageObject',
        url: options.imageUrl,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: options.organizationName,
      ...(options.organizationLogo && {
        logo: {
          '@type': 'ImageObject',
          url: options.organizationLogo,
        },
      }),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': options.url,
    },
  };
}

/**
 * Generate Organization schema (JSON-LD)
 * Use for homepage and about pages
 */
export function generateOrganizationSchema(options: OrganizationSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: options.name,
    url: options.url,
    ...(options.logo && { logo: options.logo }),
    ...(options.description && { description: options.description }),
    ...(options.address && {
      address: {
        '@type': 'PostalAddress',
        ...options.address,
      },
    }),
    ...(options.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        ...options.contactPoint,
      },
    }),
    ...(options.sameAs && { sameAs: options.sameAs }),
  };
}

/**
 * Generate Review schema (JSON-LD)
 * Use for customer testimonials and reviews
 */
export function generateReviewSchema(options: ReviewSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Thing',
      name: options.itemName,
    },
    reviewBody: options.reviewBody,
    author: {
      '@type': 'Person',
      name: options.author,
    },
    datePublished: options.datePublished,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: options.ratingValue,
      bestRating: options.bestRating || 5,
      worstRating: options.worstRating || 1,
    },
  };
}

/**
 * Generate FAQ schema (JSON-LD)
 * Use for FAQ pages and Q&A content
 */
export function generateFAQSchema(options: FAQSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: options.questions.map(q => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };
}

/**
 * Generate Breadcrumb schema (JSON-LD)
 * Use for navigation breadcrumbs
 */
export function generateBreadcrumbSchema(options: BreadcrumbSchemaOptions): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: options.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Extract FAQ questions from HTML content
 * Automatically detects Q&A patterns in content
 */
export function extractFAQFromContent(htmlContent: string): FAQSchemaOptions | null {
  const questions: Array<{ question: string; answer: string }> = [];

  // Pattern 1: <h2>Question</h2><p>Answer</p>
  const h2Pattern = /<h2[^>]*>(.*?)<\/h2>\s*<p[^>]*>(.*?)<\/p>/gi;
  let match;

  while ((match = h2Pattern.exec(htmlContent)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, '').trim();
    const answer = match[2].replace(/<[^>]*>/g, '').trim();

    // Check if it's a question (ends with ?)
    if (question.endsWith('?')) {
      questions.push({ question, answer });
    }
  }

  // Pattern 2: <h3>Question</h3><p>Answer</p>
  const h3Pattern = /<h3[^>]*>(.*?)<\/h3>\s*<p[^>]*>(.*?)<\/p>/gi;
  while ((match = h3Pattern.exec(htmlContent)) !== null) {
    const question = match[1].replace(/<[^>]*>/g, '').trim();
    const answer = match[2].replace(/<[^>]*>/g, '').trim();

    if (question.endsWith('?')) {
      questions.push({ question, answer });
    }
  }

  return questions.length > 0 ? { questions } : null;
}

/**
 * Inject schema markup into HTML
 */
export function injectSchemaMarkup(html: string, schema: object | object[]): string {
  const schemas = Array.isArray(schema) ? schema : [schema];

  const schemaScripts = schemas
    .map(s => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
    .join('\n');

  // Try to inject before </head> if present
  if (html.includes('</head>')) {
    return html.replace('</head>', `${schemaScripts}\n</head>`);
  }

  // Otherwise inject at the beginning
  return `${schemaScripts}\n${html}`;
}

/**
 * Generate comprehensive schema for a generated article
 * Combines Article + FAQ (if detected) + Organization
 */
export function generateComprehensiveSchema(
  article: GeneratedContent,
  options: {
    author: string;
    url: string;
    organizationName: string;
    organizationLogo?: string;
    imageUrl?: string;
  }
): object[] {
  const schemas: object[] = [];

  // 1. Article schema (always)
  schemas.push(
    generateArticleSchema({
      title: article.title,
      content: article.content,
      metaDescription: article.meta_description || '',
      author: options.author,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      url: options.url,
      imageUrl: options.imageUrl,
      organizationName: options.organizationName,
      organizationLogo: options.organizationLogo,
    })
  );

  // 2. FAQ schema (if Q&A detected in content)
  const faq = extractFAQFromContent(article.content);
  if (faq) {
    schemas.push(generateFAQSchema(faq));
  }

  return schemas;
}

/**
 * Validate schema markup using Schema.org validator format
 * Returns warnings if schema is incomplete
 */
export function validateSchema(schema: object): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check for required @context and @type
  const s = schema as any;
  if (!s['@context']) {
    warnings.push('Missing @context');
  }
  if (!s['@type']) {
    warnings.push('Missing @type');
  }

  // Article-specific validation
  if (s['@type'] === 'Article') {
    if (!s.headline) warnings.push('Article: Missing headline');
    if (!s.datePublished) warnings.push('Article: Missing datePublished');
    if (!s.author) warnings.push('Article: Missing author');
    if (!s.publisher) warnings.push('Article: Missing publisher');
  }

  // Organization-specific validation
  if (s['@type'] === 'Organization') {
    if (!s.name) warnings.push('Organization: Missing name');
    if (!s.url) warnings.push('Organization: Missing url');
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
