# NimbleJS
> A tiny, highly debuggable, extensible, UI framework.


## Usage

```html
<script src=''></script>
<div id="frame"></div>
```

```javascript
const target = document.getElementById('#frame');

const {
    makeRenderLoop,
    h
} = window.nimble;

makeRenderLoop(target, {
        number: 1
    },
    function (state, affect, changes) {
        return h('div.app', {}, [
            h('h2', {}, 'Hello, World!'),
            h('span', {}, `Your number is [${state.number}]`),
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