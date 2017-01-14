//Use fastclick as "tap" library. But it must be gloablly declared.
var EV_CLICK = 'click',
	win = window,
	FastClick = win.FastClick,
	hasFastClick = !!FastClick,
	hasTouch = !!('ontouchstart' in win || navigator.maxTouchPoints),
	bindFn, unbindFn, removeHandler;

function onClick(e, el, binding){
	var value = binding.value,
		cb = value && value.cb;
	if(cb) {
		cb.call(el, e);
	}
}

if(hasTouch && hasFastClick) {
	removeHandler = function(el){
		var fclickCB = el._fclickCB,
			fclickIns = el._fclickIns;
		if(fclickCB){
			el.removeEventListener(EV_CLICK, fclickCB);
			el._fclickCB = null;
		}
		if(fclickIns){
			fclickIns.destory();
			el.fclickIns = null;
		}
	};
	bindFn = function(el, binding){
		removeHandler(el);
		el._fclickIns = FastClick.attach(el);
		var fclickCB = el._fclickCB = function(e){
			onClick.call(this, e, el, binding);
		};
		el.addEventListener(EV_CLICK, fclickCB);
	};
	unbindFn = function(el){
		removeHandler(el);
	};
}
else {
	removeHandler = function(el){
		var fclickCB = el._fclickCB;
		if(fclickCB){
			el.removeEventListener(EV_CLICK, fclickCB);
			el._fclickCB = null;
		}
	};
	bindFn = function(el, binding){
		removeHandler(el);
		var fclickCB = el._fclickCB = function(e){
			onClick.call(this, e, el, binding);
		};
		el.addEventListener(EV_CLICK, fclickCB);
	};
	unbindFn = function(el){
		removeHandler(el);
	};
}

export default {
	bind: bindFn,
	unbind: unbindFn
};
