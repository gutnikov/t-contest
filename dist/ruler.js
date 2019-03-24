'use strict';

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