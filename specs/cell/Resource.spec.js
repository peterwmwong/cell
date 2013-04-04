// Generated by CoffeeScript 1.6.2
var __slice = [].slice;

define(function() {
  return function(_arg) {
    var beforeEachRequire, http;

    beforeEachRequire = _arg.beforeEachRequire;
    beforeEachRequire({
      'cell/util/http': http = jasmine.createSpy('http')
    }, ['cell/Model', 'cell/Resource', 'cell/Collection'], function(Model, Resource, Collection) {
      this.Model = Model;
      this.Resource = Resource;
      this.Collection = Collection;
      http.reset();
      this.http = http;
      return this.addMatchers({
        toHaveBeenCalledWithCallback: function() {
          var actualArgs, args, expectedArg, i, mismatchedKeys, mismatchedValues, _i, _len;

          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          actualArgs = this.actual.calls[0].args;
          mismatchedKeys = [];
          mismatchedValues = [];
          for (i = _i = 0, _len = args.length; _i < _len; i = ++_i) {
            expectedArg = args[i];
            if (!this.env.equals_(actualArgs[i], expectedArg, mismatchedKeys, mismatchedValues)) {
              this.message = function() {
                return "Expected " + (JSON.stringify(actualArgs[i])) + " to equal " + (JSON.stringify(expectedArg)) + ", " + mismatchedKeys + ", " + mismatchedValues;
              };
              return false;
            }
          }
          return typeof actualArgs[args.length] === 'function';
        }
      });
    });
    describe('new Resource( url:string, defaultParams:object )', function() {
      beforeEach(function() {
        return this.resource = new this.Resource('/{defaultPathParam}/{pathParam}', {
          defaultPathParam: 'default'
        });
      });
      describe('@genUrl( params:object, disableQueryParams:boolean ) : String', function() {
        var describeGenUrl, params;

        describeGenUrl = function(urlWithParams, inputParams, outputUrl, outputUrlDisableQueryParams) {
          var inputParamsDisableQueryParams, k;

          inputParamsDisableQueryParams = {};
          for (k in inputParams) {
            inputParamsDisableQueryParams[k] = inputParams[k];
          }
          it("When url is '" + urlWithParams + "', resource.genUrl( " + (JSON.stringify(inputParams)) + ", false ) === '" + outputUrl + "'", function() {
            var resource;

            resource = new this.Resource(urlWithParams);
            return expect(resource.genUrl(inputParams)).toBe(outputUrl);
          });
          return it("... with disableQueryParams === true, resource.genUrl( " + (JSON.stringify(inputParamsDisableQueryParams)) + ", true ) === '" + outputUrlDisableQueryParams + "'", function() {
            var resource;

            resource = new this.Resource(urlWithParams);
            return expect(resource.genUrl(inputParamsDisableQueryParams, true)).toBe(outputUrlDisableQueryParams);
          });
        };
        params = function() {
          return {
            one: 1,
            two2: 'deux',
            thr_ee: '{san}'
          };
        };
        describeGenUrl('/x', params(), '/x?one=1&two2=deux&thr_ee=%7Bsan%7D', '/x');
        describeGenUrl('/x/{one}', params(), '/x/1?two2=deux&thr_ee=%7Bsan%7D', '/x/1');
        describeGenUrl('/x/{thr_ee}', params(), '/x/%7Bsan%7D?one=1&two2=deux', '/x/%7Bsan%7D');
        return describeGenUrl('/x/{one}/{two2}/{thr_ee}', params(), '/x/1/deux/%7Bsan%7D', '/x/1/deux/%7Bsan%7D');
      });
      describe('@create( params:object ) : Resource.Instance', function() {
        beforeEach(function() {
          return this.resourceItem = this.resource.create({
            pathParam: 'path',
            one: 1,
            two: 'duex',
            three: 'san'
          });
        });
        it('issues a HTTP request', function() {
          return expect(this.http).toHaveBeenCalledWithCallback({
            method: 'POST',
            url: '/default/path',
            data: JSON.stringify({
              one: 1,
              two: 'duex',
              three: 'san'
            })
          });
        });
        it('creates an empty Resource.Instance (Model)', function() {
          expect(this.resourceItem instanceof this.Resource.Instance).toBe(true);
          expect(this.resourceItem instanceof this.Model).toBe(true);
          return expect(this.resourceItem.attributes()).toEqual({});
        });
        return describe('when http JSON response received', function() {
          beforeEach(function() {
            return this.http.calls[0].args[1](200, JSON.stringify({
              one: 1,
              two: 'deux',
              three: 'san'
            }));
          });
          return it('assigns all properties', function() {
            return expect(this.resourceItem.attributes()).toEqual({
              one: 1,
              two: 'deux',
              three: 'san'
            });
          });
        });
      });
      describe('@get( params:object ) : Resource.Instance', function() {
        beforeEach(function() {
          return this.resourceItem = this.resource.get({
            pathParam: 'path',
            queryParam: 'queryValue'
          });
        });
        it('issues a HTTP request', function() {
          return expect(this.http).toHaveBeenCalledWithCallback({
            method: 'GET',
            url: '/default/path?queryParam=queryValue'
          });
        });
        it('creates an empty Resource.Instance (Model)', function() {
          expect(this.resourceItem instanceof this.Resource.Instance).toBe(true);
          expect(this.resourceItem instanceof this.Model).toBe(true);
          return expect(this.resourceItem.attributes()).toEqual({});
        });
        return describe('when http JSON response received', function() {
          beforeEach(function() {
            return this.http.calls[0].args[1](200, JSON.stringify({
              one: 1,
              two: 'deux',
              three: 'san'
            }));
          });
          return it('assigns all properties', function() {
            return expect(this.resourceItem.attributes()).toEqual({
              one: 1,
              two: 'deux',
              three: 'san'
            });
          });
        });
      });
      return describe('#query( params:object ) : ResourceCollectionInstance', function() {
        beforeEach(function() {
          return this.resourceItem = this.resource.query({
            pathParam: 'path',
            queryParam: 'queryValue'
          });
        });
        it('issues a HTTP request', function() {
          return expect(this.http).toHaveBeenCalledWithCallback({
            method: 'GET',
            url: '/default/path?queryParam=queryValue'
          });
        });
        it('creates an empty Resource.CollectionInstance (Model)', function() {
          expect(this.resourceItem instanceof this.Resource.CollectionInstance).toBe(true);
          expect(this.resourceItem instanceof this.Collection).toBe(true);
          return expect(this.resourceItem.length()).toBe(0);
        });
        return describe('when http JSON response received', function() {
          beforeEach(function() {
            return this.http.calls[0].args[1](200, JSON.stringify([
              {
                id: 123,
                name: 'Grace'
              }, {
                id: 456,
                name: 'Peter'
              }
            ]));
          });
          return it('adds all Models', function() {
            expect(this.resourceItem.at(0).attributes()).toEqual({
              id: 123,
              name: 'Grace'
            });
            return expect(this.resourceItem.at(1).attributes()).toEqual({
              id: 456,
              name: 'Peter'
            });
          });
        });
      });
    });
    describe('ResourceCollectionInstance', function() {
      it('is an instanceof Collection', function() {});
      return describe('@requery( params:object ) : ', function() {});
    });
    return describe('Resource.Instance', function() {
      describe('@delete( params:object ) : Resource.Instance', function() {});
      return describe('@save( params:object ) : Resource.Instance', function() {});
    });
  };
});

/*
//@ sourceMappingURL=Resource.spec.map
*/