# NimbleJS
> A tiny, highly debuggable, extensible data & rendering manager.

A data and rendering manager, so you can focus on writing awesome VDom.

[![CodeFactor](https://www.codefactor.io/repository/github/isnit0/nimble-js/badge/master)](https://www.codefactor.io/repository/github/isnit0/nimble-js/overview/master)

## Usage

```html
<script src='https://rawgit.com/ISNIT0/nimble-js/master/dist.js'></script>
<div id="frame"></div>
```

```javascript
const target = document.getElementById('frame');

const {
    makeRenderLoop,
    h
} = window.nimble;

makeRenderLoop(target, {
        number: 1
    },
    function (state, affect, changes) {
        return h('div.app', [
            h('h2', 'Hello, World!'),
            h('span', `Your number is [${state.number}]`),
            h('br'),
            h('button', {
                onclick: function () {
                    affect.set('number', state.number + 1);
                }
            }, 'Increment')
        ]);
    }
);
```