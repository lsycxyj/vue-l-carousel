//jQuery Lite
//Core
var 
	doc = document,
	simpleSelectorRE = /^[\w-]*$/, 

	z = {
		init(selector, context) {
			var dom;

			if(!selector) {
				return z.Z();
			}
			else if(isString(selector)) {
				if (context !== undefined) {
					return $(context).find(selector);
				}
				else {
					dom = z.qsa(doc, selector);
				}
			}
			else if (z.isZ(selector)) {
				return selector;
			}
			else {
				//Wrap DOM nodes
				dom = [selector];
			}

			return z.Z(dom, selector);
		},
		qsa(element, selector) {
			var found,
				maybeID = selector[0] == '#',
				maybeClass = !maybeID && selector[0] == '.',
				nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
				isSimple = simpleSelectorRE.test(nameOnly)
					return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
						( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
						(element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
						slice.call(
							isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
							maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
							element.getElementsByTagName(selector) : // Or a tag
							element.querySelectorAll(selector) // Or it's not simple, and we need to query all
						)
		},
		isZ(obj) {
			return obj instanceof Z;
		},
		Z(dom, selector) {
			return new Z(dom, selector);
		}
	},

	isArray = Array.isArray || function(arr) { return arr instanceof Array}

	fn;

function Z(dom, selector){
	var i, me = this, len = dom ? dom.length : 0;
	for (i = 0; i < len) me[i] = dom[i];
	me.length = len;
	me.selector = selector || '';
}

function $(selector, context) {
	return z.init(selector, context);
}

fn = $.fn = {
	length: 0,
	map(cb) {
	},
	find(selector) {
		var result, $this = this;

		if(!selector) {
			result = $();
		}
		else if($this.length == 1) {
			result = $(z.qsa($this[0], selector));
		}
		else {
			result = $this.map(function() {
				return z.qsa(this, selector);
			});
		}

		return result;
	},
	eq(idx) {
	}
};

$.prototype = Z.prototype = fn;

//helpers
function type(o) {
	return typeof o;
}

function each() {
}

function map() {
}

function isWindow(obj) {
	return obj != null && obj == obj.window;
}

function isObject(obj) {
	return type(obj) == 'object';
}

function isFunction(func) {
	return type(func) == 'function';
}

function isString(str) {
	return type(str) == 'string';
}

function extend(o, n) {
	return Object.assign(o, n);
}

function likeArray(obj) {
	var length = !!obj && 'length' in obj && obj.length,
		type = type(obj);
}

extend($, {
	isArray,
	type,
	isWindow,
	isObject,
	isFunction,
	isString,
	extend
});

//Event
fn.on = function(e, selector, data, callback) {
};

export $;
