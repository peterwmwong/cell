// Generated by CoffeeScript 1.6.2
define(['cell/Model', 'cell/Collection', 'cell/util/http', 'cell/util/extend', 'cell/util/spy', 'cell/util/type'], function(Model, Collection, http, extend, spy, type) {
  var CollectionInstance, ModelInstance, Resource, getStatus, idfunc, setStatus;

  idfunc = function(o) {
    return o;
  };
  Resource = function(_arg) {
    var collection, model, transform;

    this.url = _arg.url, this._params = _arg.params, model = _arg.model, collection = _arg.collection, transform = _arg.transform;
    this.transform = transform || idfunc;
    this.Model = (model || Model).extend(ModelInstance);
    this.Collection = (collection || Collection).extend(CollectionInstance);
  };
  Resource.extend = extend;
  Resource.prototype.parseModelResponse = function(response, model) {
    var jsonObj, k, v;

    jsonObj = JSON.parse(response);
    jsonObj = this.transform(jsonObj);
    for (k in jsonObj) {
      v = jsonObj[k];
      model.set(k, v);
    }
  };
  Resource.prototype.parseCollectionResponse = function(response, collection) {
    var jsonObjs, obj;

    jsonObjs = JSON.parse(response);
    collection.add((function() {
      var _i, _len, _results;

      _results = [];
      for (_i = 0, _len = jsonObjs.length; _i < _len; _i++) {
        obj = jsonObjs[_i];
        _results.push(this.transform(obj));
      }
      return _results;
    }).call(this));
  };
  Resource.prototype.defaultParams = function(params) {
    var k;

    for (k in this._params) {
      if (params[k] == null) {
        params[k] = this._params[k];
      }
    }
  };
  Resource.prototype.create = function(attrs) {
    return new this.Model(this, attrs, true);
  };
  Resource.prototype.get = function(params, success, error) {
    var inst,
      _this = this;

    inst = new this.Model(this, void 0, false);
    http({
      method: 'GET',
      url: this.genUrl(params, false)
    }, function(status, response, isSuccess) {
      if (isSuccess) {
        _this.parseModelResponse(response, inst);
        inst._setStatus('ok');
        if (typeof success === "function") {
          success();
        }
      } else {
        inst._setStatus('error');
        if (typeof error === "function") {
          error();
        }
      }
    });
    return inst;
  };
  Resource.prototype.query = function(params, success, error) {
    var inst,
      _this = this;

    inst = new this.Collection(this);
    http({
      method: 'GET',
      url: this.genUrl(params, false)
    }, function(status, response, isSuccess) {
      if (isSuccess) {
        _this.parseCollectionResponse(response, inst);
        inst._setStatus('ok');
        if (typeof success === "function") {
          success();
        }
      } else {
        inst._setStatus('error');
        if (typeof error === "function") {
          error();
        }
      }
    });
    return inst;
  };
  Resource.prototype.genUrl = function(params) {
    var delim, k, newParams, url, v;

    newParams = {};
    for (k in params) {
      newParams[k] = params[k];
    }
    this.defaultParams(newParams);
    url = (url = this.url).replace(/{([A-z0-9]+)}/g, function(match, key, index) {
      var value;

      value = newParams[key];
      delete newParams[key];
      return encodeURIComponent(value);
    });
    delim = '?';
    for (k in newParams) {
      v = newParams[k];
      if (!(v)) {
        continue;
      }
      url += "" + delim + (encodeURIComponent(k)) + "=" + (encodeURIComponent(v));
      delim = '&';
    }
    return url;
  };
  getStatus = function() {
    spy.addResStatus.call(this);
    return this._status;
  };
  setStatus = function(newStatus) {
    this.trigger("status", this, this._status = newStatus);
  };
  ModelInstance = {
    constructor: function(_res, initialAttrs, isNew) {
      this._res = _res;
      Model.call(this, initialAttrs);
      this._status = (isNew ? 'new' : 'loading');
    },
    _setStatus: setStatus,
    status: getStatus,
    $delete: function(params, success, error) {
      var _this = this;

      if (this._status !== 'new') {
        http({
          method: 'DELETE',
          url: this._res.genUrl(params, false)
        }, function(status, response, isSuccess) {
          if (isSuccess) {
            _this._setStatus('deleted');
            if (typeof success === "function") {
              success();
            }
          } else {
            _this._setStatus('error');
            if (typeof error === "function") {
              error();
            }
          }
        });
        this._setStatus('deleting');
      }
    },
    $save: function(params, success, error) {
      var _this = this;

      http({
        method: this._status === 'new' ? 'POST' : 'PUT',
        url: this._res.genUrl(params, false),
        data: JSON.stringify(this._a)
      }, function(status, response, isSuccess) {
        if (isSuccess) {
          _this._res.parseModelResponse(response, _this);
          _this._setStatus('ok');
          if (typeof success === "function") {
            success();
          }
        } else {
          _this._setStatus('error');
          if (typeof error === "function") {
            error();
          }
        }
      });
      this._setStatus('saving');
    }
  };
  CollectionInstance = {
    constructor: function(_res) {
      this._res = _res;
      Collection.call(this);
      this._status = 'loading';
    },
    _setStatus: setStatus,
    status: getStatus,
    requery: function(params) {}
  };
  return Resource;
});

/*
//@ sourceMappingURL=Resource.map
*/
