VERSION       = `cat version`

DEPS          = deps

DEPS_LIB      = $(DEPS)/lib
REQUIREJS     = $(DEPS_LIB)/require.js
LESS          = $(DEPS_LIB)/less.js
LESS_MIN      = $(DEPS_LIB)/less-min.js

DEPS_BUILD    = $(DEPS)/build
GOOGLE_CLOSURE_COMPILER = $(DEPS_BUILD)/google-closure-compiler.jar

DEPS_TEST	  = $(DEPS)/test
QUNIT		     = $(DEPS_TEST)/qunit.js
QUNIT_CSS	  = $(DEPS_TEST)/qunit.css


DIST          = dist
DIST_CURRENT  = $(DIST)/current
DIST_VERSION  = $(DIST)/release/$(VERSION)
DIST_CURRENT_FILES = $(DIST_CURRENT)/cell.js \
						$(DIST_CURRENT)/cell-noRenderers.js


SRC           = src/cell
SRC_FILES     = $(SRC)/util/createClass.js \
					$(SRC)/util/Delegator.js \
					$(SRC)/util/EventSource.js \
					$(SRC)/util/isHTMLNode.js \
					$(SRC)/config.js \
					$(SRC)/util/loadComponents.js \
					$(SRC)/util/renderCSS.js \
					$(SRC)/CellInstance.js \
					$(SRC)/Cell.js \
					$(SRC)/cell-require-plugin.js \
					src/cell.js

MUSTACHE_RENDERER_FILES = $(SRC)/integration/templating/mustache.js \
							$(SRC)/integration/templating/mustache-template-renderer.js
							
LESS_RENDERER_FILES = $(SRC)/integration/styling/less-style-renderer.js


#-------------------------------------------------------------------
# Convenience
#------------------------------------------------------------------- 
.PHONY : clean update-deps-lib update-deps-build update-deps-test

clean : 
	@@echo "Removing all files and directories under $(DIST_CURRENT)"
		@@rm -rf $(DIST_CURRENT)/*

update-deps-test : 
	rm -rf $(DEPS_TEST)/*
	$(MAKE) -f Makefile $(DEPS_TEST)

#update-deps-build : 
#	rm -rf $(DEPS_BUILD)/*
#	$(MAKE) -f Makefile $(DEPS_BUILD)

update-deps-lib :
	rm -rf $(DEPS_LIB)/*
	$(MAKE) -f Makefile $(DEPS_LIB)


#-------------------------------------------------------------------
# deps/lib
#-------------------------------------------------------------------
$(DEPS_LIB) : $(REQUIREJS) $(LESS) $(LESS_MIN)

$(REQUIREJS) : 
	wget http://requirejs.org/docs/release/0.14.5/minified/require.js -O $(REQUIREJS)

$(LESS) : 
	wget http://github.com/cloudhead/less.js/raw/master/dist/less-1.0.36.js -O $(LESS)

$(LESS_MIN) : 
	wget http://github.com/cloudhead/less.js/raw/master/dist/less-1.0.36.min.js -O $(LESS_MIN)


#-------------------------------------------------------------------
# deps/test
#-------------------------------------------------------------------
$(DEPS_TEST) : $(QUNIT) $(QUNIT_CSS)

$(QUNIT) : 
	wget http://github.com/jquery/qunit/raw/master/qunit/qunit.js -O $(QUNIT)
	
$(QUNIT_CSS) : 
	wget http://github.com/jquery/qunit/raw/master/qunit/qunit.css -O $(QUNIT_CSS)


#-------------------------------------------------------------------
# deps/build
#-------------------------------------------------------------------

#-------------------------------------------------------------------
# dist/current
#-------------------------------------------------------------------
$(DIST_CURRENT) : $(DIST_CURRENT_FILES)

$(DIST_CURRENT)/cell.js : $(SRC_FILES) $(DEPS_LIB) $(MUSTACHE_RENDERER_FILES) $(LESS_RENDERER_FILES)
	cat $(REQUIREJS) \
			$(SRC_FILES) \
			$(MUSTACHE_RENDERER_FILES) \
			$(LESS) \
			$(LESS_RENDERER_FILES) \
				> $(DIST_CURRENT)/cell.js

$(DIST_CURRENT)/cell-noRenderers.js : $(SRC_FILES) $(DEPS_LIB) $(DEPS_BUILD)
	cat $(REQUIREJS) \
			$(SRC_FILES) \
				> $(DIST_CURRENT)/cell-noRenderers.js
