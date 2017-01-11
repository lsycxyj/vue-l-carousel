<style lang="less">
.v-carousel {
    &-items {
        overflow: hidden;
    }
    &-indicators {
        position: absolute;
        bottom: 10px;
        left: 0;
        width: 100%;
        text-align: center;
    }
    &-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin: 0 5px;
        border-radius: 5px;
        background: rgba(0, 0, 0, .5);
        &:active {
            background: #000;
        }
    }
    width: 100%;
    overflow: hidden;
    position: relative;
}
</style>

<template>
    <!--
        Don't use v-bind to bind events which are not available,
        Otherwise Vue will go on running with many bugs sliently as in many other places.
    -->
    <div class="v-carousel">
        <div class="v-carousel-items">
            <slot></slot>
        </div>
        <div class="v-carousel-indicators" v-if="indicators">
        </div>
    </div>
</template>

<script>
export default {
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        auto: {
            type: Number,
            default: 0
        },
        indicators: {
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
            activeIndex: 0,
            _watchItems: this.watchItems
        };
    },
}
</script>
