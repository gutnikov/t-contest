'use strict';

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
}();