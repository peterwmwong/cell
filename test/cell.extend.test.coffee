define

  'extend(<NOT AN OBJECT>) throws an error': ->
    for invalid in [7,"string",(->)]
      whenStr = "expected error thrown, when argument is #{invalid}"
      try
        cell.extend invalid
        ok false, whenStr
      catch e
        equal e, "cell.extend(): expects an object {render,init,name}", whenStr
    
  'extend({tag:<string>,init:<function>,render:<function>,name:String}): init, render, name are optional': ->
    for tag in [undefined,null,"<span>"]
      for name in [undefined,null,"exampleName"]
        for init in [undefined,null,(->)]
          for render in [undefined,null,(->)]
            whenStr = "when #{JSON.stringify {init,render,name}}"

            NewCell = cell.extend {tag, init, render, name}
            ok (NewCell.prototype instanceof cell), "prototype is an instanceof cell, #{whenStr}"
            equal NewCell::tag, tag, "prototype.tag is the name passed in cell.extend(#{whenStr})"
            equal NewCell::name, name, "prototype.name is the name passed in cell.extend(#{whenStr})"
            equal NewCell::init, init, "prototype.init is the init function passed in cell.extend(#{whenStr})"
            equal NewCell::render, render, "prototype.render is the render function passed in cell.extend(#{whenStr})"
            ok ((new NewCell()) instanceof cell), "instance is an instanceof newly created cell, when cell.extend(#{whenStr})"

  'extend({init:<NOT A FUNCTION>, render:<NOT A FUNCTION>}), throws an error': ->
    vals = [5,"string",[],{},(->),undefined,null]
    for init in vals
      for render in vals when not ((typeof init is 'function' or init in [null,undefined]) and (typeof render is 'function' or render in [null,undefined]))
        whenStr = "expected error thrown, when typeof init == #{typeof init} and typeof render == #{typeof render}"
        try
          cell.extend {init,render}
          ok false, whenStr
        catch e
          equal e, "cell.extend(): expects {render,init} to be functions", whenStr

  'extend({}), inherits parent cell attributes': ->
    SeniorBlargo = cell.extend
      name:'SeniorBlargo'
      key1:'val1'
      key2:'val2'
    JuniorBlargo = SeniorBlargo.extend()
    equal SeniorBlargo::name, JuniorBlargo::name, 'Same name'
    equal SeniorBlargo::key1, JuniorBlargo::key1, 'Same attribute key1'
    equal SeniorBlargo::key2, JuniorBlargo::key2, 'Same attribute key2'

  'extend({}), inherits parent cell attributes are overrideable': ->
    SeniorBlargo = cell.extend
      name:'SeniorBlargo'
      toBeOverriden:'val'
    JuniorBlargo = SeniorBlargo.extend
      name:'JuniorBlargo'
      toBeOverriden:'val2'
    equal JuniorBlargo::name, 'JuniorBlargo', 'Same name'
    equal JuniorBlargo::toBeOverriden, 'val2', 'Same attribute key1'
