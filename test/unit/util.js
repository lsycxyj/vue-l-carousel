import Vue from 'vue';
import $ from 'jquery';
import simulant from 'simulant';

function type(o) {
	return typeof o;
}

function isArr(o) {
	return o instanceof Array;
}

function isStr(o) {
	return type(o) == 'string';
}


function destroyVM(vm) {
	if (vm) {
		let el = vm.$el;
		if (el && el.parentNode) {
			$(el).remove();
		}
	}
}

function createAndReplaceElem() {
	const el = document.createElement('div'),
		elBody = document.body,
		oEl = document.getElementById('app');
	if (oEl) {
		$(oEl).remove(oEl);
	}
	elBody.appendChild(el);
	return el;
}

function createVM(Compo, propsData = {}, mounted) {
	const nPropsData = {...propsData};
	const el = createAndReplaceElem();
	let VueExtended = Vue;
	if (isStr(Compo)) {
		nPropsData.template = Compo;
	}
	//Component
	else {
		VueExtended = Vue.extend(Vue);
	}
	return new VueExtended(nPropsData).$mount(mounted === false ? null : el)
}

function createVirtualPointer() {
	return {
		x: 0,
		y: 0,
		trigger(evtName) {
			const x = this.x,
				y = this.y;
			// TODO: I haven't found a good way to simulate touch events
			simulant.fire(document.elementFromPoint(x, y), evtName, {
				clientX: x,
				clientY: y,
				pageX: x,
				pageY: y,
				touches: [
					{
						pageX: x,
						pageY: y,
					}
				],
				targetTouches: [{
					pageX: x,
					pageY: y,
				}],
			});
			//$(document.elementFromPoint(x, y)).trigger($.Event(evtName, {
			//	pageX: x,
			//	pageY: y,
			//	targetTouches: [{
			//		pageX: x,
			//		pageY: y,
			//	}],
			//}));
		},
	}
}

function cssTextToObject(txt) {
	const result = {};
	txt.split(';').forEach((term) => {
		const splits = term.split(':');
		if(splits && splits.length == 2) {
			const key = splits[0].trim(),
				value = splits[1].trim();
			result[key] = value;
		}
	});
	return result;
}

export  {
	destroyVM,
	createAndReplaceElem,
	createVM,
	createVirtualPointer,
	cssTextToObject
};
