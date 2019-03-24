// mainColor
// borderColor
// borderTopBottom
// borderLeftRight
class Ruler {
    constructor(config) {
        Object.assign(this, config, {
            leftDown: false,
            rightDown: false,
            mainDown: false,
            borderTop: 1 * getDpr(),
            borderSide: 6 * getDpr(),
            counter: 0
        });
        this.canvas = createCanvas(
            this.width,
            this.height, 1);
        this.prevLeft = -1;
        this.prevRight = -1;
        this.getTouchCords = this.getTouchCords.bind(this);
        this.getMouseCords = this.getMouseCords.bind(this);
        this.setEvents();
        this.render = this.render.bind(this);
        this.render();
    }

    getTouchCords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return v2(
            (e.touches[0].clientX - rect.left) * getDpr(),
            (e.touches[0].clientY - rect.top) * getDpr());
    }

    getMouseCords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return v2((e.clientX - rect.left) * getDpr(),
            (e.clientY - rect.top) * getDpr());
    }

    render() {
        if (this.left !== this.prevLeft || this.right !== this.prevRight) {
            let ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = withAlpha(this.theme.get('border2'), 0.2);
            ctx.fillRect(0, 0, this.width * this.left, this.height);
            ctx.fillRect(
                this.width * this.right, 0,
                this.width * (1 - this.right), this.height);
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

    setEvents() {
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

    noBodyScroll() {
        // let canvas = this.canvas;
        // document.body.addEventListener("touchstart", function (e) {
        //     if (e.target === canvas) {
        //         try {
        //             e.preventDefault();
        //          } catch(e) {}
        //     }
        // }, false);
        // document.body.addEventListener("touchend", function (e) {
        //     if (e.target === canvas) {
        //         try {
        //             e.preventDefault();
        //         } catch(e) {}
        //     }
        // }, false);
        // document.body.addEventListener("touchmove", function (e) {
        //     if (e.target === canvas) {
        //         try {
        //             e.preventDefault();
        //         } catch(e) {}
        //
        //     }
        // }, false);
    }


    handleDown(getCords, e) {
        const cords = getCords(e);
        this.downState = {
            cords,
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
        }
        else if (inRect(cords.x, cords.y, {
            left: this.width * this.left - this.touchAreaWidth,
            right: this.width * this.left + this.borderSide * 3,
            top: 0,
            bottom: this.height
        })) {
            this.leftDown = true;
        }
        else if (inRect(cords.x, cords.y, {
            left: this.width * this.right - this.borderSide * 3,
            right: this.width * this.right + this.touchAreaWidth,
            top: 0,
            bottom: this.height
        })) {
            this.rightDown = true;
        }
    }

    handleUp() {
        this.leftDown = this.rightDown = this.mainDown = false;
    }

    handleMove(getCords, e) {
        const cords = getCords(e);
        if (this.leftDown) {
            const offset = sub(cords, this.downState.cords).x;
            const left = (this.width * this.downState.left + offset)/this.width;
            this.left = Math.max(0,Math.min(this.right - this.minMainArea, left));
            this.handleChange(this.left, this.right);
        }
        if (this.rightDown) {
            const offset = sub(cords, this.downState.cords).x;
            const right = (this.width * this.downState.right + offset)/this.width;
            this.right = Math.min(1, Math.max(this.left + this.minMainArea, right));
            this.handleChange(this.left, this.right);
        }
        if (this.mainDown) {
            let offset = sub(cords, this.downState.cords).x;
            if (this.width * this.downState.left + offset < 0) {
                offset = -(this.width * this.downState.left);
            }
            if (this.width * this.downState.right + offset > this.width) {
                offset = this.width * (1 - this.downState.right);
            }
            let left = (this.width * this.downState.left + offset)/this.width;
            let right = (this.width * this.downState.right + offset)/this.width;
            if (left >= 0 && right <= 1) {
                this.left = left;
                this.right = right;
                this.handleChange(this.left, this.right);
            }
        }
    }

    handleChange(left, right) {
        if (this.onChange) {
            this.onChange(Math.max(0,left), Math.min(1, right));
        }
    }
}
