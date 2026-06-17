/**
 * SEO utility for managing page-specific meta tags and structured data
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: Record<string, any>;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://ontariowill.com';
const SITE_NAME = 'Ontario Wills';

export function updatePageSEO(config: SEOConfig) {
  // Update title
  document.title = `${config.title} | ${SITE_NAME}`;

  // Update or create meta description
  updateMetaTag('description', config.description);

  // Update keywords if provided
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag('keywords', config.keywords.join(', '));
  }

  // Update Open Graph tags
  updateMetaTag('og:title', config.title, 'property');
  updateMetaTag('og:description', config.description, 'property');
  updateMetaTag('og:type', config.ogType || 'website', 'property');
  updateMetaTag('og:url', config.canonical || `${BASE_URL}${window.location.pathname}`, 'property');
  
  if (config.ogImage) {
    updateMetaTag('og:image', config.ogImage, 'property');
  }

  // Update Twitter Card tags
  updateMetaTag('twitter:title', config.title, 'name');
  updateMetaTag('twitter:description', config.description, 'name');
  updateMetaTag('twitter:card', config.twitterCard || 'summary_large_image', 'name');
  
  if (config.ogImage) {
    updateMetaTag('twitter:image', config.ogImage, 'name');
  }

  // Update canonical URL
  if (config.canonical) {
    updateCanonicalLink(config.canonical);
  }

  // Update structured data if provided
  if (config.structuredData) {
    updateStructuredData(config.structuredData);
  }
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.setAttribute('href', url);
}

function updateStructuredData(data: Record<string, any>) {
  // Remove existing structured data script if present
  const existingScript = document.querySelector('script[data-seo-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create and add new structured data script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-structured-data', 'true');
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    ...data,
  });
  
  document.head.appendChild(script);
}

// Pre-defined SEO configurations for key pages
export const SEO_CONFIGS = {
  home: {
    title: 'Ontario Wills & Power of Attorney Creator',
    description: 'Create legally compliant Wills and Powers of Attorney in Ontario with AI-powered guidance. No credit card required. Secure, encrypted, and Ontario legal compliant.',
    keywords: ['Ontario wills', 'power of attorney', 'estate planning', 'legal documents', 'POA', 'will creator'],
    ogType: 'website',
  },
  about: {
    title: 'About Ontario Wills - Estate Planning Made Simple',
    description: 'Learn how Ontario Wills helps Ontario residents create legally compliant estate planning documents with AI-powered guidance and expert legal support.',
    keywords: ['about Ontario Wills', 'estate planning', 'legal compliance', 'Ontario law', 'will creation'],
    structuredData: {
      '@type': 'WebPage',
      'name': 'About Ontario Wills',
      'description': 'Learn how Ontario Wills helps Ontario residents create legally compliant estate planning documents',
    },
  },
  pricing: {
    title: 'Pricing - Ontario Wills',
    description: 'Affordable pricing for estate planning. Choose between Free and Premium plans. No hidden fees. Start creating your will today.',
    keywords: ['pricing', 'plans', 'estate planning cost', 'will pricing', 'Ontario'],
    structuredData: {
      '@type': 'PricingPage',
      'name': 'Ontario Wills Pricing',
      'description': 'Transparent pricing for estate planning documents',
    },
  },
  dashboard: {
    title: 'Dashboard - Ontario Wills',
    description: 'Manage your estate planning documents with our secure dashboard. Create, edit, and download your wills and powers of attorney.',
    keywords: ['dashboard', 'document management', 'estate planning', 'wills', 'powers of attorney'],
  },
  willCreator: {
    title: 'Will Creator - Ontario Wills',
    description: 'Create a legally compliant will in Ontario with our AI-powered will creator. Answer simple questions and generate your will in minutes.',
    keywords: ['will creator', 'create will', 'Ontario will', 'estate planning', 'legal will'],
  },
  poaCreator: {
    title: 'Power of Attorney Creator - Ontario Wills',
    description: 'Create a legally compliant Power of Attorney in Ontario. Choose between Property POA or Personal Care POA with our guided creator.',
    keywords: ['power of attorney', 'POA creator', 'Ontario POA', 'property POA', 'personal care POA'],
  },
};
