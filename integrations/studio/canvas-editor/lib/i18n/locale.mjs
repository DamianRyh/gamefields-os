/** Presentation locale only. Project data and currency remain unchanged. */
/** @returns {"pl"|"en"} */
export function resolveStudioLocale(value){return value==="en"?"en":"pl"}
export function studioLocaleFromSearch(search){return resolveStudioLocale(new URLSearchParams(search).get("lang"))}
export function studioLocalHref(href,locale){
 const url=new URL(href,"https://studio.invalid");
 if(url.origin!=="https://studio.invalid")throw new Error("Expected internal Studio URL");
 if(locale==="en")url.searchParams.set("lang","en");else url.searchParams.delete("lang");
 return url.pathname+url.search+url.hash;
}
export function studioNumberLocale(locale){return locale==="en"?"en-GB":"pl-PL"}

/** Translate only own dictionary entries; never return inherited object properties. */
export function studioDisplay(text,locale,dictionary){
 return locale==="en" && Object.prototype.hasOwnProperty.call(dictionary,text) && typeof dictionary[text]==="string" ? dictionary[text] : text;
}
