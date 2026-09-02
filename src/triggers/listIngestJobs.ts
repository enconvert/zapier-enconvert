import {
  defineInputFields,
  defineTrigger,
  type PollingTriggerPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface Job {
  job_id: string;
  status?: string;
  mode?: string;
}

interface JobsResponse {
  jobs?: Job[];
}

type JobChoice = { id: string; name: string };

// The gateway caps list endpoints at 100 rows per page.
const PAGE = 100;

const inputFields = defineInputFields([]);

const perform = (async (z, bundle) => {
  const response = await z.request<JobsResponse>({
    url: `${API_BASE}/v2/ingest`,
    method: 'GET',
    params: {
      skip: (bundle.meta.page ?? 0) * PAGE,
      limit: PAGE,
    },
  });
  return (response.data.jobs ?? []).map(
    (job): JobChoice => ({
      id: job.job_id,
      name: `${job.job_id} — ${job.status} (${job.mode})`,
    }),
  );
}) satisfies PollingTriggerPerform<typeof inputFields, JobChoice>;

export default defineTrigger({
  key: 'listIngestJobs',
  noun: 'Ingest Job',
  display: {
    label: 'List of Ingest Jobs',
    description: 'Hidden trigger that powers the Ingest Job dropdown in this app.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    inputFields,
    perform,
    canPaginate: true,
  },
});
