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
        <div class="v-carousel-items">
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
    ua = win.navigator.userAgent || win.navigator.appVersion,
    vendor = (/webkit/i).test(ua) ? 'webkit' : (/firefox/i).test(ua) ? 'moz' : 'opera' in win ? 'o'  : '',
    cssVendor = vendor ? '-' + vendor.toLowerCase() + '-' : '', //css前缀兼容

    PROP_TRANSITION = cssVendor + 'transition',
    PROP_TRANSFORM = cssVendor + 'transform',

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
    findNodes = $.qsa,
    bindEvent = $.on,
    unbindEvent = $.off,
    oneEvent = $.one,
    appendNode = $.append,
    prependNode = $.prepend,
    cloneNode = $.clone,
    removeNode = $.remove,
    addClass = $.addClass,
    getAttr = $.attr,
    doCSS = $.css,
    getWidth = $.width,
    getOffset = $.offset,
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
            default: false
        },
        rewind: {
            type: Boolean,
            default: true
        },
        mouseDrag: {
            type: Boolean,
            default: false
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
            //It seems that key with symbols can't be accessced directly from vm.
            activeIndex: 0,
            animPaused: true,
            itemsLen: 0,
            slideCount: 0,
            hasLoop: false,
            autoTimer: null,
            //Nodes
            cloneItems: [],
            items: null,
            itemsWrap: null,
            //Callbacks
            transEndCB: null
        };
    },
    directives: {
        fclick: VueFclickLite
    },
    mounted() {
        var me = this,

            $el = me.$el,
            $itemsWrap = findNodes($el, '.v-carousel-items')[0],
            
            updateRender = me.updateRender,
            checkDrag = me.checkDrag,
            adjRound = me.adjRound;

        me.itemsWrap = $itemsWrap;

        me.$watch('watchItems', updateRender);
        me.$watch('mouseDrag', checkDrag);
        me.$watch('auto', me.checkAuto);

        checkDrag();
        updateRender();
        adjRound();

        bindEvent(win, EV_RESIZE, adjRound);
        bindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
    },
    //Although "updated" can be used to detect content changes, it'll bring too many changes which are not I want. So use $watch instead.
    destroyed() {
        var me = this,
            $itemsWrap = me.itemsWrap;
        unbindEvent(win, EV_RESIZE, me.adjRound);
        me.unbindDrag();
        unbindEvent($itemsWrap, EV_TRANSITION_END, me.checkTrans);
    },
    methods: {
        updateRender() {
            var me = this,

                loop = me.loop,
                watchItems = me.watchItems,
                itemsLen = watchItems.length,
                hasLoop = loop && itemsLen > 1,
                slideCount = hasLoop ? itemsLen + 2 : itemsLen, 

                $itemsWrap = me.itemsWrap,
                $cloneItems = me.cloneItems;

            //clean up
            if($cloneItems.length > 0){
                each($cloneItems, function($item){
                    removeNode($item);
                });
                $cloneItems = [];
                me.cloneItems = $cloneItems;
            }

            var $items = findNodes($itemsWrap, '.v-carousel-item');

            if(hasLoop) {
                var firstNode = $items[0],
                    lastNode = $items[itemsLen - 1],
                    firstNodeCloned = cloneNode(firstNode, true),
                    lastNodeCloned = cloneNode(lastNode, true);
                appendNode($itemsWrap, firstNodeCloned);
                prependNode($itemsWrap, lastNodeCloned);

                $cloneItems.push(firstNodeCloned);
                $cloneItems.push(lastNodeCloned);
                each($cloneItems, function($item){
                    addClass($item, 'cloned');
                });

                $items = findNodes($itemsWrap, '.v-carousel-item');
            }

            me.hasLoop = hasLoop;
            me.itemsLen = itemsLen;
            me.slideCount = slideCount;
            me.items = $items;

            doCSS($itemsWrap, 'width', 100 * slideCount + '%');
            each($items, function(element){
                doCSS(element, 'width', (100 / slideCount) + '%');
            });

            me.rmAnim();
            me.adjRound();
            me.reset();
            me.addAnim();
            me.checkAuto();
        },
        reset() {
            var me = this;
            me.off();
            me.to(0);
        },
        checkDrag() {
            var me = this,
                mouseDrag = me.mouseDrag;
            me.unbindDrag();
            if(hasTouch || mouseDrag){
                //DragSnap support
                bindEvent(me.itemsWrap, EV_START, me.startCB);
            }
        },
        unbindDrag() {
            var me = this;
            unbindEvent(me.itemsWrap, EV_START, me.startCB);
        },
        checkAuto() {
            var me = this,
                auto = me.auto,

                turnOff = me.off,
                turnOn = me.on,

                $itemsWrap = me.itemsWrap;

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
            var me = this,
                $itemsWrap = me.itemsWrap;
            //reset reset animation
            doCSS($itemsWrap, PROP_TRANSITION, 'none');
            me.animPaused = true;
        },
        addAnim: function() {
            var me = this,
                $itemsWrap = me.itemsWrap;
            //Force to paint
            getOffset($itemsWrap);

            doCSS($itemsWrap, PROP_TRANSITION, PROP_TRANSFORM + ' ' + (me.speed / 1000) + 's ease');
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

                onSlideEnd = null,
                realIndex,
                left;
                
            if(hasLoop){
                if(index == -1){
                    onSlideEnd = function() {
                        removeAnimation();
                        go(itemsLen - 1);
                        addAnimation();
                    };
                }
                else if(index == itemsLen){
                    onSlideEnd = function() {
                        removeAnimation();
                        go(1);
                        addAnimation();
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
            doCSS(this.itemsWrap, PROP_TRANSFORM, `translate3d(${moveTo}%,0,0)`);
        },
        startCB(e) {
            var me = this,
                $el = me.$el,

                getEventData = me.getEv,
                removeAnimation = me.rmAnim,
                addAnimation = me.addAnim,
                transTo = me.transTo,
                getPercent = me.getPercent,

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

                $itemsWrap = me.itemsWrap,
                elWidth = getWidth($el),
                currentPos = getCurrentPos($itemsWrap);

            removeAnimation();

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
                    var percent = currentPos + (((stop.coords[0] - start.coords[0]) / elWidth) * 100 / me.slideCount);
                    transTo(percent);
                    e.preventDefault();
                }               
            }

            function snapback($itemsWrap, left) {
                var currentPos = getCurrentPos($itemsWrap),
                    left = ((!left && currentPos < 0) ? roundDown(currentPos) - 100 : roundDown(currentPos)) / me.slideCount;
                transTo(left);
            }

            function dragsnap(dir){
                me.nextPrev(dir);
            }

            bindEvent($itemsWrap, EV_MOVE, moveHandler);
            oneEvent($itemsWrap, EV_END, function(e) {
                var activeIndex = me.activeIndex;
                unbindEvent($itemsWrap, EV_MOVE, moveHandler);

                addAnimation();

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

                    if(deltaX > jumppoint && me.hasLoop || (!left && activeIndex >= 0 || left && activeIndex <= me.itemsLen - 1)) {
                        dragsnap(left ? DIR_NEXT : DIR_PREV);
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
                $items = me.items,
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
