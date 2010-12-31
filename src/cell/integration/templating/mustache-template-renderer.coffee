define ['cell/Config'], (Config)->
   tmpNodeId = 0

   # Set less as style.renderer
   Config.set 'template.renderer', ({template,data},done)->
      nestedRequests =[]

      done
         html: window.Mustache.to_html( template, data,
            #TODO Support id (templates can specify id of container div)
            getPartial: (cname,ndata,id)->
              nestedRequests.push
                 cell: cname
                 data: ndata
                 to: (nodeid = 'cellTmpNode' + tmpNodeId++)
                 id: id

              # Hidden temp node that will be replaced when
              return "<div id='#{nodeid}' style='display:none'> </div>"
         )
         nestedRequests: nestedRequests

