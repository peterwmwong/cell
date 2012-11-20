define ->
  ->
    load_fixture = (iframe_src, cb)->
      $fixture_container = $('#spec-fixture')
      $fixture_container.
        empty().
        html "<iframe src='#{iframe_src}'></iframe>"

      waitFor = ->
        $fix = $ 'html', $('iframe',$fixture_container)[0].contentDocument
        $f = (sel)-> $ sel, $fix
        if $f('body > *').length > 0 then cb $f
        else setTimeout waitFor, 20
      waitFor()

    describe 'A single JS and single CSS are created correctly', ->
      beforeEach ->
        @$f = undefined
        runs -> load_fixture '/specs/fixtures/cell-builder-plugin/index.html', (@$f)=>
        waitsFor -> @$f?

      it "Should render Mock and MockNested Cells", ->
        expect(@$f('body').html().trim()).
          toBe '<div class="Mock" cell="Mock">Mock: <div class="MockNested" cell="MockNested">MockNested</div></div>'

      it "Should apply Mock css from all.css", ->
        expect(@$f('.Mock').css('color')).
          toBe 'rgb(0, 0, 255)'

      it "Should apply MockNested css from all.css", ->
        expect(@$f('.MockNested').css('color')).
          toBe 'rgb(255, 0, 0)'

      it "Should NOT attach <link> for Mock.css", ->
        expect(@$f('head > link[href*="Mock.css"]').length).toBe 0
          
      it "Should NOT attach <link> for MockNested.css", ->
        expect(@$f('head > link[href*="MockNested.css"]').length).toBe 0
        
