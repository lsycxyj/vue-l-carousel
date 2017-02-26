<style lang="less">
	.v-carousel {
		&-items {
			overflow: hidden;
		}
		&-dots {
			position: absolute;
			bottom: 10px;
			left: 0;
			width: 100%;
			text-align: center;
		}
		&-dot {
			&.active {
				background: #000;
				cursor: default;
			}
			cursor: pointer;
			display: inline-block;
			width: 10px;
			height: 10px;
			margin: 0 5px;
			border-radius: 5px;
			background: rgba(0, 0, 0, .5);
		}
		&-nav {
			&.prev {
				left: 0;
			}
			&.next {
				right: 0;
			}
			@h: 30px;
			cursor: pointer;
			position: absolute;
			line-height: @h;
			color: #FFF;
			padding: 0 5px;
			background: rgba(0, 0, 0, .5);
			top: 50%;
			margin-top: -@h / 2;
		}
		width: 100%;
		overflow: hidden;
		position: relative;
	}
</style>

<template>
	<!--
		Don't use v-bind to bind events which are not available,
		Otherwise Vue will go on rendering with many bugs sliently as in many other places.
	-->
	<div class="v-carousel">
		<slot name="before"></slot>
		<div class="v-carousel-items">
			<slot></slot>
		</div>
		<div class="v-carousel-dots" :style="dotsStyle" v-if="dots">
			<div :class="{'v-carousel-dot': true, 'active': activeIndex==index}" @click="to(index)"
				 v-for="(item, index) in watchItems"></div>
		</div>
		<div class="v-carousel-nav prev" @click="prev" v-show="hasLoop || (itemsLen > 1 && activeIndex > 0)"
			 v-html="prevHtml"></div>
		<div class="v-carousel-nav next" @click="next" v-show="hasLoop || (itemsLen > 1 && activeIndex < itemsLen - 1)"
			 v-html="nextHtml"></div>
		<slot name="after"></slot>
	</div>
</template>

<script>
/* global window */
import { $ } from './util';

const win = window,
	navigator = win.navigator,
	String = win.String,
	Number = win.Number,
	Boolean = win.Boolean,
	ua = navigator.userAgent || navigator.appVersion,
	/* eslint no-nested-ternary: 0 */
	vendor = (/webkit/i).test(ua) ? 'webkit' : (/firefox/i).test(ua) ? 'moz' : 'opera' in win ? 'o' : '',
	cssVendor = vendor ? `-${vendor.toLowerCase()}-` : '',

	PROP_TRANSITION = `${cssVendor}transition`,
	PROP_TRANSFORM = `${cssVendor}transform`,

	hasTouch = !!('ontouchstart' in win || navigator.maxTouchPoints),

	DIR_PREV = 'prev',
	DIR_NEXT = 'next',

	// unable to detect the exact event
	EV_TRANSITION_END = ['transitionend', 'OTransitionEnd', 'webkitTransitionEnd'],

	EV_TOUCH_START = 'touchstart',
	EV_TOUCH_END = 'touchend',
	EV_TOUCH_MOVE = 'touchmove',

	EV_MOUSE_ENTER = 'mouseenter',
	EV_MOUSE_LEAVE = 'mouseleave',

	EV_MOUSE_DOWN = 'mousedown',
	EV_MOUSE_UP = 'mouseup',
	EV_MOUSE_MOVE = 'mousemove',

	EV_RESIZE = 'resize',

	// Custom events
	EV_CHANGED_INDEX = 'changed-index',
	EV_RENDER_UPDATED = 'render-updated',
	EV_NEXT = 'next',
	EV_PREV = 'prev',
	EV_TO = 'to';

	/*
	Events = {
		  EV_CHANGED_INDEX,
		  EV_RENDER_UPDATED,
		  EV_NEXT,
		  EV_PREV,
		  EV_TO
	},
	*/

