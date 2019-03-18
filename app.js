// TODO:
// 1. Animation of lines
// 2. Turning on/off lines
// 3. Ask somebody to do buttons
// 4. Rullers
// 5. Main area dragging
// 6. WebGL implementation
// 7. SVG implementation

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

class Chart {
    constructor(width, height, data) {
        this.dpr = window.devicePixelRatio || 1;
        this.dprFactor = v2(this.dpr, this.dpr);
        this.canvas = this.createCanvas(width, height, this.dpr);
        this.context2d = this.canvas.getContext('2d');

        this.plotArea = v2(this.canvas.width, this.canvas.height);

        this.colors = data.colors;
        this.names = data.names;
        this.lines = {};

        // Animate functions
        this.animateCount = 0;
        this.yAnimation = null;

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
        this.render = this.render.bind(this);
        this.render();
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
        this.x0 = x0;
        this.x1 = x1;
        // Determine index range
        const i0 = this.x.findIndex(v => v >= x0) || 0;
        const i1 = this.x.findIndex(v => v >= x1) || this.x.length - 1;

        this.i0 = i0 === -1 ? 0 : i0;
        this.i1 = i1 === -1 ? this.x.length - 1 : i1;

        let yMax = 0;
        Object.entries(this.lines).forEach(function([name, values]) {
            const lineMax = values.slice(this.i0, this.i1).sort(desc)[0];
            yMax = yMax > lineMax ? yMax : lineMax;
        }, this);

        this.sourceOffset = v2(this.x0, 0);
        this.sourceArea = v2(this.x1 - this.x0, this.sourceArea ? this.sourceArea.y : 350);
        this.factor = map(this.sourceArea, this.plotArea);
    }

    nextFrame() {
        this.update();
        requestAnimFrame(this.render);
    }

    fps() {
        if (!this.fps)  {
            this.fps = 1;
            this.lastCall = Date.now();
        }
        if (Date.now() - this.lastCall > 1000) {
            if (this.fps <= 50) {
                console.log(`RPS is too low: ${this.fps}`);
            }
            this.fps = 0;
            this.lastCall = Date.now();
        }
        this.rps++;
    }

    update() {
        if (!this.yAnimation) {
            this.yAnimation = this.animateMaxY(320);
        }
        const newArea = this.yAnimation();
        // Finished?
        if (newArea === null) {
            this.yAnimation = this.animateMaxY(this.animateCount % 2 ? 650 : 320);
            this.animateCount++;
        } else {
            this.sourceArea.y = newArea.y;
            this.factor = map(this.sourceArea, this.plotArea);
        }
    }

    animateMaxY(y) {
        return animate(
            this.sourceArea,
            v2(this.sourceArea.x, y),
            1,
            easeOutQuint
        );
    }

    render() {
        this.context2d.clearRect(0, 0, this.plotArea.x, this.plotArea.y);
        Object.keys(this.lines).forEach(this.renderLine, this);
        this.nextFrame();
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
//         for (let i = this.i0; i <= this.i1; i++ ) {
//             const plotPoint = invertY(
//                 scale(
//                     sub(
//                         v2(this.x[i], ys[i]), 
//                         this.sourceOffset
//                     ),
//                     this.factor
//                 ), this.plotArea);
//             if (i === this.i0) {
//                 this.context2d.moveTo(plotPoint.x,plotPoint.y);
//             } else {
//                 this.context2d.lineTo(plotPoint.x,plotPoint.y);
//             }
//         }
        this.context2d.stroke();
    }
}

const main = new Chart(
    600,
    400,
    window.data[0]
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
        setLeftHandle(0.3);
        setRightHandle(0.3);

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

function inRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

const container = document.getElementById('chart');
container.appendChild(main.canvas);
container.appendChild(ruler.canvas);
const slider = new RangeSlider(function(min, max) {
//     console.log(min, max);
    main.setPctRange(min, max);
});
slider.mountTo(container);

// Animation and easing functions
function animate(v2from, v2to, durationSec, easingFn) {
    const timeStarted = Date.now();
    return function() {
        const t = (Date.now() - timeStarted) / (durationSec * 1000);
        // Finished?
        if (t > 1) {
            return null;
        } else {
            const et = easingFn(t);
            const delta = sub(v2to, v2from);
            return add(v2from, v2(delta.x * et, delta.y * et));
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

// Line point
function linePoint(p1, p2, x) {
    const y = ((p1.x * p2.y - p2.x * p1.y) + (p1.y - p2.y)*x)/(-(p2.x - p1.x));
    return v2(x,y);
}

