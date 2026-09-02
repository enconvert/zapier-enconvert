import {
  defineInputFields,
  defineSearch,
  type SearchPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface Job {
  job_id: string;
  status?: string;
  mode?: string;
  pages_discovered?: number;
  pages_processed?: number;
  total_chunks?: number;
  output_url?: string;
}

type Item = Job & { id: string };

const inputFields = defineInputFields([
  {
    key: 'job_id',
    label: 'Ingest Job',
    type: 'string',
    required: true,
    dynamic: 'listIngestJobs.id.name',
    helpText: 'Pick an ingest job, or map an ID from an earlier step.',
  },
]);

const perform = (async (z, bundle) => {
  const response = await z.request<Job>({
    url: `${API_BASE}/v2/ingest/${encodeURIComponent(bundle.inputData.job_id)}`,
    method: 'GET',
  });
  const job = response.data;
  // A Search returns an array; here it is the single matching job.
  return [{ ...job, id: job.job_id }];
}) satisfies SearchPerform<typeof inputFields, Item>;

export default defineSearch({
  key: 'getIngestJob',
  noun: 'Ingest Job',
  display: {
    label: 'Get Ingest Job',
    description:
      'Read an ingest job by ID, including its status and finished JSONL output URL.',
  },
  operation: {
    inputFields,
    perform,
    sample: {
      id: 'ing_abc123',
      job_id: 'ing_abc123',
      status: 'completed',
      mode: 'sitemap',
      pages_discovered: 12,
      pages_processed: 12,
      total_chunks: 148,
      output_url: 'https://files.enconvert.com/ingest/abc123.jsonl?signature=example',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'job_id', label: 'Job ID' },
      { key: 'status', label: 'Status' },
      { key: 'mode', label: 'Mode' },
      { key: 'pages_discovered', label: 'Pages Discovered', type: 'integer' },
      { key: 'total_chunks', label: 'Total Chunks', type: 'integer' },
      { key: 'output_url', label: 'Output URL (JSONL)' },
    ],
  },
});
