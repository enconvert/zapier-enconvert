import type { ZObject, Bundle } from 'zapier-platform-core';

/**
 * Copy a converted file's bytes into Zapier's file store and return a URL that
 * downstream apps can use.
 *
 * `z.request({ raw: true })` returns the raw response; handing that promise to
 * `z.stashFile` uploads the bytes and yields a public URL. `skipAuth` fetches
 * the pre-signed URL without the `X-API-Key` header, which the storage host
 * rejects. `skipThrowForStatus` lets stashing surface a useful error rather
 * than throwing on a non-2xx first.
 */
const stashConvertedFile = async (z: ZObject, bundle: Bundle) => {
  const url = bundle.inputData.url as string;
  const filePromise = z.request({
    url,
    raw: true,
    middlewareData: { skipAuth: true },
    skipThrowForStatus: true,
  });
  return z.stashFile(filePromise);
};

export const hydrators = {
  stashConvertedFile,
};
