
// Night mode for a page
// Use same colors as on demo (themes)
// fix hover
// fix buttons on old safari
// normal dialog on hover
// put date on the middle of the point
// put hover on separate canvas
// put hrules on separate canvas?
// drobniye koordinaty?
// less lines for phones
// put left to 0 right to 100% - rulers disapear
// Blinking numbers
// rewrite no classes
// h animations sometimes looks strange
// Canvas resize breaks ruler

class ChartCanvas {
    constructor(width, height, data, hasRulers, p0, p1) {
        //
        this.hasRulers = hasRulers;
        this.colors = data.colors;
        this.rgbaColors = {};
        for (let c in data.colors) {
            this.rgbaColors[c] = hexToRgbA(data.colors[c]);
        }

        this.names = data.names;
        this.lines = {};
        data.columns.forEach(function(line) {
            const name = line[0];
            const values = line.slice(1);
            if (data.types[name] === 'line') {
                this.lines[name] = values;
            } else if (data.types[name] === 'x') {
                this.xOffset = values[0];
                this.xDates = values.map(v => formatDate(v));
                this.x = values.map(v => v - this.xOffset);
                this.xFirst = 0;
                this.xLast = this.x[this.x.length - 1];
                this.xSize = this.xLast - this.xFirst;
            }
        }, this);

        this.linesEnabled = this.prevLinesEnabled = Object.keys(data.names)
            .reduce(function(all, key) {
                all[key] = true;
                return all;
            }, {});
        this.linesChanged = false;

        // Canvas
        this.canvas = createCanvas(width, height);
        this.context2d = this.canvas.getContext('2d');
        this.plotAreaPadding = this.hasRulers ? v2(0, 50 * getDpr()) : v2(0, 0);
        this.plotArea = v2(
            this.canvas.width - this.plotAreaPadding.x * 2,
            this.canvas.height - this.plotAreaPadding.y * 2);

        this.yRangeSteps = 5;
        this.xRangeSteps = 6;
        this.stepsScale = stepsScale(0, this.x.length - 1, this.xRangeSteps);

        this.p0 = p0;
        this.p1 = p1;
        this.iHover = null;

        this.setFromPct(p0, p1);
        this.setFromPct(p0, p1);
        this.setPlotPoints();

        this.prevYRulers = [];
        this.yRulers = splitRange(0, this.sourceHeight, this.yRangeSteps);

        this.xRulers = rangeSteps(this.i0, this.i1, 1, this.xRangeSteps);
        this.xRulersIn = [];
        this.xRulersOut = [];

        this.timings = {};
        this.animations = [];

        this.lastUpdate = Date.now();
        this.setEvents();
        this.update = this.update.bind(this);
        this.render();
        this.update();
    }

    setEvents() {
        this.canvas.addEventListener('mousemove', function(e) {
            const rect = this.canvas.getBoundingClientRect();
            const cords = v2((e.clientX - rect.left) * getDpr(),
                (e.clientY - rect.top) * getDpr());
            const anyLineName = Object.keys(this.lines)[0];
            const anyLine = this.plotPoints[anyLineName];
            const delta = (anyLine[2][1].x - anyLine[1][1].x) / 2;
            const hInd = anyLine.findIndex(function(ip) {
                if (ip[0] === null) {
                    return false;
                }
                return ip[1].x >= cords.x - delta && ip[1].x <= cords.x + delta;
            });
            this.iHover = hInd !== -1 ? hInd : null;
        }.bind(this));

        this.canvas.addEventListener('mouseout', function(e) {
            this.iHover = null;
        }.bind(this));
    }

    setSize(w, h) {
        setCanvasSize(this.canvas, w, h);
        this.plotArea = v2(
            this.canvas.width - this.plotAreaPadding.x * 2,
            this.canvas.height - this.plotAreaPadding.y * 2);
        this.factor = map(this.sourceArea, this.plotArea);
    }

    setRange(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }

