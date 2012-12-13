define (require)->
  _ = require 'underscore'
  Backbone = require 'backbone'

  Reference = (@model, @attrs, transform, @context)->
    # Only overwrite default transform if supplied
    @transform = transform if transform

    # Register change listeners
    @model.on "change:#{@attrs.join ' change:'}", @_onChange, @

    # Optimize @value() for multi attribute cases
    if @attrs.length > 1
      @value = new Function "return this.transform"+
        (if @context then '.call(this.context,' else '(')+
        "this.model.attributes.#{@attrs.join(', this.model.attributes.')})"
    @

  ctor = ->
    @constructor = Reference

    # Create a new Reference based on other references
    @combine = (references, transform, context)->

      # Normalize references to an array
      if references instanceof Reference then references = [references]

      # Bail if references is not an array or is an empty array
      else if (not _.isArray references) or (references.length is 0) then return @

      new ReferenceReference [@].concat(references), transform, context

    @ref = (transform, context)->
      return @ unless typeof transform is 'function'
      new ReferenceReference [@], transform, context

    @_onChange = _.debounce (->
      @trigger 'change', @, @value()
      return
    ), 0

    @onChangeAndDo = (handler, context)->
      @on 'change', handler, context
      handler.call context, @, @value()
      return

    # Default value() to return first (and usually the only) attribute value
    @value = -> @transform.call @context, this.model.attributes[@attrs[0]]

    @transform = (v)-> v
    @
  ctor:: = Backbone.Events
  Reference:: = new ctor()


  ReferenceReference = (@references, transform, @context)->
    # Only overwrite default transform if supplied
    @transform = transform if transform

    # Register change listeners
    _.each @references,
      (ref)->
        ref.on 'change', @_onChange, @
        return
      @

    # Optimize @value() for multi attribute cases
    if @references.length > 1
      @value = new Function "return this.transform"+
        (if @context then '.call(this.context,' else '(')+
        "this.references[#{_.range(0,@references.length).join '].value(), this.references['}].value())"
    @

  ctor = ->
    @constructor = ReferenceReference

    # Default value() to return first (and usually the only) reference value
    @value = -> @transform.call @context, @references[0].value()
    @
  ctor:: = Reference::
  ReferenceReference:: = new ctor()


  Backbone.Model::ref = (attrs, transform, context)->
    # Normalize to array
    if typeof attrs is 'string' then attrs = [attrs]

    # Bail if not an array or empty array
    else if not _.isArray(attrs) or (attrs.length is 0) then return

    new Reference @, attrs, transform, context

  {Reference}