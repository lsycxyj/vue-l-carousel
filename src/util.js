/* global getComputedStyle window */
const win = window,
	simpleSelectorRE = /^[\w-]*$/,
	cssNumber = {
		'column-count': 1,
		columns: 1,
		'font-weight': 1,
		'line-height': 1,
		opacity: 1,
		'z-index': 1,
		zoom: 1,
	},

	emptyArr = [],
	slice = emptyArr.slice,

	round = Math.round;

function type(o) {
	return typeof o;
}

function isArr(o) {
	return o instanceof Array;
}

function isStr(o) {
	return type(o) == 'string';
}

function qsa(element, selector) {
	// From Zepto
	/* eslint no-nested-ternary: 0 no-cond-assign: 0  */
	let found;
	const maybeID = selector[0] == '#',
		maybeClass = !maybeID && selector[0] == '.',
		// Ensure that a 1 char tag name still gets checked
		nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
		isSimple = simpleSelectorRE.test(nameOnly);
	// Safari DocumentFragment doesn't have getElementById
	return (element.getElementById && isSimple && maybeID) ?
		((found = element.getElementById(nameOnly)) ? [found] : []) :
		(element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
			slice.call(
				// DocumentFragment doesn't have getElementsByClassName/TagName
				isSimple && !maybeID && element.getElementsByClassName ?
					// If it's simple, it could be a class
					maybeClass ? element.getElementsByClassName(nameOnly) :
						element.getElementsByTagName(selector) : // Or a tag
					element.querySelectorAll(selector), // Or it's not simple, and we need to query all
			);
}

function each(elements, callback) {
	for (let i = 0, len = elements.length, element; i < len; i++) {
		element = elements[i];
		callback.call(element, element, i);
	}
}

function on(element, ev, callback) {
	if (isStr(ev)) {
		element.addEventListener(ev, callback);
	}
	else if (isArr(ev)) {
		each(ev, e => on(element, e, callback));
	}
}

function off(element, ev, callback) {
	if (isStr(ev)) {
		element.removeEventListener(ev, callback);
	}
	else if (isArr(ev)) {
		each(ev, e => off(element, e, callback));
	}
}

function one(element, ev, callback) {
	function handler(...args) {
		callback.apply(this, args);
		off(element, ev, handler);
	}

	on(element, ev, handler);
}

function attr(element, name) {
	return element.getAttribute(name);
}

function children(element) {
	return element.childNodes;
}

function append(element, target) {
	element.appendChild(target);
}

function prepend(element, target) {
	const childNodes = children(element);
	if (childNodes.length > 0) {
		element.insertBefore(target, childNodes[0]);
	}
	else {
		append(element, target);
	}
}

function clone(element, deep) {
	return element.cloneNode(deep);
}

function className(element, value) {
	var klass = element.className || '',
		svg = klass && klass.baseVal !== undefined;

	if (value === undefined) return svg ? klass.baseVal : klass;
	if (svg) {
		klass.baseVal = value;
	}
	else {
		element.className = value;
	}
}

function addClass(element, classname) {
	var classList = element.classList;
	if (classList) {
		element.classList.add(classname);
	}
	else {
		const cls = className(element).split(' '),
			map = {};
		each(cls, (klass) => {
			map[klass] = true;
		});

		if (!map[classname]) {
			className(element, cls.join(' ') + classname);
		}
	}
}

function remove(element) {
	const $parent = element.parentNode;
	if ($parent) {
		$parent.removeChild(element);
	}
}

function camelize(str) {
	return str.replace(/-+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''));
}

function dasherize(str) {
	return str.replace(/::/g, '/')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.replace(/([a-z\d])([A-Z])/g, '$1_$2')
		.replace(/_/g, '-')
		.toLowerCase();
}

function maybeAddPx(name, value) {
	return (type(value) == 'number' && !cssNumber[dasherize(name)]) ? `${value}px` : value;
}

function css(element, property, value) {
	/* eslint consistent-return: 0 */
	const elementSytle = element.style;
	if (arguments.length < 3) {
		return elementSytle[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property);
	}
	else if (!value && value !== 0) {
		elementSytle.removeProperty(dasherize(property));
	}
	else {
		elementSytle[dasherize(property)] = maybeAddPx(property, value);
	}
}

function offset(element) {
	const obj = element.getBoundingClientRect();
	return {
		left: obj.left + win.pageXOffset,
		top: obj.top + win.pageYOffset,
		width: round(obj.width),
		height: round(obj.height),
	};
}

function width(element) {
	return offset(element).width;
}

export const $ = {
	qsa,
	on,
	off,
	one,
	type,
	isArr,
	isStr,
	append,
	prepend,
	clone,
	addClass,
	remove,
	children,
	attr,
	css,
	each,
	offset,
	width,
};
