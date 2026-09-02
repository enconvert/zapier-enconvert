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
    helpText: 'The document to convert. Map a file from a previous step.',
  },
  {
    key: 'output_filename',
    type: 'string',
    required: false,
    label: 'Output Filename',
    helpText: 'Name for the markdown file, for example notes.md.',
  },
]);

const perform = ((z, bundle) =>
  convertFile(z, String(bundle.inputData.file), '/v1/convert/anything-to-markdown', {
    output_filename: bundle.inputData.output_filename,
  })) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'convertToMarkdown',
  noun: 'Markdown',
  display: {
    label: 'Convert File to Markdown',
    description:
      'Convert Word, PowerPoint, Excel, PDF, EPUB, RTF, HTML and more into markdown.',
  },
  operation: {
    inputFields,
    perform,
    sample: { ...CONVERT_SAMPLE, filename: 'output.md' },
    outputFields: [
      { key: 'file', type: 'file', label: 'Converted File' },
      { key: 'filename', type: 'string', label: 'Filename' },
      { key: 'object_key', type: 'string', label: 'Object Key' },
      { key: 'file_size', type: 'integer', label: 'File Size (bytes)' },
      { key: 'conversion_time_seconds', type: 'number', label: 'Conversion Time (s)' },
      { key: 'job_id', type: 'string', label: 'Job ID' },
      { key: 'presigned_url', type: 'string', label: 'Download URL' },
    ],
  },
});
