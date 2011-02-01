define(['cell!','./others/jsOnly','cell!./others/jsOnlyCell'],function(c){
   c.jsSpy = sinon.spy();
   c.jsSpy.apply(c, arguments);
});
