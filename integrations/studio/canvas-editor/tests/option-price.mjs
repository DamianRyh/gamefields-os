import assert from 'node:assert/strict';
import {optionPriceDelta} from '../lib/option-price.ts';
// Artificial fixtures test subtraction and unknown-rate handling, not company prices.
const item=(id,totalNet,quantity=1)=>({id,totalNet,quantity,unitNet:totalNet,label:id,unit:'test'});
const quote=(items,rateVersion='test-rates')=>({rateVersion,priceNet:null,items});
const a=quote([item('surface',100),item('installation',20),item('transport',null)]);
const b=quote([item('surface',160),item('installation',20),item('transport',null)]);
assert.equal(optionPriceDelta(a,b,'material'),60);assert.equal(optionPriceDelta(b,a,'material'),-60);
assert.equal(optionPriceDelta(a,a,'material'),0);
assert.equal(optionPriceDelta(a,{...b,rateVersion:'new-rates'},'material'),null);
assert.equal(optionPriceDelta(quote([item('surface',null)]),quote([item('surface',null)]),'material'),null,'Same unknown rates must never appear as zero');
assert.equal(optionPriceDelta(a,quote([item('surface',160),item('installation',20),item('transport',null,2)]),'material'),null,'An unknown changed quantity prevents an exact delta');
assert.equal(optionPriceDelta(a,quote([item('surface',null),item('installation',20),item('transport',null)]),'material'),null);
console.log('PASS option prices: positive/negative/exact zero, rate-version guards and unknown affected rates.');
