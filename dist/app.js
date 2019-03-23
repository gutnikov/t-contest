'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Night mode for a page
// Use same colors as on demo (themes)

// fix hover
// less lines for phones
// put left to 0 right to 100% - rulers disapear
// Blinking numbers
// Canvas resize breaks ruler

var ChartCanvas = function () {
    function ChartCanvas(width, height, data, hasRulers, p0, p1) {
        _classCallCheck(this, ChartCanvas);

        //
        this.hasRulers = hasRulers;
        this.colors = data.colors;
        this.rgbaColors = {};
        for (var c in data.colors) {
            this.rgbaColors[c] = hexToRgbA(data.colors[c]);
        }

        this.names = data.names;
        this.lines = {};
        data.columns.forEach(function (line) {
            var _this = this;

            var name = line[0];
            var values = line.slice(1);
            if (data.types[name] === 'line') {
                this.lines[name] = values;
            } else if (data.types[name] === 'x') {
                this.xOffset = values[0];
                this.xDates = values.map(function (v) {
                    return formatDate(v);
                });
                this.x = values.map(function (v) {
                    return v - _this.xOffset;
                });
                this.xFirst = 0;
                this.xLast = this.x[this.x.length - 1];
                this.xSize = this.xLast - this.xFirst;
            }
        }, this);

        this.linesEnabled = this.prevLinesEnabled = Object.keys(data.names).reduce(function (all, key) {
            all[key] = true;
            return all;
        }, {});
        this.linesChanged = false;

        // Canvas
        this.canvas = createCanvas(width, height);
        this.context2d = this.canvas.getContext('2d');
        this.plotAreaPadding = this.hasRulers ? v2(0, 50 * getDpr()) : v2(0, 0);
        this.plotArea = v2(this.canvas.width - this.plotAreaPadding.x * 2, this.canvas.height - this.plotAreaPadding.y * 2);

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

    _createClass(ChartCanvas, [{
        key: 'setEvents',
        value: function setEvents() {
            this.canvas.addEventListener('mousemove', function (e) {
                var rect = this.canvas.getBoundingClientRect();
                var cords = v2((e.clientX - rect.left) * getDpr(), (e.clientY - rect.top) * getDpr());
                var anyLineName = Object.keys(this.lines)[0];
                var anyLine = this.plotPoints[anyLineName];
                var delta = (anyLine[2][1].x - anyLine[1][1].x) / 2;
                var hInd = anyLine.findIndex(function (ip) {
                    if (ip[0] === null) {
                        return false;
                    }
                    return ip[1].x >= cords.x - delta && ip[1].x <= cords.x + delta;
                });
                this.iHover = hInd !== -1 ? hInd : null;
            }.bind(this));

            this.canvas.addEventListener('mouseout', function (e) {
                this.iHover = null;
            }.bind(this));
        }
    }, {
        key: 'setSize',
        value: function setSize(w, h) {
            setCanvasSize(this.canvas, w, h);
            this.plotArea = v2(this.canvas.width - this.plotAreaPadding.x * 2, this.canvas.height - this.plotAreaPadding.y * 2);
            this.factor = map(this.sourceArea, this.plotArea);
        }
    }, {
        key: 'setRange',
        value: function setRange(p0, p1) {
            this.p0 = p0;
            this.p1 = p1;
        }
    }, {
        key: 'setLineEnabled',
        value: function setLineEnabled(name, isEnabled) {
            this.prevLinesEnabled = this.linesEnabled;
            this.linesEnabled = Object.assign({}, this.linesEnabled, _defineProperty({}, name, isEnabled));
            this.linesChanged = true;
        }
    }, {
        key: 'setFromPct',
        value: function setFromPct() {
            this.prevP0 = this.p0;
            this.prevP1 = this.p1;
            this.prevX0 = this.x0;
            this.prevX1 = this.x1;
            this.prevI0 = this.i0;
            this.prevI1 = this.i1;
            this.prevSourceHeight = this.sourceHeight;

            var _0 = this.getXI(this.p0);
            this.x0 = _0[0];
            this.i0 = _0[1];

            var _1 = this.getXI(this.p1);
            this.x1 = _1[0];
            this.i1 = _1[1];

            this.sourceHeight = this.getMaxHeight(this.prevSourceHeight);
            this.sourceOffset = v2(this.x0, 0);
            this.sourceArea = v2(this.x1 - this.x0, this.sourceArea ? this.sourceArea.y : this.sourceHeight);
            this.factor = map(this.sourceArea, this.plotArea);
        }
    }, {
        key: 'setPlotPoints',
        value: function setPlotPoints() {
            var self = this;
            this.plotPoints = Object.keys(this.lines).reduce(function (all, name) {
                all[name] = self.setLinePlotPoints(name);
                return all;
            }, {});
        }
    }, {
        key: 'setLinePlotPoints',
        value: function setLinePlotPoints(name) {
            var points = [];
            var xs = this.x.slice(this.i0, this.i1 + 1);
            var ys = this.lines[name].slice(this.i0, this.i1 + 1);

            for (var i = 0; i < xs.length; i++) {
                var plotPoint = add(invertY(scale(sub(v2(xs[i], ys[i]), this.sourceOffset), this.factor), this.plotArea), this.plotAreaPadding);
                points.push([this.i0 + i, plotPoint]);
            }

            // First point
            if (this.i0 > 0) {
                points.unshift([null, add(invertY(scale(sub(v2(this.x0, linePoint(v2(this.x[this.i0 - 1], this.lines[name][this.i0 - 1]), v2(this.x[this.i0], this.lines[name][this.i0]), this.x0).y), this.sourceOffset), this.factor), this.plotArea), this.plotAreaPadding)]);
            }
            // Last point
            if (this.i1 < this.lines[name].length - 2) {
                points.push([null, add(invertY(scale(sub(v2(this.x1, linePoint(v2(this.x[this.i1], this.lines[name][this.i1]), v2(this.x[this.i1 + 1], this.lines[name][this.i1 + 1]), this.x1).y), this.sourceOffset), this.factor), this.plotArea), this.plotAreaPadding)]);
            }
            return points;
        }
    }, {
        key: 'getXI',
        value: function getXI(p) {
            var x = this.xFirst + this.xSize * p;
            var i = this.x.findIndex(function (v) {
                return v >= x;
            });
            return [x, i];
        }
    }, {
        key: 'fps',
        value: function fps() {
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
    }, {
        key: 'timing',
        value: function timing(name, value) {
            if (value) {
                this.timings[name] = value;
            }
            return this.timings[name];
        }
    }, {
        key: 'animation',
        value: function animation(name, fn) {
            this.animations[name] = fn;
        }
    }, {
        key: 'updateTimings',
        value: function updateTimings() {
            var prevUpdate = this.lastUpdate;
            this.lastUpdate = Date.now();
            var delta = this.lastUpdate - prevUpdate;
            var changed = false;
            for (var k in this.timings) {
                var prev = this.timings[k]();
                var next = this.timings[k](delta);
                if (prev !== next) {
                    changed = true;
                }
            }
            for (var _k in this.animations) {
                var anim = this.animations[_k];
                if (!anim) {
                    continue;
                }
                var v = anim.call(this);
                if (v === true) {
                    this.animations[_k] = null;
                }
            }
            return changed;
        }
    }, {
        key: 'inputChanged',
        value: function inputChanged() {
            return this.prevP0 !== this.p0 || this.prevP1 !== this.p1;
        }
    }, {
        key: 'getLinesChanged',
        value: function getLinesChanged() {
            var result = {};
            for (var k in this.linesEnabled) {
                if (this.linesEnabled[k] !== this.prevLinesEnabled[k]) {
                    result[k] = this.linesEnabled[k] ? 'on' : 'off';
                }
            }
            return result;
        }
    }, {
        key: 'getMaxHeight',
        value: function getMaxHeight(defaultValue) {
            var arrays = Object.keys(this.lines).filter(function (key) {
                return this.linesEnabled[key];
            }, this).map(function (key) {
                return this.lines[key];
            }, this);
            return arrays.length ? splitRange(0, arraysMaxValue(arrays, this.i0, this.i1), this.yRangeSteps)[this.yRangeSteps] : defaultValue;
        }
    }, {
        key: 'update',
        value: function update() {
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
                var linesChanged = this.getLinesChanged();
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
    }, {
        key: 'handleXRangeChanged',
        value: function handleXRangeChanged() {
            var _this2 = this;

            var wt = this.timing('changeWidth');
            if (!wt || wt() === 1) {
                this.timing('changeWidth', timing(500, this.handleWidthTimingDone.bind(this)));
            }
            var newSteps = [];
            for (var i = 0; i < this.stepsScale.length; i++) {
                var steps = this.stepsScale[i].filter(function (v) {
                    return v >= _this2.i0 && v <= _this2.i1;
                });
                if (steps.length > this.xRangeSteps) {
                    break;
                }
                newSteps = steps;
            }
            this.xRulersOut = this.xRulersOut.concat(this.xRulers.filter(function (v) {
                return newSteps.indexOf(v) === -1;
            }));
            this.xRulersIn = newSteps.filter(function (v) {
                return _this2.xRulers.indexOf(v) === -1;
            });
            this.xRulers = this.xRulers.filter(function (v) {
                return newSteps.indexOf(v) !== -1;
            });
        }
    }, {
        key: 'handleWidthTimingDone',
        value: function handleWidthTimingDone() {
            this.xRulers = this.xRulers.concat(this.xRulersIn);
            this.xRulersOut = [];
            this.xRulersIn = [];
        }
    }, {
        key: 'handleYRangeChanged',
        value: function handleYRangeChanged() {
            var t = this.timing('changeHeight', timing(600));
            var current = this.sourceArea.y;
            this.prevYRulers = this.yRulers;
            this.yRulers = splitRange(0, this.sourceHeight, this.yRangeSteps);
            this.animation('lines', function () {
                var tv = t();
                this.sourceArea.y = animated(current, this.sourceHeight, easeInOutQuart(tv));
                this.factor = map(this.sourceArea, this.plotArea);
                return tv === 1;
            });
        }
    }, {
        key: 'handleLinesChanged',
        value: function handleLinesChanged(changes) {
            Object.keys(changes).forEach(function (name) {
                this.timing('line:' + name, timing(600));
            }, this);
        }
    }, {
        key: 'render',
        value: function render() {
            this.context2d.clearRect(0, 0, this.plotArea.x + this.plotAreaPadding.x * 2, this.plotArea.y + this.plotAreaPadding.y * 2);
            if (this.hasRulers) {
                this.renderYRulers();
                this.renderXRulers();
            }
            this.renderLines();
            this.renderTooltip(10);
            this.fps();
        }
    }, {
        key: 'renderLines',
        value: function renderLines() {
            Object.keys(this.lines).forEach(function (name) {
                this.renderLine(name);
            }, this);
        }
    }, {
        key: 'renderLine',
        value: function renderLine(name) {
            var points = this.plotPoints[name];
            var t = this.timing('line:' + name);
            var alpha = t ? t() : 1;
            this.context2d.beginPath();
            this.context2d.strokeStyle = withAlpha(this.rgbaColors[name], easeInOutQuart(this.linesEnabled[name] ? alpha : 1 - alpha));
            this.context2d.lineWidth = 2.5 * getDpr();
            for (var i = 0; i < points.length; i++) {
                var p = points[i][1];
                if (i === 0) {
                    this.context2d.moveTo(p.x, p.y);
                } else {
                    this.context2d.lineTo(p.x, p.y);
                }
            }
            this.context2d.stroke();
        }
    }, {
        key: 'renderXRulers',
        value: function renderXRulers() {
            var _this3 = this;

            var t = this.timing('changeWidth');
            var tv = t ? t() : 1;
            this.xRulersIn.forEach(function (r) {
                return _this3.renderXRuler(r, easeInQuart(tv));
            });
            this.xRulersOut.forEach(function (r) {
                return _this3.renderXRuler(r, 1 - easeInQuart(tv));
            });
            this.xRulers.forEach(function (r) {
                return _this3.renderXRuler(r, 1);
            });
        }
    }, {
        key: 'renderXRuler',
        value: function renderXRuler(i, alpha) {
            var x = this.x[i];
            var label = this.xDates[i];
            var v = scale(sub(v2(x, 0), this.sourceOffset), this.factor);
            this.context2d.font = "28px Arial";
            this.context2d.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.context2d.fillText(label, v.x, this.plotArea.y + this.plotAreaPadding.y * 2 - 30);
        }
    }, {
        key: 'renderYRulers',
        value: function renderYRulers() {
            var _this4 = this;

            var t = this.timing('changeHeight');
            var tv = t ? t() : 1;
            this.yRulers.forEach(function (r) {
                return _this4.renderYRuler(r, easeInQuad(tv));
            });
            this.prevYRulers.forEach(function (r) {
                return _this4.renderYRuler(r, easeInQuad(1 - tv));
            });
        }
    }, {
        key: 'renderYRuler',
        value: function renderYRuler(y, alpha) {
            this.context2d.beginPath();
            this.context2d.strokeStyle = 'rgba(224, 224, 224, ' + alpha + ')';
            this.context2d.lineWidth = 1 * getDpr();
            var rv = add(invertY(scale(v2(0, y), this.factor), this.plotArea), this.plotAreaPadding);
            this.context2d.moveTo(20, rv.y);
            this.context2d.lineTo(this.plotArea.x, rv.y);
            this.context2d.stroke();
            this.context2d.font = "28px Arial";
            this.context2d.fillStyle = 'rgba(0, 0, 0, ' + alpha + ')';
            this.context2d.fillText(String(Math.ceil(y)), 30, rv.y - 18);
        }
    }, {
        key: 'renderTooltip',
        value: function renderTooltip() {
            if (!Number.isFinite(this.iHover)) {
                return;
            }
            var self = this;
            var anyLine = Object.keys(this.lines)[0];
            var points = Object.keys(this.lines).reduce(function (all, name) {
                var pp = self.plotPoints[name][self.iHover];
                all[name] = {
                    p: pp[1],
                    value: self.lines[name][pp[0]],
                    date: self.xDates[pp[0]]
                };
                return all;
            }, {});
            var anyPoint = points[anyLine];

            var ctx = this.context2d;
            // Line
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(224, 224, 224)';
            ctx.lineWidth = 1 * getDpr();
            ctx.moveTo(anyPoint.p.x, 0 + this.plotAreaPadding.y);
            ctx.lineTo(anyPoint.p.x, this.plotArea.y + this.plotAreaPadding.y);
            ctx.stroke();
            ctx.lineWidth = 2 * getDpr();

            // Circles
            Object.keys(points).forEach(function (name) {
                var p = points[name].p;
                var t = this.timing('line:' + name);
                var alpha = t ? t() : 1;
                ctx.fillStyle = withAlpha('rgba(255,255,255,alpha)', this.linesEnabled[name] ? 1 : 1 - alpha);
                ctx.strokeStyle = withAlpha(this.rgbaColors[name], easeInOutQuart(this.linesEnabled[name] ? alpha : 1 - alpha));
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4 * getDpr(), 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }, this);

            // Tooltip
            var rectWidth = 200 * getDpr();
            var rectHeight = 50 * getDpr() * (Math.ceil(Object.keys(this.lines).length / 2) + 1);
            var rectX = points[anyLine].p.x - rectWidth * (1 / 3);
            var rectY = 10;
            var cornerRadius = 20;
            ctx.strokeStyle = 'rgba(205,205,205)';
            // ctx.lineJoin = "round";
            // ctx.lineWidth = cornerRadius;
            ctx.lineWidth = 1 * getDpr();
            ctx.strokeRect(rectX + cornerRadius / 2, rectY + cornerRadius / 2, rectWidth - cornerRadius, rectHeight - cornerRadius);
            ctx.fillStyle = 'rgba(255,255,255)';
            ctx.fillRect(rectX + cornerRadius / 2, rectY + cornerRadius / 2, rectWidth - cornerRadius, rectHeight - cornerRadius);

            // Header
            this.context2d.font = "28px Arial";
            this.context2d.fillStyle = 'rgba(0, 0, 0, 1)';
            this.context2d.fillText(anyPoint.date, rectX + rectWidth / 2 - 50, rectY + 50);

            Object.keys(points).forEach(function (name, i) {
                var point = points[name];
                ctx.fillStyle = withAlpha(this.rgbaColors[name], 1);
                ctx.font = "36px Arial";
                var itemY = rectY + 100 + Math.floor(i / 2) * 100;
                var itemX = rectX + 50 + i % 2 * 150;
                ctx.fillText(point.value, itemX, itemY);
                ctx.font = "28px Arial";
                ctx.fillText(this.names[name], itemX, itemY + 34);
            }, this);
        }
    }]);

    return ChartCanvas;
}();

function chartAt(parent, data) {
    var p0 = 0.3;
    var p1 = 0.6;
    var element = document.createElement('div');
    element.classList.add('chart');
    element.innerHTML = '\n            <div class=\'chart-header\'>Followers</div>\n            <div class=\'chart-main-canvas\'></div>\n            <div class=\'chart-ruler\'></div>\n            <div class=\'chart-buttons\'></div>\n        ';
    var rect = parent.getBoundingClientRect();
    var width = rect.width;
    var height = width * (2 / 3);
    var mainCanvas = new ChartCanvas(width, height, data, true, p0, p1);
    var rulerCanvas = new ChartCanvas(width, 50, data, false, 0, 1);
    var ruler = new Ruler({
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
        onChange: function onChange(min, max) {
            mainCanvas.setRange(min, max);
        }
    });
    var buttons = new Buttons(data, function (name, value) {
        mainCanvas.setLineEnabled(name, value);
        rulerCanvas.setLineEnabled(name, value);
    });
    ruler.canvas.width = rect.width + 'px';
    ruler.canvas.height = '50px';

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

var container = document.getElementById('container');

window.data.forEach(function (data) {
    chartAt(container, data);
});