    setLineEnabled(name, isEnabled) {
        this.prevLinesEnabled = this.linesEnabled;
        this.linesEnabled = Object.assign({}, this.linesEnabled, {
            [name]: isEnabled
        });
        this.linesChanged = true;
    }

    setFromPct() {
        this.prevP0 = this.p0;
        this.prevP1 = this.p1;
        this.prevX0 = this.x0;
        this.prevX1 = this.x1;
        this.prevI0 = this.i0;
        this.prevI1 = this.i1;
        this.prevSourceHeight = this.sourceHeight;

        const _0 = this.getXI(this.p0);
        this.x0 = _0[0];
        this.i0 = _0[1];

        const _1 = this.getXI(this.p1);
        this.x1 = _1[0];
        this.i1 = _1[1];

        this.sourceHeight = this.getMaxHeight(this.prevSourceHeight);
        this.sourceOffset = v2(this.x0, 0);
        this.sourceArea = v2(this.x1 - this.x0, this.sourceArea ? this.sourceArea.y : this.sourceHeight);
        this.factor = map(this.sourceArea, this.plotArea);
    }

    setPlotPoints() {
        const self = this;
        this.plotPoints = Object.keys(this.lines).reduce(function(all, name) {
            all[name] = self.setLinePlotPoints(name);
            return all;
        }, {});
    }

    setLinePlotPoints(name) {
        const points = [];
        const xs = this.x.slice(this.i0, this.i1 + 1);
        const ys = this.lines[name].slice(this.i0, this.i1 + 1);

        for (let i = 0; i < xs.length; i++) {
            const plotPoint = add(invertY(
                scale(
                    sub(
                        v2(xs[i], ys[i]),
                        this.sourceOffset
                    ),
                    this.factor
                ), this.plotArea), this.plotAreaPadding);
            points.push([this.i0 + i, plotPoint]);
        }

        // First point
        if (this.i0 > 0) {
            points.unshift([null,
                add(invertY(
                    scale(
                        sub(
                            v2(this.x0, linePoint(
                                v2(this.x[this.i0 - 1], this.lines[name][this.i0 - 1]),
                                v2(this.x[this.i0], this.lines[name][this.i0]),
                                this.x0)
                                .y),
                            this.sourceOffset
                        ),
                        this.factor
                    ), this.plotArea), this.plotAreaPadding)
            ]);
        }
        // Last point
        if (this.i1 < this.lines[name].length - 2) {
            points.push([null,
                add(invertY(
                    scale(
                        sub(
                            v2(this.x1, linePoint(
                                v2(this.x[this.i1], this.lines[name][this.i1]),
                                v2(this.x[this.i1 + 1], this.lines[name][this.i1 + 1]),
                                this.x1
                            ).y),
                            this.sourceOffset
                        ),
                        this.factor
                    ), this.plotArea), this.plotAreaPadding)
            ]);
        }
        return points;
    }

    getXI(p) {
        const x = this.xFirst + this.xSize * (p);
        const i = this.x.findIndex(v => v >= x);
        return [x, i];
    }

    fps() {
        if (!this.curFps) {
            this.curFps = 1;
            this.lastCall = Date.now();
        }
        if (Date.now() - this.lastCall > 1000) {
            document.getElementById('fps').innerHTML = 'FPS = ' + this.curFps;
            this.curFps = 0;
            this.lastCall = Date.now();
        }
        this.curFps++;
    }

    timing(name, value) {
        if (value) {
            this.timings[name] = value;
        }
        return this.timings[name];
    }

    animation(name, fn) {
        this.animations[name] = fn;
    }

    updateTimings() {
        const prevUpdate = this.lastUpdate;
        this.lastUpdate = Date.now();
        const delta = this.lastUpdate - prevUpdate;
        let changed = false;
        for (let k in this.timings) {
            const prev = this.timings[k]();
            const next = this.timings[k](delta);
            if (prev !== next) {
                changed = true;
            }
        }
        for (let k in this.animations) {
            const anim = this.animations[k];
            if (!anim) {
                continue;
            }
            const v = anim.call(this);
            if (v === true) {
                this.animations[k] = null;
            }
        }
        return changed;
    }

