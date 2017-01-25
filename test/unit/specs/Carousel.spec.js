// TODO not all tested

import Vue from 'vue';
import $ from 'jquery';
import {Carousel, CarouselItem} from '../../../src/index';
import {createVM, destroyVM} from '../util';

const EV_CHANGED_INDEX = 'changed-index',
	EV_PREV = 'prev',
	EV_NEXT = 'next',
	
	TIME_LAG = 100;


describe('Suite: test Carousel.vue', () => {
	const COMMON_LIST = [
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
			speed: 300,
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
					<carousel ref="car" :watchItems="list" :prevHTML="prevHTML" :nextHTML="nextHTML" :speed="speed" :loop="loop" :rewind="rewind" :mouseDrag="mouseDrag" :auto="auto" :dots="dots" :dotsStyle="dotsStyle">
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
			}, 300 + 10);
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
		expect($elCarouselDots.attr('style')).toBe('position: relative;')

		vm.dotsStyle = {
			position: 'absolute'
		};

		new Promise((resolve, reject) => {
			vm.$nextTick(() => {
				// object style
				expect($elCarouselDots.attr('style')).toBe('position: absolute;')
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
						expect($elCarouselDots.attr('style')).toBe('position: relative; left: 50%;');
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
			}, 1000 + 300 + TIME_LAG);
		})
			.then(() => {
				const promise = new Promise((resolve, reject) => {
					const changedSpy = jasmine.createSpy();
					refCar.$once(EV_CHANGED_INDEX, (e) => {
						changedSpy();
						expect(e.index).toBe(2);
					});
					setTimeout(() => {
						expect(changedSpy).toHaveBeenCalled();
						resolve();
						// substract last extra time
					}, 1000 - 300 - TIME_LAG + 300 + TIME_LAG);
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

				expect($cloneds.length).toBe(2);
				expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH);
				refCar.$emit(EV_PREV);

				setTimeout(() => {
					const left = $carouselItems.offset().left;
					expect(left > -CAROUSEL_WIDTH && left < 0).toBeTruthy();
				}, 100);

				setTimeout(() => {
					expect(refCar.activeIndex).toBe(2);
					expect($nextBtn.css('display')).not.toBe('none');
					expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH * (COMMON_LIST.length - 2 + 2));
					resolve();
				}, 300 + TIME_LAG);
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
					}, 300 + TIME_LAG);
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
					expect(refCar.activeIndex).toBe(2);
					expect($nextBtn.css('display')).not.toBe('none');
					expect($carouselItems.offset().left).toBe(-CAROUSEL_WIDTH * (COMMON_LIST.length - 1));
					resolve();
				}, 300 + TIME_LAG);
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
					}, 300 + TIME_LAG);
				}))
				.then(done);
		});
	});
});
