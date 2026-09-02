import {
  defineInputFields,
  defineTrigger,
  type PollingTriggerPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface Watcher {
  watcher_id: string;
  url: string;
  status: string;
}

interface WatchersResponse {
  watchers?: Watcher[];
}

type WatcherChoice = { id: string; name: string };

// The gateway caps list endpoints at 100 rows per page.
const PAGE = 100;

const inputFields = defineInputFields([]);

const perform = (async (z, bundle) => {
  const response = await z.request<WatchersResponse>({
    url: `${API_BASE}/v2/watch`,
    method: 'GET',
    params: {
      skip: (bundle.meta.page ?? 0) * PAGE,
      limit: PAGE,
    },
  });
  // The raw API is snake_case. The camelCase seen from @enconvert/mcp is a
  // client-side rename; mapping against it would yield undefined ids.
  return (response.data.watchers ?? []).map(
    (watcher): WatcherChoice => ({
      id: watcher.watcher_id,
      name: `${watcher.url} (${watcher.status})`,
    }),
  );
}) satisfies PollingTriggerPerform<typeof inputFields, WatcherChoice>;

export default defineTrigger({
  key: 'listWatchers',
  noun: 'Watcher',
  display: {
    label: 'List of Watchers',
    description: 'Hidden trigger that powers the Watcher dropdown in this app.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    inputFields,
    perform,
    canPaginate: true,
  },
});
