define [
  'jquery'
  '../utils/spec-utils'
  ], ($,{nodeToHTML,msie})-> ->
    load_fixture = (iframe_src, cb)->
      $fixture_container = $ '#spec-fixture'
      $fixture_container
        .empty()
        .html "<iframe src='#{iframe_src}'></iframe>"

      waitFor = ->
        $fix = $ 'html', $('iframe',$fixture_container)[0].contentDocument
        $f = (sel)-> $ sel, $fix
        if $f('body > *').length > 1 then cb $f
        else setTimeout waitFor, 20
      waitFor()

    describe 'A single JS and single CSS are created correctly', ->
      beforeEach ->
        @$f = undefined
        runs -> load_fixture '../specs/fixtures/defineView-builder-plugin/index.html', (@$f)=>
        waitsFor -> @$f?

      afterEach ->
        $('#spec-fixture').empty()

      it "Should render Mock and MockNested Cells", ->
        expect(nodeToHTML @$f('body')[0]).
          toMatch /<div cell="Mock" class="Mock">Mock: <div cell="MockNested" class="MockNested">MockNested<\/div><\/div>/

      it "Should apply Mock css from all.css", ->
        expect(@$f('.Mock').css('color')).toBe (
          if msie < 9 then '#00f'
          else 'rgb(0, 0, 255)'
        )

      it "Should apply MockNested css from all.css", ->
        expect(@$f('.MockNested').css('color')).toBe (
          if msie < 9 then '#f00'
          else 'rgb(255, 0, 0)'
        )

      it "Should NOT attach <link> for Mock.css", ->
        expect(@$f('head > link[href*="Mock.css"]').length).toBe 0
          
      it "Should NOT attach <link> for MockNested.css", ->
        expect(@$f('head > link[href*="MockNested.css"]').length).toBe 0
        