    inputChanged() {
        return this.prevP0 !== this.p0 || this.prevP1 !== this.p1;
    }

    getLinesChanged() {
        const result = {};
        for (let k in this.linesEnabled) {
            if (this.linesEnabled[k] !== this.prevLinesEnabled[k]) {
                result[k] = this.linesEnabled[k] ? 'on' : 'off';
            }
        }
        return result;
    }

    getMaxHeight(defaultValue) {
        const arrays = Object.keys(this.lines)
            .filter(function(key) {
                return this.linesEnabled[key]
            }, this)
            .map(function(key) {
                return this.lines[key]
            }, this);
        return arrays.length ? splitRange(0, arraysMaxValue(arrays, this.i0, this.i1), this.yRangeSteps)[this.yRangeSteps] : defaultValue;
    }

    update() {
        // Update animation timings
        if (this.updateTimings() || this.inputChanged() || this.linesChanged) {
            this.setFromPct();
            this.setPlotPoints();
            // run animation
            if (this.prevX0 !== this.x0 || this.prevX1 !== this.x1) {
                this.handleXRangeChanged(this.i0, this.i1);
            }
            if (this.sourceHeight !== this.prevSourceHeight) {
                this.handleYRangeChanged();
            }
            const linesChanged = this.getLinesChanged();
            if (Object.keys(linesChanged).length) {
                this.handleLinesChanged(linesChanged);
            }
            this.prevP0 = this.p0;
            this.prevP1 = this.p1;
            this.prevX0 = this.x0;
            this.prevX1 = this.x1;
            this.prevLinesEnabled = this.linesEnabled;
            this.prevSourceHeight = this.sourceHeight;
            this.prevI0 = this.i0;
            this.prevI1 = this.i1;
            this.linesChanged = false;
            this.render();
        }
        requestAnimFrame(this.update);
    }

    handleXRangeChanged() {
        const wt = this.timing('changeWidth');
        if (!wt || wt() === 1) {
            this.timing('changeWidth', timing(500, this.handleWidthTimingDone.bind(this)));
        }
        let newSteps = [];
        for (let i = 0; i < this.stepsScale.length; i++) {
            let steps = this.stepsScale[i].filter(v => v >= this.i0 && v <= this.i1);
            if (steps.length > this.xRangeSteps) {
                break;
            }
            newSteps = steps;
        }
        this.xRulersOut = this.xRulersOut.concat(this.xRulers.filter(v => newSteps.indexOf(v) === -1));
        this.xRulersIn = newSteps.filter(v => this.xRulers.indexOf(v) === -1);
        this.xRulers = this.xRulers.filter(v => newSteps.indexOf(v) !== -1);
    }

    handleWidthTimingDone() {
        this.xRulers = this.xRulers.concat(this.xRulersIn);
        this.xRulersOut = [];
        this.xRulersIn = [];
    }

    handleYRangeChanged() {
        const t = this.timing('changeHeight', timing(600));
        const current = this.sourceArea.y;
        this.prevYRulers = this.yRulers;
        this.yRulers = splitRange(0, this.sourceHeight, this.yRangeSteps);
        this.animation('lines', function() {
            const tv = t();
            this.sourceArea.y = animated(current, this.sourceHeight, easeInOutQuart(tv));
            this.factor = map(this.sourceArea, this.plotArea);
            return tv === 1;
        });
    }

    handleLinesChanged(changes) {
        Object.keys(changes).forEach(function(name) {
            this.timing('line:' + name, timing(600));
        }, this);
    }

    render() {
        this.context2d.clearRect(
            0, 0, this.plotArea.x + this.plotAreaPadding.x * 2,
            this.plotArea.y + this.plotAreaPadding.y * 2);
        if (this.hasRulers) {
            this.renderYRulers();
            this.renderXRulers();
        }
        this.renderLines();
        this.renderTooltip(10);
        this.fps();
    }

