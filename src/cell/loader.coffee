define ['require','cell'], (require,cell)->
   # Load/render Cells specified in DOM node data-cell attributes
   for node in document.querySelectorAll '[data-cell]' when cellname=node.dataset.cell
      do (node,cellname)->
         require ["cell!#{cellname}"], (c)->
            c.render
               data: try JSON.parse datastring if datastring=node.dataset.cellData
               to: node
