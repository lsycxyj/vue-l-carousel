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
            left: 0;
        }
        &.next{
            right: 0;
        }
        cursor: pointer;
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
            <div :class="{'v-carousel-dot': true, 'active': activeIndex==index}" v-fclick="{cb:function(){to(index)}}" v-for="(item, index) in watchItems"></div>
        </div>
        <div class="v-carousel-nav prev" v-fclick="{cb:prev}" v-show="hasLoop || (itemsLen > 1 && activeIndex > 0)" v-html="prevHTML"></div>
        <div class="v-carousel-nav next" v-fclick="{cb:next}" v-show="hasLoop || (itemsLen > 1 && activeIndex < itemsLen - 1)" v-html="nextHTML"></div>
        <slot name="after"></slot>
    </div>
</template>

<script>
import VueFclickLite from './VueFclickLite';
import util from './util';

const win = window,
    doc = document,
    navigator = win.navigator,
    hasTouch = !!('ontouchstart' in win || navigator.maxTouchPoints),

    DIR_PREV = 'prev',
    DIR_NEXT = 'next',

    //unable to detect the exact event
    EV_TRANSITION_END = ['transitionend','OTransitionEnd','webkitTransitionEnd'],

    EV_TOUCH_START = 'touchstart',
    EV_TOUCH_END = 'touchend',
    EV_TOUCH_MOVE = 'touchmove',

    EV_MOUSE_ENTER = 'mouseenter',
    EV_MOUSE_LEAVE = 'mouseleave',

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
    oneEvent = $.one,
    getAttr = $.attr,
    doCSS = $.css,
    getWidth = $.width,
    each = $.each;

