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
    helpText: 'The image (or PDF) to convert.',
  },
  {
    key: 'from',
    type: 'string',
    required: true,
    label: 'From Format',
    choices: { jpeg: 'JPEG', png: 'PNG', webp: 'WebP', heic: 'HEIC', svg: 'SVG', pdf: 'PDF' },
  },
  {
    key: 'to',
    type: 'string',
    required: true,
    label: 'To Format',
    choices: { jpeg: 'JPEG', png: 'PNG', webp: 'WebP', heic: 'HEIC', svg: 'SVG' },
    helpText: 'PDF converts to JPEG only. See the guide for the full matrix of supported pairs.',
  },
  {
    key: 'width',
    type: 'integer',
    required: false,
    label: 'Width',
    helpText:
      'Only used when the input is an SVG. 1 to 10000; width times height cannot exceed 25 million.',
  },
  {
    key: 'height',
    type: 'integer',
    required: false,
    label: 'Height',
    helpText: 'Only used when the input is an SVG.',
  },
  {
    key: 'output_filename',
    type: 'string',
    required: false,
    label: 'Output Filename',
  },
]);

const perform = ((z, bundle) =>
  convertFile(
    z,
    String(bundle.inputData.file),
    `/v1/convert/${bundle.inputData.from}-to-${bundle.inputData.to}`,
    {
      output_filename: bundle.inputData.output_filename,
      width: bundle.inputData.width,
      height: bundle.inputData.height,
    },
  )) satisfies CreatePerform<typeof inputFields>;

export default defineCreate({
  key: 'convertImage',
  noun: 'Image',
  display: {
    label: 'Convert Image',
    description:
      'Convert between JPEG, PNG, WebP, HEIC and SVG, or rasterize a PDF page to JPEG.',
  },
  operation: {
    inputFields,
    perform,
    sample: { ...CONVERT_SAMPLE, filename: 'output.png' },
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
