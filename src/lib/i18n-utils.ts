import { translations } from "./i18n";
export type Lang = "en" | "el";

/** Convert URL prefix ("en" | "gr") to translation locale */
export function getLangFromParam(lang: string): Lang {
  return lang === "gr" ? "el" : "en";
}

/** Server-side translation helper */
export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
}

/** Prefix an internal href with the current language */
export function localizeHref(href: string, lang: string): string {
  if (href.startsWith("/")) return `/${lang}${href}`;
  return href;
}

/** Return the opposite URL prefix */
export function getAlternateLang(lang: string): string {
  return lang === "en" ? "gr" : "en";
}

/** For getStaticPaths — generates both language variants */
export function getLangs() {
  return [{ params: { lang: "en" } }, { params: { lang: "gr" } }];
}

/** Pick text from a bilingual object or plain string */
export function pickText(value: { en: string; el: string } | string, lang: Lang): string {
  if (typeof value === "string") return value;
  return value[lang] || value.en;
}
