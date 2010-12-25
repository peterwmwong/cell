define -> (name,css,done)->
   styleTag = document.createElement 'style'
   styleTag.id = name
   styleTag.innerHTML = css
   document.head.appendChild styleTag

   done styleTag
