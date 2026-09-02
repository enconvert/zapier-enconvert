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
    helpText: 'The file to convert. Map a file from a previous step.',
  },
  {
    key: 'output_filename',
    type: 'string',
    required: false,
    label: 'Output Filename',
    helpText: 'Name for the PDF, for example invoice.pdf.',
  },
  {
    key: 'pdf_options',
    type: 'text',
    required: false,
    label: 'PDF Options (JSON)',
    helpText:
      'Optional JSON, for example {"page_size":"A4","orientation":"portrait"}. Office files carry their own page setup, so only grayscale applies to them.',
  },
]);

const perform = ((z, bundle) =>
  convertFile(z, String(bundle.inputData.file), '/v1/convert/anything-to-pdf', {
    output_filename: bundle.inputData.output_filename,
    pdf_options: bundle.inputData.pdf_options,
  })) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'convertToPdf',
  noun: 'PDF',
  display: {
    label: 'Convert File to PDF',
    description:
      'Convert a document, spreadsheet, presentation, image, HTML or text file to PDF.',
  },
  operation: {
    inputFields,
    perform,
    sample: { ...CONVERT_SAMPLE, filename: 'output.pdf' },
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
