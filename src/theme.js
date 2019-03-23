function Theme(values) {
    let theme;
    let themeValues = values;
    const body = document.body;
    return {
        activate: function(t) {
            body.classList.remove('theme-' + theme);
            body.classList.add('theme-' + t);
            theme = t;
        },
        get: function(name) {
            return themeValues[theme][name];
        }
    };
}
