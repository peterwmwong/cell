
  define((function() {
    var div;
    div = document.createElement('div');
    return {
      normalizeHTML: function(html) {
        div.innerHTML = html;
        return div.innerHTML;
      },
      nodeToHTML: function(node) {
        div.innerHTML = '';
        div.appendChild(node);
        return div.innerHTML;
      }
    };
  })());
