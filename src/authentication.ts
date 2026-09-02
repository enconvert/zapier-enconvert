import type { ZObject, Bundle, Authentication } from 'zapier-platform-core';

import { API_BASE } from './constants.js';

/**
 * Verify the credential when an account is connected. `GET /v1/whoami` returns
 * `{ project_id, plan_slug }` and only accepts private keys, so a public `pk_`
 * key fails here. The `X-API-Key` header is added by the beforeRequest
 * middleware, so it is not set again here.
 *
 * The test returns the whole response, so `connectionLabel` reads body fields
 * with the `{{json.X}}` prefix.
 */
const test = (z: ZObject, _bundle: Bundle) =>
  z.request({ url: `${API_BASE}/v1/whoami`, method: 'GET' });

export default {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText:
        'Your EnConvert **private** key (starts with `sk_`), created in your [dashboard](https://www.enconvert.com/dashboard/api-keys). Public `pk_` keys are not accepted.',
    },
  ],
  test,
  connectionLabel: 'EnConvert ({{json.plan_slug}})',
} satisfies Authentication;
