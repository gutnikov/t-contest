window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function createCanvas(w, h, dpr) {
    const canvas = document.createElement('canvas');
    setCanvasSize(canvas, w,h, dpr);
    return canvas;
}

function setCanvasSize(canvas, w, h, dpr) {
    const useDpr = dpr || getDpr();
    canvas.width = w * useDpr;
    canvas.height = h * useDpr;
    canvas.style = `width: ${w}px; height: ${h}px`;
}

const dpr = window.devicePixelRatio || 1;
function getDpr() {
    return dpr;
}

// Animation and easing functions
function timing(duration, onFinish) {
    let timePassed = 0;
    return function(delta) {
        const prev = Math.min(1, timePassed/duration);
        timePassed += (delta || 0);
        const cur = Math.min(1, timePassed/duration);
        if (prev < 1 && cur === 1 && onFinish) {
            onFinish();
        }
        return cur;
    }
}

function animated(from, to, t) {
    return from + (to - from) * t;
}

function easeInQuad(t) { return t*t }
function easeInQuart(t) { return t*t*t*t }
function easeInOutQuart(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }

// Vector operations
function v2(x,y) { return { x, y }; }

function add(a, b) {
    return v2(a.x + b.x, a.y + b.y);
}

function sub(a,b) {
    return v2(a.x - b.x, a.y - b.y);
}

function map(from, to) {
    return v2(to.x/from.x, to.y/from.y);
}

function scale(v, factor) {
    return v2(v.x * factor.x, v.y * factor.y);
}

function invertY(v, area) {
    return v2(v.x, area.y - v.y);
}

function inRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Line point
function linePoint(p1, p2, x) {
    const y = ((p1.x * p2.y - p2.x * p1.y) + (p1.y - p2.y)*x)/(-(p2.x - p1.x));
    return v2(x,y);
}

function range(first, step, count) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(first + i * step);
    }
    return result;
}

function rangeSteps(first, last, step, size) {
    let count = Math.ceil((last - first)/step);
    if ( count < size ) {
        return range(first, step, count);
    } else {
        return rangeSteps(first, last, step * 2, size);
    }
}

function stepsScale(first, last, count) {
    let result = [];
    let i = 2;
    do {
        result.push(rangeSteps(first, last, 1, i * count));
        i *= 2;
    } while (i * count < last - first);
    return result;
}

function splitRange(first, last, count) {
    while(((last - first)/(count - 1)) % 1 !== 0) {
        last++;
    }
    let step = (last - first)/count;
    let result = [];
    for (let i = 0; i <= count; i++) {
        result.push(Math.round(first + i * step));
    }
    return result;
}

function arraysMaxValue(arrays, i0, i1) {
    let max = arrays[0][0];
    for (let j = 0; j < arrays.length; j++) {
        for (let i = i0; i <= i1; i++) {
            max = max > arrays[j][i] ? max : arrays[j][i];
        }
    }
    return max;
}

function hexToRgbA(hex){
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',alpha)';
    }
    return 'rgba(0,0,0)';
}

function withAlpha(rgba, alpha) {
    return rgba.replace('alpha', Number.isFinite(alpha) ? alpha : 1);
}

const monthNames = [
    'Jan', 'Feb', 'Mar',
    'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'
];

function formatDate(time) {
    const date = new Date(time);
    return monthNames[date.getMonth()] + ' ' + date.getDate();
}
