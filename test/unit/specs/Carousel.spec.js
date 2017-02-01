// TODO not all tested

import $ from 'jquery';
import {Carousel, CarouselItem} from '../../../src/index';
import {cssTextToObject, createVM, destroyVM, createVirtualPointer} from '../util';

const EV_CHANGED_INDEX = 'changed-index',
	EV_RENDER_UPDATED = 'render-updated',
	EV_PREV = 'prev',
	EV_NEXT = 'next',
	EV_TO = 'to',

	EV_CLICK = 'click',
	EV_TOUCHSTART = 'touchstart',
	EV_TOUCHMOVE = 'touchmove',
	EV_TOUCHEND = 'touchend',
	EV_MOUSE_DOWN = 'mousedown',
	EV_MOUSE_MOVE = 'mousemove',
	EV_MOUSE_UP = 'mouseup',

	TIME_LAG = 100;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20 * 1000;

describe('Suite: test Carousel.vue', () => {
	const COMMON_SPEED_TIME = 300,
		COMMON_LIST = [
			{
				url: 'url1'
			},
			{
				url: 'url2'
			},
			{
				url: 'url3'
			}
		],
		COMMON_DATA = {
			prevHTML: '&lt;',
			nextHTML: '&gt;',
			speed: COMMON_SPEED_TIME,
			list: COMMON_LIST,
			loop: false,
			rewind: false,
			mouseDrag: false,
			auto: 0,
			dots: true,
			dotsStyle: '',
		},
		$body = $('body');
	let vm;

	$body.css({
		padding: 0,
		margin: 0,
	});

	//beforeEach(() => {
	//});
	//
	afterEach(() => {
		destroyVM(vm);
	});

	function setup(data) {
		destroyVM(vm);
		vm = createVM(
			`
				<div>
					<carousel ref="car" :watch-items="list" :prev-html="prevHTML" :next-html="nextHTML" :speed="speed" :loop="loop" :rewind="rewind" :mouseDrag="mouseDrag" :auto="auto" :dots="dots" :dots-style="dotsStyle">
						<carousel-item v-for="(item, index) in list">
							<p>CarouselItem{{index}}, URL is {{item.url}}</p>
						</carousel-item>
						<div slot="before">Insert node before</div>
						<div slot="after">Insert node after</div>
					</carousel>
				</div>
			`,
			{
				components: {
					'carousel': Carousel,
					'carousel-item': CarouselItem
				},
				...data,
			});
	}

	it('default behavior', (done) => {
		destroyVM(vm);
		vm = createVM(
			`
				<div>
					<carousel ref="car" :watchItems="list">
						<carousel-item v-for="(item, index) in list">
							<p>CarouselItem{{index}}, URL is {{item.url}}</p>
						</carousel-item>
					</carousel>
				</div>
			`,
			{
				components: {
					'carousel': Carousel,
					'carousel-item': CarouselItem
				},
				data() {
					return {
						list: COMMON_LIST
					};
				},
			});
		const $el = $(vm.$el),
			$elCarouselItems = $el.find('.v-carousel-items'),
			$elCarouselDots = $el.find('.v-carousel-dots'),
			$elCarouselItem = $elCarouselItems.find('.v-carousel-item'),
			$elCarouselDot = $elCarouselDots.find('.v-carousel-dot'),
			$prevBtn = $el.find('.v-carousel-nav.prev'),
			$nextBtn = $el.find('.v-carousel-nav.next'),
			refCar = vm.$refs.car;

		expect($elCarouselItems.length).toBe(1);
		expect($elCarouselDots.length).toBe(1);
		expect($elCarouselItem.length).toBe(COMMON_LIST.length);
		expect($elCarouselDot.length).toBe(COMMON_LIST.length);
		expect($prevBtn.html()).toBe('&lt;');
		expect($nextBtn.html()).toBe('&gt;');
		//no loop
		expect($prevBtn.css('display')).toBe('none');
		$elCarouselDot.each(function (i) {
			const $me = $(this);
			if (i == 0) {
				expect($me.hasClass('active')).toBe(true);
			}
			else {
				expect($me.hasClass('active')).toBe(false);
			}
		});
		//no auto
		expect(refCar.autoTimer).toBe(null);

		// animation speed
		new Promise((resolve, reject) => {
			refCar.$emit(EV_NEXT);
			expect(refCar.activeIndex).toBe(0);
			setTimeout(() => {
				expect(refCar.activeIndex).toBe(1);
				resolve();
			}, COMMON_SPEED_TIME + TIME_LAG);
		})
			.then(done);
	});

	it('insert slot nodes before and after', () => {
		setup({
			data() {
				return COMMON_DATA;
			}
		});
		const $el = $(vm.$el),
			$children = $el.children('.v-carousel').children(),
			$firstChild = $children.first(),
			$lastChild = $children.last();
		expect($firstChild.length).toBe(1);
		expect($lastChild.length).toBe(1);
		expect($firstChild.html()).toBe('Insert node before');
		expect($lastChild.html()).toBe('Insert node after');
	});

	it('html of prev and after html buttons', () => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					prevHTML: '<b>prev</b>',
					nextHTML: '<b>next</b>',
				};
			}
		});
		const $el = $(vm.$el),
			$prevBtn = $el.find('.v-carousel-nav.prev'),
			$nextBtn = $el.find('.v-carousel-nav.next');
		expect($prevBtn.html()).toBe('<b>prev</b>')
		expect($nextBtn.html()).toBe('<b>next</b>')
	});

	it('not show dots', () => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					dots: false,
				};
			}
		});
		const $el = $(vm.$el),
			$elCarouselDots = $el.find('.v-carousel-dots');
		expect($elCarouselDots.length).toBe(0);
	});

	it('dots style', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					dotsStyle: 'position: relative;',
				};
			}
		});
		const $el = $(vm.$el),
			$elCarouselDots = $el.find('.v-carousel-dots');
		// string style
		expect(cssTextToObject($elCarouselDots.attr('style'))).toEqual(cssTextToObject('position: relative;'));

		vm.dotsStyle = {
			position: 'absolute'
		};

		new Promise((resolve, reject) => {
			vm.$nextTick(() => {
				// object style
				expect(cssTextToObject($elCarouselDots.attr('style'))).toEqual(cssTextToObject('position: absolute;'));
				resolve();
			});
		})
			.then(() => {
				vm.dotsStyle = [{
					position: 'relative'
				}, {
					left: '50%'
				}];
				const promise = new Promise((resolve, reject) => {
					vm.$nextTick(() => {
						// array style
						expect(cssTextToObject($elCarouselDots.attr('style'))).toEqual(cssTextToObject('position: relative; left: 50%;'));
						resolve();
					});
				});

				return promise;
			})
			.then(done);
	});

	it('auto timer', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					auto: 1000,
				};
			}
		});

		const refCar = vm.$refs.car;

		expect(refCar.autoTimer).not.toEqual(null);
		// Spy doesn't work for vue methods. Use event instead.

		new Promise((resolve, reject) => {
			const changedSpy = jasmine.createSpy();
			refCar.$once(EV_CHANGED_INDEX, (e) => {
				changedSpy();
				expect(e.index).toBe(1);
			});
			setTimeout(() => {
				expect(changedSpy).toHaveBeenCalled();
				resolve();
				// extra time for animation
			}, 1000 + COMMON_SPEED_TIME + TIME_LAG);
		})
			.then(() => {
				const promise = new Promise((resolve, reject) => {
					const changedSpy = jasmine.createSpy();
					refCar.$once(EV_CHANGED_INDEX, (e) => {
						changedSpy();
						expect(e.index).toBe(COMMON_LIST.length - 1);
					});
					setTimeout(() => {
						expect(changedSpy).toHaveBeenCalled();
						resolve();
						// substract last extra time
					}, 1000 - COMMON_SPEED_TIME - TIME_LAG + COMMON_SPEED_TIME + TIME_LAG);
				});
				return promise;
			})
			.then(() => new Promise((resolve, reject) => {
				vm.list = [
					{
						url: 'url1',
					},
				];

				vm.$nextTick(() => {
					// no auto if there's less or equal than one item
					expect(refCar.autoTimer).toBe(null);
					resolve();
				});
			}))
			.then(() => new Promise((resolve, reject) => {
				vm.list = [];

				vm.$nextTick(() => {
					expect(refCar.autoTimer).toBe(null);
					resolve();
				});
			}))
			.then(done);
	});

	it('animation speed', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					speed: 1000,
				};
			}
		});

		const refCar = vm.$refs.car;

		new Promise((resolve, reject) => {
			refCar.$emit(EV_NEXT);
			expect(refCar.activeIndex).toBe(0);
			setTimeout(() => {
				expect(refCar.activeIndex).toBe(0);
			}, 500);
			setTimeout(() => {
				expect(refCar.activeIndex).toBe(1);
				resolve();
			}, 1000 + TIME_LAG);
		})
			.then(done);
	});

	it('loop behavior', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: false,
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car,
			$carousel = $el.find('.v-carousel'),
			$carouselItems = $el.find('.v-carousel-items'),
			$prevBtn = $el.find('.v-carousel-nav.prev'),
			$nextBtn = $el.find('.v-carousel-nav.next'),

			CAROUSEL_WIDTH = $carousel.width();

		// v-show doesn't show at first
		vm.$nextTick(() => {
			expect($prevBtn.css('display')).not.toBe('none');
			new Promise((resolve, reject) => {
				const $cloneds = $carouselItems.find('.cloned');

				expect($cloneds.length).toBe(COMMON_LIST.length - 1);
				expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH);
				refCar.$emit(EV_PREV);

				setTimeout(() => {
					const left = $carouselItems.offset().left;
					expect(left > -CAROUSEL_WIDTH && left < 0).toBeTruthy();
				}, 100);

				setTimeout(() => {
					expect(refCar.activeIndex).toBe(COMMON_LIST.length - 1);
					expect($nextBtn.css('display')).not.toBe('none');
					expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH * (COMMON_LIST.length - 2 + 2));
					resolve();
				}, COMMON_SPEED_TIME + TIME_LAG);
			})
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_NEXT);

					setTimeout(() => {
						const left = $carouselItems.offset().left;
						expect(left < -CAROUSEL_WIDTH * (COMMON_LIST.length + 2 - 1 - 1) && left > -CAROUSEL_WIDTH * (COMMON_LIST.length + 2 - 1 - 1 + 1)).toBeTruthy();
					}, 100);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						expect($prevBtn.css('display')).not.toBe('none');
						expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.list = [
						{
							url: 'url1'
						}
					];
					vm.$nextTick(() => {
						expect($nextBtn.css('display')).toBe('none');
						expect($prevBtn.css('display')).toBe('none');
						resolve();
					});
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.list = [];
					vm.$nextTick(() => {
						expect($nextBtn.css('display')).toBe('none');
						expect($prevBtn.css('display')).toBe('none');
						resolve();
					});
				}))
				.then(done);
		});

	});

	it('rewind behavior', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: true,
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car,
			$carousel = $el.find('.v-carousel'),
			$carouselItems = $el.find('.v-carousel-items'),
			$prevBtn = $el.find('.v-carousel-nav.prev'),
			$nextBtn = $el.find('.v-carousel-nav.next'),

			CAROUSEL_WIDTH = $carousel.width();

		// v-show doesn't show at first
		vm.$nextTick(() => {
			expect($prevBtn.css('display')).not.toBe('none');
			new Promise((resolve, reject) => {
				const $cloneds = $carouselItems.find('.cloned');

				expect($cloneds.length).toBe(0);
				expect($carouselItems.offset().left).toBe(0);
				refCar.$emit(EV_PREV);

				setTimeout(() => {
					const left = $carouselItems.offset().left;
					expect(left > -CAROUSEL_WIDTH * (COMMON_LIST.length - 1) && left < 0).toBeTruthy();
				}, 100);

				setTimeout(() => {
					expect(refCar.activeIndex).toBe(COMMON_LIST.length - 1);
					expect($nextBtn.css('display')).not.toBe('none');
					expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH * (COMMON_LIST.length - 1));
					resolve();
				}, COMMON_SPEED_TIME + TIME_LAG);
			})
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_NEXT);

					setTimeout(() => {
						const left = $carouselItems.offset().left;
						expect(left > -CAROUSEL_WIDTH * (COMMON_LIST.length - 1) && left < 0).toBeTruthy();
					}, 100);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						expect($prevBtn.css('display')).not.toBe('none');
						expect($carouselItems.offset().left).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.list = [
						{
							url: 'url1'
						}
					];
					vm.$nextTick(() => {
						expect($nextBtn.css('display')).toBe('none');
						expect($prevBtn.css('display')).toBe('none');
						resolve();
					});
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.list = [];
					vm.$nextTick(() => {
						expect($nextBtn.css('display')).toBe('none');
						expect($prevBtn.css('display')).toBe('none');
						resolve();
					});
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.loop = false;
					vm.list = COMMON_LIST;
					vm.$nextTick(() => {
						expect($nextBtn.css('display')).not.toBe('none');
						expect($prevBtn.css('display')).toBe('none');
						resolve();
					});
				}))
				.then(done);
		});
	});

	// Events
	it('click event', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car,
			$carousel = $el.find('.v-carousel'),
			$prevBtn = $el.find('.v-carousel-nav.prev'),
			$nextBtn = $el.find('.v-carousel-nav.next'),
			$dot = $el.find('.v-carousel-dot');

		new Promise((resolve, reject) => {
			vm.$nextTick(() => {
				$nextBtn.trigger(EV_CLICK);
				setTimeout(() => {
					expect(refCar.activeIndex).toBe(1);
					resolve();
				}, COMMON_SPEED_TIME + TIME_LAG);
			});
		})
			.then(() => new Promise((resolve, reject) => {
				$prevBtn.trigger(EV_CLICK);
				setTimeout(() => {
					expect(refCar.activeIndex).toBe(0);
					resolve();
				}, COMMON_SPEED_TIME + TIME_LAG);
			}))
			.then(() => new Promise((resolve, reject) => {
				$dot.eq(1).trigger(EV_CLICK);
				setTimeout(() => {
					expect(refCar.activeIndex).toBe(1);
					resolve();
				}, COMMON_SPEED_TIME + TIME_LAG);
			}))
			.then(done);
	});

	it('prev event', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: false
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car;

		new Promise((resolve, reject) => {
			vm.$nextTick(() => {
				refCar.$emit(EV_PREV);
				setTimeout(() => {
					expect(refCar.activeIndex).toBe(COMMON_LIST.length - 1);

					refCar.$emit(EV_PREV);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(COMMON_LIST.length - 2);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);

				}, COMMON_SPEED_TIME + TIME_LAG);
			});
		})
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = true;
				vm.rewind = true;
				vm.$nextTick(() => {
					refCar.$emit(EV_PREV);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(COMMON_LIST.length - 1);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				});
			}))
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = false;
				vm.rewind = true;
				vm.$nextTick(() => {
					refCar.$emit(EV_PREV);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				});
			}))
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = false;
				vm.rewind = false;
				vm.$nextTick(() => {
					refCar.$emit(EV_PREV);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				});
			}))
			.then(done);
	});

	it('to event', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: false
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car;

		function runTest() {
			return new Promise((resolve, reject) => {
				vm.$nextTick(() => {
					refCar.$emit(EV_TO, -1);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				});
			})
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_TO, COMMON_LIST.length);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_TO, 1);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(1);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_TO, COMMON_LIST.length);
					setTimeout(() => {
						expect(refCar.activeIndex).toBe(1);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}));
		}

		runTest()
			.then(() => new Promise((resolve, reject) => {
				vm.loop = true;
				vm.rewind = true;
				resolve();
			}))
			.then(() => runTest())
			.then(() => new Promise((resolve, reject) => {
				vm.loop = false;
				vm.rewind = true;
				resolve();
			}))
			.then(() => runTest())
			.then(() => new Promise((resolve, reject) => {
				vm.loop = false;
				vm.rewind = false;
				resolve();
			}))
			.then(() => runTest())
			.then(done);
	});

	it('next event', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: false
				};
			}
		});

		const $el = $(vm.$el),
			refCar = vm.$refs.car,
			lastIndex = COMMON_LIST.length - 1;

		function runTest(expectedIndex) {
			return new Promise((resolve, reject) => {
				vm.$nextTick(() => {
					refCar.$emit(EV_TO, lastIndex);

					setTimeout(() => {
						refCar.$emit(EV_NEXT);

						setTimeout(() => {
							expect(refCar.activeIndex).toBe(expectedIndex);
							resolve();
						}, COMMON_SPEED_TIME + TIME_LAG);
					}, COMMON_SPEED_TIME + TIME_LAG);
				});
			});
		}

		new Promise((resolve, reject) => {
			vm.$nextTick(() => {
				refCar.$emit(EV_NEXT);
				setTimeout(() => {
					expect(refCar.activeIndex).toBe(1);

					refCar.$emit(EV_TO, lastIndex);
					setTimeout(() => {
						refCar.$emit(EV_NEXT);

						setTimeout(() => {
							expect(refCar.activeIndex).toBe(0);
							resolve();
						}, COMMON_SPEED_TIME + TIME_LAG);
					}, COMMON_SPEED_TIME + TIME_LAG);

				}, COMMON_SPEED_TIME + TIME_LAG);
			});
		})
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = true;
				vm.rewind = true;
				resolve();
			}))
			.then(() => runTest(0))
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = false;
				vm.rewind = true;
				resolve();
			}))
			.then(() => runTest(lastIndex))
			.then(() => new Promise((resolve, reject) => {
				vm.list = COMMON_LIST;
				vm.loop = false;
				vm.rewind = false;
				resolve();
			}))
			.then(() => runTest(lastIndex))
			.then(done);
	});

	it('render-updated event', (done) => {
		const changedSpy = jasmine.createSpy();
		let i = 0;

		setup({
			data() {
				return {
					...COMMON_DATA,
					list: []
				};
			},
			mounted() {
				this.$refs.car.$on(EV_RENDER_UPDATED, changedSpy);
			}
		});

		new Promise((resolve, reject) => {
			vm.list = COMMON_LIST;
			vm.$nextTick(() => {
				expect(changedSpy.calls.count()).toBe(++i);
				resolve();
			});
		})
			.then(() => new Promise((resolve, reject) => {
				vm.loop = !vm.loop;
				vm.$nextTick(() => {
					expect(changedSpy.calls.count()).toBe(++i);
					resolve();
				});
			}))
			.then(() => new Promise((resolve, reject) => {
				vm.rewind = !vm.rewind;
				vm.$nextTick(() => {
					expect(changedSpy.calls.count()).toBe(++i);
					resolve();
				});
			}))
			.then(done);
	});

	it('drag', (done) => {
		setup({
			data() {
				return {
					...COMMON_DATA,
					loop: true,
					rewind: false,
					mouseDrag: true
				};
			}
		});

		const $el = $(vm.$el),
			$carousel = $el.find('.v-carousel'),
			$carouselItems = $el.find('.v-carousel-items'),

			refCar = vm.$refs.car,
			lastIndex = COMMON_LIST.length - 1,
			pointer = createVirtualPointer(),

			elOffset = $carousel[0].getBoundingClientRect(),
			elTop = elOffset.top,
			elLeft = elOffset.left,
			elWidth = elOffset.width,
			elHeight = elOffset.height,
			elCenterX = elLeft + elWidth / 2,
			elCenterY = elTop + elHeight / 2,
			dragSnapLimit = elWidth / 4,
			EXTRA_PX = 1;

		vm.$nextTick(() => {
			// I haven't found a good way to simulate touch event, use mouse events instead.
			Promise.resolve()
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX - dragSnapLimit + EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft - dragSnapLimit + EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX + dragSnapLimit - EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft + dragSnapLimit - EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX - dragSnapLimit - EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft - dragSnapLimit - EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(1);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX + dragSnapLimit + EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft + dragSnapLimit + EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX + dragSnapLimit + EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft + dragSnapLimit + EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(lastIndex);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					pointer.x = elCenterX;
					pointer.y = elCenterY;
					pointer.trigger(EV_MOUSE_DOWN);

					pointer.x = elCenterX - dragSnapLimit - EXTRA_PX;
					pointer.trigger(EV_MOUSE_MOVE);

					const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
					expect(nItemsLeft).toBeCloseTo(oItemsLeft - dragSnapLimit - EXTRA_PX, 0);

					pointer.trigger(EV_MOUSE_UP);

					setTimeout(() => {
						expect(refCar.activeIndex).toBe(0);
						resolve();
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(() => new Promise((resolve, reject) => {
					vm.loop = false;
					vm.$nextTick(() => {
						const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
						pointer.x = elCenterX;
						pointer.y = elCenterY;
						pointer.trigger(EV_MOUSE_DOWN);

						pointer.x = elCenterX + dragSnapLimit + EXTRA_PX;
						pointer.trigger(EV_MOUSE_MOVE);

						const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
						expect(nItemsLeft).toBeCloseTo(oItemsLeft + dragSnapLimit + EXTRA_PX, 0);

						pointer.trigger(EV_MOUSE_UP);

						setTimeout(() => {
							expect(refCar.activeIndex).toBe(0);
							resolve();
						}, COMMON_SPEED_TIME + TIME_LAG);
					});
				}))
				.then(() => new Promise((resolve, reject) => {
					refCar.$emit(EV_TO, lastIndex);
					setTimeout(() => {
						const oItemsLeft = $carouselItems[0].getBoundingClientRect().left;
						pointer.x = elCenterX;
						pointer.y = elCenterY;
						pointer.trigger(EV_MOUSE_DOWN);

						pointer.x = elCenterX - dragSnapLimit - EXTRA_PX;
						pointer.trigger(EV_MOUSE_MOVE);

						const nItemsLeft = $carouselItems[0].getBoundingClientRect().left;
						expect(nItemsLeft).toBeCloseTo(oItemsLeft - dragSnapLimit - EXTRA_PX, 0);

						pointer.trigger(EV_MOUSE_UP);

						setTimeout(() => {
							expect(refCar.activeIndex).toBe(lastIndex);
							resolve();
						}, COMMON_SPEED_TIME + TIME_LAG);
					}, COMMON_SPEED_TIME + TIME_LAG);
				}))
				.then(done);
		});
	});
});
