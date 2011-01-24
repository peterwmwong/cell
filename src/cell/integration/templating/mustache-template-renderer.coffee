define ['cell/Config'], (Config)->
   tmpNodeId = 0

   # Set less as style.renderer
   Config.set 'template.renderer', ({template,data},done)->
      nestedRequests =[]

      done
         html: window.Mustache.to_html( template, data,
            #TODO Support id (templates can specify id of container div)
            getPartial: (cname,ndata,id,tag)->
              nestedRequests.push
                 cell: cname
                 data: ndata
                 replace: (nodeid='cellTmpNode' + tmpNodeId++)
                 id: id
                 tag: tag

              # Hidden temp node that will be replaced when
              tag ?= 'div'
              return "<#{tag} id='#{nodeid}' style='display:none'> </#{tag}>"
         )
         nestedRequests: nestedRequests

