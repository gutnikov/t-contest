// TODO:
// Main area dragging with canvas

// Turning line on/of animations (fix anim fn)
// V rules animations
// Dates instead of numbers
// main chart layout: padding on top + vrules on bottom
// Vertical ruller showing current position

// Canvas resizing
// Calculate a number of vrules by the sccreen size

// Use same colors as on demo (themes)

// Fix scaling so it always divided by 6 decently
// Add new buttons

// Night mode for a page
// Header
// Buttons
// Button animations

// Bug: put close to each other
// Drag left handle, then drag right - causes scale to lag

// Put all charts on a page

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

class Chart {
    constructor(width, height, data, hasRulers) {
        this.dpr = window.devicePixelRatio || 1;
        this.dprFactor = v2(this.dpr, this.dpr);
        this.canvas = this.createCanvas(width, height, this.dpr);
        this.context2d = this.canvas.getContext('2d');
        this.hasRulers = hasRulers;
        this.linesEnabled = this.prevLinesEnabled = Object.keys(data.names).reduce(function(all, key){
            all[key] = true;
            return all;
        }, {});

        this.plotArea = v2(this.canvas.width, this.canvas.height);

        this.colors = data.colors;
        this.names = data.names;
        this.lines = {};

        // Animate functions
        this.animateCount = 0;
        this.yAnimation = null;
        this.t = 0;

        data.columns.forEach(function(line) {
            const name = line[0];
            const values = line.slice(1);
            if (data.types[name] === 'line') {
                this.lines[name] = values;
            }
            else if (data.types[name] === 'x') {
                this.x0 = values[0];
                this.x = values.map(v => v - this.x0);
                this.xFirst = 0;
                this.xLast = this.x[this.x.length - 1];
                this.xSize = this.xLast - this.xFirst;
            }
        }, this);
        
        this.setXRange(this.x[0], this.x[this.x.length - 1]);

        this.vRules = {
            in: [],
            out: [],
            done: this.getVSteps(0, this.x.length - 1)
        }

        this.update = this.update.bind(this);
        // sourceY, anim: in | out | null
        this.rulers = {
            in: [],
            out: [],
            done: []
        };

        this.update();
    }

    createCanvas(w, h, dpr) {
        const canvas = document.createElement('canvas');
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style = `width: ${w}px; height: ${h}px`;
        return canvas;
    }

    setPctRange(p0, p1) {
        const x0 = this.xFirst + this.xSize * (p0/100);
        const x1 = this.xFirst + this.xSize * (p1/100);
        this.setXRange(x0, x1);
    }

    setXRange(x0, x1) {
        // X range
        this.prevX0 = this.x0;
        this.prevX1 = this.x1;
        this.x0 = x0;
        this.x1 = x1;
    }

//     fps() {
//         if (!this.fps)  {
//             this.fps = 1;
//             this.lastCall = Date.now();
//         }
//         if (Date.now() - this.lastCall > 1000) {
//             if (this.fps <= 50) {
//                 console.log(`RPS is too low: ${this.fps}`);
//             }
//             this.fps = 0;
//             this.lastCall = Date.now();
//         }
//         this.rps++;
//     }

    linesChanged() {
        const before = Object.entries(this.prevLinesEnabled).map(entry => entry[1]).join(',');
        const after = Object.entries(this.linesEnabled).map(entry => entry[1]).join(',');
        return before !== after;
    }

    getVSteps(i0, i1, inv) {
        return inv ? steps(i1, i0, -1) : steps(i0, i1);
    }

    updateVRules(i0, i1) {
        const steps = this.getVSteps(i0, i1, this.prevX0 !== this.x0);
//         console.log(this.vRules.done.join(','));
//         console.log(steps.join(','));
        this.vRules.done = steps;
    }

