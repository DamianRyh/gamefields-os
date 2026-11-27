import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveStudioLocale,studioLocaleFromSearch,studioLocalHref,studioNumberLocale,studioDisplay} from "../lib/i18n/locale.mjs";
const read=name=>JSON.parse(readFileSync(new URL("../lib/i18n/"+name+".json",import.meta.url),"utf8"));
assert.deepEqual(Object.keys(read("pl")).sort(),Object.keys(read("en")).sort());
assert.equal(resolveStudioLocale("de"),"pl");
assert.equal(studioLocaleFromSearch("?lang=en&project=abc"),"en");
assert.equal(studioLocaleFromSearch(""),"pl");
assert.equal(studioLocalHref("/radar?project=abc#map","en"),"/radar?project=abc&lang=en#map");
assert.equal(studioLocalHref("/?lang=en&project=abc","pl"),"/?project=abc");
assert.equal(studioNumberLocale("en"),"en-GB");
assert.throws(()=>studioLocalHref("https://example.com/","en"));
console.log("Studio locale contract OK");

const dictionary=read("display-en");
assert.ok(Object.keys(dictionary).length>0);
for(const [key,value] of Object.entries(dictionary)){assert.equal(typeof value,"string",key);assert.ok(value.trim(),key);assert.equal(studioDisplay(key,"pl",dictionary),key);assert.equal(studioDisplay(key,"en",dictionary),value);}
for(const key of ["constructor","toString","__proto__","unknown string"])assert.equal(studioDisplay(key,"en",{}),key);
assert.equal(studioLocalHref("/radar/pole-mokotowskie?view=map#preview","en"),"/radar/pole-mokotowskie?view=map&lang=en#preview");
console.log("Display dictionary and navigation contract OK");
