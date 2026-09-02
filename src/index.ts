import zapier, { defineApp } from 'zapier-platform-core';

import packageJson from '../package.json' with { type: 'json' };

import authentication from './authentication.js';
import { addApiKey, handleBadResponses } from './middleware.js';
import { hydrators } from './hydrators.js';

import convertToPdf from './creates/convertToPdf.js';
import convertToMarkdown from './creates/convertToMarkdown.js';
import convertImage from './creates/convertImage.js';
import compressImage from './creates/compressImage.js';
import perceiveUrl from './creates/perceiveUrl.js';
import distill from './creates/distill.js';
import startIngest from './creates/startIngest.js';
import createWatcher from './creates/createWatcher.js';

import searchWeb from './searches/searchWeb.js';
import discoverUrls from './searches/discoverUrls.js';
import getIngestJob from './searches/getIngestJob.js';

import watchChange from './triggers/watchChange.js';
import listWatchers from './triggers/listWatchers.js';
import listIngestJobs from './triggers/listIngestJobs.js';

export default defineApp({
  version: packageJson.version,
  platformVersion: zapier.version,

  authentication,

  // Attaches the X-API-Key header to every EnConvert request.
  beforeRequest: [addApiKey],
  afterResponse: [handleBadResponses],

  // Each perform builds its request body explicitly, so let input through
  // untouched (also clears Zapier's D028 cleanInputData recommendation).
  flags: { cleanInputData: false },

  // Resolves a converted file's bytes when a downstream step consumes it.
  hydrators,

  triggers: {
    [watchChange.key]: watchChange,
    // Hidden: these only populate dropdowns, they never appear in the Zap editor.
    [listWatchers.key]: listWatchers,
    [listIngestJobs.key]: listIngestJobs,
  },

  searches: {
    [searchWeb.key]: searchWeb,
    [discoverUrls.key]: discoverUrls,
    [getIngestJob.key]: getIngestJob,
  },

  creates: {
    [convertToPdf.key]: convertToPdf,
    [convertToMarkdown.key]: convertToMarkdown,
    [convertImage.key]: convertImage,
    [compressImage.key]: compressImage,
    [perceiveUrl.key]: perceiveUrl,
    [distill.key]: distill,
    [startIngest.key]: startIngest,
    [createWatcher.key]: createWatcher,
  },
});
