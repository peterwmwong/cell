define (require)->
  require('bench-dom')
    dom_html: '<select multiple name="samp"></select>'
    both: "dom.attr('name');"