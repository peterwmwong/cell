define ->
   waitdo = (delay,f)-> setTimeout f,delay
   test = (f)-> (require,get,done)-> get ->
      f (new Function(@testName))(), done

   $testObj: 'Cell'
   $beforeTest: (require,done)->
      delete window.Cell
      done()

   "return Cell.extend({})": test (_,done)->
      for funcName in ['render','renderElement']
         strictEqual typeof _[funcName], 'function', "should have a function '#{funcName}'"
      done()

   """
   return Cell.extend({
      render:function(options,done){
         done("<p>"+options.key+"</p>");
      }
   }).renderElement({key:"value"});
   """: test (_,done)->
      ok _ instanceof HTMLElement, "should be an instanceof HTMLElement"
      strictEqual _.tagName, "DIV", "should be a <div>"
      ok _.innerHTML, exp="<p>value</p>", "innerHTML should be #{exp}"
      done()

   """
   return Cell.extend({
      render:function(options,done){
         done("<p>"+options.key+"</p>");
      }
   }).render({key:"value"});
   """: test (_,done)->
      strictEqual _, "<div id='__cell_0__'></div>", "should be the HTML for placeholder"
      done()

   """
   var One = Cell.extend({
      render:function(options,done){
         done("Hello from One");
      }
   });

   return Cell.extend({
      render:function(options,done){
         done(One.render());
      }
   }).renderElement({key:"value"});
   """: test (_,done)->
      strictEqual _.innerHTML, '<div id="__cell_1__">Hello from One</div>'
      done()

   """
   var One = Cell.extend({
      render:function(options,done){
         setTimeout(function(){
            done("Hello from One")
         },100);
      }
   });

   return Cell.extend({
      render:function(options,done){
         done(One.render());
      }
   }).renderElement();
   """: test (_,done)->
      strictEqual _.innerHTML, '<div id="__cell_1__"></div>', 'innerHTML should have nested Cell render placeholder'
      waitdo 101, ->
         strictEqual _.innerHTML, '<div id="__cell_1__">Hello from One</div>', 'innerHTML should have nested Cell after defered render'
         done()
