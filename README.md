Cell encapsulates your UI components (HTML, JS, and CSS).


Getting Started
===============

### 1. Create your cell

```coffee
# views/App.coffee
define
  render: (_)-> [
    _ '.greeting', 'Hello World'
  ]
```

```css
/* views/App.css */
.App > .greeting{
  color: #BADA55;
}
```

### 2. Attach cell.js (after `require.js`)

```html
<script src='cell.js'></script>
```

### 3. Append your cell

```html
<body data-cell='views/App'>
```


### 4. Sit back and relax