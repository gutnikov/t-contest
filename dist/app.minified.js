"use strict";function createCanvas(t,e,i){var s=document.createElement("canvas");return setCanvasSize(s,t,e,i),s}function setCanvasSize(t,e,i,s){var n=s||getDpr();t.width=e*n,t.height=i*n,t.style.width=e+"px",t.style.height=i+"px"}window.requestAnimFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(t){window.setTimeout(t,1e3/60)};var dpr=window.devicePixelRatio||1;function getDpr(){return dpr}function timing(t,e){var i=0;return function(s){var n=Math.min(1,i/t);i+=s||0;var h=Math.min(1,i/t);return n<1&&1===h&&e&&e(),h}}function animated(t,e,i){return t+(e-t)*i}function easeInQuad(t){return t*t}function easeInQuart(t){return t*t*t*t}function easeInOutQuart(t){return t<.5?8*t*t*t*t:1-8*--t*t*t*t}function v2(t,e){return{x:t,y:e}}function add(t,e){return v2(t.x+e.x,t.y+e.y)}function sub(t,e){return v2(t.x-e.x,t.y-e.y)}function map(t,e){return v2(e.x/t.x,e.y/t.y)}function scale(t,e){return v2(t.x*e.x,t.y*e.y)}function invertY(t,e){return v2(t.x,e.y-t.y)}function inRect(t,e,i){return t>=i.left&&t<=i.right&&e>=i.top&&e<=i.bottom}function linePoint(t,e,i){return v2(i,(t.x*e.y-e.x*t.y+(t.y-e.y)*i)/-(e.x-t.x))}function range(t,e,i){for(var s=[],n=0;n<i;n++)s.push(t+n*e);return s}function rangeSteps(t,e,i,s){var n=Math.ceil((e-t)/i);return n<s?range(t,i,n):rangeSteps(t,e,2*i,s)}function stepsScale(t,e,i){var s=[],n=2;do{s.push(rangeSteps(t,e,1,n*i)),n*=2}while(n*i<e-t);return s}function splitRange(t,e,i){for(;(e-t)/(i-1)%1!=0;)e++;for(var s=(e-t)/i,n=[],h=0;h<=i;h++)n.push(Math.round(t+h*s));return n}function arraysMaxValue(t,e,i){for(var s=t[0][0],n=0;n<t.length;n++)for(var h=e;h<=i;h++)s=s>t[n][h]?s:t[n][h];return s}function hexToRgbA(t){var e=void 0;return/^#([A-Fa-f0-9]{3}){1,2}$/.test(t)?(3==(e=t.substring(1).split("")).length&&(e=[e[0],e[0],e[1],e[1],e[2],e[2]]),"rgba("+[(e="0x"+e.join(""))>>16&255,e>>8&255,255&e].join(",")+",alpha)"):"rgba(0,0,0)"}function withAlpha(t,e){return t.replace("alpha",Number.isFinite(e)?e:1)}var monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function formatDate(t){var e=new Date(t);return monthNames[e.getMonth()]+" "+e.getDate()}var _createClass=function(){function t(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}return function(e,i,s){return i&&t(e.prototype,i),s&&t(e,s),e}}();function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var Buttons=function(){function t(e,i){_classCallCheck(this,t);var s=String(Math.random()).slice(-3);this.buttons=Object.keys(e.names).reduce(function(t,i){return t[i]={name:i,title:e.names[i],color:e.colors[i],id:i+"-"+s},t},{}),this.onChange=i||function(){},this.element=document.createElement("div"),this.element.innerHTML=this.tpl(this.buttons),Object.keys(this.buttons).forEach(function(t){var e=this.buttons[t];this.element.querySelector("#"+e.id).addEventListener("change",this.handleChange.bind(this))},this)}return _createClass(t,[{key:"handleChange",value:function(t){var e=t.target.checked,i=t.target.name;t.target.closest(".tl_checkbox_container").style.background=e?this.buttons[i].color:"transparent",this.onChange(i,e)}},{key:"tpl",value:function(t){return'<div class="tl_graphic_buttons">\n            <div class="tl_graphic_buttons_row">'+Object.keys(t).map(function(t){var e=this.buttons[t];return this.buttonTpl(e.id,e.name,e.color)},this).join("")+"</div>\n        </div>"}},{key:"buttonTpl",value:function(t,e,i){return'\n        <div class="tl_graphic_buttons_cell">\n            <div class="tl_graphic_button">\n                <div class="tl_checkbox_container" style="border-color: '+i+";background: "+i+';">\n                    <svg class="tl_scheckbox" viewBox="-295 358 78 78">\n                        <path class="tl_scheckbox_stroke" d="M-273.2,398.2l10,9.9 l22.4-22.3"></path>\n                    </svg>\n                    <input id="'+t+'" name="'+e+'" type="checkbox" class="tl_checkbox" checked="checked"></div>\n                <label class="tl_graphic_title" for="'+t+'">'+e+"</label></div>\n        </div>\n    "}}]),t}();_createClass=function(){function t(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}return function(e,i,s){return i&&t(e.prototype,i),s&&t(e,s),e}}();function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var Ruler=function(){function t(e){_classCallCheck(this,t),Object.assign(this,e,{leftDown:!1,rightDown:!1,mainDown:!1,counter:0}),this.canvas=createCanvas(this.width,this.height,1),this.prevLeft=-1,this.prevRight=-1,this.getTouchCords=this.getTouchCords.bind(this),this.getMouseCords=this.getMouseCords.bind(this),this.setEvents(),this.render=this.render.bind(this),this.render()}return _createClass(t,[{key:"getTouchCords",value:function(t){var e=this.canvas.getBoundingClientRect();return v2((t.touches[0].clientX-e.left)*getDpr(),(t.touches[0].clientY-e.top)*getDpr())}},{key:"getMouseCords",value:function(t){var e=this.canvas.getBoundingClientRect();return v2((t.clientX-e.left)*getDpr(),(t.clientY-e.top)*getDpr())}},{key:"render",value:function(){if(this.left!==this.prevLeft||this.right!==this.prevRight){var t=this.canvas.getContext("2d");t.clearRect(0,0,this.width,this.height),t.fillStyle=this.theme.mainColor,t.fillRect(0,0,this.width*this.left,this.height),t.fillRect(this.width*this.right,0,this.width*(1-this.right),this.height),t.fillStyle=this.theme.borderColor,t.fillRect(this.width*this.left,0,this.width*(this.right-this.left),this.theme.border[0]),t.fillRect(this.width*this.left,this.height-this.theme.border[0],this.width*(this.right-this.left),this.theme.border[0]),t.fillRect(this.width*this.left,0,this.theme.border[1],this.height),t.fillRect(this.width*this.right-this.theme.border[1],0,this.theme.border[1],this.height),this.prevLeft=this.left,this.prevRight=this.right}requestAnimFrame(this.render)}},{key:"setEvents",value:function(){this.canvas.addEventListener("mousedown",this.handleDown.bind(this,this.getMouseCords),!1),document.addEventListener("mouseup",this.handleUp.bind(this,this.getMouseCords),!1),document.addEventListener("mousemove",this.handleMove.bind(this,this.getMouseCords),!1),this.canvas.addEventListener("touchstart",this.handleDown.bind(this,this.getTouchCords),!1),this.canvas.addEventListener("touchend",this.handleUp.bind(this,this.getTouchCords),!1),this.canvas.addEventListener("touchmove",this.handleMove.bind(this,this.getTouchCords),!1),this.noBodyScroll()}},{key:"noBodyScroll",value:function(){var t=this.canvas;document.body.addEventListener("touchstart",function(e){e.target==t&&e.preventDefault()},!1),document.body.addEventListener("touchend",function(e){e.target==t&&e.preventDefault()},!1),document.body.addEventListener("touchmove",function(e){e.target==t&&e.preventDefault()},!1)}},{key:"handleDown",value:function(t,e){var i=t(e);this.downState={cords:i,left:this.left,right:this.right},inRect(i.x,i.y,{left:this.width*this.left+3*this.theme.border[1],right:this.width*this.right-3*this.theme.border[1],top:0,bottom:this.height})?this.mainDown=!0:inRect(i.x,i.y,{left:this.width*this.left-this.touchAreaWidth,right:this.width*this.left+3*this.theme.border[1],top:0,bottom:this.height})?this.leftDown=!0:inRect(i.x,i.y,{left:this.width*this.right-3*this.theme.border[1],right:this.width*this.right+this.touchAreaWidth,top:0,bottom:this.height})&&(this.rightDown=!0)}},{key:"handleUp",value:function(){this.leftDown=this.rightDown=this.mainDown=!1}},{key:"handleMove",value:function(t,e){var i=t(e);if(this.leftDown){var s=sub(i,this.downState.cords).x,n=(this.width*this.downState.left+s)/this.width;this.left=Math.max(0,Math.min(this.right-this.minMainArea,n)),this.handleChange(this.left,this.right)}if(this.rightDown){var h=sub(i,this.downState.cords).x,r=(this.width*this.downState.right+h)/this.width;this.right=Math.min(1,Math.max(this.left+this.minMainArea,r)),this.handleChange(this.left,this.right)}if(this.mainDown){var a=sub(i,this.downState.cords).x;this.width*this.downState.left+a<0&&(a=-this.width*this.downState.left),this.width*this.downState.right+a>this.width&&(a=this.width*(1-this.downState.right));var o=(this.width*this.downState.left+a)/this.width,l=(this.width*this.downState.right+a)/this.width;o>=0&&l<=1&&(this.left=o,this.right=l,this.handleChange(this.left,this.right))}}},{key:"handleChange",value:function(t,e){this.onChange&&this.onChange(Math.max(0,t),Math.min(1,e))}}]),t}();_createClass=function(){function t(t,e){for(var i=0;i<e.length;i++){var s=e[i];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}return function(e,i,s){return i&&t(e.prototype,i),s&&t(e,s),e}}();function _defineProperty(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var ChartCanvas=function(){function t(e,i,s,n,h,r){for(var a in _classCallCheck(this,t),this.hasRulers=n,this.colors=s.colors,this.rgbaColors={},s.colors)this.rgbaColors[a]=hexToRgbA(s.colors[a]);this.names=s.names,this.lines={},s.columns.forEach(function(t){var e=this,i=t[0],n=t.slice(1);"line"===s.types[i]?this.lines[i]=n:"x"===s.types[i]&&(this.xOffset=n[0],this.xDates=n.map(function(t){return formatDate(t)}),this.x=n.map(function(t){return t-e.xOffset}),this.xFirst=0,this.xLast=this.x[this.x.length-1],this.xSize=this.xLast-this.xFirst)},this),this.linesEnabled=this.prevLinesEnabled=Object.keys(s.names).reduce(function(t,e){return t[e]=!0,t},{}),this.linesChanged=!1,this.canvas=createCanvas(e,i),this.context2d=this.canvas.getContext("2d"),this.plotAreaPadding=this.hasRulers?v2(0,50*getDpr()):v2(0,0),this.plotArea=v2(this.canvas.width-2*this.plotAreaPadding.x,this.canvas.height-2*this.plotAreaPadding.y),this.yRangeSteps=5,this.xRangeSteps=6,this.stepsScale=stepsScale(0,this.x.length-1,this.xRangeSteps),this.p0=h,this.p1=r,this.iHover=null,this.setFromPct(h,r),this.setFromPct(h,r),this.setPlotPoints(),this.prevYRulers=[],this.yRulers=splitRange(0,this.sourceHeight,this.yRangeSteps),this.xRulers=rangeSteps(this.i0,this.i1,1,this.xRangeSteps),this.xRulersIn=[],this.xRulersOut=[],this.timings={},this.animations=[],this.lastUpdate=Date.now(),this.setEvents(),this.bodyNoScroll(),this.update=this.update.bind(this),this.render(),this.update()}return _createClass(t,[{key:"setEvents",value:function(){this.canvas.addEventListener("mousemove",function(t){var e=this.canvas.getBoundingClientRect(),i=v2((t.clientX-e.left)*getDpr(),(t.clientY-e.top)*getDpr()),s=Object.keys(this.lines)[0],n=this.plotPoints[s],h=(n[2][1].x-n[1][1].x)/2,r=n.findIndex(function(t){return null!==t[0]&&(t[1].x>=i.x-h&&t[1].x<=i.x+h)});this.iHover=-1!==r?r:null}.bind(this)),this.canvas.addEventListener("mouseout",function(t){this.iHover=null}.bind(this))}},{key:"setSize",value:function(t,e){setCanvasSize(this.canvas,t,e),this.plotArea=v2(this.canvas.width-2*this.plotAreaPadding.x,this.canvas.height-2*this.plotAreaPadding.y),this.factor=map(this.sourceArea,this.plotArea)}},{key:"setRange",value:function(t,e){this.p0=t,this.p1=e}},{key:"setLineEnabled",value:function(t,e){this.prevLinesEnabled=this.linesEnabled,this.linesEnabled=Object.assign({},this.linesEnabled,_defineProperty({},t,e)),this.linesChanged=!0}},{key:"setFromPct",value:function(){this.prevP0=this.p0,this.prevP1=this.p1,this.prevX0=this.x0,this.prevX1=this.x1,this.prevI0=this.i0,this.prevI1=this.i1,this.prevSourceHeight=this.sourceHeight;var t=this.getXI(this.p0);this.x0=t[0],this.i0=t[1];var e=this.getXI(this.p1);this.x1=e[0],this.i1=e[1],this.sourceHeight=this.getMaxHeight(this.prevSourceHeight),this.sourceOffset=v2(this.x0,0),this.sourceArea=v2(this.x1-this.x0,this.sourceArea?this.sourceArea.y:this.sourceHeight),this.factor=map(this.sourceArea,this.plotArea)}},{key:"setPlotPoints",value:function(){var t=this;this.plotPoints=Object.keys(this.lines).reduce(function(e,i){return e[i]=t.setLinePlotPoints(i),e},{})}},{key:"setLinePlotPoints",value:function(t){for(var e=[],i=this.x.slice(this.i0,this.i1+1),s=this.lines[t].slice(this.i0,this.i1+1),n=0;n<i.length;n++){var h=add(invertY(scale(sub(v2(i[n],s[n]),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding);e.push([this.i0+n,h])}return this.i0>0&&e.unshift([null,add(invertY(scale(sub(v2(this.x0,linePoint(v2(this.x[this.i0-1],this.lines[t][this.i0-1]),v2(this.x[this.i0],this.lines[t][this.i0]),this.x0).y),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding)]),this.i1<this.lines[t].length-2&&e.push([null,add(invertY(scale(sub(v2(this.x1,linePoint(v2(this.x[this.i1],this.lines[t][this.i1]),v2(this.x[this.i1+1],this.lines[t][this.i1+1]),this.x1).y),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding)]),e}},{key:"getXI",value:function(t){var e=this.xFirst+this.xSize*t,i=this.x.findIndex(function(t){return t>=e});return[e,i]}},{key:"fps",value:function(){this.curFps||(this.curFps=1,this.lastCall=Date.now()),Date.now()-this.lastCall>1e3&&(document.getElementById("fps").innerHTML="FPS = "+this.curFps,this.curFps=0,this.lastCall=Date.now()),this.curFps++}},{key:"timing",value:function(t,e){return e&&(this.timings[t]=e),this.timings[t]}},{key:"animation",value:function(t,e){this.animations[t]=e}},{key:"updateTimings",value:function(){var t=this.lastUpdate;this.lastUpdate=Date.now();var e=this.lastUpdate-t,i=!1;for(var s in this.timings){this.timings[s]()!==this.timings[s](e)&&(i=!0)}for(var n in this.animations){var h=this.animations[n];if(h)!0===h.call(this)&&(this.animations[n]=null)}return i}},{key:"inputChanged",value:function(){return this.prevP0!==this.p0||this.prevP1!==this.p1}},{key:"getLinesChanged",value:function(){var t={};for(var e in this.linesEnabled)this.linesEnabled[e]!==this.prevLinesEnabled[e]&&(t[e]=this.linesEnabled[e]?"on":"off");return t}},{key:"getMaxHeight",value:function(t){var e=Object.keys(this.lines).filter(function(t){return this.linesEnabled[t]},this).map(function(t){return this.lines[t]},this);return e.length?splitRange(0,arraysMaxValue(e,this.i0,this.i1),this.yRangeSteps)[this.yRangeSteps]:t}},{key:"update",value:function(){if(this.updateTimings()||this.inputChanged()||this.linesChanged){this.setFromPct(),this.setPlotPoints(),this.prevX0===this.x0&&this.prevX1===this.x1||this.handleXRangeChanged(this.i0,this.i1),this.sourceHeight!==this.prevSourceHeight&&this.handleYRangeChanged();var t=this.getLinesChanged();Object.keys(t).length&&this.handleLinesChanged(t),this.prevP0=this.p0,this.prevP1=this.p1,this.prevX0=this.x0,this.prevX1=this.x1,this.prevLinesEnabled=this.linesEnabled,this.prevSourceHeight=this.sourceHeight,this.prevI0=this.i0,this.prevI1=this.i1,this.linesChanged=!1,this.render()}requestAnimFrame(this.update)}},{key:"handleXRangeChanged",value:function(){var t=this,e=this.timing("changeWidth");e&&1!==e()||this.timing("changeWidth",timing(500,this.handleWidthTimingDone.bind(this)));for(var i=[],s=0;s<this.stepsScale.length;s++){var n=this.stepsScale[s].filter(function(e){return e>=t.i0&&e<=t.i1});if(n.length>this.xRangeSteps)break;i=n}this.xRulersOut=this.xRulersOut.concat(this.xRulers.filter(function(t){return-1===i.indexOf(t)})),this.xRulersIn=i.filter(function(e){return-1===t.xRulers.indexOf(e)}),this.xRulers=this.xRulers.filter(function(t){return-1!==i.indexOf(t)})}},{key:"handleWidthTimingDone",value:function(){this.xRulers=this.xRulers.concat(this.xRulersIn),this.xRulersOut=[],this.xRulersIn=[]}},{key:"handleYRangeChanged",value:function(){var t=this.timing("changeHeight",timing(600)),e=this.sourceArea.y;this.prevYRulers=this.yRulers,this.yRulers=splitRange(0,this.sourceHeight,this.yRangeSteps),this.animation("lines",function(){var i=t();return this.sourceArea.y=animated(e,this.sourceHeight,easeInOutQuart(i)),this.factor=map(this.sourceArea,this.plotArea),1===i})}},{key:"handleLinesChanged",value:function(t){Object.keys(t).forEach(function(t){this.timing("line:"+t,timing(600))},this)}},{key:"render",value:function(){this.context2d.clearRect(0,0,this.plotArea.x+2*this.plotAreaPadding.x,this.plotArea.y+2*this.plotAreaPadding.y),this.hasRulers&&(this.renderYRulers(),this.renderXRulers()),this.renderLines(),this.renderTooltip(10),this.fps()}},{key:"renderLines",value:function(){Object.keys(this.lines).forEach(function(t){this.renderLine(t)},this)}},{key:"renderLine",value:function(t){var e=this.plotPoints[t],i=this.timing("line:"+t),s=i?i():1;this.context2d.beginPath(),this.context2d.strokeStyle=withAlpha(this.rgbaColors[t],easeInOutQuart(this.linesEnabled[t]?s:1-s)),this.context2d.lineWidth=2.5*getDpr();for(var n=0;n<e.length;n++){var h=e[n][1];0===n?this.context2d.moveTo(h.x,h.y):this.context2d.lineTo(h.x,h.y)}this.context2d.stroke()}},{key:"renderXRulers",value:function(){var t=this,e=this.timing("changeWidth"),i=e?e():1;this.xRulersIn.forEach(function(e){return t.renderXRuler(e,easeInQuart(i))}),this.xRulersOut.forEach(function(e){return t.renderXRuler(e,1-easeInQuart(i))}),this.xRulers.forEach(function(e){return t.renderXRuler(e,1)})}},{key:"renderXRuler",value:function(t,e){var i=this.x[t],s=this.xDates[t],n=scale(sub(v2(i,0),this.sourceOffset),this.factor);this.context2d.font="28px Arial",this.context2d.fillStyle="rgba(0, 0, 0, "+e+")",this.context2d.fillText(s,n.x,this.plotArea.y+2*this.plotAreaPadding.y-30)}},{key:"renderYRulers",value:function(){var t=this,e=this.timing("changeHeight"),i=e?e():1;this.yRulers.forEach(function(e){return t.renderYRuler(e,easeInQuad(i))}),this.prevYRulers.forEach(function(e){return t.renderYRuler(e,easeInQuad(1-i))})}},{key:"renderYRuler",value:function(t,e){this.context2d.beginPath(),this.context2d.strokeStyle="rgba(224, 224, 224, "+e+")",this.context2d.lineWidth=1*getDpr();var i=add(invertY(scale(v2(0,t),this.factor),this.plotArea),this.plotAreaPadding);this.context2d.moveTo(20,i.y),this.context2d.lineTo(this.plotArea.x,i.y),this.context2d.stroke(),this.context2d.font="28px Arial",this.context2d.fillStyle="rgba(0, 0, 0, "+e+")",this.context2d.fillText(String(Math.ceil(t)),30,i.y-18)}},{key:"renderTooltip",value:function(){if(Number.isFinite(this.iHover)){var t=this,e=Object.keys(this.lines)[0],i=Object.keys(this.lines).reduce(function(e,i){var s=t.plotPoints[i][t.iHover];return e[i]={p:s[1],value:t.lines[i][s[0]],date:t.xDates[s[0]]},e},{}),s=i[e],n=this.context2d;n.beginPath(),n.strokeStyle="rgba(224, 224, 224)",n.lineWidth=1*getDpr(),n.moveTo(s.p.x,0+this.plotAreaPadding.y),n.lineTo(s.p.x,this.plotArea.y+this.plotAreaPadding.y),n.stroke(),n.lineWidth=2*getDpr(),Object.keys(i).forEach(function(t){var e=i[t].p,s=this.timing("line:"+t),h=s?s():1;n.fillStyle=withAlpha("rgba(255,255,255,alpha)",this.linesEnabled[t]?1:1-h),n.strokeStyle=withAlpha(this.rgbaColors[t],easeInOutQuart(this.linesEnabled[t]?h:1-h)),n.beginPath(),n.arc(e.x,e.y,4*getDpr(),0,2*Math.PI),n.fill(),n.stroke()},this);var h=200*getDpr(),r=50*getDpr()*(Math.ceil(Object.keys(this.lines).length/2)+1),a=i[e].p.x-h*(1/3);n.strokeStyle="rgba(205,205,205)",n.lineWidth=1*getDpr(),n.strokeRect(a+10,20,h-20,r-20),n.fillStyle="rgba(255,255,255)",n.fillRect(a+10,20,h-20,r-20),this.context2d.font="28px Arial",this.context2d.fillStyle="rgba(0, 0, 0, 1)",this.context2d.fillText(s.date,a+h/2-50,60),Object.keys(i).forEach(function(t,e){var s=i[t];n.fillStyle=withAlpha(this.rgbaColors[t],1),n.font="36px Arial";var h=110+100*Math.floor(e/2),r=a+50+e%2*150;n.fillText(s.value,r,h),n.font="28px Arial",n.fillText(this.names[t],r,h+34)},this)}}}]),t}();function chartAt(t,e){var i=document.createElement("div");i.classList.add("chart"),i.innerHTML="\n            <div class='chart-header'>Followers</div>\n            <div class='chart-main-canvas'></div>\n            <div class='chart-ruler'></div>\n            <div class='chart-buttons'></div>\n        ";var s=t.getBoundingClientRect(),n=s.width,h=new ChartCanvas(n,n*(2/3),e,!0,.3,.6),r=new ChartCanvas(n,50,e,!1,0,1),a=new Ruler({width:s.width*getDpr(),height:50*getDpr(),theme:{mainColor:"rgba(0,0,0,0.3)",borderColor:"rgba(0,0,0, 0.5)",border:[1*getDpr(),6*getDpr()]},left:.3,right:.6,minMainArea:.03,touchAreaWidth:30,onChange:function(t,e){h.setRange(t,e)}}),o=new Buttons(e,function(t,e){h.setLineEnabled(t,e),r.setLineEnabled(t,e)});a.canvas.style.width=s.width+"px",a.canvas.style.height="50px",i.querySelector(".chart-main-canvas").appendChild(h.canvas),i.querySelector(".chart-ruler").appendChild(r.canvas),i.querySelector(".chart-ruler").appendChild(a.canvas),i.querySelector(".chart-buttons").appendChild(o.element),t.appendChild(i)}var container=document.getElementById("container");window.data.forEach(function(t){chartAt(container,t)});
