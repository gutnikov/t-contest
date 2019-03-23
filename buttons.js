class Buttons {
    constructor(data, onChange) {
        const rnd = String(Math.random()).slice(-3);
        this.buttons = Object.keys(data.names).reduce(function(all, name) {
            all[name] = {
                name: name,
                title: data.names[name],
                color: data.colors[name],
                id: name + '-' + rnd
            };
            return all;
        }, {});
        this.onChange = onChange || function(){};
        this.element = document.createElement('div');
        this.element.innerHTML = this.tpl(this.buttons);
        Object.keys(this.buttons).forEach(function(name) {
            const b = this.buttons[name];
            this.element.querySelector('#'+ b.id)
                .addEventListener('change', this.handleChange.bind(this));
        }, this);
    }

    handleChange(event) {
        const checked = event.target.checked;
        const name = event.target.name;
        const parent = event.target.closest('.tl_checkbox_container');
        parent.style.background = checked ? this.buttons[name].color : 'transparent';
        this.onChange(name, checked);
    }

    tpl(buttons) {
        const buttonsTpl = Object.keys(buttons).map(function(bName){
            const b = this.buttons[bName];
            return this.buttonTpl(b.id, b.name, b.color);
        }, this);
        return `<div class="tl_graphic_buttons">
            <div class="tl_graphic_buttons_row">${buttonsTpl.join('')}</div>
        </div>`;
    }

    buttonTpl(id, name, color) {
        return `
        <div class="tl_graphic_buttons_cell">
            <div class="tl_graphic_button">
                <div class="tl_checkbox_container" style="border-color: ${color};background: ${color};">
                    <svg class="tl_scheckbox" viewBox="-295 358 78 78">
                        <path class="tl_scheckbox_stroke" d="M-273.2,398.2l10,9.9 l22.4-22.3"></path>
                    </svg>
                    <input id="${id}" name="${name}" type="checkbox" class="tl_checkbox" checked="checked"></div>
                <label class="tl_graphic_title" for="${id}">${name}</label></div>
        </div>
    `;
    }
}


