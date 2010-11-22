
on('render',function(ev){
   ev.node.querySelector('#clickMe').onclick = function(e){
      ev.node.querySelector('#result').innerHTML+= ev.data.fname+' '+ev.data.lname+'<br />';
   };
});
