import type {
  BeforeRequestMiddleware,
  AfterResponseMiddleware,
} from 'zapier-platform-core';

import { API_BASE, API_KEY_HEADER } from './constants.js';

/**
 * The single place the `X-API-Key` header is attached.
 *
 * Two guards keep it off requests that must stay unauthenticated:
 *   1. `middlewareData.skipAuth` lets a specific request opt out (the hydrator
 *      that fetches a pre-signed download URL sets this).
 *   2. A host check adds the key only to calls that target the EnConvert API,
 *      never to a pre-signed storage URL on a different host.
 */
export const addApiKey: BeforeRequestMiddleware = (request, _z, bundle) => {
  if (request.middlewareData?.skipAuth) {
    return request;
  }
  const apiKey = bundle.authData?.apiKey;
  if (apiKey && request.url && request.url.startsWith(API_BASE)) {
    request.headers = request.headers || {};
    request.headers[API_KEY_HEADER] = apiKey;
  }
  return request;
};

/**
 * Surface authentication failures with a clear message. A public `pk_` key
 * gets a 403 from `/v1/whoami`, so this fires the moment a wrong key is used.
 */
export const handleBadResponses: AfterResponseMiddleware = (response, z) => {
  if (response.status === 401 || response.status === 403) {
    throw new z.errors.Error(
      'The EnConvert API key is invalid or lacks access. Use a private key that starts with sk_. Public pk_ keys are not accepted.',
      'AuthenticationError',
      response.status,
    );
  }
  return response;
};