    renderLines() {
        Object.keys(this.lines)
            .forEach(function(name) {
                this.renderLine(name);
            }, this);
    }

    renderLine(name) {
        const points = this.plotPoints[name];
        const t = this.timing('line:' + name);
        let alpha = t ? t() : 1;
        this.context2d.beginPath();
        this.context2d.strokeStyle = withAlpha(
            this.rgbaColors[name],
            easeInOutQuart(this.linesEnabled[name] ? alpha : 1 - alpha)
        );
        this.context2d.lineWidth = 2.5 * getDpr();
        for (let i = 0; i < points.length; i++) {
            const p = points[i][1];
            if (i === 0) {
                this.context2d.moveTo(p.x, p.y);
            } else {
                this.context2d.lineTo(p.x, p.y);
            }
        }
        this.context2d.stroke();
    }

    renderXRulers() {
        const t = this.timing('changeWidth');
        const tv = t ? t() : 1;
        this.xRulersIn.forEach(r => this.renderXRuler(r, easeInQuart(tv)));
        this.xRulersOut.forEach(r => this.renderXRuler(r, 1 - easeInQuart(tv)));
        this.xRulers.forEach(r => this.renderXRuler(r, 1));
    }

    renderXRuler(i, alpha) {
        const x = this.x[i];
        const label = this.xDates[i];
        const v = scale(sub(v2(x, 0), this.sourceOffset), this.factor);
        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context2d.fillText(label, v.x, this.plotArea.y + this.plotAreaPadding.y * 2 - 30);
    }

    renderYRulers() {
        const t = this.timing('changeHeight');
        const tv = t ? t() : 1;
        this.yRulers.forEach(r => this.renderYRuler(r, easeInQuad(tv)));
        this.prevYRulers.forEach(r => this.renderYRuler(r, easeInQuad(1 - tv)));
    }

    renderYRuler(y, alpha) {
        this.context2d.beginPath();
        this.context2d.strokeStyle = `rgba(224, 224, 224, ${alpha})`;
        this.context2d.lineWidth = 1 * getDpr();
        const rv = add(invertY(
            scale(v2(0, y), this.factor
            ), this.plotArea), this.plotAreaPadding);
        this.context2d.moveTo(20, rv.y);
        this.context2d.lineTo(this.plotArea.x, rv.y);
        this.context2d.stroke();
        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        this.context2d.fillText(String(Math.ceil(y)), 30, rv.y - 18);
    }

    renderTooltip() {
        if (!Number.isFinite(this.iHover)) {
            return;
        }
        const self = this;
        const anyLine = Object.keys(this.lines)[0];
        const points = Object.keys(this.lines).reduce(function(all, name) {
            const pp = self.plotPoints[name][self.iHover];
            all[name] = {
                p: pp[1],
                value: self.lines[name][pp[0]],
                date: self.xDates[pp[0]]
            };
            return all;
        }, {});
        const anyPoint = points[anyLine];

        const ctx = this.context2d;
        // Line
        ctx.beginPath();
        ctx.strokeStyle = `rgba(224, 224, 224)`;
        ctx.lineWidth = 1 * getDpr();
        ctx.moveTo(anyPoint.p.x, 0 + this.plotAreaPadding.y);
        ctx.lineTo(anyPoint.p.x, this.plotArea.y + this.plotAreaPadding.y);
        ctx.stroke();
        ctx.lineWidth = 2 * getDpr();

        // Circles
        Object.keys(points).forEach(function(name) {
            const p = points[name].p;
            const t = this.timing('line:' + name);
            let alpha = t ? t() : 1;
            ctx.fillStyle = withAlpha('rgba(255,255,255,alpha)', this.linesEnabled[name] ? 1 : 1 - alpha);
            ctx.strokeStyle = withAlpha(
                this.rgbaColors[name],
                easeInOutQuart(this.linesEnabled[name] ? alpha : 1 - alpha)
            );
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 * getDpr(), 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }, this);

        // Tooltip
        const rectWidth = 200 * getDpr();
        const rectHeight = 50 * getDpr() * (Math.ceil(Object.keys(this.lines).length / 2) + 1);
        const rectX = points[anyLine].p.x - rectWidth * (1 / 3);
        const rectY = 10;
        const cornerRadius = 20;
        ctx.strokeStyle = 'rgba(205,205,205)';
        // ctx.lineJoin = "round";
        // ctx.lineWidth = cornerRadius;
        ctx.lineWidth = 1 * getDpr();
        ctx.strokeRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);
        ctx.fillStyle = 'rgba(255,255,255)';
        ctx.fillRect(rectX + (cornerRadius / 2), rectY + (cornerRadius / 2), rectWidth - cornerRadius, rectHeight - cornerRadius);

