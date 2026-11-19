import { API } from './routes';

// In the browser: asks for the position once and lets /api/area keep the
// nearest commune. Resolves to the commune's name, or null when the buyer
// says no or no commune is near.
export function locate(): Promise<string | null> {
  return new Promise((done) => {
    if (!navigator.geolocation) return done(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch(API.area, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ lat: coords.latitude, lng: coords.longitude }),
        }).catch(() => null);
        done(res?.ok ? ((await res.json()) as { name: string }).name : null);
      },
      () => done(null),
      { maximumAge: 600_000, timeout: 10_000 },
    );
  });
}
