import assert from 'node:assert/strict';
import {validateGraphicSource,graphicSourceError} from '../lib/graphic-source-policy.ts';
const src=xml=>'data:image/svg+xml;base64,'+Buffer.from(xml).toString('base64');
const safe=`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient><clipPath id="clip"><rect width="20" height="20"/></clipPath><mask id="m"><circle r="5"/></mask></defs><g clip-path="url(#clip)" mask="url('#m')"><path d="M0 0L2 2" fill="url(#g)"/><text>Łódź &amp; klub &#x1F3DF;</text></g></svg>`;
assert.equal(validateGraphicSource(src(safe)),true);
assert.equal(validateGraphicSource('data:image/png;base64,aGVsbG8='),true,'Legacy PNG acceptance remains unchanged');
for(const xml of [
 '<svg><script>alert(1)</script></svg>', '<svg onload="alert(1)"/>','<svg ONLOAD="x"/>','<svg><foreignObject/></svg>',
 '<!DOCTYPE svg [<!ENTITY x "x">]><svg/>','<svg><use href="https://example.com/a.svg#x"/></svg>','<svg><use href="/a.svg#x"/></svg>',
 '<svg><use href="&#106;avascript:alert(1)"/></svg>','<svg><path fill="url(https://example.com/x)"/></svg>',
 '<svg><path style="fill: u\\72l(https://example.com)"/></svg>','<svg><style>@import "x";</style></svg>',
 '<svg><animate attributeName="href"/></svg>','<svg><set attributeName="href"/></svg>',
 '<svg><?xml version="1.0"?></svg>','<svg><g></svg>','<svg/><svg/>','<svg id="x" id="y"/>',
 '<svg><text>&unknown;</text></svg>','<svg><text>&#1;</text></svg>','<svg><text>]]></text></svg>','<svg><text>&amp</text></svg>','<html/>','<svg><path fill="url( #x"/></svg>',
 '<svg><path style="behavior: x"/></svg>','<svg><use href="data:image/svg+xml;base64,eA=="/></svg>',
 '<svg><g a="1"/></svg>','<svg / >','<svg><use href="#x"/></svg>','<svg xmlns:xlink="https://example.com"/>','<svg><path style="fill: u&#114;l(https://example.com)"/></svg>','<svg><g/></svg>trailing','<svg><text><![CDATA[x]]></text></svg>',
 '<svg>'+ '<g>'.repeat(65)+'</g>'.repeat(65)+'</svg>', '<svg>'+'<path/>'.repeat(10001)+'</svg>',
 '<svg><text>'+'x'.repeat(2_000_000)+'</text></svg>'
])assert.equal(validateGraphicSource(src(xml)),false,xml.slice(0,120));
for(const value of ['data:image/svg+xml;base64,@@@@','data:image/svg+xml;base64,eA=','data:image/svg+xml;base64,/w==','https://example.com/a.svg','data:image/svg+xml;base64,PHN2Zy8+===='])assert.equal(validateGraphicSource(value),false,value);
assert.equal(graphicSourceError(src('<svg/>')),null);
assert.equal(validateGraphicSource(src('<svg><text>A &amp; B &amp; C</text></svg>')),true);
assert.equal(validateGraphicSource(src('<svg><path style="fill: url(\'#x\');stroke:#fff"/></svg>')),true);
console.log('PASS: bounded static SVG policy, safe references/Unicode, hostile XML/CSS/active content rejection, legacy PNG unchanged.');
