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
        <div class="v-carousel-items" :style="{'transition': transition, 'transform': transform}">
            <slot></slot>
        </div>
        <div class="v-carousel-dots" v-if="dots">
            <div :class="{'v-carousel-dot': true, 'active': activeIndex==index}" v-fclick="to(index)" v-for="(item, index) in watchItems"></div>
        </div>
        <div class="v-carousel-nav prev" v-fclick="{cb:prev}" v-html="nextHTML"></div>
        <div class="v-carousel-nav next" v-fclick="{cb:next}" v-html="prevHTML"></div>
        <slot name="after"></slot>
    </div>
</template>

<script>
import VueFclickLite from './VueFclickLite';
import util from './util';

const win = window,
    navigator = win.navigator,
    ua = navigator.userAgent || navigator.appVersion,
    hasTouch = !!('ontouchstart' in win || navigator.maxTouchPoints),
    vendor = (/webkit/i).test(ua) ? 'webkit' : (/firefox/i).test(ua) ? 'moz' : 'opera' in win ? 'o' : (/msie/i).test(ua) ? 'ms' : '',

    EV_TOUCH_START = 'touchstart',
    EV_TOUCH_END = 'touchend',
    EV_TOUCH_MOVE = 'touchmove',

    EV_MOUSE_DOWN = 'mousedown',
    EV_MOUSE_UP = 'mouseup',
    EV_MOUSE_MOVE = 'mousemove',

    EV_RESIZE = 'resize',
    
    EV_START = hasTouch ? EV_TOUCH_START : EV_MOUSE_DOWN,
    EV_MOVE = hasTouch ? EV_TOUCH_MOVE : EV_MOUSE_MOVE,
    EV_END = hasTouch ? EV_TOUCH_END : EV_MOUSE_UP;

var $ = util.$,
    findChildren = $.qsa,
    bindEvent = $.on,
    unbindEvent = $.off,
    getAttr = $.attr,
    doCSS = $.css,
    getWidth = $.getWidth,
    each = $.each;

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
        //0 for no autoplay
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
            activeIndex: 0,
            transition: 'none',
            transform: '',
            slideCount: 0,
            $items: null
        };
    },
    directives: {
        fclick: VueFclickLite
    },
    mounted() {
        var me = this,

            $el = me.$el,
            $itemsWrap = findChildren($el, '.v-carousel-items')[0],
            
            updateRender = me.updateRender;

        me.$itemsWrap = $itemsWrap;

        //me.$watch('watchItems', function(n, o){
        //    updateRender();
        //});
        //updateRender();
    },
    update() {
        console.log('update');
    },
    destroyed() {
    },
    methods: {
        updateRender() {
            var me = this,

                loop = me.loop,
                watchItems = me.watchItems,
                //slideCount = loop && ? 

                $itemsWrap = me.$itemsWrap,
                $items = findChildren($el, '.v-carousel-item'),

                transition = 'transform ' + (me.speed / 1000) + 's ease';

            me.$items = $items;

            //reset reset animation
            me.transtion = 'none';
            me.nextTick(function() {
                me.to(0);
                me.transtion = transtion;
            });

            me.updateItems();
        },
        updateItems() {
        },
        next() {
        },
        prev() {
            console.log(arguments, '')
        },
        to(index) {
        },
        transTo(moveTo) {
            me.transform = 'translate3d(0,0,0)';
        },
        getEv(e) {
            var obj;
            if (e.targetTouches) {
                obj = e.targetTouches[0];
            }
            else {
                obj = e;
            }

            return obj;
        },
        getPercent() {
            return getAttr(me.$itemsWrap, 'style').match(/transform:.*translate3d.*\((.*[0-9].*)%/i) && parseFloat(RegExp.$1);
        },
        //Account for iOS safari rounding problems
        adjRound() {
            var me = this,
                $el = me.$el,
                $items = me.$items,
                diff = getWidth($el) - getWidth($items[0]);

            if(diff !== 0) {
                each($items, function(element) {
                    doCSS(element, 'position', 'relative');
                    doCSS(element, 'left', (diff * i) + 'px');
                });
            }
        }
    }
}
</script>
