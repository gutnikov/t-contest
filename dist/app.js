'use strict';

// fix hover
// fix buttons on old safari
// normal dialog on hover
// put date on the middle of the point
// put hover on separate canvas
// put hrules on separate canvas?
// drobniye koordinaty?
// less lines for phones
// put left to 0 right to 100% - rulers disapear
// Blinking numbers
// rewrite no classes
// h animations sometimes looks strange
// Canvas resize breaks ruler
// Provide github link

// Theme
var theme = new Theme({
    light: {
        bg: 'white',
        main: 'black',
        rulerName: hexToRgbA('#8f9092'),
        // border: hexToRgbA('#d1d3d6'),
        border: hexToRgbA('#a0a0a0'),
        border2: hexToRgbA('#000000')
    },
    dark: {
        bg: '#242f3d',
        main: 'white',
        rulerName: hexToRgbA('#818c98'),
        border: hexToRgbA('#425061'),
        border2: hexToRgbA('#000000')
    }
});
theme.activate('dark');

function chartAt(parent, data) {
    // Params
    var p0 = 0.3;
    var p1 = 0.6;
    var element = document.createElement('div');
    element.classList.add('chart');
    element.innerHTML = '\n            <div class=\'chart-header\'>Followers</div>\n            <div class=\'chart-main-canvas\'></div>\n            <div class=\'chart-ruler\'></div>\n            <div class=\'chart-buttons\'></div>\n        ';
    var rect = parent.getBoundingClientRect();
    var width = rect.width;
    var height = width * (2 / 3);

    // Canvases
    var mainCanvas = new ChartCanvas({
        width: width,
        height: height,
        data: data, hasRulers: true,
        p0: p0,
        p1: p1,
        theme: theme
    });
    var rulerCanvas = new ChartCanvas({
        width: width,
        height: 50,
        data: data,
        hasRulers: false,
        p0: 0,
        p1: 1,
        theme: theme
    });

    var ruler = new Ruler({
        width: rect.width * getDpr(),
        height: 50 * getDpr(),
        theme: theme,
        left: p0,
        right: p1,
        minMainArea: 0.03,
        touchAreaWidth: 30,
        onChange: function onChange(min, max) {
            mainCanvas.setRange(min, max);
        }
    });
    ruler.canvas.style.width = rect.width + 'px';
    ruler.canvas.style.height = '50px';

    var buttons = new Buttons(data, function (name, value) {
        mainCanvas.setLineEnabled(name, value);
        rulerCanvas.setLineEnabled(name, value);
    });
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