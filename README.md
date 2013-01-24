Cell encapsulates your UI components (HTML, JS, and CSS).


Getting Started
===============

### 1. Create (and compile) your cell

```coffee
# App.coffee
define (require)->
  App = require('cell/defineView!')
    render: (__)-> [
      __ '.greeting', 'Hello World'
    ]

  document.body.appendChild new App()
```

```css
/* App.css */
.App > .greeting {
  color: #BADA55;
}
```

### 2. Add dependencies and load cell

```html
<script src='cell/require.js'></script>
<script>
require.config({
  paths:{
    cell: 'cell/cell',
    dom: 'cell/dom'
  },
  deps: [
    'App'
  ]
});
</script>
```

### 3. Sit back and relax