define [
  'jquery'
  '../utils/spec-utils'
  ], ($,{nodeToHTML,msie})-> ({beforeEachRequire})->
    load_fixture = (iframe_src, cb)->
      $fixture_container = $ '#spec-fixture'
      $fixture_container
        .empty()
        .html "<iframe src='#{iframe_src}'></iframe>"

      waitFor = ->
        $fix = $ 'html', $('iframe',$fixture_container)[0].contentDocument
        $f = (sel)-> $ sel, $fix
        if $f('body > .Mock').length > 0 then cb $f
        else setTimeout waitFor, 20
      waitFor()

    if isNaN(msie)
      describe '@repathCSSRelativeURL(cssContents, cssFilePath, baseUrl)', ->
        beforeEach ->
          window.process =
            versions:
              node: '0.8.11'

          window.require.nodeRequire = (dep)=>
            if dep is 'path'
              @path =
                dirname: jasmine.createSpy('path.dirname').andCallFake (a)-> "path_dirname(#{a})"
                join: jasmine.createSpy('path.join').andCallFake (a,b)-> "path_join(#{a},#{b})"
                relative: jasmine.createSpy('path.relative').andCallFake (a,b)-> "path_relative(#{a},#{b})"

        afterEach ->
          delete window.process
          delete window.require.nodeRequire

        beforeEachRequire ['cell/defineView-builder-plugin'], (@defineViewPlugin)->

        it "repath relative url()'s to be rooted to the project", ->
          cssContents =
            """
            .hasRelativeURL1 {
              background-image: url('./three/img.png');
            }
            .hasRelativeURL2 {
              background-image:url(three/img.png);
            }
            .hasRelativeURL3 {
              background-image: \turl("three/img.png");
            }
            .hasAbsoluteURL1 {
              background-image: url('/abs/img.png');
            }
            .hasAbsoluteURL1 {
              background-image: url('https://www.google.com/images/srpr/logo3w.png');
            }
            """
          cssFilePath = '/one/two/cssFile.css'
          baseUrl = '/one/'
          result = @defineViewPlugin.repathCSSRelativeURL cssContents, cssFilePath, baseUrl

          expect(result).toEqual do->
            """
            .hasRelativeURL1 {
              background-image: url('path_relative(/one/,path_join(path_dirname(/one/two/cssFile.css),./three/img.png))');
            }
            .hasRelativeURL2 {
              background-image: url('path_relative(/one/,path_join(path_dirname(/one/two/cssFile.css),three/img.png))');
            }
            .hasRelativeURL3 {
              background-image: url('path_relative(/one/,path_join(path_dirname(/one/two/cssFile.css),three/img.png))');
            }
            .hasAbsoluteURL1 {
              background-image: url('/abs/img.png');
            }
            .hasAbsoluteURL1 {
              background-image: url('https://www.google.com/images/srpr/logo3w.png');
            }
            """

    describe_builder_spec = (desc,cssFname,jsFname)->

      describe desc, ->

        describe 'A single JS and single CSS are created correctly', ->
          beforeEach ->
            @$f = undefined
            runs -> load_fixture "../specs/fixtures/defineView-builder-plugin/index.html?css=#{cssFname}&js=#{jsFname}", (@$f)=>
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

          it "Should repath CSS urls", ->
            expect(@$f('.MockNested').css('background-image')).toMatch /specs\/fixtures\/defineView-builder-plugin\/dir\/logo.png/

          it "Should apply MockNested css from all.css", ->
            expect(@$f('.MockNested').css('color')).toBe (
              if msie < 9 then '#f00'
              else 'rgb(255, 0, 0)'
            )

          it "Should NOT attach <link> for Mock.css", ->
            expect(@$f('head > link[href*="Mock.css"]').length).toBe 0
              
          it "Should NOT attach <link> for MockNested.css", ->
            expect(@$f('head > link[href*="MockNested.css"]').length).toBe 0
          
    describe_builder_spec 'When a filename is specified in the r.js build "out" config', 'all', 'all'
    describe_builder_spec 'When a filename is specified in the r.js build "out" and "outcss" config', 'all-outcss-filename', 'all-outjs-filename'
    describe_builder_spec 'When a function is specified in the r.js build "out" and "outcss" config', 'all-nodeBuild', 'all-nodeBuild'
