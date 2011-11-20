define ->

  $fixture_container = $('#qunit-fixture')

  load_fixture = (html, cb)->
    $fixture_container.html html
    waitFor = ->
      $fix = $ 'html', $('iframe',$fixture_container)[0].contentDocument
      $f = (sel)-> $ sel, $fix
      if $f('body > *').length > 0 then cb $f
      else setTimeout waitFor, 20
    waitFor()
    
  $afterEach: -> $fixture_container.html ''

  'verifies a single JS and single CSS is created correctly':
    async: ->
      expect 5
      load_fixture '<iframe src="/test/fixtures/cell-builder-plugin/index.html"></iframe>', ($f)->

        equal $f('body').html().trim(),
          '<div class="Mock">Mock: <div class="MockNested">MockNested</div></div>'
          "Should render Mock and MockNested Cells"

        equal $f('.Mock').css('color'),
          'rgb(0, 0, 255)'
          "Should apply Mock css from all.css"

        equal $f('.MockNested').css('color'),
          'rgb(255, 0, 0)'
          "Should apply MockNested css from all.css"

        equal $f('head > link[href*="Mock.css"]').length,
          0,
          "Should NOT attach <link> for Mock.css"
          
        equal $f('head > link[href*="MockNested.css"]').length,
          0,
          "Should NOT attach <link> for MockNested.css"
        
        start()
