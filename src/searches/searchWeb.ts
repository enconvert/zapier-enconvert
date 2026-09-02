import {
  defineInputFields,
  defineSearch,
  type SearchPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface LookupResult {
  title?: string;
  url?: string;
  snippet?: string;
  position?: number;
  source?: string;
  date?: string;
}

interface LookupResponse {
  results?: LookupResult[];
}

type Item = LookupResult & { id: string };

const inputFields = defineInputFields([
  { key: 'query', label: 'Query', type: 'string', required: true },
  {
    key: 'category',
    label: 'Category',
    type: 'string',
    required: false,
    default: 'web',
    choices: {
      web: 'Web',
      news: 'News',
      images: 'Images',
      scholar: 'Scholar',
      patents: 'Patents',
      maps: 'Maps',
    },
  },
  { key: 'num_results', label: 'Number of Results', type: 'integer', required: false },
]);

const perform = (async (z, bundle) => {
  const response = await z.request<LookupResponse>({
    url: `${API_BASE}/v2/lookup`,
    method: 'POST',
    body: {
      query: bundle.inputData.query,
      category: bundle.inputData.category,
      num_results: bundle.inputData.num_results,
    },
  });
  const results = response.data.results ?? [];
  // A Search must return an ARRAY, each item carrying a stable `id`.
  return results.map((result, index): Item => ({
    ...result,
    id: result.url ?? `${bundle.inputData.query}-${index}`,
  }));
}) satisfies SearchPerform<typeof inputFields, Item>;

export default defineSearch({
  key: 'searchWeb',
  noun: 'Result',
  display: {
    label: 'Search the Web',
    description:
      'Search the web, news, images, scholar, patents or maps and return one result per row.',
  },
  operation: {
    inputFields,
    perform,
    sample: {
      id: 'https://example.com/article',
      title: 'Example Article',
      url: 'https://example.com/article',
      snippet: 'A short summary of the matching result.',
      position: 1,
      source: 'example.com',
      date: '2026-08-20',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'url', label: 'URL' },
      { key: 'snippet', label: 'Snippet' },
      { key: 'position', label: 'Position', type: 'integer' },
      { key: 'source', label: 'Source' },
      { key: 'date', label: 'Date' },
    ],
  },
});
