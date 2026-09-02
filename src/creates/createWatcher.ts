import {
  defineCreate,
  defineInputFields,
  type CreatePerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

const inputFields = defineInputFields([
  { key: 'url', type: 'string', required: true, label: 'URL' },
  {
    key: 'frequency_minutes',
    type: 'integer',
    required: false,
    label: 'Frequency (minutes)',
    helpText: 'How often to re-check. Hourly (60) is the floor.',
  },
  {
    key: 'webhook_url',
    type: 'string',
    required: false,
    label: 'Webhook URL',
    helpText: 'Optional. EnConvert POSTs here when the page changes.',
  },
  {
    key: 'notify_email',
    type: 'boolean',
    required: false,
    label: 'Notify by Email',
  },
]);

const perform = (async (z, bundle) => {
  const body: Record<string, unknown> = { url: bundle.inputData.url };
  if (bundle.inputData.frequency_minutes) {
    body.frequency_minutes = bundle.inputData.frequency_minutes;
  }
  if (bundle.inputData.webhook_url) body.webhook_url = bundle.inputData.webhook_url;
  if (bundle.inputData.notify_email !== undefined) {
    body.notify_email = bundle.inputData.notify_email;
  }

  const response = await z.request({
    url: `${API_BASE}/v2/watch`,
    method: 'POST',
    body,
  });
  return response.data;
}) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'createWatcher',
  noun: 'Watcher',
  display: {
    label: 'Create Watcher',
    description:
      'Monitor a page for changes on a fixed cadence and get notified by webhook or email when it changes.',
  },
  operation: {
    inputFields,
    perform,
    sample: {
      watcher_id: 'wat_abc123',
      url: 'https://example.com',
      status: 'active',
      frequency_minutes: 60,
      next_check_at: '2026-08-27T13:00:00Z',
    },
    outputFields: [
      { key: 'watcher_id', label: 'Watcher ID' },
      { key: 'url', label: 'URL' },
      { key: 'status', label: 'Status' },
      { key: 'frequency_minutes', label: 'Frequency (minutes)', type: 'integer' },
      { key: 'next_check_at', label: 'Next Check At', type: 'datetime' },
    ],
  },
});
