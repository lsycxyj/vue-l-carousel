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
    &-nav{
        @h: 30px;
        &.prev{

        }
        &.next{

        }
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
        <div class="v-carousel-dots" v-if="dots">
            <div :class="{'v-carousel-dot': true, 'active': activeIndex==index}" v-for="(item, index) in watchItems"></div>
        </div>
        <div class="v-carousel-nav next" v-html="prevHTML"></div>
        <div class="v-carousel-nav prev" v-html="nextHTML"></div>
        <slot name="after"></slot>
    </div>
</template>

<script>
import VueFclickLite from './VueFclickLite'

const
    EV_TOUCH_START = 'touchstart',
    EV_TOUCH_END = 'touchend',
    EV_TOUCH_MOVE = 'touchmove';

export default {
    props: {
        prevHTML: {
            type: String,
            default: '&lt;'
        },
        nextHTML: {
            type: String,
            default: '&gt;'
        },
        speed: {
            type: Number,
            default: 300
        },
        loop: {
            type: Boolean,
            default: true
        },
        auto: {
            type: Number,
            default: 0
        },
        dots: {
            type: Boolean,
            default: true
        },
        delta: {
            type: Number,
            default: 100
        },
        watchItems: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            activeIndex: 0
        };
    },
    directives: {
        fclick: VueFclickLite
    },
    mounted() {
        var me = this,
            el = me.$el;

        me.$watch('watchItems', function(n, o){
            me.updateRender();
        });
    },
    destroyed() {
    },
    methods: {
        //Event callbacks
        onDotTap(index) {
        },
        updateRender() {
            var me = this;
            me.updateItems();
            me.updateDots();
        },
        updateItems() {
        }
    }
}
</script>
