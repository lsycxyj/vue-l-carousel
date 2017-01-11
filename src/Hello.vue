<template>
    <div
        class="v-carousel"
        @touchstart="onTouchstart"
        @touchmove="onTouchmove"
        @touchend="onTouchend"
        @touchcancel="onTouchcancel"
        >
        {{activeIndex}}
        <slot></slot>
    </div>
</template>
<style>
</style>
<script>
    export default{
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
                //watchItems: this.watchItems
            };
        }
    }
</script>
