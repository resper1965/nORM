/**
 * Keyword Suggestions
 * Suggest default keywords for new clients
 */

/**
 * Generate default keywords for a client
 * @param clientName Client name
 * @returns Array of suggested keywords
 */
export function generateDefaultKeywords(clientName: string): string[] {
  const name = clientName.trim();
  const keywords: string[] = [];

  // Add brand name
  keywords.push(name);

  // Add common negative terms (Brazilian market)
  const negativeTerms = [
    'fraude',
    'processo',
    'reclamação',
    'problema',
    'scam',
    'estelionato',
    'calote',
    'golpe',
  ];

  for (const term of negativeTerms) {
    keywords.push(`${name} ${term}`);
  }

  return keywords;
}

/**
 * Suggest keywords based on industry
 */
export function suggestKeywordsByIndustry(
  clientName: string,
  industry?: string
): string[] {
  const baseKeywords = generateDefaultKeywords(clientName);

  if (!industry) {
    return baseKeywords;
  }

  const industryKeywords: Record<string, string[]> = {
    'advocacia': ['advogado', 'escritório', 'processo judicial'],
    'medicina': ['médico', 'clínica', 'hospital', 'tratamento'],
    'tecnologia': ['software', 'sistema', 'aplicativo', 'desenvolvimento'],
    'educação': ['curso', 'escola', 'faculdade', 'ensino'],
    'ecommerce': ['loja', 'produto', 'compra', 'entrega'],
  };

  const industryTerms = industryKeywords[industry.toLowerCase()] || [];
  const additionalKeywords = industryTerms.map((term) => `${clientName} ${term}`);

  return [...baseKeywords, ...additionalKeywords];
}

