"use strict";function $(q,p){return(p||document).querySelector(q)}function createCanvas(w,h,dpr){var canvas=document.createElement("canvas");return setCanvasSize(canvas,w,h,dpr),canvas}function setCanvasSize(canvas,w,h,dpr){var useDpr=dpr||getDpr();canvas.width=w*useDpr,canvas.height=h*useDpr,canvas.style.width=w+"px",canvas.style.height=h+"px"}window.requestAnimFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||function(callback){window.setTimeout(callback,1e3/60)};var dpr=window.devicePixelRatio||1;function getDpr(){return dpr}function timing(duration,onFinish){var timePassed=0;return function(delta){var prev=Math.min(1,timePassed/duration);timePassed+=delta||0;var cur=Math.min(1,timePassed/duration);return prev<1&&1===cur&&onFinish&&onFinish(),cur}}function animated(from,to,t){return from+(to-from)*t}function easeInQuad(t){return t*t}function easeInQuart(t){return t*t*t*t}function easeInOutQuart(t){return t<.5?8*t*t*t*t:1-8*--t*t*t*t}function v2(x,y){return{x:x,y:y}}function add(a,b){return v2(a.x+b.x,a.y+b.y)}function sub(a,b){return v2(a.x-b.x,a.y-b.y)}function map(from,to){return v2(to.x/from.x,to.y/from.y)}function scale(v,factor){return v2(v.x*factor.x,v.y*factor.y)}function invertY(v,area){return v2(v.x,area.y-v.y)}function ints(v){return v2(Math.round(v.x),Math.round(v.y))}function inRect(x,y,rect){return x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom}function linePoint(p1,p2,x){return v2(x,(p1.x*p2.y-p2.x*p1.y+(p1.y-p2.y)*x)/-(p2.x-p1.x))}function range(first,step,count){for(var result=[],i=0;i<count;i++)result.push(first+i*step);return result}function rangeSteps(first,last,step,size){var count=Math.ceil((last-first)/step);return count<size?range(first,step,count):rangeSteps(first,last,2*step,size)}function stepsScale(first,last,count){var result=[],i=2;do{result.push(rangeSteps(first,last,1,i*count)),i*=2}while(i*count<last-first);return result}function splitRange(first,last,count){for(;(last-first)/(count-1)%1!=0;)last++;for(var step=(last-first)/count,result=[],i=0;i<=count;i++)result.push(Math.round(first+i*step));return result}function arraysMaxValue(arrays,i0,i1){for(var max=arrays[0][0],j=0;j<arrays.length;j++)for(var i=i0;i<=i1;i++)max=max>arrays[j][i]?max:arrays[j][i];return max}function hexToRgbA(hex){var c=void 0;return/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)?(3==(c=hex.substring(1).split("")).length&&(c=[c[0],c[0],c[1],c[1],c[2],c[2]]),"rgba("+[(c="0x"+c.join(""))>>16&255,c>>8&255,255&c].join(",")+",alpha)"):"rgba(0,0,0)"}function withAlpha(rgba,alpha){return rgba.replace("alpha",Number.isFinite(alpha)?alpha:1)}var monthNames=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function formatDate(time){var date=new Date(time);return monthNames[date.getMonth()]+" "+date.getDate()}function Theme(values){var theme=void 0,themeValues=values,themeNames=Object.keys(themeValues),body=document.body,switcher=document.getElementById("theme-switcher"),t={activate:function(t){body.classList.remove("theme-"+theme),body.classList.add("theme-"+t);var nextT=themeNames.find(function(name){return name!==t});switcher.innerText="Switch to "+nextT+" theme",switcher.setAttribute("data-switch-to",nextT),theme=t,console.log("Theme = "+t+", next = "+nextT)},getName:function(){return theme},get:function(name){return themeValues[theme][name]}};return switcher.addEventListener("click",function(e){t.activate(e.target.getAttribute("data-switch-to"))}),t}var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}var Buttons=function(){function Buttons(data,onChange){_classCallCheck(this,Buttons);var rnd=String(Math.random()).slice(-3);this.buttons=Object.keys(data.names).reduce(function(all,name){return all[name]={name:name,title:data.names[name],color:data.colors[name],id:name+"-"+rnd},all},{}),this.onChange=onChange||function(){},this.element=document.createElement("div"),this.element.innerHTML=this.tpl(this.buttons),Object.keys(this.buttons).forEach(function(name){var b=this.buttons[name];this.element.querySelector("#"+b.id).addEventListener("change",this.handleChange.bind(this))},this)}return _createClass(Buttons,[{key:"handleChange",value:function(event){var checked=event.target.checked,name=event.target.name,parent=event.target.closest(".tl_checkbox_container");parent.style.background=checked?this.buttons[name].color:"transparent",parent.querySelector(".tl_scheckbox").style.visibility=checked?"visible":"hidden",this.onChange(name,checked)}},{key:"tpl",value:function(buttons){return'<div class="tl_graphic_buttons">\n            <div class="tl_graphic_buttons_row">'+Object.keys(buttons).map(function(bName){var b=this.buttons[bName];return this.buttonTpl(b.id,b.name,b.color)},this).join("")+"</div>\n        </div>"}},{key:"buttonTpl",value:function(id,name,color){return'\n        <div class="tl_graphic_buttons_cell">\n            <div class="tl_graphic_button">\n                <div class="tl_checkbox_container" style="border-color: '+color+";background: "+color+';">\n                    <svg class="tl_scheckbox" viewBox="-295 358 78 78">\n                        <path class="tl_scheckbox_stroke" d="M-273.2,398.2l10,9.9 l22.4-22.3"></path>\n                    </svg>\n                    <input id="'+id+'" name="'+name+'" type="checkbox" class="tl_checkbox" checked="checked"></div>\n                <label class="tl_graphic_title" for="'+id+'">'+name+"</label></div>\n        </div>\n    "}}]),Buttons}();_createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}var Ruler=function(){function Ruler(config){_classCallCheck(this,Ruler),Object.assign(this,config,{leftDown:!1,rightDown:!1,mainDown:!1,borderTop:1*getDpr(),borderSide:6*getDpr(),counter:0}),this.canvas=createCanvas(this.width,this.height,1),this.prevLeft=-1,this.prevRight=-1,this.getTouchCords=this.getTouchCords.bind(this),this.getMouseCords=this.getMouseCords.bind(this),this.setEvents(),this.render=this.render.bind(this),this.render()}return _createClass(Ruler,[{key:"getTouchCords",value:function(e){var rect=this.canvas.getBoundingClientRect();return v2((e.touches[0].clientX-rect.left)*getDpr(),(e.touches[0].clientY-rect.top)*getDpr())}},{key:"getMouseCords",value:function(e){var rect=this.canvas.getBoundingClientRect();return v2((e.clientX-rect.left)*getDpr(),(e.clientY-rect.top)*getDpr())}},{key:"render",value:function(){if(this.left!==this.prevLeft||this.right!==this.prevRight){var ctx=this.canvas.getContext("2d");ctx.clearRect(0,0,this.width,this.height),ctx.fillStyle=withAlpha(this.theme.get("border2"),.2),ctx.fillRect(0,0,this.width*this.left,this.height),ctx.fillRect(this.width*this.right,0,this.width*(1-this.right),this.height),ctx.fillStyle=withAlpha(this.theme.get("border2"),.5),ctx.fillRect(this.width*this.left,0,this.width*(this.right-this.left),this.borderTop),ctx.fillRect(this.width*this.left,this.height-this.borderTop,this.width*(this.right-this.left),this.borderTop),ctx.fillRect(this.width*this.left,0,this.borderSide,this.height),ctx.fillRect(this.width*this.right-this.borderSide,0,this.borderSide,this.height),this.prevLeft=this.left,this.prevRight=this.right}requestAnimFrame(this.render)}},{key:"setEvents",value:function(){this.canvas.addEventListener("mousedown",this.handleDown.bind(this,this.getMouseCords),!1),document.addEventListener("mouseup",this.handleUp.bind(this,this.getMouseCords),!1),document.addEventListener("mousemove",this.handleMove.bind(this,this.getMouseCords),!1),this.canvas.addEventListener("touchstart",this.handleDown.bind(this,this.getTouchCords),!1),this.canvas.addEventListener("touchend",this.handleUp.bind(this,this.getTouchCords),!1),this.canvas.addEventListener("touchmove",this.handleMove.bind(this,this.getTouchCords),!1),this.noBodyScroll()}},{key:"noBodyScroll",value:function(){}},{key:"handleDown",value:function(getCords,e){var cords=getCords(e);this.downState={cords:cords,left:this.left,right:this.right},inRect(cords.x,cords.y,{left:this.width*this.left+3*this.borderSide,right:this.width*this.right-3*this.borderSide,top:0,bottom:this.height})?this.mainDown=!0:inRect(cords.x,cords.y,{left:this.width*this.left-this.touchAreaWidth,right:this.width*this.left+3*this.borderSide,top:0,bottom:this.height})?this.leftDown=!0:inRect(cords.x,cords.y,{left:this.width*this.right-3*this.borderSide,right:this.width*this.right+this.touchAreaWidth,top:0,bottom:this.height})&&(this.rightDown=!0)}},{key:"handleUp",value:function(){this.leftDown=this.rightDown=this.mainDown=!1}},{key:"handleMove",value:function(getCords,e){var cords=getCords(e);if(this.leftDown){var offset=sub(cords,this.downState.cords).x,left=(this.width*this.downState.left+offset)/this.width;this.left=Math.max(0,Math.min(this.right-this.minMainArea,left)),this.handleChange(this.left,this.right)}if(this.rightDown){var _offset=sub(cords,this.downState.cords).x,right=(this.width*this.downState.right+_offset)/this.width;this.right=Math.min(1,Math.max(this.left+this.minMainArea,right)),this.handleChange(this.left,this.right)}if(this.mainDown){var _offset2=sub(cords,this.downState.cords).x;this.width*this.downState.left+_offset2<0&&(_offset2=-this.width*this.downState.left),this.width*this.downState.right+_offset2>this.width&&(_offset2=this.width*(1-this.downState.right));var _left=(this.width*this.downState.left+_offset2)/this.width,_right=(this.width*this.downState.right+_offset2)/this.width;_left>=0&&_right<=1&&(this.left=_left,this.right=_right,this.handleChange(this.left,this.right))}}},{key:"handleChange",value:function(left,right){this.onChange&&this.onChange(Math.max(0,left),Math.min(1,right))}}]),Ruler}();_createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}();function _defineProperty(obj,key,value){return key in obj?Object.defineProperty(obj,key,{value:value,enumerable:!0,configurable:!0,writable:!0}):obj[key]=value,obj}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}var ChartCanvas=function(){function ChartCanvas(_ref){var width=_ref.width,height=_ref.height,data=_ref.data,hasRulers=_ref.hasRulers,p0=_ref.p0,p1=_ref.p1,theme=_ref.theme;for(var c in _classCallCheck(this,ChartCanvas),this.hasRulers=hasRulers,this.colors=data.colors,this.rgbaColors={},data.colors)this.rgbaColors[c]=hexToRgbA(data.colors[c]);this.theme=theme,this.prevThemeName=this.theme.getName(),this.names=data.names,this.lines={},data.columns.forEach(function(line){var _this=this,name=line[0],values=line.slice(1);"line"===data.types[name]?this.lines[name]=values:"x"===data.types[name]&&(this.xOffset=values[0],this.xDates=values.map(function(v){return formatDate(v)}),this.x=values.map(function(v){return v-_this.xOffset}),this.xFirst=0,this.xLast=this.x[this.x.length-1],this.xSize=this.xLast-this.xFirst)},this),this.linesEnabled=Object.keys(data.names).reduce(function(all,key){return all[key]=!0,all},{}),this.linesChanged=!1,this.width=width,this.canvas=createCanvas(width,height),this.tooltipCanvas=createCanvas(width,height),this.context2d=this.canvas.getContext("2d"),this.tooltipContext2d=this.tooltipCanvas.getContext("2d"),this.plotAreaPadding=this.hasRulers?v2(0,50*getDpr()):v2(0,0),this.plotArea=v2(this.canvas.width-2*this.plotAreaPadding.x,this.canvas.height-2*this.plotAreaPadding.y),this.yRangeSteps=5,this.xRangeSteps=6,this.stepsScale=stepsScale(0,this.x.length-1,this.xRangeSteps),this.p0=p0,this.p1=p1,this.iHover=null,this.setFromPct(p0,p1),this.setFromPct(p0,p1),this.setPlotPoints(),this.prevYRulers=[],this.yRulers=splitRange(0,this.sourceHeight,this.yRangeSteps),this.xRulers=rangeSteps(this.i0,this.i1,1,this.xRangeSteps),this.xRulersIn=[],this.xRulersOut=[],this.timings={},this.animations=[],this.lastUpdate=Date.now(),this.hasRulers&&(this.setEvents(),this.noBodyScroll()),this.update=this.update.bind(this),this.render(),this.update()}return _createClass(ChartCanvas,[{key:"setEvents",value:function(){var mCords=this.getMouseCords.bind(this),tCords=this.getTouchCords.bind(this);this.tooltipCanvas.addEventListener("mousemove",this.touchMove.bind(this,mCords)),this.tooltipCanvas.addEventListener("mouseout",this.touchEnd.bind(this,mCords)),this.tooltipCanvas.addEventListener("touchmove",this.touchMove.bind(this,tCords)),this.tooltipCanvas.addEventListener("touchend",this.touchEnd.bind(this,tCords))}},{key:"touchMove",value:function(getCords,e){var cords=getCords(e),anyLineName=Object.keys(this.lines)[0],anyLine=this.plotPoints[anyLineName],delta=(anyLine[2][1].x-anyLine[1][1].x)/2,hInd=anyLine.findIndex(function(ip){return null!==ip[0]&&(ip[1].x>=cords.x-delta&&ip[1].x<=cords.x+delta)});this.iHover=-1!==hInd?hInd:null}},{key:"getTouchCords",value:function(e){var rect=this.tooltipCanvas.getBoundingClientRect();return v2((e.touches[0].clientX-rect.left)*getDpr(),(e.touches[0].clientY-rect.top)*getDpr())}},{key:"getMouseCords",value:function(e){var rect=this.tooltipCanvas.getBoundingClientRect();return v2((e.clientX-rect.left)*getDpr(),(e.clientY-rect.top)*getDpr())}},{key:"touchEnd",value:function(){this.iHover=null}},{key:"noBodyScroll",value:function(){var canvas=this.tooltipCanvas;document.body.addEventListener("touchstart",function(e){e.target===canvas&&e.preventDefault()},!1),document.body.addEventListener("touchend",function(e){e.target===canvas&&e.preventDefault()},!1),document.body.addEventListener("touchmove",function(e){e.target===canvas&&e.preventDefault()},!1)}},{key:"setRange",value:function(p0,p1){this.p0=p0,this.p1=p1}},{key:"setLineEnabled",value:function(name,isEnabled){this.prevLinesEnabled=this.linesEnabled,this.linesEnabled=Object.assign({},this.linesEnabled,_defineProperty({},name,isEnabled)),this.timing("line:"+name,timing(600)),this.linesChanged=!0}},{key:"setFromPct",value:function(){var isShift=!1;Number.isFinite(this.prevP0)&&Number.isFinite(this.prevP1)&&(isShift=this.p0-this.prevP0==this.p1-this.prevP1),this.prevP0=this.p0,this.prevP1=this.p1,this.prevX0=this.x0,this.prevX1=this.x1,this.prevI0=this.i0,this.prevI1=this.i1,this.prevSourceHeight=this.sourceHeight;var _0=this.getXI(this.p0);this.x0=_0[0],this.i0=_0[1];var _1=this.getXI(this.p1);this.x1=_1[0],this.i1=_1[1],isShift&&(this.i1=this.i0+this.prevI1-this.prevI0),this.sourceHeight=this.getMaxHeight(this.prevSourceHeight),this.sourceOffset=v2(this.x0,0),this.sourceArea=v2(this.x1-this.x0,this.sourceArea?this.sourceArea.y:this.sourceHeight),this.factor=map(this.sourceArea,this.plotArea)}},{key:"setPlotPoints",value:function(){var self=this;this.plotPoints=Object.keys(this.lines).reduce(function(all,name){return all[name]=self.setLinePlotPoints(name),all},{})}},{key:"setLinePlotPoints",value:function(name){for(var points=[],xs=this.x.slice(this.i0,this.i1+1),ys=this.lines[name].slice(this.i0,this.i1+1),i=0;i<xs.length;i++){var plotPoint=ints(add(invertY(scale(sub(v2(xs[i],ys[i]),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding));points.push([this.i0+i,plotPoint])}return this.i0>0&&points.unshift([null,ints(add(invertY(scale(sub(v2(this.x0,linePoint(v2(this.x[this.i0-1],this.lines[name][this.i0-1]),v2(this.x[this.i0],this.lines[name][this.i0]),this.x0).y),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding))]),this.i1<this.lines[name].length-2&&points.push([null,ints(add(invertY(scale(sub(v2(this.x1,linePoint(v2(this.x[this.i1],this.lines[name][this.i1]),v2(this.x[this.i1+1],this.lines[name][this.i1+1]),this.x1).y),this.sourceOffset),this.factor),this.plotArea),this.plotAreaPadding))]),points}},{key:"getXI",value:function(p){var x=Math.round(this.xFirst+this.xSize*p),i=this.x.findIndex(function(v){return v>=x});return[x,i]}},{key:"fps",value:function(){}},{key:"timing",value:function(name,value){return value&&(this.timings[name]=value),this.timings[name]}},{key:"animation",value:function(name,fn){this.animations[name]=fn}},{key:"updateTimings",value:function(){var prevUpdate=this.lastUpdate;this.lastUpdate=Date.now();var delta=this.lastUpdate-prevUpdate,changed=!1;for(var k in this.timings){this.timings[k]()!==this.timings[k](delta)&&(changed=!0)}for(var _k in this.animations){var anim=this.animations[_k];if(anim)!0===anim.call(this)&&(this.animations[_k]=null)}return changed}},{key:"inputChanged",value:function(){return this.prevP0!==this.p0||this.prevP1!==this.p1}},{key:"getActiveLines",value:function(){var result={};for(var k in this.linesEnabled)this.linesEnabled[k]&&(result[k]=!0);return result}},{key:"getMaxHeight",value:function(defaultValue){var arrays=Object.keys(this.lines).filter(function(key){return this.linesEnabled[key]},this).map(function(key){return this.lines[key]},this);return arrays.length?splitRange(0,arraysMaxValue(arrays,this.i0,this.i1),this.yRangeSteps)[this.yRangeSteps]:defaultValue}},{key:"update",value:function(){(this.updateTimings()||this.inputChanged()||this.linesChanged||this.theme.getName()!==this.prevThemeName)&&(this.setFromPct(),this.setPlotPoints(),this.prevX0===this.x0&&this.prevX1===this.x1||this.handleXRangeChanged(this.i0,this.i1),this.sourceHeight!==this.prevSourceHeight&&this.handleYRangeChanged(),this.prevP0=this.p0,this.prevP1=this.p1,this.prevX0=this.x0,this.prevX1=this.x1,this.prevLinesEnabled=this.linesEnabled,this.prevSourceHeight=this.sourceHeight,this.prevI0=this.i0,this.prevI1=this.i1,this.linesChanged=!1,this.prevThemeName=this.theme.getName(),this.render()),this.renderTooltip(),requestAnimFrame(this.update)}},{key:"handleXRangeChanged",value:function(){var _this2=this,wt=this.timing("changeWidth");wt&&1!==wt()||this.timing("changeWidth",timing(500,this.handleWidthTimingDone.bind(this)));for(var newSteps=[],from=this.i0%2?this.i0+1:this.i0,to=this.i1%2?this.i1+1:this.i1,i=0;i<this.stepsScale.length;i++){var steps=this.stepsScale[i].filter(function(v){return v>=from&&v<=to});if(steps.length>this.xRangeSteps+1)break;newSteps=steps}newSteps.length&&(this.xRulersOut=this.xRulersOut.concat(this.xRulers.filter(function(v){return-1===newSteps.indexOf(v)})),this.xRulersIn=newSteps.filter(function(v){return-1===_this2.xRulers.indexOf(v)}),this.xRulers=this.xRulers.filter(function(v){return-1!==newSteps.indexOf(v)}))}},{key:"handleWidthTimingDone",value:function(){this.xRulers=this.xRulers.concat(this.xRulersIn),this.xRulersOut=[],this.xRulersIn=[]}},{key:"handleYRangeChanged",value:function(){var t=this.timing("changeHeight",timing(600)),current=this.sourceArea.y;this.prevYRulers=this.yRulers,this.yRulers=splitRange(0,this.sourceHeight,this.yRangeSteps),this.animation("lines",function(){var tv=t();return this.sourceArea.y=animated(current,this.sourceHeight,easeInOutQuart(tv)),this.factor=map(this.sourceArea,this.plotArea),1===tv})}},{key:"render",value:function(){this.context2d.clearRect(0,0,this.plotArea.x+2*this.plotAreaPadding.x,this.plotArea.y+2*this.plotAreaPadding.y),this.hasRulers&&(this.renderYRulers(),this.renderXRulers()),this.renderLines(),this.fps()}},{key:"renderLines",value:function(){Object.keys(this.lines).forEach(function(name){this.renderLine(name)},this)}},{key:"renderLine",value:function(name){var points=this.plotPoints[name],t=this.timing("line:"+name),alpha=t?t():1;this.context2d.beginPath(),this.context2d.strokeStyle=withAlpha(this.rgbaColors[name],easeInOutQuart(this.linesEnabled[name]?alpha:1-alpha)),this.context2d.lineWidth=2.5*getDpr();for(var i=0;i<points.length;i++){var p=points[i][1];0===i?this.context2d.moveTo(p.x,p.y):this.context2d.lineTo(p.x,p.y)}this.context2d.stroke()}},{key:"renderXRulers",value:function(){var _this3=this,t=this.timing("changeWidth"),tv=t?t():1;this.xRulersIn.forEach(function(r){return _this3.renderXRuler(r,easeInQuart(tv))}),this.xRulersOut.forEach(function(r){return _this3.renderXRuler(r,1-easeInQuart(tv))}),this.xRulers.forEach(function(r){return _this3.renderXRuler(r,1)})}},{key:"renderXRuler",value:function(i,alpha){var x=this.x[i],label=this.xDates[i],v=scale(sub(v2(x,0),this.sourceOffset),this.factor);this.context2d.font="28px Arial",this.context2d.fillStyle=withAlpha(this.theme.get("rulerName"),alpha),this.context2d.fillText(label,v.x,this.plotArea.y+this.plotAreaPadding.y+40)}},{key:"renderYRulers",value:function(){var _this4=this,t=this.timing("changeHeight"),tv=t?t():1;this.yRulers.forEach(function(r){return _this4.renderYRuler(r,easeInQuad(tv))}),this.prevYRulers.forEach(function(r){return _this4.renderYRuler(r,easeInQuad(1-tv))})}},{key:"renderYRuler",value:function(y,alpha){this.context2d.beginPath(),this.context2d.strokeStyle=withAlpha(this.theme.get("border"),alpha),this.context2d.lineWidth=1*getDpr();var rv=add(invertY(scale(v2(0,y),this.factor),this.plotArea),this.plotAreaPadding);this.context2d.moveTo(20,rv.y),this.context2d.lineTo(this.plotArea.x,rv.y),this.context2d.stroke(),this.context2d.font="28px Arial",this.context2d.fillStyle=withAlpha(this.theme.get("rulerName"),alpha),this.context2d.fillText(String(Math.ceil(y)),30,rv.y-18)}},{key:"renderTooltip",value:function(){if(this.tooltipContext2d.clearRect(0,0,this.plotArea.x+2*this.plotAreaPadding.x,this.plotArea.y+2*this.plotAreaPadding.y),Number.isFinite(this.iHover)){var activeLines=this.getActiveLines(),lineNames=Object.keys(activeLines);if(lineNames.length){var self=this,anyLine=lineNames[0],points=lineNames.reduce(function(all,name){var pp=self.plotPoints[name][self.iHover];return all[name]={p:pp[1],value:self.lines[name][pp[0]],date:self.xDates[pp[0]]},all},{}),anyPoint=points[anyLine],ctx=this.tooltipContext2d;ctx.beginPath(),ctx.strokeStyle=withAlpha(this.theme.get("border"),1),ctx.lineWidth=1*getDpr(),ctx.moveTo(anyPoint.p.x,0+this.plotAreaPadding.y),ctx.lineTo(anyPoint.p.x,this.plotArea.y+this.plotAreaPadding.y),ctx.stroke(),ctx.lineWidth=2*getDpr(),Object.keys(points).forEach(function(name){var p=points[name].p,t=this.timing("line:"+name),alpha=t?t():1;ctx.fillStyle=withAlpha(this.theme.get("bg"),this.linesEnabled[name]?1:1-alpha),ctx.strokeStyle=withAlpha(this.rgbaColors[name],easeInOutQuart(this.linesEnabled[name]?alpha:1-alpha)),ctx.beginPath(),ctx.arc(p.x,p.y,4*getDpr(),0,2*Math.PI),ctx.fill(),ctx.stroke()},this);var rectWidth=130*getDpr(),rectHeight=50*getDpr()*(Math.ceil(lineNames.length/1)+1),rectX=points[anyLine].p.x+rectWidth>this.width?points[anyLine].p.x-rectWidth-30:points[anyLine].p.x+30,r=40;ctx.strokeStyle=withAlpha(this.theme.get("border"),1),ctx.lineWidth=1*getDpr(),ctx.fillStyle=withAlpha(this.theme.get("bg")),ctx.beginPath(),ctx.moveTo(rectX+r,10),ctx.lineTo(rectX+rectWidth-r,10),ctx.quadraticCurveTo(rectX+rectWidth,10,rectX+rectWidth,50),ctx.lineTo(rectX+rectWidth,10+rectHeight-r),ctx.quadraticCurveTo(rectX+rectWidth,10+rectHeight,rectX+rectWidth-r,10+rectHeight),ctx.lineTo(rectX+r,10+rectHeight),ctx.quadraticCurveTo(rectX,10+rectHeight,rectX,10+rectHeight-r),ctx.lineTo(rectX,50),ctx.quadraticCurveTo(rectX,10,rectX+r,10),ctx.fill(),ctx.stroke(),ctx.font="28px Arial",ctx.fillStyle=withAlpha(this.theme.get("main"),1),ctx.fillText(anyPoint.date,rectX+rectWidth/2-50,60),Object.keys(points).forEach(function(name,i){var point=points[name];ctx.fillStyle=withAlpha(this.rgbaColors[name],1),ctx.font="36px Arial";var itemY=110+90*Math.floor(i/1),itemX=rectX+50+i%1*150;ctx.fillText(point.value,itemX,itemY),ctx.font="28px Arial",ctx.fillText(this.names[name],itemX,itemY+34)},this)}}}}]),ChartCanvas}(),theme=new Theme({light:{bg:"white",main:"black",rulerName:hexToRgbA("#8f9092"),border:hexToRgbA("#a0a0a0"),border2:hexToRgbA("#000000")},dark:{bg:"#242f3d",main:"white",rulerName:hexToRgbA("#818c98"),border:hexToRgbA("#425061"),border2:hexToRgbA("#000000")}});function chartAt(parent,data){var element=document.createElement("div");element.classList.add("chart"),element.innerHTML="\n            <div class='chart-header'>Followers</div>\n            <div class='chart-main-canvas'></div>\n            <div class='chart-ruler'></div>\n            <div class='chart-buttons'></div>\n        ";var rect=parent.getBoundingClientRect(),width=rect.width,height=width*(2/3),mainCanvas=new ChartCanvas({width:width,height:height,data:data,hasRulers:!0,p0:.3,p1:.6,theme:theme}),rulerCanvas=new ChartCanvas({width:width,height:50,data:data,hasRulers:!1,p0:0,p1:1,theme:theme}),ruler=new Ruler({width:rect.width*getDpr(),height:50*getDpr(),theme:theme,left:.3,right:.6,minMainArea:.03,touchAreaWidth:30,onChange:function(min,max){mainCanvas.setRange(min,max)}});ruler.canvas.style.width=rect.width+"px",ruler.canvas.style.height="50px";var buttons=new Buttons(data,function(name,value){mainCanvas.setLineEnabled(name,value),rulerCanvas.setLineEnabled(name,value)}),$main=$(".chart-main-canvas",element);$main.appendChild(mainCanvas.canvas),$main.appendChild(mainCanvas.tooltipCanvas),$main.style.height=height+"px";var $chartRuler=$(".chart-ruler",element);$chartRuler.appendChild(rulerCanvas.canvas),$chartRuler.appendChild(ruler.canvas),$(".chart-buttons",element).appendChild(buttons.element),parent.appendChild(element)}theme.activate("dark");var container=document.getElementById("container");window.data.forEach(function(data){chartAt(container,data)});
