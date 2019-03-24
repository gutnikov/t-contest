class ChartCanvas {
    constructor({width, height, data, hasRulers, p0, p1, theme}) {
        //
        this.hasRulers = hasRulers;
        this.colors = data.colors;
        this.rgbaColors = {};
        for (let c in data.colors) {
            this.rgbaColors[c] = hexToRgbA(data.colors[c]);
        }
        this.theme = theme;
        this.prevThemeName = this.theme.getName();

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

        this.linesEnabled = Object.keys(data.names)
            .reduce(function(all, key) {
                all[key] = true;
                return all;
            }, {});
        this.linesChanged = false;

        // Canvas
        this.width = width;
        this.canvas = createCanvas(width, height);
        this.tooltipCanvas = createCanvas(width, height);
        this.context2d = this.canvas.getContext('2d');
        this.tooltipContext2d = this.tooltipCanvas.getContext('2d');
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
        if (this.hasRulers) {
            this.setEvents();
            this.noBodyScroll();
        }
        this.update = this.update.bind(this);
        this.render();
        this.update();
    }

    setEvents() {
        const mCords = this.getMouseCords.bind(this);
        const tCords = this.getTouchCords.bind(this);
        this.tooltipCanvas.addEventListener('mousemove', this.touchMove.bind(this, mCords));
        this.tooltipCanvas.addEventListener('mouseout', this.touchEnd.bind(this, mCords));
        this.tooltipCanvas.addEventListener('touchmove', this.touchMove.bind(this, tCords) );
        this.tooltipCanvas.addEventListener('touchend', this.touchEnd.bind(this, tCords));
    }

    touchMove(getCords, e) {
        const cords = getCords(e);
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
    }

    getTouchCords(e) {
        const rect = this.tooltipCanvas.getBoundingClientRect();
        return v2(
            (e.touches[0].clientX - rect.left) * getDpr(),
            (e.touches[0].clientY - rect.top) * getDpr());
    }

    getMouseCords(e) {
        const rect = this.tooltipCanvas.getBoundingClientRect();
        return v2((e.clientX - rect.left) * getDpr(),
            (e.clientY - rect.top) * getDpr());
    }

    touchEnd() {
        this.iHover = null;
    }

    noBodyScroll() {
        let canvas = this.tooltipCanvas;
        document.body.addEventListener("touchstart", function (e) {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, false);
        document.body.addEventListener("touchend", function (e) {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, false);
        document.body.addEventListener("touchmove", function (e) {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, false);
    }

    // setSize(w, h) {
    //     setCanvasSize(this.canvas, w, h);
    //     this.plotArea = v2(
    //         this.canvas.width - this.plotAreaPadding.x * 2,
    //         this.canvas.height - this.plotAreaPadding.y * 2);
    //     this.factor = map(this.sourceArea, this.plotArea);
    // }

    setRange(p0, p1) {
        this.p0 = p0;
        this.p1 = p1;
    }

    setLineEnabled(name, isEnabled) {
        this.prevLinesEnabled = this.linesEnabled;
        this.linesEnabled = Object.assign({}, this.linesEnabled, {
            [name]: isEnabled
        });
        this.timing('line:' + name, timing(600));
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
            const plotPoint = ints(add(invertY(
                scale(
                    sub(
                        v2(xs[i], ys[i]),
                        this.sourceOffset
                    ),
                    this.factor
                ), this.plotArea), this.plotAreaPadding));
            points.push([this.i0 + i, plotPoint]);
        }

        // First point
        if (this.i0 > 0) {
            points.unshift([null,
                ints(add(invertY(
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
                    ), this.plotArea), this.plotAreaPadding))
            ]);
        }
        // Last point
        if (this.i1 < this.lines[name].length - 2) {
            points.push([null,
                ints(add(invertY(
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
                    ), this.plotArea), this.plotAreaPadding))
            ]);
        }
        return points;
    }

    getXI(p) {
        const x = Math.round(this.xFirst + this.xSize * (p));
        const i = this.x.findIndex(v => v >= x);
        return [x, i];
    }

    fps() {
        // if (!this.curFps) {
        //     this.curFps = 1;
        //     this.lastCall = Date.now();
        // }
        // if (Date.now() - this.lastCall > 1000) {
        //     document.getElementById('fps').innerHTML = 'FPS = ' + this.curFps;
        //     this.curFps = 0;
        //     this.lastCall = Date.now();
        // }
        // this.curFps++;
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

    getActiveLines() {
        const result = {};
        for (let k in this.linesEnabled) {
            if (this.linesEnabled[k]) {
                result[k] = true;
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
        if (this.updateTimings() || this.inputChanged() || this.linesChanged || this.theme.getName() !== this.prevThemeName) {
            this.setFromPct();
            this.setPlotPoints();
            // run animation
            if (this.prevX0 !== this.x0 || this.prevX1 !== this.x1) {
                this.handleXRangeChanged(this.i0, this.i1);
            }
            if (this.sourceHeight !== this.prevSourceHeight) {
                this.handleYRangeChanged();
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
            this.prevThemeName = this.theme.getName();
            this.render();
        }
        this.renderTooltip();
        requestAnimFrame(this.update);
    }

    handleXRangeChanged() {
        const wt = this.timing('changeWidth');
        if (!wt || wt() === 1) {
            this.timing('changeWidth', timing(500, this.handleWidthTimingDone.bind(this), 200));
        }
        let newSteps = [];
        let from = this.i0 % 2 ? this.i0 + 1 : this.i0;
        let to = this.i1 %2 ? this.i1 + 1 : this.i1;
        for (let i = 0; i < this.stepsScale.length; i++) {
            let steps = this.stepsScale[i].filter(v => v >= from && v <= to);
            if (steps.length > this.xRangeSteps + 1) {
                break;
            }
            newSteps = steps;
        }
        if (newSteps.length) {
            this.xRulersOut = this.xRulersOut.concat(this.xRulers.filter(v => newSteps.indexOf(v) === -1));
            this.xRulersIn = newSteps.filter(v => this.xRulers.indexOf(v) === -1);
            this.xRulers = this.xRulers.filter(v => newSteps.indexOf(v) !== -1);
        }
    }

    handleWidthTimingDone() {
        this.xRulers = this.xRulers.concat(this.xRulersIn);
        this.xRulersOut = [];
        this.xRulersIn = [];
    }

    handleYRangeChanged() {
        const t = this.timing('changeHeight', timing(600, null, 100));
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

    render() {
        this.context2d.clearRect(
            0, 0, this.plotArea.x + this.plotAreaPadding.x * 2,
            this.plotArea.y + this.plotAreaPadding.y * 2);
        if (this.hasRulers) {
            this.renderYRulers();
            this.renderXRulers();
        }
        this.renderLines();
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
        this.context2d.fillStyle = withAlpha(this.theme.get('rulerName'), alpha);
        this.context2d.fillText(label, v.x, this.plotArea.y + this.plotAreaPadding.y + 40);
    }

    renderYRulers() {
        const t = this.timing('changeHeight');
        const tv = t ? t() : 1;
        this.yRulers.forEach(r => this.renderYRuler(r, easeInQuad(tv)));
        this.prevYRulers.forEach(r => this.renderYRuler(r, easeInQuad(1 - tv)));
    }

    renderYRuler(y, alpha) {
        this.context2d.beginPath();
        this.context2d.strokeStyle = withAlpha(this.theme.get('border'), alpha);
        this.context2d.lineWidth = 1 * getDpr();
        const rv = add(invertY(
            scale(v2(0, y), this.factor
            ), this.plotArea), this.plotAreaPadding);
        this.context2d.moveTo(20, rv.y);
        this.context2d.lineTo(this.plotArea.x, rv.y);
        this.context2d.stroke();
        this.context2d.font = "28px Arial";
        this.context2d.fillStyle = withAlpha(this.theme.get('rulerName'), alpha);
        this.context2d.fillText(String(Math.ceil(y)), 30, rv.y - 18);
    }

    renderTooltip() {
        this.tooltipContext2d.clearRect(
            0, 0, this.plotArea.x + this.plotAreaPadding.x * 2,
            this.plotArea.y + this.plotAreaPadding.y * 2);

        if (!Number.isFinite(this.iHover)) {
            return;
        }
        const activeLines = this.getActiveLines();
        const lineNames = Object.keys(activeLines);
        if (!lineNames.length) {
            return;
        }
        const self = this;
        const anyLine = lineNames[0];
        const points = lineNames.reduce(function(all, name) {
            const pp = self.plotPoints[name][self.iHover];
            all[name] = {
                p: pp[1],
                value: self.lines[name][pp[0]],
                date: self.xDates[pp[0]]
            };
            return all;
        }, {});
        const anyPoint = points[anyLine];

        const ctx = this.tooltipContext2d;
        // Line
        ctx.beginPath();
        ctx.strokeStyle = withAlpha(this.theme.get('border'), 1);
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
            ctx.fillStyle = withAlpha(this.theme.get('bg'), this.linesEnabled[name] ? 1 : 1 - alpha);
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
        const rectWidth = 130 * getDpr();
        const rectHeight = 50 * getDpr() * (Math.ceil(lineNames.length / 1) + 1);
        const rectX = points[anyLine].p.x  > (this.width * getDpr())/2 ?
            points[anyLine].p.x - rectWidth - 30 * getDpr() :
            points[anyLine].p.x + 30 * getDpr();
        const rectY = 10;
        const r = 40;
        // const rsq = Math.sqrt(r*r);
        ctx.strokeStyle = withAlpha(this.theme.get('border'), 1);
        ctx.lineWidth = 1 * getDpr();
        ctx.fillStyle = withAlpha(this.theme.get('bg'));

        ctx.beginPath();
        // left top
        ctx.moveTo(rectX + r, rectY);
        // right top
        ctx.lineTo(rectX + rectWidth - r, rectY);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + r);
        // right bottom
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - r);
        ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - r, rectY + rectHeight);
        // left bottom
        ctx.lineTo(rectX + r, rectY + rectHeight);
        ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - r);
        // left top
        ctx.lineTo(rectX, rectY + r);
        ctx.quadraticCurveTo(rectX, rectY, rectX + r, rectY);
        ctx.fill();
        ctx.stroke();

        // Header
        ctx.font = "28px Arial";
        ctx.fillStyle = withAlpha(this.theme.get('main'), 1);
        ctx.fillText(anyPoint.date, rectX + rectWidth / 2 - 50, rectY + 50);

        Object.keys(points).forEach(function(name, i) {
            const point = points[name];
            ctx.fillStyle = withAlpha(
                this.rgbaColors[name], 1
            );
            ctx.font = "36px Arial";
            const itemY = rectY + 100 + Math.floor(i / 1) * 90;
            const itemX = rectX + 50 + (i % 1) * 150;
            ctx.fillText(point.value, itemX, itemY);
            ctx.font = "28px Arial";
            ctx.fillText(this.names[name], itemX, itemY + 34);
        }, this);
    }
}
