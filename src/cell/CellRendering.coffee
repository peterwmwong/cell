define [], ->
   class CellRendering
      constructor: (cell,data,nodes)->
         unless cell and nodes
            throw new Error "CellRendering must have a cell and node"

         $ = (sel)->
            for n in nodes when hit=n.querySelector(sel)
               return hit
         
         $$ = (sel)->
            r = []
            for n in nodes when (hits=n.querySelectorAll(sel)) and hits.length>0
               for hit in hits
                  r.push hit
            r

         # Define read-only properties cell, node, $, $$ and data
         for k,v of {cell:cell, nodes:nodes, '$':$, '$$':$$}
            Object.defineProperty this, k, {value:v, enumerable:true}

         Object.defineProperty this, 'data', {get:(->data), enumerable:true}

         @update = (newdata,done)->
            data = newdata
            replace = nodes.splice(0,1)[0]
            for n in nodes
               n.parentNode.removeChild n
            @cell.render {data:data,replace:replace}, done
