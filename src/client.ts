import type { ZObject } from 'zapier-platform-core';
import FormData from 'form-data';

import { API_BASE } from './constants.js';
import { hydrators } from './hydrators.js';

/** The JSON envelope every `/v1/convert/*` endpoint returns. */
interface ConvertResponse {
  presigned_url: string;
  object_key: string;
  filename: string;
  file_size: number;
  conversion_time_seconds: number;
  job_id: string;
}

/** The shape a conversion Create hands back, with a dehydrated file attached. */
export interface ConvertResult extends ConvertResponse {
  /** A dehydrated pointer Zapier resolves into the real file when consumed. */
  file: string;
}

/** Extension per content type, for files whose name reaches us without one. */
const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/epub+zip': 'epub',
  'application/rtf': 'rtf',
  'text/rtf': 'rtf',
  'text/html': 'html',
  'text/markdown': 'md',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/svg+xml': 'svg',
};

function filenameFromContentDisposition(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const encoded = /filename\*\s*=\s*[^']*''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      // Malformed percent-encoding; fall through to the plain form.
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain?.[1] ? plain[1].trim() : undefined;
}

const hasExtension = (name: string): boolean => /\.[A-Za-z0-9]{1,8}$/.test(name);

function segmentFromUrl(url: string): string | undefined {
  try {
    const last = new URL(url).pathname.split('/').filter(Boolean).pop();
    return last && last.length ? decodeURIComponent(last) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Work out the filename to upload under.
 *
 * The converters detect the input format from the extension and reject anything
 * else with a 400, so this cannot fall back to a bare name. Zapier hydrates a
 * `type: 'file'` field into an opaque URL like
 * `https://zapier.com/engine/hydrate/.../` whose last path segment carries no
 * extension, which is why the URL alone is not enough: take the name the file
 * server reports, then the URL, and finally derive one from the content type.
 */
function sourceName(
  url: string,
  contentDisposition?: string,
  contentType?: string,
): string | undefined {
  const fromHeader = filenameFromContentDisposition(contentDisposition);
  if (fromHeader && hasExtension(fromHeader)) return fromHeader;

  const fromUrl = segmentFromUrl(url);
  if (fromUrl && hasExtension(fromUrl)) return fromUrl;

  const mediaType = (contentType ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
  const extension = EXTENSION_BY_CONTENT_TYPE[mediaType];
  if (!extension) return undefined;
  return `${(fromHeader ?? fromUrl ?? 'upload').replace(/\.+$/, '')}.${extension}`;
}

/**
 * Upload a file to a `/v1/convert/*` endpoint and return the parsed result with
 * a dehydrated `file` attached.
 *
 * The input file arrives as a URL (Zapier hydrates `type: 'file'` fields into a
 * URL). We fetch its bytes with `skipAuth` (it is not an EnConvert URL), stream
 * them as multipart to the converter, and dehydrate the pre-signed result so
 * the bytes flow to the next step only when needed.
 */
export async function convertFile(
  z: ZObject,
  fileUrl: string,
  path: string,
  extraFields: Record<string, string | number | undefined> = {},
): Promise<ConvertResult> {
  const fileResponse = await z.request({
    url: fileUrl,
    raw: true,
    middlewareData: { skipAuth: true },
  });
  const fileBuffer = await fileResponse.buffer();

  const filename = sourceName(
    fileUrl,
    fileResponse.headers?.get('content-disposition') ?? undefined,
    fileResponse.headers?.get('content-type') ?? undefined,
  );
  if (!filename) {
    throw new z.errors.Error(
      'Could not tell what kind of file this is. EnConvert reads the format from ' +
        'the filename extension, and this file arrived with neither a name nor a ' +
        'recognised content type. Map the file from a step that keeps its original ' +
        'filename, such as an email attachment or a cloud-storage file.',
      'InvalidData',
      400,
    );
  }

  const form = new FormData();
  form.append('file', fileBuffer, {
    filename,
    knownLength: fileBuffer.length,
  });
  form.append('direct_download', 'false');
  for (const [key, value] of Object.entries(extraFields)) {
    if (value !== undefined && value !== null && value !== '') {
      form.append(key, String(value));
    }
  }

  const response = await z.request({
    url: `${API_BASE}${path}`,
    method: 'POST',
    body: form as unknown as NodeJS.ReadableStream,
    headers: form.getHeaders(),
  });
  const data = response.data as ConvertResponse;

  return {
    ...data,
    file: z.dehydrateFile(hydrators.stashConvertedFile, {
      url: data.presigned_url,
      filename: data.filename,
    }),
  };
}

/** Sample output shared by every conversion Create. */
export const CONVERT_SAMPLE = {
  presigned_url: 'https://files.enconvert.com/converted/abc123/output?signature=example',
  object_key: 'converted/abc123/output',
  filename: 'output.pdf',
  file_size: 84213,
  conversion_time_seconds: 1.42,
  job_id: 'job_01HZX9M4Q7C2K5B3',
  file: 'https://zapier.com/engine/hydrate/example/',
};
