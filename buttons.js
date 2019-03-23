class Buttons {
    constructor(names, onChange) {
        this.names = names;
        this.onChange = onChange || function(){};
        this.element = document.createElement('div');
        this.element.innerHTML = names.map(function(item, i) {
            return `
                <div class="checkbox">
                    <input type="checkbox" id="ch${i}" name="${item.id}" checked="true"/>
                    <label for="ch${i}">${item.name}</label>
                </div>
            `;
        }).join('');
        this.names.forEach(function(item) {
            this.element.querySelector(`input[name=${item.id}]`).addEventListener('change', this.handleChange.bind(this));
        }, this);
    }

    handleChange(event) {
        this.onChange(event.target.name, event.target.checked);
    }
}