    update() {
        if (this.prevX0 !== this.x0 || this.prevX1 !== this.x1 || this.linesChanged()) {
            const x0 = this.x0;
            const x1 = this.x1;
            // Determine index range
            const i0 = this.x.findIndex(v => v >= x0) || 0;
            const i1 = this.x.findIndex(v => v >= x1) || this.x.length - 1;

            this.i0 = i0 === -1 ? 0 : i0;
            this.i1 = i1 === -1 ? this.x.length - 1 : i1;

            if (this.prevX0 !== this.x0 || this.prevX1 !== this.x1) {
                this.updateVRules(this.i0, this.i1);
            }


            let yMax = 0;
            Object.entries(this.lines)
                .filter(function([name]) { return this.linesEnabled[name] }, this)
                .forEach(function([name, values]) {
                const lineMax = values.slice(this.i0, this.i1 + 1).sort(desc)[0];
                yMax = yMax > lineMax ? yMax : lineMax;
            }, this);
            this.prevYMax = this.yMax || 0;
            this.yMax = yMax;

            this.sourceOffset = v2(this.x0, 0);
            this.sourceArea = v2(this.x1 - this.x0, this.sourceArea ? this.sourceArea.y : this.yMax);
            this.factor = map(this.sourceArea, this.plotArea);

            // run animation
            if (this.yMax !== this.prevYMax) {
                this.yAnimation = this.animateMaxY(this.yMax);
                this.updateRulers(this.yMax);
            }
            this.prevX0 = this.x0;
            this.prevX1 = this.x1;
            this.prevLinesEnabled = this.linesEnabled;
        }

        if (this.yAnimation) {
            let newY = this.sourceArea.y;
            
            const animResult = this.yAnimation(Date.now());
            if (!animResult) {
                this.t = 0;
                this.yAnimation = null;
                this.rulers.done = this.rulers.in;
                this.rulers.out = [];
                this.rulers.in = [];
            } else {
                this.t = animResult[0];
                newY = animResult[1].y;
            }
            this.sourceArea.y = newY;
            this.factor = map(this.sourceArea, this.plotArea);
        }

        if (this.vRulesAnimation) {
            const vResult = this.vRulesAnimation(Date.now());
            if (!vResult) {
                this.vt = 0;
                this.vRulesAnimation = null;
                this.vRules.done = this.vRules.in;
                this.vRules.out = [];
                this.vRules.in = [];
            } else {
                this.vt = vResult[0];
            }
        }

        this.render();
        requestAnimFrame(this.update);
    }

    animateMaxY(y) {
        return animate(
            this.sourceArea,
            v2(this.sourceArea.x, y),
            0.60,
            easeInOutQuart,
            Date.now()
        );
    }

    render() {
        this.context2d.clearRect(0, 0, this.plotArea.x, this.plotArea.y);
        if (this.hasRulers) {
            this.renderRulers();
            this.renderVRulers();
        }
        this.renderLines();
    }

    renderLines() {
        Object.keys(this.lines)
            .filter(function(name) { return this.linesEnabled[name] }, this)
            .forEach(this.renderLine, this);
    }

    renderLine(name) {
        this.context2d.beginPath();
        this.context2d.strokeStyle = this.colors[name];
        this.context2d.lineWidth = 2.5 * this.dpr;
        
        // cords
        const xs = this.x.slice(this.i0, this.i1 + 1);
        const ys = this.lines[name].slice(this.i0, this.i1 +1);

        // First point
        if (this.i0 > 0) {
            xs.unshift(this.x0);
            ys.unshift(
                linePoint(
                    v2(this.x[this.i0-1], this.lines[name][this.i0-1]), 
                    v2(this.x[this.i0], this.lines[name][this.i0]), 
                    this.x0)
                .y);
        }

        // Last point
        if (this.i1 < this.lines[name].length - 2) {
            xs.push(this.x1);
            ys.push(
                linePoint(
                    v2(this.x[this.i1], this.lines[name][this.i1]),
                    v2(this.x[this.i1+1], this.lines[name][this.i1+1]),
                    this.x1
                ).y);
        }

        for (let i = 0; i < xs.length; i++ ) {
            const plotPoint = invertY(
                scale(
                    sub(
                        v2(xs[i], ys[i]), 
                        this.sourceOffset
                    ),
                    this.factor
                ), this.plotArea);
            if (i === 0) {
                this.context2d.moveTo(plotPoint.x,plotPoint.y);
            } else {
                this.context2d.lineTo(plotPoint.x,plotPoint.y);
            }
        }
        this.context2d.stroke();
    }

