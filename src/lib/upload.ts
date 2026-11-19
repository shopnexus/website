// In the browser: uploads one photo and resolves to its upload id. /tai-anh
// asks the server for a presigned URL, and the file goes straight to the
// object store. JPEG, PNG and WebP, at most 15 MB.

export class UploadError extends Error {
  constructor(readonly reason: 'sign-in' | 'type' | 'size' | 'failed') {
    super(reason);
  }
}

export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX = 15 * 1024 * 1024;

export async function uploadPhoto(file: File): Promise<string> {
  if (!PHOTO_TYPES.includes(file.type)) throw new UploadError('type');
  if (file.size > MAX) throw new UploadError('size');
  const res = await fetch('/tai-anh', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content_type: file.type, size: file.size }),
  }).catch(() => null);
  if (res?.status === 401) throw new UploadError('sign-in');
  if (!res?.ok) throw new UploadError('failed');
  const t = (await res.json()) as { id: string; url: string; headers: Record<string, string> };
  // The browser sets Content-Length itself and refuses to have it set.
  const headers = Object.fromEntries(Object.entries(t.headers).filter(([k]) => k.toLowerCase() !== 'content-length'));
  const put = await fetch(t.url, { method: 'PUT', headers, body: file }).catch(() => null);
  if (!put?.ok) throw new UploadError('failed');
  return t.id;
}
