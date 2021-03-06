#===================================================================
#--------------------------- VARIABLES -----------------------------
#===================================================================
requirejsBuild = src/r.js


#===================================================================
#­--------------------------- TARGETS ------------------------------
#===================================================================
.PHONY : all

all: specs

#-------------------------------------------------------------------
# BUILD
#------------------------------------------------------------------- 

#-------------------------------------------------------------------
# Dependencies 
#------------------------------------------------------------------- 
deps: 
	npm install

lodash:
	node_modules/.bin/lodash backbone -o support/lodash.custom.js
	rm ./lodash.*js

#-------------------------------------------------------------------
# TEST
#------------------------------------------------------------------- 

# Build test/fixtures/defineView-builder-plugin/
# 	- Tests cell can be properly used by requirejs optimizer build script
spec-defineView-builder-plugin:
	script/compile-specs
	node $(requirejsBuild) -o specs/fixtures/defineView-builder-plugin/build.js
	node $(requirejsBuild) -o specs/fixtures/defineView-builder-plugin/build-outcss-filename.js
	cd specs/fixtures/defineView-builder-plugin; node node_build.js

define MAKE_ALL_TESTS_COFFEE
specs = process.argv[4..].map (e)-> "spec!#{/(.*?\.spec)\.js/.exec(e)[1]}"
console.log "define(#{JSON.stringify specs},function(){return Array.prototype.slice.call(arguments)});"
endef
export MAKE_ALL_TESTS_COFFEE

specs: deps spec-defineView-builder-plugin
	script/compile-specs
	cd specs/; find . -name "*.spec.js" -type f | xargs ../node_modules/.bin/coffee -e "$$MAKE_ALL_TESTS_COFFEE" > GENERATED_all-specs.js
