interface StructuredDataProps {
  data: Record<string, unknown>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Organization schema for FX Alert
export function fxAlertOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FX Alert',
    url: 'https://raterefresher.web.app',
    logo: 'https://raterefresher.web.app/logo.png',
    description: 'Foreign exchange rate monitoring and insights for USD to THB currency pairs',
    sameAs: [] as string[],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  }
}

// WebSite schema with search action
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FX Alert',
    url: 'https://raterefresher.web.app',
    description: 'Monitor USD to THB exchange rates with historical trends and AI-powered analysis',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://raterefresher.web.app/?search={search_term_string}',
      },
      'query-input': {
        '@type': 'PropertyValueSpecification',
        valueRequired: true,
        valueName: 'search_term_string',
      },
    },
  }
}

// Article schema for guide pages
export function articleSchema(props: {
  title: string
  description: string
  publishDate: string
  modifiedDate?: string
  url: string
  authorName?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: props.title,
    description: props.description,
    image: 'https://raterefresher.web.app/og-image.png',
    datePublished: props.publishDate,
    dateModified: props.modifiedDate || props.publishDate,
    author: {
      '@type': 'Person',
      name: props.authorName || 'FX Alert Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FX Alert',
      logo: {
        '@type': 'ImageObject',
        url: 'https://raterefresher.web.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': props.url,
    },
  }
}

// FinancialProduct schema for exchange rate monitoring
export function financialProductSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: 'USD to THB Exchange Rate Monitor',
    description: 'Real-time monitoring and analysis of USD to THB exchange rates with historical trends and band-based insights',
    brand: {
      '@type': 'Organization',
      name: 'FX Alert',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free exchange rate monitoring service',
    },
  }
}

// FAQPage schema for FAQs
export function faqPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// BreadcrumbList schema
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
