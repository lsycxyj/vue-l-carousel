<style lang="less">
</style>
<template>
    <div id="app">
        <h3>Vue Carousel Example</h3>
        <carousel :auto="auto" :watchItems="list">
            <carousel-item v-for="(item, index) in list" @click="log(index)">
                <p>CarouselItem{{index}}, URL is {{item.url}}</p>
            </carousel-item>
        </carousel>
        <button @click="toggleAuto()">toggle auto</button>
        <button @click="changeList()">change list</button>
    </div>
</template>
<script>
import Carousel from '../../src/Carousel'
import CarouselItem from '../../src/CarouselItem'

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
        url: 'url7'
    }
],
    log = console.log;

export default {
    components: {
        'carousel': Carousel,
        'carousel-item': CarouselItem
    },
    data() {
        return {
            auto: 3000,
            list: list1
        };
    },
    methods: {
        toggleAuto() {
            this.auto = this.auto === 0 ? 3000 : 0;
        },
        log(content) {
            log(content);
        },
        onSlideEnd(index, item) {
            log('Slide end:' + index);
            log(item);
        },
        changeList() {
            this.list = this.list == list1 ? list2 : list1;
        }
    }
};
</script>
