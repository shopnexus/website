import icon from '@brand/icon-192.png';
import type { APIRoute } from 'astro';
import badge from '../assets/pwa/badge-96.png';
import { OTHER_TARGET, TARGETS } from '../lib/notices';
import worker from '../scripts/service-worker.js?raw';

// The service worker, at the root so its scope is the whole site: the code in
// scripts/service-worker.js after the SITE values it reads. Built once.
export const prerender = true;

const SITE = { targets: TARGETS, other: OTHER_TARGET, icon: icon.src, badge: badge.src };

export const GET: APIRoute = () =>
  new Response(`const SITE = ${JSON.stringify(SITE)};\n${worker}`, { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
