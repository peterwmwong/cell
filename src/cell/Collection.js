// Generated by CoffeeScript 1.6.2
define(['cell/Events', 'util/type', 'cell/Model', 'cell/util/spy'], function(Events, type, Model, spy) {
  var Collection, iter;

  iter = function(str, before, after) {
    return Function.call(void 0, 'f', 'c', 'd', "if(this._i){" + "this._s();" + "if(f==null)return;" + ("var i=-1,t=this,l=t.length(),e" + (before || '') + ";") + "while(++i<l){" + "e=t._i[i];" + str + ("}" + (after || '') + "}"));
  };
  return Collection = Events.extend({
    constructor: function(array) {
      Events.call(this);
      this._i = [];
      this.add(array);
    },
    model: Model,
    at: function(index) {
      if (this._i) {
        this._s();
        return this._i[index];
      }
    },
    length: function() {
      if (this._i) {
        this._s();
        return this._i.length;
      }
    },
    indexOf: Array.prototype.indexOf ? function(model) {
      if (this._i) {
        this._s();
        return this._i.indexOf(model);
      }
    } : iter('if(e===f){return i}', '', 'return -1'),
    toArray: function() {
      if (this._i) {
        this._s();
        return this._i.slice();
      }
    },
    each: iter('if(f.call(c,e,i,t)===!1)i=l'),
    map: iter('r.push(f.call(c,e,i,t))', ',r=[]', 'return r'),
    reduce: iter('f=c.call(d,f,e,i,t)', '', 'return f'),
    filterBy: iter('for(k in f)' + 'if((v=f[k])==null||v===(x=e.get(k))||(typeof v=="function"&&v(x)))' + 'r.push(e)', ',k,v,x,r=[]', 'return r'),
    pipe: function(pipes) {
      var cur, pipe, _i, _len;

      if (this._i) {
        cur = this;
        for (_i = 0, _len = pipes.length; _i < _len; _i++) {
          pipe = pipes[_i];
          if (type.isA((cur = pipe.run(cur)))) {
            cur = new Collection(cur);
          }
        }
        return cur;
      }
    },
    add: function(models, index) {
      var i, len;

      if (this._i && models) {
        models = type.isA(models) ? models.slice() : [models];
        i = -1;
        len = models.length;
        if (index == null) {
          index = this.length();
        }
        while (++i < len) {
          this._i.splice(index++, 0, (models[i] = this._toM(models[i])));
        }
        this.trigger('add', models, this, index - len);
      }
    },
    remove: function(models) {
      var i, index, indices, len, model, removedModels;

      if (this._i && models) {
        if (!type.isA(models)) {
          models = [models];
        }
        i = -1;
        len = models.length;
        removedModels = [];
        indices = [];
        while (++i < len) {
          model = models[i];
          if ((index = this.indexOf(model)) > -1) {
            delete model.collection;
            removedModels.push(model);
            indices.push(index);
            this._i.splice(index, 1);
          }
        }
        if (indices.length) {
          this.trigger('remove', removedModels, this, indices);
        }
      }
    },
    destroy: function() {
      if (this._i) {
        Events.prototype.destroy.call(this);
        delete this._i;
      }
    },
    _toM: function(o) {
      o = o instanceof this.model ? o : new Model(o);
      o.collection = this;
      return o;
    },
    _s: spy.addCol
  });
});

/*
//@ sourceMappingURL=Collection.map
*/
