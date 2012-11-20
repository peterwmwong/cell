// Generated by CoffeeScript 1.3.3

define(function() {
  return function() {
    var load_fixture;
    load_fixture = function(iframe_src, cb) {
      var $fixture_container, waitFor;
      $fixture_container = $('#spec-fixture');
      $fixture_container.empty().html("<iframe src='" + iframe_src + "'></iframe>");
      waitFor = function() {
        var $f, $fix;
        $fix = $('html', $('iframe', $fixture_container)[0].contentDocument);
        $f = function(sel) {
          return $(sel, $fix);
        };
        if ($f('body > *').length > 0) {
          return cb($f);
        } else {
          return setTimeout(waitFor, 20);
        }
      };
      return waitFor();
    };
    return describe('A single JS and single CSS are created correctly', function() {
      beforeEach(function() {
        this.$f = void 0;
        runs(function() {
          var _this = this;
          return load_fixture('/specs/fixtures/cell-builder-plugin/index.html', function($f) {
            _this.$f = $f;
          });
        });
        return waitsFor(function() {
          return this.$f != null;
        });
      });
      it("Should render Mock and MockNested Cells", function() {
        return expect(this.$f('body').html().trim()).toBe('<div class="Mock" cell="Mock">Mock: <div class="MockNested" cell="MockNested">MockNested</div></div>');
      });
      it("Should apply Mock css from all.css", function() {
        return expect(this.$f('.Mock').css('color')).toBe('rgb(0, 0, 255)');
      });
      it("Should apply MockNested css from all.css", function() {
        return expect(this.$f('.MockNested').css('color')).toBe('rgb(255, 0, 0)');
      });
      it("Should NOT attach <link> for Mock.css", function() {
        return expect(this.$f('head > link[href*="Mock.css"]').length).toBe(0);
      });
      return it("Should NOT attach <link> for MockNested.css", function() {
        return expect(this.$f('head > link[href*="MockNested.css"]').length).toBe(0);
      });
    });
  };
});
