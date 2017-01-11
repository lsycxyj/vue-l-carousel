<style lang="less">
    .vue-carousel {

    }
</style>

<template>
    <div class="v-carousel"
        @touchstart="onTouchstart"
        @touchmove="onTouchmove"
        @touchend="onTouchend"
        @touchcancel="onTouchcancel">
        <div class="v-carousel-items">
            <slot></slot>
        </div>
        <div class="v-carousel-indicators" v-if="indicators">
            <div></div>
        </div>
    </div>
</template>

<script>
import CarouselItem from './CarouselItem.vue'

export default {
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        auto: {
            type: Number,
            default: 5000
        },
        indicators: {
            type: Boolean,
            default: true
        },
        delta: {
            type: Number,
            default: true
        },
        onSlideEnd: {
            type: Function,
            default: (index, item) => {}
        },
        watchItems: {
            type: Array,
            default: []
        }
    },
    data: {
        activeIndex: 0
    },
    components:{
    }
}
</script>
