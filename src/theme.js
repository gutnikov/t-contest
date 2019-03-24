
function Theme(values) {
    let theme;
    let themeValues = values;
    let themeNames = Object.keys(themeValues);
    const body = document.body;
    const switcher = document.getElementById('theme-switcher');
    const t = {
        activate: function(t) {
            body.classList.remove('theme-' + theme);
            body.classList.add('theme-' + t);
            const nextT = themeNames.find(name => name !== t);
            switcher.innerText = 'Switch to ' + nextT + ' theme';
            switcher.setAttribute('data-switch-to', nextT);
            theme = t;
            console.log('Theme = ' + t + ', next = '+ nextT);
        },
        getName: function() {
            return theme;
        },
        get: function(name) {
            return themeValues[theme][name];
        }
    };
    switcher.addEventListener('click', function(e) {
        t.activate(e.target.getAttribute('data-switch-to'));
    });
    return t;
}
