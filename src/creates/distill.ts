import {
  defineCreate,
  defineInputFields,
  type CreatePerform,
} from 'zapier-platform-core';

import { API_BASE } from '../constants.js';

const inputFields = defineInputFields([
  {
    key: 'urls',
    type: 'string',
    list: true,
    required: true,
    label: 'URLs',
    helpText: 'One or more page URLs to extract from.',
  },
  {
    key: 'schema',
    type: 'text',
    required: true,
    label: 'Schema (JSON)',
    helpText:
      'A JSON object mapping each field name to a plain-language description, for example {"plan":"the plan name","price":"the monthly price"}.',
  },
]);

const perform = (async (z, bundle) => {
  let schema: unknown;
  try {
    schema = JSON.parse(bundle.inputData.schema);
  } catch {
    throw new z.errors.Error(
      'The schema must be a valid JSON object.',
      'InvalidSchema',
      400,
    );
  }
  const response = await z.request({
    url: `${API_BASE}/v2/distill`,
    method: 'POST',
    body: { urls: bundle.inputData.urls, schema },
  });
  return response.data;
}) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'distill',
  noun: 'Extraction',
  display: {
    label: 'Distill Structured Data',
    description: 'Extract fields matching a JSON schema from one or more pages.',
  },
  operation: {
    inputFields,
    perform,
    sample: { operation_id: 'per_def456', total: 1, completed: 1, failed: 0, results: [] },
    outputFields: [
      { key: 'operation_id', label: 'Operation ID' },
      { key: 'total', label: 'Total', type: 'integer' },
      { key: 'completed', label: 'Completed', type: 'integer' },
      { key: 'failed', label: 'Failed', type: 'integer' },
    ],
  },
});
