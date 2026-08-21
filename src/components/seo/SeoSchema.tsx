import Script from "next/script";

interface SeoSchemaProps {
  type: "Product" | "NewsArticle" | "WebSite" | "Organization";
  data: Record<string, any>;
}

export default function SeoSchema({ type, data }: SeoSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`jsonld-schema-${type.toLowerCase()}-${Math.random().toString(36).substring(7)}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
