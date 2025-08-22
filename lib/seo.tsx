import { useEffect } from 'react';
import { analytics } from './analytics';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

export function useSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex = false
}: SEOProps) {
  useEffect(() => {
    // Update page title
    if (title) {
      document.title = `${title} | ChefGrocer`;
    }

    // Update meta description
    if (description) {
      updateMetaTag('description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }

    // Update canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaProperty('og:title', title);
    }
    if (description) {
      updateMetaProperty('og:description', description);
    }
    if (ogImage) {
      updateMetaProperty('og:image', ogImage);
    }
    updateMetaProperty('og:type', ogType);

    // Update robots meta tag
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // Track page view
    analytics.trackPageView(window.location.pathname);
  }, [title, description, keywords, canonical, ogImage, ogType, noIndex]);
}

function updateMetaTag(name: string, content: string) {
  let metaTag = document.querySelector(`meta[name="${name}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('name', name);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
}

function updateMetaProperty(property: string, content: string) {
  let metaTag = document.querySelector(`meta[property="${property}"]`);
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute('property', property);
    document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let linkTag = document.querySelector(`link[rel="${rel}"]`);
  if (!linkTag) {
    linkTag = document.createElement('link');
    linkTag.setAttribute('rel', rel);
    document.head.appendChild(linkTag);
  }
  linkTag.setAttribute('href', href);
}

// SEO optimization for specific pages
export const pageSEO = {
  home: {
    title: 'AI-Powered Smart Cooking Assistant',
    description: 'Transform your cooking with ChefGrocer\'s AI-powered meal planning, smart grocery lists, USDA nutrition data, and voice-guided cooking assistance. Start your free trial today!',
    keywords: 'AI cooking assistant, meal planning, nutrition database, grocery list, USDA food data, recipe management, smart cooking'
  },
  subscribe: {
    title: 'Subscribe to ChefGrocer Pro',
    description: 'Unlock premium features with ChefGrocer Pro. Get unlimited meal plans, auto-generated grocery lists, pantry tracking, and custom AI plans for just $4.99/month.',
    keywords: 'ChefGrocer subscription, premium meal planning, AI cooking assistant pro, unlimited recipes'
  },
  checkout: {
    title: 'Secure Checkout - ChefGrocer',
    description: 'Complete your ChefGrocer purchase securely. Unlock premium cooking features and start your culinary journey with AI-powered assistance.',
    keywords: 'ChefGrocer checkout, secure payment, premium cooking features',
    noIndex: true
  }
};

// Structured data for rich snippets
export function addStructuredData(data: object) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// Product structured data
export function addProductStructuredData(product: {
  name: string;
  description: string;
  price: string;
  currency: string;
  availability: string;
}) {
  addStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`
    }
  });
}