    updateRulers(yMax) {
        this.rulers.out = this.rulers.done;
        this.rulers.done = [];
        this.rulers.in = [];
        
        const step = yMax / 6;
        for (let i = 0; i < 6; i++ ) {
            this.rulers.in[i] = {
                y: step * i
            };
        }
    }

    renderVRulers() {
        this.vRules.in.forEach(r => this.renderVRuler(r, linear(this.vt)));
        this.vRules.out.forEach(r => this.renderVRuler(r, linear(1 - this.vt)));
        this.vRules.done.forEach(r => this.renderVRuler(r, 1));
    }

    renderVRuler(i, alpha) {
        const x = this.x[i];
        const v = scale(sub(v2(x, 0), this.sourceOffset), this.factor);

        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context2d.fillText(String(Math.ceil(i)), v.x, this.plotArea.y - 20);

    }

    renderRulers() {
        this.rulers.in.forEach(r => this.renderRuler(r.y, easeInQuad(this.t)));
        this.rulers.out.forEach(r => this.renderRuler(r.y, easeInQuad(1 - this.t)));
        this.rulers.done.forEach(r => this.renderRuler(r.y, 1));
    }

    renderRuler(y, alpha) {
        this.context2d.beginPath();
        this.context2d.strokeStyle = `rgba(224, 224, 224, ${alpha})`;
        this.context2d.lineWidth = 1 * this.dpr;
        const rv = invertY(
            scale(v2(0, y), this.factor
            ), this.plotArea)
        
        this.context2d.moveTo(20, rv.y) ;
        this.context2d.lineTo(this.plotArea.x, rv.y);
        this.context2d.stroke();
        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context2d.fillText(String(Math.ceil(y)), 30, rv.y - 18);
    }

    setLineEnabled(name, isEnabled) {
        this.prevLinesEnabled = this.linesEnabled;
        this.linesEnabled = Object.assign({}, this.linesEnabled, {
            [name]: isEnabled
        });
    }
}

