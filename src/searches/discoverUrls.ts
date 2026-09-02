import {
  defineInputFields,
  defineSearch,
  type SearchPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface DiscoverResponse {
  urls?: string[];
  total?: number;
}

type Item = { id: string; url: string };

const inputFields = defineInputFields([
  { key: 'url', label: 'URL', type: 'string', required: true, helpText: 'The site to enumerate.' },
  {
    key: 'mode',
    label: 'Mode',
    type: 'string',
    required: false,
    default: 'hybrid',
    choices: { sitemap: 'Sitemap', crawl: 'Crawl', hybrid: 'Hybrid' },
  },
  { key: 'max_urls', label: 'Max URLs', type: 'integer', required: false },
]);

const perform = (async (z, bundle) => {
  const response = await z.request<DiscoverResponse>({
    url: `${API_BASE}/v2/discover`,
    method: 'POST',
    body: {
      url: bundle.inputData.url,
      mode: bundle.inputData.mode,
      max_urls: bundle.inputData.max_urls,
    },
  });
  return (response.data.urls ?? []).map((url): Item => ({ id: url, url }));
}) satisfies SearchPerform<typeof inputFields, Item>;

export default defineSearch({
  key: 'discoverUrls',
  noun: 'URL',
  display: {
    label: 'Discover URLs',
    description:
      'List a site’s URLs via sitemap, crawl or both, without rendering any page.',
  },
  operation: {
    inputFields,
    perform,
    sample: { id: 'https://example.com/pricing', url: 'https://example.com/pricing' },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'url', label: 'URL' },
    ],
  },
});
