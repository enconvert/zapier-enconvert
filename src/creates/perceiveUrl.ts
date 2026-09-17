import {
  defineCreate,
  defineInputFields,
  type CreatePerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

const inputFields = defineInputFields([
  { key: 'url', type: 'string', required: true, label: 'URL', helpText: 'The page to render.' },
  {
    key: 'outputs',
    type: 'string',
    list: true,
    required: false,
    label: 'Outputs',
    default: 'markdown',
    choices: {
      markdown: 'Markdown',
      html_cleaned: 'Cleaned HTML',
      html_raw: 'Raw HTML',
      screenshot: 'Screenshot',
      screenshot_full_page: 'Full-page Screenshot',
      pdf: 'PDF',
      links: 'Links',
      images: 'Images',
      structured: 'Structured Data',
    },
  },
  {
    key: 'only_main_content',
    type: 'boolean',
    required: false,
    label: 'Only Main Content',
    helpText: 'Strip navigation, footers and boilerplate before producing markdown or HTML.',
  },
]);

const perform = (async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE}/v2/perceive`,
    method: 'POST',
    body: {
      url: bundle.inputData.url,
      outputs: bundle.inputData.outputs?.length
        ? bundle.inputData.outputs
        : ['markdown', 'structured'],
      only_main_content: bundle.inputData.only_main_content,
    },
  });
  return response.data;
}) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'perceiveUrl',
  noun: 'Page',
  display: {
    label: 'Perceive URL',
    description:
      'Render a web page into markdown, HTML, a screenshot, a PDF, links, images or structured data, with a render_quality honesty score.',
  },
  operation: {
    inputFields,
    perform,
    sample: {
      operation_id: 'per_abc123',
      status: 'completed',
      url: 'https://example.com',
      render_quality: 0.98,
      is_blocked: false,
      billed: true,
      cache_hit: false,
      extraction_tier: 'none',
      cost_cents: 2,
    },
    outputFields: [
      { key: 'operation_id', label: 'Operation ID' },
      { key: 'status', label: 'Status' },
      { key: 'url', label: 'URL' },
      { key: 'render_quality', label: 'Render Quality', type: 'number' },
      { key: 'is_blocked', label: 'Blocked', type: 'boolean' },
      { key: 'billed', label: 'Billed', type: 'boolean' },
      { key: 'cache_hit', label: 'Cache Hit', type: 'boolean' },
      { key: 'extraction_tier', label: 'Extraction Tier' },
      { key: 'cost_cents', label: 'Cost (cents)', type: 'integer' },
    ],
  },
});
