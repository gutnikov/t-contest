
// put left to 0 right to 100% - rulers disapear
// Blinking numbers
// rewrite no classes
// Provide github link

// h animations sometimes looks strange
// Canvas resize breaks ruler
// fix buttons on old safari

// Theme
const theme = new Theme({
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
    const p0 = 0.3;
    const p1 = 0.6;
    const element = document.createElement('div');
    element.classList.add('chart');
    element.innerHTML = `
            <div class='chart-header'>Followers</div>
            <div class='chart-main-canvas'></div>
            <div class='chart-ruler'></div>
            <div class='chart-buttons'></div>
        `;
    let rect = parent.getBoundingClientRect();
    const width = rect.width;
    const height = width * (2 / 3);

    // Canvases
    const mainCanvas = new ChartCanvas({
        width,
        height,
        data, hasRulers: true,
        p0,
        p1,
        theme
    });
    const rulerCanvas = new ChartCanvas({
        width,
        height: 50,
        data,
        hasRulers: false,
        p0: 0,
        p1: 1,
        theme
    });

    const ruler = new Ruler({
        width: rect.width * getDpr(),
        height: 50 * getDpr(),
        theme,
        left: p0,
        right: p1,
        minMainArea: 0.03,
        touchAreaWidth: 30,
        onChange: function(min, max) {
            mainCanvas.setRange(min, max);
        }
    });
    ruler.canvas.style.width = rect.width + 'px';
    ruler.canvas.style.height = '50px';

    const buttons = new Buttons(data, function(name, value) {
        mainCanvas.setLineEnabled(name, value);
        rulerCanvas.setLineEnabled(name, value);
    });

    const $main = $('.chart-main-canvas', element);
    $main.appendChild(mainCanvas.canvas);
    $main.appendChild(mainCanvas.tooltipCanvas);
    $main.style.height = height + 'px';

    const $chartRuler = $('.chart-ruler', element);
    $chartRuler.appendChild(rulerCanvas.canvas);
    $chartRuler.appendChild(ruler.canvas);

    $('.chart-buttons', element).appendChild(buttons.element);
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

const container = document.getElementById('container');

window.data.forEach(function(data) {
    chartAt(container, data);
});

