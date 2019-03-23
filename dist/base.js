'use strict';

window.requestAnimFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
}();

function createCanvas(w, h, dpr) {
    var canvas = document.createElement('canvas');
    setCanvasSize(canvas, w, h, dpr);
    return canvas;
}

function setCanvasSize(canvas, w, h, dpr) {
    var useDpr = dpr || getDpr();
    canvas.width = w * useDpr;
    canvas.height = h * useDpr;
    canvas.style = 'width: ' + w + 'px; height: ' + h + 'px';
}

var dpr = window.devicePixelRatio || 1;
function getDpr() {
    return dpr;
}

// Animation and easing functions
function timing(duration, onFinish) {
    var timePassed = 0;
    return function (delta) {
        var prev = Math.min(1, timePassed / duration);
        timePassed += delta || 0;
        var cur = Math.min(1, timePassed / duration);
        if (prev < 1 && cur === 1 && onFinish) {
            onFinish();
        }
        return cur;
    };
}

function animated(from, to, t) {
    return from + (to - from) * t;
}

function animate(v2from, v2to, durationSec, easingFn, timeStarted) {
    return function (now) {
        var t = (now - timeStarted) / (durationSec * 1000);
        // Finished?
        if (t > 1) {
            return null;
        } else {
            var et = easingFn(t);
            var delta = sub(v2to, v2from);
            return [t, add(v2from, v2(delta.x * et, delta.y * et))];
        }
    };
}

// no easing, no acceleration
function linear(t) {
    return t;
}
// accelerating from zero velocity
function easeInQuad(t) {
    return t * t;
}
// decelerating to zero velocity
function easeOutQuad(t) {
    return t * (2 - t);
}
// acceleration until halfway, then deceleration
function easeInOutQuad(t) {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
// accelerating from zero velocity
function easeInCubic(t) {
    return t * t * t;
}
// decelerating to zero velocity
function easeOutCubic(t) {
    return --t * t * t + 1;
}
// acceleration until halfway, then deceleration
function easeInOutCubic(t) {
    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}
// accelerating from zero velocity
function easeInQuart(t) {
    return t * t * t * t;
}
// decelerating to zero velocity
function easeOutQuart(t) {
    return 1 - --t * t * t * t;
}
// acceleration until halfway, then deceleration
function easeInOutQuart(t) {
    return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
}
// accelerating from zero velocity
function easeInQuint(t) {
    return t * t * t * t * t;
}
// decelerating to zero velocity
function easeOutQuint(t) {
    return 1 + --t * t * t * t * t;
}
// acceleration until halfway, then deceleration
function easeInOutQuint(t) {
    return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
}

// Vector operations
function v2(x, y) {
    return {
        x: x,
        y: y
    };
}

function add(a, b) {
    return v2(a.x + b.x, a.y + b.y);
}

function sub(a, b) {
    return v2(a.x - b.x, a.y - b.y);
}

function map(from, to) {
    return v2(to.x / from.x, to.y / from.y);
}

function scale(v, factor) {
    return v2(v.x * factor.x, v.y * factor.y);
}

function invertY(v, area) {
    return v2(v.x, area.y - v.y);
}

function desc(a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? 1 : -1;
}

function inRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Line point
function linePoint(p1, p2, x) {
    var y = (p1.x * p2.y - p2.x * p1.y + (p1.y - p2.y) * x) / -(p2.x - p1.x);
    return v2(x, y);
}

function range(first, step, count) {
    var result = [];
    for (var i = 0; i < count; i++) {
        result.push(first + i * step);
    }
    return result;
}

function rangeSteps(first, last, step, size) {
    var count = Math.ceil((last - first) / step);
    if (count < size) {
        return range(first, step, count);
    } else {
        return rangeSteps(first, last, step * 2, size);
    }
}

function stepsScale(first, last, count) {
    var result = [];
    var i = 2;
    do {
        result.push(rangeSteps(first, last, 1, i * count));
        i *= 2;
    } while (i * count < last - first);
    return result;
}

function splitRange(first, last, count) {
    while ((last - first) / (count - 1) % 1 !== 0) {
        last++;
    }
    var step = (last - first) / count;
    var result = [];
    for (var i = 0; i <= count; i++) {
        result.push(Math.round(first + i * step));
    }
    return result;
}

function arraysMaxValue(arrays, i0, i1) {
    var max = arrays[0][0];
    for (var j = 0; j < arrays.length; j++) {
        for (var i = i0; i <= i1; i++) {
            max = max > arrays[j][i] ? max : arrays[j][i];
        }
    }
    return max;
}

function hexToRgbA(hex) {
    var c = void 0;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return 'rgba(' + [c >> 16 & 255, c >> 8 & 255, c & 255].join(',') + ',alpha)';
    }
    return 'rgba(0,0,0)';
}

function withAlpha(rgba, alpha) {
    return rgba.replace('alpha', Number.isFinite(alpha) ? alpha : 1);
}

var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(time) {
    var date = new Date(time);
    return monthNames[date.getMonth()] + ' ' + date.getDate();
}