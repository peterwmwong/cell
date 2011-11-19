define -> (done)->
  equal @$('body').html().trim(),
    '<div class=" Mock">Mock: <div class=" MockNested">MockNested</div></div>'
    "Should render Mock and MockNested Cells"

  equal @$('.Mock').css('color'),
    'rgb(0, 0, 255)'
    "Should apply Mock css from all.css"

  equal @$('.MockNested').css('color'),
    'rgb(255, 0, 0)'
    "Should apply MockNested css from all.css"

  equal @$('head > link[href*="Mock.css"]').length,
    0,
    "Should NOT attach <link> for Mock.css"
    
  equal @$('head > link[href*="MockNested.css"]').length,
    0,
    "Should NOT attach <link> for MockNested.css"
    
  done()

