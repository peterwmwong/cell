define [], ->
   class CellRendering
      constructor: (cell,data,node)->
         unless cell and node
            throw new Error "CellRendering must have a cell and node"

         # Define read-only properties cell, node, $, $$ and data
         for k,v of {cell:cell, node:node, '$':node.querySelector.bind(node), '$$':node.querySelectorAll.bind(node)}
            Object.defineProperty this, k, {value:v, enumerable:true}

         Object.defineProperty this, 'data', {get:(->data), enumerable:true}

         @update = (newdata,done)->
            data = newdata
            @cell.render {data:data,to:node}, done
