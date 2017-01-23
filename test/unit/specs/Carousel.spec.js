import Vue from 'vue';
import $ from '../../../src/util';
import {Carousel, CarouselItem} from '../../../src/index';

describe('Suite: test Carousel.vue', () => {

	//beforeEach(() => {
	//});
	//
	//afterEach(() => {
	//});

	it('test hello', () => {
		let vm,
			elApp = document.createElement('div'),
			elBody = document.body;

		elApp.id = 'app';
		$.append(elBody, elApp);

		vm = new Vue({
			el: '#app',
			template: `
				<div>
					<carousel :watchItems="list">
						<carousel-item v-for="(item, index) in list">
							<p>CarouselItem{{index}}, URL is {{item.url}}</p>
						</carousel-item>
						<div slot="before">Insert node before</div>
						<div slot="after">Insert node after</div>
					</carousel>
				</div>
			`,
			mounted() {
				//elApp outside will be replaced.
				const elApp = this.$el;

				expect(true).toEqual(true);
			},
			data() {
				return {
					auto: 0,
					list: [
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
					speed: 300,
					loop: true,
					rewind: false
				};
			},
			components: {
				'carousel': Carousel,
				'carousel-item': CarouselItem
			}
		});

	});
});