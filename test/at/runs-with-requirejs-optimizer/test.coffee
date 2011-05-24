define -> (done)->
  equal '<div class=" Mock">Mock: <div class=" MockNested">MockNested</div> </div>',
    @$('body').html().trim()
    "Should render Mock and MockNested Cells"

  equal 'rgb(0, 0, 255)',
    @$('.Mock').css('color')
    "Should apply Mock css from all.css"

  equal 'rgb(255, 0, 0)',
    @$('.MockNested').css('color')
    "Should apply MockNested css from all.css"

  equal 0,
    @$('head > link[href*="Mock.css"]').length,
    "Should NOT attach <link> for Mock.css"
    
  equal 0,
    @$('head > link[href*="MockNested.css"]').length,
    "Should NOT attach <link> for MockNested.css"
    
  done()

