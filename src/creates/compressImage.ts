import {
  defineCreate,
  defineInputFields,
  type CreatePerform,
} from 'zapier-platform-core';

import { convertFile, CONVERT_SAMPLE } from '../client.js';

const inputFields = defineInputFields([
  {
    key: 'file',
    type: 'file',
    required: true,
    label: 'File',
    helpText: 'A PNG, JPEG or WebP image.',
  },
  {
    key: 'target_size_kb',
    type: 'integer',
    required: false,
    label: 'Target Size (KB)',
    helpText:
      'Best effort. An unreachable target returns the smallest result achieved rather than an error, so check the size that comes back.',
  },
  {
    key: 'output_filename',
    type: 'string',
    required: false,
    label: 'Output Filename',
  },
]);

const perform = ((z, bundle) =>
  convertFile(z, String(bundle.inputData.file), '/v1/convert/compress-image', {
    target_size_kb: bundle.inputData.target_size_kb,
    output_filename: bundle.inputData.output_filename,
  })) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'compressImage',
  noun: 'Image',
  display: {
    label: 'Compress Image',
    description:
      'Shrink a PNG, JPEG or WebP towards a target size in KB. The format stays the same.',
  },
  operation: {
    inputFields,
    perform,
    sample: { ...CONVERT_SAMPLE, filename: 'output.webp' },
    outputFields: [
      { key: 'file', type: 'file', label: 'Compressed File' },
      { key: 'filename', type: 'string', label: 'Filename' },
      { key: 'object_key', type: 'string', label: 'Object Key' },
      { key: 'file_size', type: 'integer', label: 'File Size (bytes)' },
      { key: 'conversion_time_seconds', type: 'number', label: 'Conversion Time (s)' },
      { key: 'job_id', type: 'string', label: 'Job ID' },
      { key: 'presigned_url', type: 'string', label: 'Download URL' },
    ],
  },
});
