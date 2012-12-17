// Generated by CoffeeScript 1.4.0

define(['underscore', 'backbone'], function(_, Backbone) {
  var Reference, ReferenceReference, ctor;
  Reference = function(model, attrs, transform, context) {
    this.model = model;
    this.attrs = attrs;
    this.context = context;
    if (transform) {
      this.transform = transform;
    }
    this.model.on("change:" + (this.attrs.join(' change:')), this._onChange, this);
    if (this.attrs.length > 1) {
      this.value = new Function("return this.transform" + (this.context ? '.call(this.context,' : '(') + ("this.model.attributes." + (this.attrs.join(', this.model.attributes.')) + ")"));
    }
    return this;
  };
  ctor = function() {
    this.constructor = Reference;
    this.combine = function(references, transform, context) {
      if (references instanceof Reference) {
        references = [references];
      } else if ((!_.isArray(references)) || (references.length === 0)) {
        return this;
      }
      return new ReferenceReference([this].concat(references), transform, context);
    };
    this.ref = function(transform, context) {
      if (typeof transform !== 'function') {
        return this;
      }
      return new ReferenceReference([this], transform, context);
    };
    this._onChange = _.debounce((function() {
      this.trigger('change', this, this.value());
    }), 0);
    this.onChangeAndDo = function(handler, context) {
      this.on('change', handler, context);
      handler.call(context, this, this.value());
    };
    this.value = function() {
      return this.transform.call(this.context, this.model.attributes[this.attrs[0]]);
    };
    this.transform = function(v) {
      return v;
    };
    return this;
  };
  ctor.prototype = Backbone.Events;
  Reference.prototype = new ctor();
  ReferenceReference = function(references, transform, context) {
    this.references = references;
    this.context = context;
    if (transform) {
      this.transform = transform;
    }
    _.each(this.references, function(ref) {
      ref.on('change', this._onChange, this);
    }, this);
    if (this.references.length > 1) {
      this.value = new Function("return this.transform" + (this.context ? '.call(this.context,' : '(') + ("this.references[" + (_.range(0, this.references.length).join('].value(), this.references[')) + "].value())"));
    }
    return this;
  };
  ctor = function() {
    this.constructor = ReferenceReference;
    this.value = function() {
      return this.transform.call(this.context, this.references[0].value());
    };
    return this;
  };
  ctor.prototype = Reference.prototype;
  ReferenceReference.prototype = new ctor();
  Backbone.Model.prototype.ref = function(attrs, transform, context) {
    if (typeof attrs === 'string') {
      attrs = [attrs];
    } else if (!_.isArray(attrs) || (attrs.length === 0)) {
      return;
    }
    return new Reference(this, attrs, transform, context);
  };
  return {
    Reference: Reference
  };
});
