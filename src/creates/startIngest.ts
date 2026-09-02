import {
  defineCreate,
  defineInputFields,
  type CreatePerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

const inputFields = defineInputFields([
  {
    key: 'mode',
    type: 'string',
    required: true,
    label: 'Mode',
    default: 'sitemap',
    choices: { sitemap: 'Sitemap', crawl: 'Crawl', hybrid: 'Hybrid', urls: 'URL list' },
    helpText:
      'Sitemap, Crawl and Hybrid start from one seed URL. URL list ingests the exact URLs you provide.',
  },
  {
    key: 'url',
    type: 'string',
    required: false,
    label: 'Seed URL',
    helpText: 'The site to crawl. Required for Sitemap, Crawl and Hybrid modes.',
  },
  {
    key: 'urls',
    type: 'string',
    list: true,
    required: false,
    label: 'URLs',
    helpText: 'The exact URLs to ingest. Required for URL list mode.',
  },
  { key: 'max_pages', type: 'integer', required: false, label: 'Max Pages' },
  {
    key: 'webhook_url',
    type: 'string',
    required: false,
    label: 'Webhook URL',
    helpText: 'Optional. EnConvert POSTs here when the job finishes.',
  },
]);

const perform = (async (z, bundle) => {
  const body: Record<string, unknown> = { mode: bundle.inputData.mode };
  if (bundle.inputData.url) body.url = bundle.inputData.url;
  if (bundle.inputData.urls?.length) body.urls = bundle.inputData.urls;
  if (bundle.inputData.max_pages) body.max_pages = bundle.inputData.max_pages;
  if (bundle.inputData.webhook_url) body.webhook_url = bundle.inputData.webhook_url;

  const response = await z.request({
    url: `${API_BASE}/v2/ingest`,
    method: 'POST',
    body,
  });
  return response.data;
}) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'startIngest',
  noun: 'Ingest Job',
  display: {
    label: 'Start Ingest Job',
    description:
      'Crawl a whole site (or a list of URLs) into RAG-ready chunked JSONL. Runs asynchronously and returns a job you read with Get Ingest Job.',
  },
  operation: {
    inputFields,
    perform,
    sample: {
      job_id: 'ing_abc123',
      status: 'queued',
      mode: 'sitemap',
      pages_discovered: 0,
      total_chunks: 0,
      output_url: '',
    },
    outputFields: [
      { key: 'job_id', label: 'Job ID' },
      { key: 'status', label: 'Status' },
      { key: 'mode', label: 'Mode' },
      { key: 'pages_discovered', label: 'Pages Discovered', type: 'integer' },
      { key: 'total_chunks', label: 'Total Chunks', type: 'integer' },
      { key: 'output_url', label: 'Output URL (JSONL)' },
    ],
  },
});
