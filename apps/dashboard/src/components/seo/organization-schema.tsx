/**
 * Organization and WebSite schema (JSON-LD) for Google AI Overview and rich results.
 */
interface OrganizationSchemaProps {
  baseUrl: string;
  name?: string;
  description?: string;
}

export function OrganizationSchema({
  baseUrl,
  name = "AgentMD",
  description = "The CI/CD platform for AI agents. Parse, validate, and execute AGENTS.md files with built-in governance.",
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name,
        description,
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/icon.svg`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name,
        description,
        publisher: { "@id": `${baseUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", url: `${baseUrl}/docs?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "AgentMD",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: "Parse, validate, and execute AGENTS.md files. Get an agent-readiness score, run commands in CI/CD, and add governance to agentic AI workflows.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