        // Header
        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = `rgba(0, 0, 0, 1)`;
        this.context2d.fillText(anyPoint.date, rectX + rectWidth / 2 - 50, rectY + 50);

        Object.keys(points).forEach(function(name, i) {
            const point = points[name];
            ctx.fillStyle = withAlpha(
                this.rgbaColors[name], 1
            );
            ctx.font = "36px Arial";
            const itemY = rectY + 100 + Math.floor(i / 2) * 100;
            const itemX = rectX + 50 + (i % 2) * 150;
            ctx.fillText(point.value, itemX, itemY);
            ctx.font = "28px Arial";
            ctx.fillText(this.names[name], itemX, itemY + 34);
        }, this);
    }
}

function chartAt(parent, data) {
    const p0 = 0.3;
    const p1 = 0.6;
    const element = document.createElement('div');
    element.classList.add('chart');
    element.innerHTML = `
            <div class='chart-header'>Followers</div>
            <div class='chart-main-canvas'></div>
            <div class='chart-ruler'></div>
            <div class='chart-buttons'></div>
        `;
    let rect = parent.getBoundingClientRect();
    const width = rect.width;
    const height = width * (2 / 3);
    const mainCanvas = new ChartCanvas(width, height, data, true, p0, p1);
    const rulerCanvas = new ChartCanvas(width, 50, data, false, 0, 1);
    const ruler = new Ruler({
        width: rect.width * getDpr(),
        height: 50 * getDpr(),
        theme: {
            mainColor: 'rgba(0,0,0,0.3)',
            borderColor: 'rgba(0,0,0, 0.5)',
            border: [1 * getDpr(), 6 * getDpr()]
        },
        left: p0,
        right: p1,
        minMainArea: 0.03,
        touchAreaWidth: 30,
        onChange: function(min, max) {
            mainCanvas.setRange(min, max);
        }
    });
    const buttons = new Buttons(data, function(name, value) {
        mainCanvas.setLineEnabled(name, value);
        rulerCanvas.setLineEnabled(name, value);
    });
    ruler.canvas.style.width = rect.width + 'px';
    ruler.canvas.style.height = '50px';

    element.querySelector('.chart-main-canvas').appendChild(mainCanvas.canvas);
    element.querySelector('.chart-ruler').appendChild(rulerCanvas.canvas);
    element.querySelector('.chart-ruler').appendChild(ruler.canvas);
    element.querySelector('.chart-buttons').appendChild(buttons.element);
    // window.addEventListener('resize', function() {
    //     const newRect = parent.getBoundingClientRect();
    //     if (newRect.width !== rect.width) {
    //         mainCanvas.setSize(newRect.width, newRect.width * 2/3);
    //         rulerCanvas.setSize( newRect.width, 50);
    //         ruler.canvas.width = newRect.width;
    //         ruler.canvas.style = `width: ${rect.width}px; height: ${50}px`;
    //     }
    // });
    parent.appendChild(element);
}

const container = document.getElementById('container');

window.data.forEach(function(data) {
    chartAt(container, data);
});
