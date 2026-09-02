import {
  defineInputFields,
  defineTrigger,
  type PollingTriggerPerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

interface Snapshot {
  checked_at: string;
  has_changes: boolean;
  change_count: number;
}

interface SnapshotsResponse {
  snapshots?: Snapshot[];
}

type SnapshotItem = Snapshot & { id: string };

const inputFields = defineInputFields([
  {
    key: 'watcher_id',
    label: 'Watcher',
    type: 'string',
    required: true,
    dynamic: 'listWatchers.id.name',
    helpText: 'Pick a watcher, or map an ID from an earlier step.',
  },
]);

const perform = (async (z, bundle) => {
  const { watcher_id } = bundle.inputData;
  const response = await z.request<SnapshotsResponse>({
    url: `${API_BASE}/v2/watch/${encodeURIComponent(watcher_id)}/snapshots`,
    method: 'GET',
  });
  const snapshots = response.data.snapshots ?? [];
  return snapshots
    .map((snapshot): SnapshotItem => ({
      ...snapshot,
      // checked_at is unique per check, so this id is stable across polls.
      id: `${watcher_id}:${snapshot.checked_at}`,
    }))
    .sort(
      (a, b) => new Date(b.checked_at).getTime() - new Date(a.checked_at).getTime(),
    );
}) satisfies PollingTriggerPerform<typeof inputFields, SnapshotItem>;

export default defineTrigger({
  key: 'watchChange',
  noun: 'Change',
  display: {
    label: 'New Watcher Snapshot',
    description: 'Triggers when a watcher records a new snapshot (a scheduled check).',
  },
  operation: {
    type: 'polling',
    inputFields,
    perform,
    sample: {
      id: 'wat_123:2026-08-27T12:00:00Z',
      checked_at: '2026-08-27T12:00:00Z',
      has_changes: true,
      change_count: 3,
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'checked_at', label: 'Checked At', type: 'datetime' },
      { key: 'has_changes', label: 'Has Changes', type: 'boolean' },
      { key: 'change_count', label: 'Change Count', type: 'integer' },
    ],
  },
});