const findNodes = $.qsa,
	bindEvent = $.on,
	unbindEvent = $.off,
	oneEvent = $.one,
	appendNode = $.append,
	prependNode = $.prepend,
	cloneNode = $.clone,
	removeNode = $.remove,
	addClass = $.addClass,
	getAttr = $.attr,
	doCSS = $.css,
	getWidth = $.width,
	getOffset = $.offset,
	each = $.each;

function roundUp(oVal) {
	return round(oVal, Math.ceil);
}

function roundDown(oVal) {
	return round(oVal, Math.floor);
}

function round(oVal, method) {
	const val = parseInt(oVal, 10);
	return method(val / 100) * 100;
}

/*
// named exports are not supported in *.vue files. Shoot! (╯°Д°)╯︵ ┻━┻
export {
	  Events
};
*/

export default {
	props: {
		// HTML content of the previous button.
		prevHtml: {
			type: String,
			default: '&lt;',
		},
		// HTML content of the enext button.
		nextHtml: {
			type: String,
			default: '&gt;',
		},
		// The time of the transition animation. In ms.
		speed: {
			type: Number,
			default: 300,
		},
		/*
			It can go to next/previous slide at the ends if it's set to true.
			It works only the items' length more than 1.
		*/
		loop: {
			type: Boolean,
			default: false,
		},
		/*
			Rewind to the other end instead of endless loop,
			but you can only go to the other end by previous or next button,
			if it's set to true. It works only loop is set to true.
		*/
		rewind: {
			type: Boolean,
			default: false,
		},
		// It can be drag by mouse if it's set to true.
		mouseDrag: {
			type: Boolean,
			default: false,
		},
		// Autoplay interval. In ms. 0 for no autoplay.
		auto: {
			type: Number,
			default: 0,
		},
		// Pagination is available if it's set to true.
		dots: {
			type: Boolean,
			default: true,
		},
		// Style of v-carousel-dots
		dotsStyle: {
			type: [Object, String, Array],
			default: '',
		},
		/*
			The original data list used to render the CarouselItems.
			The component will rerender if this property changes.
		*/
		watchItems: {
			type: Array,
			default() {
				return [];
			},
		},
	},
	data() {
		return {
			// It seems that key with symbols can't be accessced directly from vm.
			activeIndex: 0,
			animPaused: true,
			itemsLen: 0,
			slideCount: 0,
			hasLoop: false,
			autoTimer: null,
			// Nodes
			cloneItems: [],
			items: null,
			itemsWrap: null,
			// Callbacks
			transEndCB: null,
		};
	},
	mounted() {
		const me = this,

			$el = me.$el,
			$itemsWrap = findNodes($el, '.v-carousel-items')[0],

			updateRender = function () {
				me.updateRender();
				emitChangedIndex();
				emit(EV_RENDER_UPDATED);
			},
			checkDrag = me.checkDrag,
			adjRound = me.adjRound;

		me.itemsWrap = $itemsWrap;

		function watch(k, v) {
			me.$watch(k, v);
		}

		function listen(e, cb) {
			me.$on(e, cb);
		}

		function emit(e, v) {
			me.$emit(e, v);
		}

		function emitChangedIndex() {
			const index = me.activeIndex;
			emit(EV_CHANGED_INDEX, {
				index,
				total: me.itemsLen,
				item: me.watchItems[index],
			});
		}

		watch('watchItems', updateRender);
		watch('loop', updateRender);
		watch('rewind', updateRender);
		watch('mouseDrag', checkDrag);
		watch('auto', me.checkAuto);
		watch('activeIndex', emitChangedIndex);

		listen(EV_PREV, me.prev);
		listen(EV_NEXT, me.next);
		listen(EV_TO, (v) => {
			const nVal = parseInt(v, 10),
				itemsLen = me.itemsLen;
			if (!isNaN(v) && itemsLen > 0 && nVal >= 0 && nVal < itemsLen) {
				me.to(nVal);
			}
		});

		checkDrag();
		updateRender();
		adjRound();

		bindEvent(win, EV_RESIZE, adjRound);
		bindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
	},
	/*
		Although "updated" can be used to detect content changes,
		it'll bring too many changes which are not I want.
		So use $watch instead.
	*/
	destroyed() {
		const me = this,
			$itemsWrap = me.itemsWrap;
		unbindEvent(win, EV_RESIZE, me.adjRound);
		me.unbindDrag();
		unbindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
	},
	methods: {
		updateRender() {
			const me = this,

				loop = me.loop,
				watchItems = me.watchItems,
				itemsLen = watchItems.length,
				rewind = me.rewind,
				hasLoop = loop && itemsLen > 1,
				slideCount = hasLoop && !rewind ? itemsLen + 2 : itemsLen,

				$itemsWrap = me.itemsWrap;

			var $cloneItems = me.cloneItems,
				$items;

			// clean up
			if ($cloneItems.length > 0) {
				each($cloneItems, ($item) => {
					removeNode($item);
				});
				$cloneItems = [];
				me.cloneItems = $cloneItems;
			}

			$items = findNodes($itemsWrap, '.v-carousel-item');

			// create cloned nodes
			if (hasLoop && !rewind) {
				const firstNode = $items[0],
					lastNode = $items[itemsLen - 1],
					firstNodeCloned = cloneNode(firstNode, true),
					lastNodeCloned = cloneNode(lastNode, true);
				appendNode($itemsWrap, firstNodeCloned);
				prependNode($itemsWrap, lastNodeCloned);

				$cloneItems.push(firstNodeCloned);
				$cloneItems.push(lastNodeCloned);
				each($cloneItems, ($item) => {
					addClass($item, 'cloned');
				});

				$items = findNodes($itemsWrap, '.v-carousel-item');
			}

			me.hasLoop = hasLoop;
			me.itemsLen = itemsLen;
			me.slideCount = slideCount;
			me.items = $items;

			doCSS($itemsWrap, 'width', `${100 * slideCount}%`);
			each($items, (element) => {
				doCSS(element, 'width', `${100 / slideCount}%`);
			});

			me.rmAnim();
			me.adjRound();
			me.reset();
			me.addAnim();
			me.checkAuto();
		},
		reset() {
			const me = this;
			me.off();
			me.to(0);
		},
		checkDrag() {
			const me = this,
				mouseDrag = me.mouseDrag,
				itemsWrap = me.itemsWrap,
				startCB = me.startCB,

				EV_MOVE = [],
				EV_END = [];
			me.unbindDrag();

			if (mouseDrag) {
				// DragSnap support
				EV_MOVE.push(EV_MOUSE_MOVE);
				EV_END.push(EV_MOUSE_UP);
			}

			if (hasTouch) {
				EV_MOVE.push(EV_TOUCH_MOVE);
				EV_END.push(EV_TOUCH_END);
			}

			me.EV_MOVE = EV_MOVE;
			me.EV_END = EV_END;

			/* eslint no-unused-expressions: 0 */
			mouseDrag && bindEvent(itemsWrap, EV_MOUSE_DOWN, startCB);
			hasTouch && bindEvent(itemsWrap, EV_TOUCH_START, startCB);
		},
		unbindDrag() {
			const me = this;
			unbindEvent(me.itemsWrap, [EV_TOUCH_START, EV_MOUSE_DOWN], me.startCB);
		},
		checkAuto() {
			const me = this,
				auto = me.auto,

				turnOff = me.off,
				turnOn = me.on,

				$itemsWrap = me.itemsWrap;

			unbindEvent($itemsWrap, EV_MOUSE_ENTER, turnOff);
			unbindEvent($itemsWrap, EV_MOUSE_LEAVE, turnOn);
			unbindEvent($itemsWrap, [EV_TOUCH_START, EV_MOUSE_DOWN], turnOff);
			unbindEvent($itemsWrap, [EV_TOUCH_END, EV_MOUSE_UP], turnOn);

			turnOff();

			if (auto > 0) {
				bindEvent($itemsWrap, EV_MOUSE_ENTER, turnOff);
				bindEvent($itemsWrap, EV_MOUSE_LEAVE, turnOn);
				bindEvent($itemsWrap, [EV_TOUCH_START, EV_MOUSE_DOWN], turnOff);
				bindEvent($itemsWrap, [EV_TOUCH_END, EV_MOUSE_UP], turnOn);
				turnOn();
			}
		},
		rmAnim() {
			const me = this,
				$itemsWrap = me.itemsWrap;
			// reset reset animation
			doCSS($itemsWrap, PROP_TRANSITION, 'none');
			me.animPaused = true;
		},
		addAnim() {
			const me = this,
				$itemsWrap = me.itemsWrap;
			// Force to paint
			getOffset($itemsWrap);

			doCSS($itemsWrap, PROP_TRANSITION, `${PROP_TRANSFORM} ${me.speed / 1000}s ease`);
			me.animPaused = false;
		},
		on() {
			const me = this,
				hasLoop = me.hasLoop,
				itemsLen = me.itemsLen,
				auto = me.auto;
			me.off();
			if (itemsLen > 1 && auto > 0) {
				me.autoTimer = setInterval(() => {
					if (!hasLoop) {
						if (me.activeIndex == itemsLen - 1) {
							me.to(0);
						}
						else {
							me.next();
						}
					}
					else {
						me.next();
					}
				}, auto);
			}
		},
		off() {
			const me = this;
			if (me.autoTimer) {
				clearInterval(me.autoTimer);
				me.autoTimer = null;
			}
		},
		next() {
			this.nextPrev(DIR_NEXT);
		},
		prev() {
			this.nextPrev(DIR_PREV);
		},
		nextPrev(dir) {
			const me = this,
				hasLoop = me.hasLoop,
				rewind = me.rewind,
				itemsLen = me.itemsLen,
				lastItemIndex = itemsLen - 1,
				activeIndex = me.activeIndex;
			var index;

			if (dir == DIR_PREV) {
				if (activeIndex == 0) {
					if (hasLoop) {
						if (rewind) {
							index = lastItemIndex;
						}
						else {
							index = -1;
						}
					}
					else {
						return;
					}
				}
				else {
					index = activeIndex - 1;
				}
			}// next
			else if (activeIndex == itemsLen - 1) {
				if (hasLoop) {
					if (rewind) {
						index = 0;
					}
					else {
						index = itemsLen;
					}
				}
				else {
					return;
				}
			}
			else {
				index = activeIndex + 1;
			}
			me.to(index);
		},
		to(index) {
			const me = this,
				hasLoop = me.hasLoop,
				itemsLen = me.itemsLen,
				slideCount = me.slideCount,
				rewind = me.rewind,
				lastItemIndex = itemsLen - 1,

				removeAnimation = me.rmAnim,
				addAnimation = me.addAnim,
				go = me.to;

			var realIndex,
				onSlideEnd;

			if (hasLoop) {
				if (index == -1) {
					onSlideEnd = function () {
						removeAnimation();
						go(lastItemIndex);
						addAnimation();
					};
				}
				else if (index == itemsLen) {
					onSlideEnd = function () {
						removeAnimation();
						go(0);
						addAnimation();
					};
				}

				realIndex = !rewind ? index + 1 : index;
			}
			else {
				realIndex = index;
			}

			if (!onSlideEnd) {
				if (me.animPaused) {
					me.activeIndex = index;
				}
				else {
					onSlideEnd = function () {
						me.activeIndex = index;
					};
				}
			}

			me.transEndCB = onSlideEnd;
			me.transTo(realIndex * -100 / slideCount);
		},
		checkTrans() {
			const me = this,
				transEndCB = me.transEndCB;
			// only fire once
			if (transEndCB) {
				transEndCB();
				me.transEndCB = null;
			}
		},
		transTo(moveTo) {
			doCSS(this.itemsWrap, PROP_TRANSFORM, `translate3d(${moveTo}%,0,0)`);
		},
		startCB(e) {
			/* eslint no-use-before-define: 0 */
			const me = this,
				$el = me.$el,

				EV_MOVE = me.EV_MOVE,
				EV_END = me.EV_END,

				getEventData = me.getEv,
				removeAnimation = me.rmAnim,
				addAnimation = me.addAnim,
				transTo = me.transTo,
				getPercent = me.getPercent,

				data = getEventData(e),

				$itemsWrap = me.itemsWrap,
				elWidth = getWidth($el),
				currentPos = getCurrentPos($itemsWrap);

			var start = {
					time: Date.now(),
					coords: [
						data.pageX,
						data.pageY,
					],
					origin: $el,
					interacting: false,
				},
				stop,
				deltaX,
				deltaY;

			removeAnimation();

			function getCurrentPos($itemsWrap) {
				return getAttr($itemsWrap, 'style') != undefined ? getPercent($itemsWrap) : 0;
			}

			function moveHandler(e) {
				if (!start) return;

				const d = getEventData(e);
				stop = {
					time: Date.now(),
					coords: [
						d.pageX,
						d.pageY,
					],
				};

				deltaX = Math.abs(start.coords[0] - stop.coords[0]);
				deltaY = Math.abs(start.coords[1] - stop.coords[1]);

				// move threashold
				if (deltaX < deltaY || deltaY > 10 || deltaX < 3) {
					return;
				}


				// prevent scrolling
				if (deltaX >= 3) {
					start.interacting = true;
					const percent = currentPos + ((stop.coords[0] - start.coords[0])
						/ elWidth * 100 / me.slideCount);
					transTo(percent);
					e.preventDefault();
				}
			}

			function snapback($itemsWrap, left) {
				const slideCount = me.slideCount,
					currentPos = getCurrentPos($itemsWrap) * slideCount,
					percent = (left ? roundUp(currentPos) : roundDown(currentPos)) / slideCount;

				transTo(percent);
			}

			function dragsnap(dir) {
				me.nextPrev(dir);
			}


			bindEvent($itemsWrap, EV_MOVE, moveHandler);
			oneEvent($itemsWrap, EV_END, (e) => {
				const activeIndex = me.activeIndex;
				unbindEvent($itemsWrap, EV_MOVE, moveHandler);

				addAnimation();

				if (start && stop) {
					const deltaX = Math.abs(start.coords[0] - stop.coords[0]),
						deltaY = Math.abs(start.coords[1] - stop.coords[1]),
						left = start.coords[0] > stop.coords[0],
						jumppoint = elWidth / 4;

					// move threashold
					if (deltaX > 20 && (deltaX > deltaY)) {
						e.preventDefault();
					}
					else {
						if (start.interacting) {
							snapback($itemsWrap, left);
						}
						return;
					}

					if (deltaX > jumppoint
						&& (me.hasLoop && !me.rewind
							|| !left && activeIndex > 0
							|| left && activeIndex < me.itemsLen - 1)) {
						dragsnap(left ? DIR_NEXT : DIR_PREV);
					}
					else {
						snapback($itemsWrap, left);
					}
				}
				start = stop = null;
			});
		},
		getEv(e) {
			var obj;
			if (e.targetTouches) {
				obj = e.targetTouches[0];
			}
			else {
				obj = e;
			}

			return obj;
		},
		getPercent(element) {
			return getAttr(element, 'style').match(/transform:.*translate3d.*\((.*[0-9].*)%/i) && parseFloat(RegExp.$1);
		},
		// Account for iOS safari rounding problems
		adjRound() {
			const me = this,
				$el = me.$el,
				$items = me.items,
				diff = $items && $items.length > 0 ? getWidth($el) - getWidth($items[0]) : 0;

			if (diff !== 0) {
				each($items, (element, i) => {
					doCSS(element, 'position', 'relative');
					doCSS(element, 'left', `${diff * i}px`);
				});
			}
		},
	},
};

</script>