//TODO speed up
function roundDown(oVal) {
    var val = parseInt(oVal, 10);
    return Math.ceil((val - (val % 100)) / 100) * 100;
}

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
            animPaused: true,
            transform: '',
            itemsLen: 0,
            slideCount: 0,
            hasLoop: false,
            autoTimer: null,
            $items: null,
            $itemsWrap: null,
            transEndCB: null
        };
    },
    directives: {
        fclick: VueFclickLite
    },
    mounted() {
        var me = this,

            $el = me.$el,
            $itemsWrap = findChildren($el, '.v-carousel-items')[0],
            
            updateRender = me.updateRender,
            adjRound = me.adjRound;

        me.$itemsWrap = $itemsWrap;

        me.$watch('watchItems', updateRender);
        me.$watch('auto', me.checkAuto);

        updateRender();
        adjRound();

        bindEvent(win, EV_RESIZE, adjRound);
        //DragSnap support
        bindEvent($itemsWrap, EV_START, me.startCB);
        bindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
    },
    //Although "updated" can be used to detect content changes, it'll bring too many changes which are not I want. So use $watch instead.
    destroyed() {
        var me = this;
        unbindEvent(win, EV_RESIZE, me.adjRound);
        unbindEvent(win, EV_START, me.startCB);
        unbindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
    },
    methods: {
        updateRender() {
            var me = this,

                loop = me.loop,
                hasLoop = loop && itemsLen > 1,
                watchItems = me.watchItems,
                itemsLen = watchItems.length,
                slideCount = hasLoop ? itemsLen + 2 : itemsLen, 

                $itemsWrap = me.$itemsWrap,
                $items = findChildren($itemsWrap, '.v-carousel-item');

            me.hasLoop = hasLoop;
            me.$items = $items;
            me.itemsLen = itemsLen;
            me.slideCount = slideCount;

            doCSS($itemsWrap, 'width', 100 * slideCount + '%');
            each($items, function(element){
                doCSS(element, 'width', (100 / slideCount) + '%');
            });

            me.rmAnim();
            me.adjRound();

            me.$nextTick(function() {
                me.reset();

                me.addAnim();

                me.checkAuto();
            });

        },
        reset() {
            var me = this;
            me.off();
            me.to(0);
        },
        checkAuto() {
            var me = this,
                auto = me.auto,

                turnOff = me.off,
                turnOn = me.on,

                $itemsWrap = me.$itemsWrap;

            unbindEvent($itemsWrap, EV_MOUSE_ENTER, turnOff);
            unbindEvent($itemsWrap, EV_MOUSE_LEAVE, turnOn);
            unbindEvent($itemsWrap, EV_START, turnOff);
            unbindEvent($itemsWrap, EV_END, turnOn);

            if(auto) {
                bindEvent($itemsWrap, EV_MOUSE_ENTER, turnOff);
                bindEvent($itemsWrap, EV_MOUSE_LEAVE, turnOn);
                bindEvent($itemsWrap, EV_START, turnOff);
                bindEvent($itemsWrap, EV_END, turnOn);
                turnOn();
            }
            else {
                turnOff();
            }
        },
        rmAnim: function() {
            var me = this;
            //reset reset animation
            me.transtion = 'none';
            me.animPaused = true;
        },
        addAnim: function() {
            var me = this;
            me.transition = 'transform ' + (me.speed / 1000) + 's ease';
            me.animPaused = false;
        },
        on() {
            var me = this;
            me.off();
            me.autoTimer = setInterval(function(){
                me.next();
            }, me.auto);
        },
        off() {
            var me = this;
            if(me.autoTimer) {
                clearInterval(me.autoTimer);
                me.autoTimer = null;
            }
        },
        next() {
            this.nextPrev(DIR_NEXT);
        },
        prev() {
            this.nextPrev(DIR_PREV);
        },
        nextPrev(dir) {
            var me = this,
                hasLoop = me.hasLoop,
                itemsLen = me.itemsLen,
                activeIndex = me.activeIndex,
                index;

            if(dir == DIR_PREV) {
                if(activeIndex == 0){
                    if(hasLoop) {
                        index = -1;
                    }
                    else {
                        index = 0;
                    }
                }
                else {
                    index = activeIndex - 1;
                }
            }
            //next
            else {
                if(activeIndex == itemsLen - 1){
                    if(hasLoop) {
                        index = itemsLen;
                    }
                    else {
                        index = itemsLen - 1;
                    }
                }
                else {
                    index = activeIndex + 1;
                }
            }
            me.to(index);
        },
        to(index) {
            var me = this,
                hasLoop = me.hasLoop,
                itemsLen = me.itemsLen,
                slideCount = me.slideCount,

                removeAnimation = me.rmAnim,
                addAnimation = me.addAnim,
                go = me.to,

                onSlideEnd,
                realIndex,
                left;
                
            if(hasLoop){
                if(index == -1){
                    onSlideEnd = function() {
                        removeAnimation();
                        me.$nextTick(function(){
                            go(itemsLen - 1);
                            addAnimation();
                        });
                    };
                }
                else if(index == itemsLen){
                    onSlideEnd = function() {
                        removeAnimation();
                        me.$nextTick(function(){
                            go(1);
                            addAnimation();
                        });
                    };
                }

                realIndex = index + 1;
            }
            else {
                realIndex = index;
            }

            left = realIndex * -100 / slideCount;

            if(!onSlideEnd) {
                if(me.animPaused) {
                    me.activeIndex = index;
                }
                else {
                    onSlideEnd = function(){
                        me.activeIndex = index;
                    };
                }
            }

            me.transEndCB = onSlideEnd;
            me.transTo(left);
        },
        checkTrans(){
            var me = this,
                transEndCB = me.transEndCB;
            //only fire once
            if(transEndCB){
                transEndCB();
                me.transEndCB = null;
            }
        },
        transTo(moveTo) {
            console.log(moveTo)
            this.transform = `translate3d(${moveTo}%,0,0)`;
        },
        startCB(e) {
            var me = this,
                $el = me.$el,

                getEventData = me.getEv,
                removeAnimation = me.rmAnim,
                addAnimation = me.addAnim,
                getPercent = me.getPercent,
                slideCount = me.slideCount,
                snapback = me.snapback,

                data = getEventData(e),
                
                start = {
                    time: +new Date,
                    coords: [
                        data.pageX,
                        data.pageY
                    ],
                    origin: $el,
                    interacting: false
                },
                stop, deltaX, deltaY,

                $itemsWrap = me.$itemsWrap,
                elWidth = getWidth($el),
                currentPos = getCurrentPos($itemsWrap);

            function getCurrentPos($itemsWrap) {
                return getAttr($itemsWrap, 'style') != undefined ? getPercent($itemsWrap) : 0;
            }

            function moveHandler(e) {
                var data = getEventData(e);
                stop = {
                    time: +new Date,
                    coords: [
                        data.pageX,
                        data.pageY
                    ]
                };
                deltaX = Math.abs(start.coords[0] - data.pageX);
                deltaY = Math.abs(start.coords[1] - data.pageY);

                //move threashold
                if (!start || deltaX < deltaY || deltaY > 10 || deltaX < 3) {
                    return;
                }

                // prevent scrolling
                if (deltaX >= 3) {
                    start.interacting = true;
                    var percent = currentPos + (((stop.coords - start.coords[0]) / elWidth) * 100 / slideCount);
                    me.transform = `translate3d("${percent}%,0,0")`;
                    e.preventDefault();
                }               
            }

            function snapback($itemsWrap, left) {
                var currentPos = getCurrentPos($itemsWrap),
                    left = ((!left && currentPos < 0) ? roundDown(currentPos) - 100 : roundDown(currentPos)) / slideCount;
            }

            function dragsnap(dir){
                me.nextPrev(dir);
            }
            
            bindEvent($itemsWrap, EV_MOVE, moveHandler);
            oneEvent($itemsWrap, EV_END, function(e) {
                var activeIndex = me.activeIndex;
                unbindEvent($itemsWrap, EV_MOVE, moveHandler);

                removeAnimation();

                if(start && stop) {
                    var deltaX = Math.abs(start.coords[0] - stop.coords[0]),
                        deltaY = Math.abs(start.coords[1] - stop.coords[1]),
                        left = start.coords[0] > stop.coords[0],
                        jumppoint;

                    //move threashold
                    if(deltaX > 20 && (deltaX > deltaY)) {
                        e.preventDefault();
                    }
                    else {
                        if(start.interacting) {
                            snapback($itemsWrap, left);
                        }
                        return;
                    }

                    jumppoint = elWidth / 4;

                    if(deltaX > jumppoint && (!left && activeIndex > 0 || left && activeIndex < me.itemsLen - 1)) {
                        dragsnap(left ? DIR_PREV : DIR_NEXT);
                    }
                    else {
                        snapback($itemsWrap, left)
                    }
                }
                start = stop = undefined;
            });
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
        getPercent(element) {
            return getAttr(element, 'style').match(/transform:.*translate3d.*\((.*[0-9].*)%/i) && parseFloat(RegExp.$1);
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
