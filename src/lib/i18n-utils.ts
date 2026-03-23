import { translations } from "./i18n";
export type Lang = "en" | "el";
export type LangParam = string | undefined;

/** Convert URL prefix ("gr") to translation locale. undefined/anything else = English */
export function getLangFromParam(lang: LangParam): Lang {
  return lang === "gr" ? "el" : "en";
}

/** Server-side translation helper */
export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
}

/** Prefix an internal href with the current language (no prefix for English) */
export function localizeHref(href: string, lang: LangParam): string {
  if (lang === "gr" && href.startsWith("/")) return `/gr${href}`;
  return href;
}

/** Return the alternate URL prefix */
export function getAlternateLang(lang: LangParam): string {
  return lang === "gr" ? "" : "gr";
}

/** For getStaticPaths — generates both language variants */
export function getLangs() {
  return [{ params: { lang: undefined } }, { params: { lang: "gr" } }];
}

/** Pick text from a bilingual object or plain string */
export function pickText(value: { en: string; el: string } | string, lang: Lang): string {
  if (typeof value === "string") return value;
  return value[lang] || value.en;
}
