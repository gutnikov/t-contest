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
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
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

function easeInQuad(t) {
    return t * t;
}
function easeInQuart(t) {
    return t * t * t * t;
}
function easeInOutQuart(t) {
    return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
}

// Vector operations
function v2(x, y) {
    return { x: x, y: y };
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
}'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buttons = function () {
    function Buttons(data, onChange) {
        _classCallCheck(this, Buttons);

        var rnd = String(Math.random()).slice(-3);
        this.buttons = Object.keys(data.names).reduce(function (all, name) {
            all[name] = {
                name: name,
                title: data.names[name],
                color: data.colors[name],
                id: name + '-' + rnd
            };
            return all;
        }, {});
        this.onChange = onChange || function () {};
        this.element = document.createElement('div');
        this.element.innerHTML = this.tpl(this.buttons);
        Object.keys(this.buttons).forEach(function (name) {
            var b = this.buttons[name];
            this.element.querySelector('#' + b.id).addEventListener('change', this.handleChange.bind(this));
        }, this);
    }

    _createClass(Buttons, [{
        key: 'handleChange',
        value: function handleChange(event) {
            var checked = event.target.checked;
            var name = event.target.name;
            var parent = event.target.closest('.tl_checkbox_container');
            parent.style.background = checked ? this.buttons[name].color : 'transparent';
            this.onChange(name, checked);
        }
    }, {
        key: 'tpl',
        value: function tpl(buttons) {
            var buttonsTpl = Object.keys(buttons).map(function (bName) {
                var b = this.buttons[bName];
                return this.buttonTpl(b.id, b.name, b.color);
            }, this);
            return '<div class="tl_graphic_buttons">\n            <div class="tl_graphic_buttons_row">' + buttonsTpl.join('') + '</div>\n        </div>';
        }
    }, {
        key: 'buttonTpl',
        value: function buttonTpl(id, name, color) {
            return '\n        <div class="tl_graphic_buttons_cell">\n            <div class="tl_graphic_button">\n                <div class="tl_checkbox_container" style="border-color: ' + color + ';background: ' + color + ';">\n                    <svg class="tl_scheckbox" viewBox="-295 358 78 78">\n                        <path class="tl_scheckbox_stroke" d="M-273.2,398.2l10,9.9 l22.4-22.3"></path>\n                    </svg>\n                    <input id="' + id + '" name="' + name + '" type="checkbox" class="tl_checkbox" checked="checked"></div>\n                <label class="tl_graphic_title" for="' + id + '">' + name + '</label></div>\n        </div>\n    ';
        }
    }]);

    return Buttons;
}();'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// mainColor
// borderColor
// borderTopBottom
// borderLeftRight
var Ruler = function () {
    function Ruler(config) {
        _classCallCheck(this, Ruler);

        Object.assign(this, config, {
            leftDown: false,
            rightDown: false,
            mainDown: false,
            borderTop: 1 * getDpr(),
            borderSide: 6 * getDpr(),
            counter: 0
        });
        this.canvas = createCanvas(this.width, this.height, 1);
        this.prevLeft = -1;
        this.prevRight = -1;
        this.getTouchCords = this.getTouchCords.bind(this);
        this.getMouseCords = this.getMouseCords.bind(this);
        this.setEvents();
        this.render = this.render.bind(this);
        this.render();
    }

    _createClass(Ruler, [{
        key: 'getTouchCords',
        value: function getTouchCords(e) {
            var rect = this.canvas.getBoundingClientRect();
            return v2((e.touches[0].clientX - rect.left) * getDpr(), (e.touches[0].clientY - rect.top) * getDpr());
        }
    }, {
        key: 'getMouseCords',
        value: function getMouseCords(e) {
            var rect = this.canvas.getBoundingClientRect();
            return v2((e.clientX - rect.left) * getDpr(), (e.clientY - rect.top) * getDpr());
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.left !== this.prevLeft || this.right !== this.prevRight) {
                var ctx = this.canvas.getContext("2d");
                ctx.clearRect(0, 0, this.width, this.height);
                ctx.fillStyle = withAlpha(this.theme.get('border2'), 0.2);
                ctx.fillRect(0, 0, this.width * this.left, this.height);
                ctx.fillRect(this.width * this.right, 0, this.width * (1 - this.right), this.height);
                ctx.fillStyle = withAlpha(this.theme.get('border2'), 0.5);
                ctx.fillRect(this.width * this.left, 0, this.width * (this.right - this.left), this.borderTop);
                ctx.fillRect(this.width * this.left, this.height - this.borderTop, this.width * (this.right - this.left), this.borderTop);
                ctx.fillRect(this.width * this.left, 0, this.borderSide, this.height);
                ctx.fillRect(this.width * this.right - this.borderSide, 0, this.borderSide, this.height);
                this.prevLeft = this.left;
                this.prevRight = this.right;
            }
            requestAnimFrame(this.render);
        }
    }, {
        key: 'setEvents',
        value: function setEvents() {
            // Mouse
            this.canvas.addEventListener("mousedown", this.handleDown.bind(this, this.getMouseCords), false);
            document.addEventListener("mouseup", this.handleUp.bind(this, this.getMouseCords), false);
            document.addEventListener("mousemove", this.handleMove.bind(this, this.getMouseCords), false);
            // Touch
            this.canvas.addEventListener("touchstart", this.handleDown.bind(this, this.getTouchCords), false);
            this.canvas.addEventListener("touchend", this.handleUp.bind(this, this.getTouchCords), false);
            this.canvas.addEventListener("touchmove", this.handleMove.bind(this, this.getTouchCords), false);
            this.noBodyScroll();
        }
    }, {
        key: 'noBodyScroll',
        value: function noBodyScroll() {
            var canvas = this.canvas;
            document.body.addEventListener("touchstart", function (e) {
                if (e.target == canvas) {
                    e.preventDefault();
                }
            }, false);
            document.body.addEventListener("touchend", function (e) {
                if (e.target == canvas) {
                    e.preventDefault();
                }
            }, false);
            document.body.addEventListener("touchmove", function (e) {
                if (e.target == canvas) {
                    e.preventDefault();
                }
            }, false);
        }
    }, {
        key: 'handleDown',
        value: function handleDown(getCords, e) {
            var cords = getCords(e);
            this.downState = {
                cords: cords,
                left: this.left,
                right: this.right
            };
            if (inRect(cords.x, cords.y, {
                left: this.width * this.left + this.borderSide * 3,
                right: this.width * this.right - this.borderSide * 3,
                top: 0,
                bottom: this.height
            })) {
                this.mainDown = true;
            } else if (inRect(cords.x, cords.y, {
                left: this.width * this.left - this.touchAreaWidth,
                right: this.width * this.left + this.borderSide * 3,
                top: 0,
                bottom: this.height
            })) {
                this.leftDown = true;
            } else if (inRect(cords.x, cords.y, {
                left: this.width * this.right - this.borderSide * 3,
                right: this.width * this.right + this.touchAreaWidth,
                top: 0,
                bottom: this.height
            })) {
                this.rightDown = true;
            }
        }
    }, {
        key: 'handleUp',
        value: function handleUp() {
            this.leftDown = this.rightDown = this.mainDown = false;
        }
    }, {
        key: 'handleMove',
        value: function handleMove(getCords, e) {
            var cords = getCords(e);
            if (this.leftDown) {
                var offset = sub(cords, this.downState.cords).x;
                var left = (this.width * this.downState.left + offset) / this.width;
                this.left = Math.max(0, Math.min(this.right - this.minMainArea, left));
                this.handleChange(this.left, this.right);
            }
            if (this.rightDown) {
                var _offset = sub(cords, this.downState.cords).x;
                var right = (this.width * this.downState.right + _offset) / this.width;
                this.right = Math.min(1, Math.max(this.left + this.minMainArea, right));
                this.handleChange(this.left, this.right);
            }
            if (this.mainDown) {
                var _offset2 = sub(cords, this.downState.cords).x;
                if (this.width * this.downState.left + _offset2 < 0) {
                    _offset2 = -(this.width * this.downState.left);
                }
                if (this.width * this.downState.right + _offset2 > this.width) {
                    _offset2 = this.width * (1 - this.downState.right);
                }
                var _left = (this.width * this.downState.left + _offset2) / this.width;
                var _right = (this.width * this.downState.right + _offset2) / this.width;
                if (_left >= 0 && _right <= 1) {
                    this.left = _left;
                    this.right = _right;
                    this.handleChange(this.left, this.right);
                }
            }
        }
    }, {
        key: 'handleChange',
        value: function handleChange(left, right) {
            if (this.onChange) {
                this.onChange(Math.max(0, left), Math.min(1, right));
            }
        }
    }]);

    return Ruler;
}();