const main = new Chart(
    600,
    400,
    window.data[0],
    true
);
const ruler = new Chart(
    600,
    50,
    window.data[0]
);
// Slider component
class RangeSlider {
    constructor(onRangeChanged) {
        this.onRangeChanged = onRangeChanged || function(){};
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="range-slider" id="range-slider">
                <div class="left-area">
                    <div class="handle"></div>
                </div>
                <div class="main-area"></div>
                <div class="right-area">
                    <div class="handle"></div>
                </div>
            </div>
        `;
        this.element = wrapper.children[0];
    }

    mountTo(parent) {
        parent.appendChild(this.element);
        this.setEvents();
    }

    setEvents() {
        const rect = this.element.getBoundingClientRect();
        const left = this.element.querySelectorAll('.left-area')[0];
        const leftHanle = this.element.querySelectorAll('.left-area .handle')[0];
        const right = this.element.querySelectorAll('.right-area')[0];
        const rightHandle = this.element.querySelectorAll('.right-area .handle')[0]
        const main = this.element.querySelectorAll('.main-area')[0];

        const self = this;
        setLeftHandle(0.0);
        setRightHandle(0.9);

        // Dragging main area
        document.addEventListener('mousedown', function(event) {
            const leftRect = leftHanle.getBoundingClientRect();
            const rightRect = rightHandle.getBoundingClientRect();
            const mainRect = main.getBoundingClientRect();

            if (inRect(event.clientX, event.clientY, mainRect)) {
                self.mainDown = true;
                self.mainClickX = mainRect.left - event.clientX;
            }
            if (inRect(event.clientX, event.clientY, leftRect)) {
                self.leftDown = true;
                self.leftOffset = leftRect.width - (event.clientX - leftRect.left);
            }
            if (inRect(event.clientX, event.clientY, rightRect)) {
                self.rightDown = true;
                self.rightOffset = rightRect.width - (rightRect.right - event.clientX);
            }
        });

        document.addEventListener('mouseup', function() {
            self.mainDown = false;
            self.leftDown = false;
            self.rightDown = false;
        });

        document.addEventListener('mousemove', function(event) {
            if (!self.leftDown && !self.rightDown && !self.mainDown) {
                return;
            }
            if (self.mainDown) {
            }
            if (self.leftDown) {
                setLeftHandle((event.clientX - rect.left) / rect.width);
            }
            if (self.rightDown) {
                setRightHandle((rect.right - event.clientX) / rect.width);
            }
        });

        function setLeftHandle(pct) {
            left.style.flexBasis = `${(pct * 100).toFixed(1)}%`;
            self.handleRangeChanged(left.style.flexBasis, right.style.flexBasis);
        }

        function setRightHandle(pct) {
            right.style.flexBasis = `${(pct * 100).toFixed(1)}%`;
            self.handleRangeChanged(left.style.flexBasis, right.style.flexBasis);
        }

        function setMainArea(event) {

        }
    }

    handleRangeChanged(left, right) {
        this.onRangeChanged(
            Number(left.slice(0, -1)), 
            100 - Number(right.slice(0, -1))
        );
    }
}

class Buttons {
    constructor(names, onChange) {
        this.names = names;
        this.onChange = onChange || function(){};
        this.element = document.createElement('div');
        const buttons = names.map(item => `<label><input type="checkbox" name="${item.id}" checked="true">${item.name}</label>`);
        this.element.innerHTML = buttons.join('');
    }

    mountTo(parent) {
        parent.appendChild(this.element);
        this.names.forEach(function(item) {
            this.element.querySelector(`input[name=${item.id}]`).addEventListener('change', this.handleChange.bind(this));
        }, this);
    }

    handleChange(event) {
        this.onChange(event.target.name, event.target.checked);
    }
}


const container = document.getElementById('chart');
container.appendChild(main.canvas);
container.appendChild(ruler.canvas);
const slider = new RangeSlider(function(min, max) {
//     console.log(min, max);
    main.setPctRange(min, max);
});
slider.mountTo(container);
const buttons = new Buttons(
    Object.entries(window.data[0].names).map(function(e){ return {id: e[0], name: e[1]}}),
    function(name, value) {
        main.setLineEnabled(name, value);
        ruler.setLineEnabled(name, value);
    }
    );
buttons.mountTo(container);

// Animation and easing functions
function animate(v2from, v2to, durationSec, easingFn, timeStarted) {
    return function(now) {
        const t = (now - timeStarted) / (durationSec * 1000);
        // Finished?
        if (t > 1) {
            return null;
        } else {
            const et = easingFn(t);
            const delta = sub(v2to, v2from);
            return [t, add(v2from, v2(delta.x * et, delta.y * et))];
        }
    }
}

// no easing, no acceleration
function linear(t) { return t }
// accelerating from zero velocity
function easeInQuad(t) { return t*t }
// decelerating to zero velocity
function easeOutQuad(t) { return t*(2-t) }
// acceleration until halfway, then deceleration
function easeInOutQuad(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t }
// accelerating from zero velocity 
function easeInCubic(t) { return t*t*t }
// decelerating to zero velocity 
function easeOutCubic(t) { return (--t)*t*t+1 }
// acceleration until halfway, then deceleration 
function easeInOutCubic(t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 }
// accelerating from zero velocity 
function easeInQuart(t) { return t*t*t*t }
// decelerating to zero velocity 
function easeOutQuart(t) { return 1-(--t)*t*t*t }
// acceleration until halfway, then deceleration
function easeInOutQuart(t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t }
// accelerating from zero velocity
function easeInQuint(t) { return t*t*t*t*t }
// decelerating to zero velocity
function easeOutQuint(t) { return 1+(--t)*t*t*t*t }
// acceleration until halfway, then deceleration 
function easeInOutQuint(t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }

// Vector operations
function v2(x,y) {
    return {
        x,
        y
    };
}

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

function steps(first, last, step = 1, size = 8) {
    let count = Math.ceil((last - first)/step);
    if ( count < size ) {
        return range(first, step, count);
    } else {
        return steps(first, last, step * 2, size);
    }
}