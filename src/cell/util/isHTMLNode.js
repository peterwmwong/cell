require.def('cell/util/isHTMLNode', [], function(){
   return function(node){
      return node && (node instanceof HTMLElement || node instanceof HTMLBodyElement || node.nodeType === Node.ELEMENT_NODE);
   };
});