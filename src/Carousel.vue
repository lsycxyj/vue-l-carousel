<template>
    <div class="v-carousel"
        @touchstart="onTouchstart"
        @touchmove="onTouchmove"
        @touchend="onTouchend"
        @touchcancel="onTouchcancel">
        <div class="v-carousel-items">
            <slot></slot>
        </div>
        <div class="v-carousel-indicators">
            <div></div>
        </div>
    </div>
</template>
<style lang="less">
    .vue-carousel {

    }
</style>
<script>
    export default{
        data() {
            return {
                msg:'hello vue'
            };
        },
        components:{
        }
    }
</script>
