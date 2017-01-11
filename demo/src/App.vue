<style lang="less">
</style>
<template>
    <div id="app">
        <h3>Vue Carousel Example</h3>
        <Carousel :on-slide-end="slideEnd" :auto="auto">
        </Carousel>
        <button @click="toggleAuto">toggle auto</button>
    </div>
</template>
<script>
import Carousel from '../../src/Carousel'
import CarouselItem from '../../src/CarouselItem'

const list1 = [
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
    list1 = [
    {
        url: 'url4'
    },
    {
        url: 'url5'
    },
    {
        url: 'url6'
    }
],

    log = console.log;

export default {
    components: {
        Carousel,
        CarouselItem
    },
    data: {
        auto: 3000,
        list: list1
    },
    methods: {
        toggleAuto() {
            this.auto = this.auto === 0 ? 3000 : 0;
        }
    }
};
</script>
