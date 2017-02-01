<style lang="less">
.v-carousel-item {
	height: 100px;
}
</style>
<template>
	<div>
		<h3>Vue Carousel Example</h3>
		<carousel ref="car" @changed-index="log" :auto="auto" :watch-items="list" :dots="true" :loop="loop" :speed="speed" :rewind="rewind" :mouse-drag="mouseDrag">
			<carousel-item v-for="(item, index) in list">
				<p>CarouselItem{{index}}, URL is {{item.url}}</p>
			</carousel-item>
			<div slot="before">Insert node before</div>
			<div slot="after">Insert node after</div>
		</carousel>
		<div>
			<button @click="toggleAuto()">toggle auto: {{auto}}</button>
			<button @click="toggleLoop()">toggle loop: {{loop}}</button>
			<button @click="toggleRewind()">toggle rewind: {{rewind}}</button>
			<button @click="toggleMouseDrag()">toggle mouseDrag: {{mouseDrag}}</button>
			<button @click="changeList()">change list</button>
		</div>
		<div>
			<button @click="$refs.car.$emit('prev')">Prev slide</button>
			<button @click="$refs.car.$emit('next')">Next slide</button>
		</div>
		<div>
			<label>Goto:</label>
			<input type="number" @input="to" value="0">
		</div>
	</div>
</template>
<script>
import { Carousel, CarouselItem } from '../../src/index';

var list1 = [
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
	list2 = [
	{
		url: 'url4'
	},
	{
		url: 'url5'
	},
	{
		url: 'url6'
	},
	{
		url: 'url7'
	}
];

export default {
	components: {
		'carousel': Carousel,
		'carousel-item': CarouselItem
	},
	data() {
		return {
			auto: 30000,
			list: list1,
			speed: 300,
			loop: true,
			rewind: false,
			mouseDrag: false
		};
	},
	mounted() {
		var me = this,
			car = me.$refs.car;
		car.$on('changed-index', function(){
			console.log(arguments);
		});
	},
	methods: {
		toggleAuto() {
			this.auto = this.auto === 0 ? 3000 : 0;
		},
		toggleLoop() {
			this.loop = !this.loop;
		},
		toggleRewind() {
			this.rewind = !this.rewind;
		},
		toggleMouseDrag() {
			this.mouseDrag = !this.mouseDrag;
		},
		log(content) {
			console.log(content);
		},
		to(e) {
			this.$refs.car.$emit('to', e.target.value);
		},
		indexChanged(index, total, item) {
			var me = this,
				log = me.log;
			log('Slide end:' + index);
			log(item);
		},
		changeList() {
			this.list = this.list == list1 ? list2 : list1;
		}
	}
};
</script>
