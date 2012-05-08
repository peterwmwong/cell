Cell encapsulates your UI components (HTML, JS, and CSS).


Getting Started
===============

### 1. Create (and compile) your cell

```coffee
# App.coffee
define ['__'], (__)-> # import __ render helper
  render_el: (__)-> [
    __ '.greeting', 'Hello World'
  ]
```

```css
/* App.css */
.App > .greeting {
  color: #BADA55;
}
```

### 2. Add dependencies and load cell

```html
<script src="vendor/jquery.js"></script>
<script src='vendor/underscore.js'></script>
<script src='vendor/backbone.js'></script>
<!-- add require.js and load cell module -->
<script data-main='cell' src='node_modules/requirejs/require.js'></script>
```

### 3. Add your cell

```html
<body data-cell='App'></body>
```


### 4. Sit back and relax