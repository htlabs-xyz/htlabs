// Client-side i18n runtime: detects locale (cookie → timezone → navigator → en),
// applies translations to elements with [data-i18n] / [data-i18n-attr],
// and exposes a toggle handler bound via [data-i18n-toggle].

import { translations, type Locale } from './translations';

const COOKIE = 'lang';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(): Locale | null {
  const m = document.cookie.match(/(?:^|;\s*)lang=(en|vi)/);
  return (m?.[1] as Locale) ?? null;
}

function detect(): Locale {
  const c = readCookie();
  if (c) return c;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz === 'Asia/Ho_Chi_Minh' || tz === 'Asia/Saigon') return 'vi';
  } catch {}
  if ((navigator.language || '').toLowerCase().startsWith('vi')) return 'vi';
  return 'en';
}

function apply(lang: Locale) {
  document.documentElement.lang = lang;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const v = key && translations[key]?.[lang];
    if (typeof v === 'string') el.textContent = v;
  });
  // Inline content-collection translations: data-i18n-vi="..." holds VI text;
  // EN is preserved on first apply via dataset.i18nEn.
  document.querySelectorAll<HTMLElement>('[data-i18n-vi]').forEach((el) => {
    if (!el.dataset.i18nEn) el.dataset.i18nEn = el.textContent ?? '';
    el.textContent = lang === 'vi' ? (el.getAttribute('data-i18n-vi') ?? '') : (el.dataset.i18nEn ?? '');
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-attr]').forEach((el) => {
    (el.getAttribute('data-i18n-attr') || '').split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!attr || !key) return;
      const v = translations[key]?.[lang];
      if (typeof v === 'string') el.setAttribute(attr, v);
    });
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-toggle]').forEach((el) => {
    el.textContent = lang === 'vi' ? 'EN' : 'VI';
    el.setAttribute('aria-label', lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt');
  });
}

function setLang(lang: Locale) {
  document.cookie = `${COOKIE}=${lang};path=/;max-age=${ONE_YEAR};SameSite=Lax`;
  apply(lang);
}

declare global {
  interface Window {
    __htLang?: { get: () => Locale; set: (l: Locale) => void };
  }
}

window.__htLang = { get: () => readCookie() ?? detect(), set: setLang };

apply(detect());

document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement | null)?.closest('[data-i18n-toggle]');
  if (!target) return;
  e.preventDefault();
  setLang((readCookie() ?? detect()) === 'vi' ? 'en' : 'vi');
});
