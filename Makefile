VERSION  = `cat version`
src_files = $(shell find src -type f -name "*.coffee")

define compile_coffee
	mkdir -p build/js
	coffee -b -o build/js/ -c src/
endef

define build_requirejs_module
	./deps/lib/requirejs/build/build.sh name=$1 out=$2 baseUrl=build/js includeRequire=true $3
endef

define minify
	java -jar deps/build/google-closure-compiler/compiler.jar --js $1 --js_output_file $2
endef

#-------------------------------------------------------------------
# Convenience
#------------------------------------------------------------------- 
.PHONY : all nomin clean

all: build/cell-core.js build/cell.js
nomin: build/cell-core-nomin.js build/cell-nomin.js

build/cell-core-nomin.js: $(src_files)
	$(compile_coffee)
	$(call build_requirejs_module,cell/bootstrap-core,build/cell-core-nomin.js,optimize=none)

build/cell-nomin.js: build/cell-core-nomin.js
	$(call build_requirejs_module,cell/bootstrap,build/cell.js.tmp,optimize=none)
	cat deps/lib/less.js/less.js deps/lib/mustache.js/mustache.js build/cell.js.tmp > build/cell-nomin.js
	rm build/cell.js.tmp

build/cell-core.js: build/cell-core-nomin.js
	$(call minify,build/cell-core-nomin.js,build/cell-core.js)

build/cell.js: build/cell-nomin.js
	$(call minify,build/cell-nomin.js,build/cell.js)

clean: 
	@@rm -rf build

