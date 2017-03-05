# vue-l-carousel

> A responsive carousel(namely slider or swiper) component for Vue.js v2.x+. [Live demo](https://cdn.rawgit.com/lsycxyj/vue-l-carousel/master/demo/index.html)

### Pull requests are welcome :)

![Build Status](https://travis-ci.org/lsycxyj/vue-l-carousel.svg?branch=master)
[![Coverage](https://img.shields.io/codecov/c/github/lsycxyj/vue-l-carousel/master.svg)](https://codecov.io/github/lsycxyj/vue-l-carousel?branch=master)

## License
LGPL-V3  
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](http://www.gnu.org/licenses/lgpl-3.0)

## Features

- Responsive carousel component for both desktop and mobile devices.
- No extra dependencies except Vue
- High performance with GPU acceleration and transition animations
- Available to be styled with CSS
- Event-based API and notification

## Installation

[![vue-l-carousel](https://nodei.co/npm/vue-l-carousel.png)](https://npmjs.org/package/vue-l-carousel)

`npm install vue-l-carousel`

## Usage
```html
    <carousel :auto="3000" :watch-items="list">
        <carousel-item v-for="(item, index) in list">
            <p>CarouselItem{{index}}, URL is {{item.url}}</p>
        </carousel-item>

        <div slot="before">Insert node before</div>
        <div slot="after">Insert node after</div>
    </carousel>
```
```javascript
import { Carousel, CarouselItem } from 'vue-l-carousel'
export default {
    data() {
        return {
            auto: 3000,
            list: [
                {
                    url: 'url1'
                },
                {
                    url: 'url2'
                },
                {
                    url: 'url3'
                },
            ]
        }
    },
    components: {
        'carousel': Carousel,
        'carousel-item': CarouselItem
    }
}
```
## Carousel configs and API
### props
<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th style="width: 100px;">Name</th>
            <th style="width: 50px;">Type</th>
            <th style="width: 50px;">Default</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>prev-html</td>
            <td>String</td>
            <td>&lt;</td>
            <td>HTML content of the previous button.</td>
        </tr>
        <tr>
            <td>next-html</td>
            <td>String</td>
            <td>&gt;</td>
            <td>HTML content of the next button.</td>
        </tr>
        <tr>
            <td>speed</td>
            <td>Number</td>
            <td>300</td>
            <td>The time of the transition animation. In ms.</td>
        </tr>
        <tr>
            <td>loop<sup>[2]</sup></td>
            <td>Boolean</td>
            <td>false</td>
            <td>
                It can go to next/previous slide at the ends if it's set to true. It works only the items' length more than 1.
            </td>
        </tr>
        <tr>
            <td>rewind<sup>[2]</sup></td>
            <td>Boolean</td>
            <td>false</td>
            <td>Rewind to the other end instead of endless loop, but you can only go to the other end by previous or next button, if it's set to true. It works only loop is set to true.</td>
        </tr>
        <tr>
            <td>mouse-drag</td>
            <td>Boolean</td>
            <td>false</td>
            <td>It can be drag by mouse if it's set to true.</td>
        </tr>
        <tr>
            <td>auto</td>
            <td>Number</td>
            <td>0</td>
            <td>Autoplay interval. In ms. 0 for no autoplay.</td>
        </tr>
        <tr>
            <td>dots</td>
            <td>Boolean</td>
            <td>true</td>
            <td>Pagination is available if it's set to true.</td>
        </tr>
        <tr>
            <td>dots-style</td>
            <td>[Object, String, Array]</td>
            <td><pre>''</pre></td>
            <td>Style of v-carousel-dots</td>
        </tr>
        <tr>
            <td>watch-items<sup>[1][2]</sup></td>
            <td>Array</td>
            <td><pre>[]</pre></td>
            <td>The original data list used to render the CarouselItems. The component will rerender if this property changes.</td>
        </tr>
    </tbody>
</table>

Notice: 

[1]: Required props  
[2]: Changing it will cause `render-update` event.  

### events
<table  class="table table-bordered table-striped">
    <thead>
        <tr>
            <th style="width: 100px;">Name</th>
            <th style="width: 50px;">Direction</th>
            <th style="width: 50px;">Arguments</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>changed-index</td>
            <td>Emit</td>
            <td>
                <pre>
{  
    index, // Current index
    total, // Total amount of items
    item, // Item data of current index
}
                </pre>
            </td>
            <td>It emits when index changed.</td>
        </tr>
        <tr>
            <td>render-updated</td>
            <td>Emit</td>
            <td>-</td>
            <td>It emits when render updated.</td>
        </tr>
        <tr>
            <td>next</td>
            <td>Receive</td>
            <td>-</td>
            <td>Make carousel go to the next slide.</td>
        </tr>
        <tr>
            <td>prev</td>
            <td>Receive</td>
            <td>-</td>
            <td>Make carousel go to the previous slide.</td>
        </tr>
        <tr>
            <td>to</td>
            <td>Receive</td>
            <td><pre>index</pre></td>
            <td>Make carousel go to the specific index of slide.</td>
        </tr>
    </tbody>
</table>

## Well, what's next?
- ~~Load resources via AJAX~~ (For single responsibility, I recommend you to composite with other libraries, [v-l-lazyload](https://github.com/lsycxyj/vue-l-lazyload) for [example](https://cdn.rawgit.com/lsycxyj/vue-l-carousel/master/demo/index_with_lazyload.html) instead)
- Vertical orientation support
- Add components for dots
- Multiple items in the same page
- More elegant way to test behaviors

