/**
 * FAQ schema (JSON-LD) for Google AI Overview and rich results.
 * Renders as a script tag in the document head.
 */
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  items: FaqItem[];
}

export function FaqSchema({ items }: FaqSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
