/* Court lines of the nine sports in metres, from the field corner: the Studio's SportSurfaceLines
   (canvas-editor/components/sport-surface-art.tsx). Shared by sporty.js and the render tool. */
  /* court lines in metres from the field's corner (same geometry as the Studio) */
function lines(s) {
  var L = s.fieldLength, W = s.fieldWidth, o = [];
function ln(a, b, c, d) { o.push('M' + a + ' ' + b + 'L' + c + ' ' + d); }
function circ(cx, cy, r) { o.push('M' + (cx - r) + ' ' + cy + 'a' + r + ' ' + r + ' 0 1 0 ' + 2 * r + ' 0a' + r + ' ' + r + ' 0 1 0 ' + -2 * r + ' 0'); }
function rect(x, y, w, h) { o.push('M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + -w + 'Z'); }
function mirror(fn) { fn(function (x) { return x; }, function (y) { return y; }); fn(function (x) { return L - x; }, function (y) { return W - y; }); }
  rect(0.04, 0.04, L - 0.08, W - 0.08);
  if (s.id === 'teqball') { ln(L / 2, 0, L / 2, W); ln(L / 2 - 3.5, 0, L / 2 - 3.5, W); ln(L / 2 + 3.5, 0, L / 2 + 3.5, W); }
  if (s.id === 'tennis') { ln(L / 2, 0, L / 2, W); ln(0, 1.37, L, 1.37); ln(0, W - 1.37, L, W - 1.37); ln(L / 2 - 6.4, 1.37, L / 2 - 6.4, W - 1.37); ln(L / 2 + 6.4, 1.37, L / 2 + 6.4, W - 1.37); ln(L / 2 - 6.4, W / 2, L / 2 + 6.4, W / 2); }
  if (s.id === 'padel') { ln(10, 0, 10, W); ln(3.05, 0, 3.05, W); ln(16.95, 0, 16.95, W); ln(3.05, 5, 16.95, 5); }
  if (s.id === 'volleyball') { ln(9, 0, 9, W); ln(6, 0, 6, W); ln(12, 0, 12, W); }
  if (s.id === 'pickleball') { var k = 2.1336; ln(L / 2, 0, L / 2, W); ln(L / 2 - k, 0, L / 2 - k, W); ln(L / 2 + k, 0, L / 2 + k, W); ln(0, W / 2, L / 2 - k, W / 2); ln(L / 2 + k, W / 2, L, W / 2); }
  if (s.id === 'basketball-full') {
    ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, 1.8);
    mirror(function (X, Y) {
      o.push('M' + X(0) + ' ' + Y(W / 2 - 2.45) + 'L' + X(5.8) + ' ' + Y(W / 2 - 2.45) + 'L' + X(5.8) + ' ' + Y(W / 2 + 2.45) + 'L' + X(0) + ' ' + Y(W / 2 + 2.45));
      o.push('M' + X(5.8) + ' ' + Y(W / 2 - 1.8) + 'A1.8 1.8 0 0 1 ' + X(5.8) + ' ' + Y(W / 2 + 1.8));
      o.push('M' + X(0) + ' ' + Y(0.9) + 'L' + X(2.99) + ' ' + Y(0.9) + 'A6.75 6.75 0 0 1 ' + X(2.99) + ' ' + Y(W - 0.9) + 'L' + X(0) + ' ' + Y(W - 0.9));
      circ(X(1.575), W / 2, 0.225);
    });
  }
  if (s.id === 'basketball-3x3') {
    rect(L / 2 - 2.45, 0, 4.9, 5.8);
    o.push('M' + (L / 2 - 1.8) + ' 5.8A1.8 1.8 0 0 0 ' + (L / 2 + 1.8) + ' 5.8');
    o.push('M0.9 0V2.99A6.75 6.75 0 0 0 ' + (L - 0.9) + ' 2.99V0');
    circ(L / 2, 1.575, 0.225);
  }
  if (s.id === 'street-football-3x3' || s.id === 'futsal') {
    ln(L / 2, 0, L / 2, W); circ(L / 2, W / 2, s.id === 'futsal' ? 3 : 1.5);
    mirror(function (X, Y) {
      if (s.id === 'futsal') o.push('M' + X(0) + ' ' + Y(W / 2 - 7.5) + 'A6 6 0 0 1 ' + X(6) + ' ' + Y(W / 2 - 1.5) + 'L' + X(6) + ' ' + Y(W / 2 + 1.5) + 'A6 6 0 0 1 ' + X(0) + ' ' + Y(W / 2 + 7.5));
      else o.push('M' + X(0) + ' ' + Y(W / 2 - 2) + 'L' + X(2.5) + ' ' + Y(W / 2 - 2) + 'L' + X(2.5) + ' ' + Y(W / 2 + 2) + 'L' + X(0) + ' ' + Y(W / 2 + 2));
    });
  }
  return o.join('');
}
function fieldPos(s) { return { x: (s.length - s.fieldLength) / 2, y: typeof s.fieldOffsetY === 'number' ? s.fieldOffsetY : (s.width - s.fieldWidth) / 2 }; }
