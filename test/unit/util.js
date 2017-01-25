import Vue from 'vue';
import $ from '../../src/util';

function destroyVM(vm) {
	if (vm) {
		let el = vm.$el;
		if (el && el.parentNode) {
			$.remove(el);
		}
	}
}

function createAndReplaceElem() {
	const el = document.createElement('div'),
		elBody = document.body,
		oEl = document.getElementById('app');
	if (oEl) {
		$.remove(el);
	}
	elBody.appendChild(el);
	return el;
}

function createVM(Compo, propsData = {}, mounted) {
	const nPropsData = {...propsData};
	const el = createAndReplaceElem();
	let VueExtended = Vue;
	if ($.isStr(Compo)) {
		nPropsData.template = Compo;
	}
	//Component
	else {
		VueExtended = Vue.extend(Vue);
	}
	return new VueExtended(nPropsData).$mount(mounted === false ? null : el)
}

export  {
	destroyVM,
	createAndReplaceElem,
	createVM,
};
