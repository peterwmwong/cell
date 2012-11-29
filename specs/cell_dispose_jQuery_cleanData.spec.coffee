define ['./spec-utils'], ({nodeHTMLEquals,stringify,node})->

  ({beforeEachRequire})->

    beforeEachRequire [
      'cell!fixtures/remove/Root'
      'cell'
      'backbone'
    ], (@Root, @cell, @Backbone)->

    removeFunc =
      name: 'jQuery.remove()'
      func: -> @remove()

    emptyFunc =
      name: 'jQuery.empty()'
      func: -> @empty()

    htmlFunc =
      name: "jQuery.html('')"
      func: -> @html ''

    for testFunc in [ emptyFunc, htmlFunc ]

      describe testFunc.name, ->
        beforeEach ->
          # This model is used determine whether a cell's event handlers on this.model
          # have been properly removed.  The test cell's event handlers increment the
          # values when the 'flash' is fired on the model
          @model = new @Backbone.Model()
          @model.root = 10
          @model.parent = 100
          @model.child = 1000

          # These attributes are used to dermine whether a cell's event handlers attached
          # using delegateEvents are undelegated.
          # The test cell's element event handlers increment the values on 'click'.
          @model.root_el = 30
          @model.parent_el = 300
          @model.child_el = 3000

          # This collection is used determine whether a cell's event handlers on this.collection
          # have been properly removed.  The test cell's event handlers increment the
          # values when the 'flash' is fired on the collection
          @collection = new @Backbone.Collection()
          @collection.root = 20
          @collection.parent = 200
          @collection.child = 2000

          @root = new @Root
            model: @model
            collection: @collection

          @$rootEl = @root.render().$el
          @$rootContainer = $('<div>').append @$rootEl

        describe 'verify fixture cell model, collection and DOM Element handlers attached', ->
          beforeEach ->
            @model.trigger 'flash', @model
            @collection.trigger 'flash', @collection
            $('[cell]', @$rootContainer).click()

          it "Model event handlers", ->
            expect(@model.root).toBe 11
            expect(@model.parent).toBe 101
            expect(@model.child).toBe 1001

          it "Collection event handlers", ->
            expect(@collection.root).toBe 21
            expect(@collection.parent).toBe 201
            expect(@collection.child).toBe 2001

          it "DOM Element event handlers", ->
            expect(@model.root_el).toBe 31
            expect(@model.parent_el).toBe 301
            expect(@model.child_el).toBe 3001


        describe "Removing DOM elements using #{testFunc.name}", ->
          beforeEach ->
            testFunc.func.call @$rootContainer

            @model.trigger 'flash', @model
            @collection.trigger 'flash', @collection
            $('[cell]', @$rootContainer).click()

          it "removes references to this.model, this.collection, this.el, this.$el, and this.$el", ->
            _.each ['model', 'collection', 'el', '$el', '$'], (prop)=>
              expect(@root[prop]).not.toBeDefined()
              expect(@root.parent[prop]).not.toBeDefined()
              expect(@root.parent.child[prop]).not.toBeDefined()

          it "Detaches Model event handlers on all descendant cells", ->
            expect(@model.root).toBe 10
            expect(@model.parent).toBe 100
            expect(@model.child).toBe 1000

          it "Detaches Collection event handlers on all descendant cells", ->
            expect(@collection.root).toBe 20
            expect(@collection.parent).toBe 200
            expect(@collection.child).toBe 2000

          it "Detaches DOM event handlers on all descendant cells", ->
            expect(@model.root_el).toBe 30
            expect(@model.parent_el).toBe 300
            expect(@model.child_el).toBe 3000        


        
    describe 'jQuery.remove()', ->
      beforeEach ->
        # This model is used determine whether a cell's event handlers on this.model
        # have been properly removed.  The test cell's event handlers increment the
        # values when the 'flash' is fired on the model
        @model = new @Backbone.Model()
        @model.root = 10
        @model.parent = 100
        @model.child = 1000

        # These attributes are used to dermine whether a cell's event handlers attached
        # using delegateEvents are undelegated.
        # The test cell's element event handlers increment the values on 'click'.
        @model.root_el = 30
        @model.parent_el = 300
        @model.child_el = 3000

        # This collection is used determine whether a cell's event handlers on this.collection
        # have been properly removed.  The test cell's event handlers increment the
        # values when the 'flash' is fired on the collection
        @collection = new @Backbone.Collection()
        @collection.root = 20
        @collection.parent = 200
        @collection.child = 2000

        @root = new @Root
          model: @model
          collection: @collection

        @$rootEl = @root.render().$el
        @$rootContainer = $('<div>').append @$rootEl

      describe 'verify fixture cell model, collection and DOM Element handlers attached', ->
        beforeEach ->
          @model.trigger 'flash', @model
          @collection.trigger 'flash', @collection
          $('[cell]', @$rootContainer).click()

        it "Model event handlers", ->
          expect(@model.root).toBe 11
          expect(@model.parent).toBe 101
          expect(@model.child).toBe 1001

        it "Collection event handlers", ->
          expect(@collection.root).toBe 21
          expect(@collection.parent).toBe 201
          expect(@collection.child).toBe 2001

        it "DOM Element event handlers", ->
          expect(@model.root_el).toBe 31
          expect(@model.parent_el).toBe 301
          expect(@model.child_el).toBe 3001


      describe 'Removing an ancestor DOM element using jQuery.remove()', ->
        beforeEach ->
          @$rootContainer.children().remove()

          @model.trigger 'flash', @model
          @collection.trigger 'flash', @collection
          $('[cell]', @$rootContainer).click()

        it "removes references to this.model, this.collection, this.el, this.$el, and this.$el", ->
          _.each ['model', 'collection', 'el', '$el', '$'], (prop)=>
            expect(@root[prop]).not.toBeDefined()
            expect(@root.parent[prop]).not.toBeDefined()
            expect(@root.parent.child[prop]).not.toBeDefined()

        it "Detaches Model event handlers on all descendant cells", ->
          expect(@model.root).toBe 10
          expect(@model.parent).toBe 100
          expect(@model.child).toBe 1000

        it "Detaches Collection event handlers on all descendant cells", ->
          expect(@collection.root).toBe 20
          expect(@collection.parent).toBe 200
          expect(@collection.child).toBe 2000

        it "Detaches DOM event handlers on all descendant cells", ->
          expect(@model.root_el).toBe 30
          expect(@model.parent_el).toBe 300
          expect(@model.child_el).toBe 3000        


      describe "Removing a cell's element using jQuery.remove()", ->
        beforeEach ->
          $('.Root', @$rootContainer).remove()

          @model.trigger 'flash', @model
          @collection.trigger 'flash', @collection
          $('[cell]', @$rootContainer).click()

        it "removes references to this.model, this.collection, this.el, this.$el, and this.$el", ->
          _.each ['model', 'collection', 'el', '$el', '$'], (prop)=>
            expect(@root[prop]).not.toBeDefined()
            expect(@root.parent[prop]).not.toBeDefined()
            expect(@root.parent.child[prop]).not.toBeDefined()

        it "Detaches Model event handlers on all descendant cells", ->
          expect(@model.root).toBe 10
          expect(@model.parent).toBe 100
          expect(@model.child).toBe 1000

        it "Detaches Collection event handlers on all descendant cells", ->
          expect(@collection.root).toBe 20
          expect(@collection.parent).toBe 200
          expect(@collection.child).toBe 2000

        it "Detaches DOM event handlers on all descendant cells", ->
          expect(@model.root_el).toBe 30
          expect(@model.parent_el).toBe 300
          expect(@model.child_el).toBe 3000


      describe "Removing a nested cell's element using jQuery.remove()", ->
        beforeEach ->
          $('.Parent', @$rootContainer).remove()

          @model.trigger 'flash', @model
          @collection.trigger 'flash', @collection
          $('[cell]', @$rootContainer).click()

        # it "removes references to this.model, this.collection, this.el, this.$el, and this.$el", ->
        #   _.each ['model', 'collection', 'el', '$el', '$'], (prop)=>
        #     expect(@root[prop]).toBeDefined()
        #     expect(@root.parent[prop]).not.toBeDefined()
        #     expect(@root.parent.child[prop]).not.toBeDefined()

        it "Detaches Model event handlers on all descendant cells", ->
          expect(@model.root).toBe 11
          expect(@model.parent).toBe 100
          expect(@model.child).toBe 1000

        it "Detaches Collection event handlers on all descendant cells", ->
          expect(@collection.root).toBe 21
          expect(@collection.parent).toBe 200
          expect(@collection.child).toBe 2000

        it "Detaches DOM event handlers on all descendant cells", ->
          expect(@model.root_el).toBe 31
          expect(@model.parent_el).toBe 300
          expect(@model.child_el).toBe 3000


      describe "Removing a leaf (cell doesn't contain any other cell) cell's element using jQuery.remove()", ->
        beforeEach ->
          $('.Child', @$rootContainer).remove()

          @model.trigger 'flash', @model
          @collection.trigger 'flash', @collection
          $('[cell]', @$rootContainer).click()

        it "removes references to this.model, this.collection, this.el, this.$el, and this.$el", ->
          _.each ['model', 'collection', 'el', '$el', '$'], (prop)=>
            expect(@root[prop]).toBeDefined()
            expect(@root.parent[prop]).toBeDefined()
            expect(@root.parent.child[prop]).not.toBeDefined()

        it "Detaches Model event handlers on all descendant cells", ->
          expect(@model.root).toBe 11
          expect(@model.parent).toBe 101
          expect(@model.child).toBe 1000

        it "Detaches Collection event handlers on all descendant cells", ->
          expect(@collection.root).toBe 21
          expect(@collection.parent).toBe 201
          expect(@collection.child).toBe 2000

        it "Detaches DOM event handlers on all descendant cells", ->
          expect(@model.root_el).toBe 31
          expect(@model.parent_el).toBe 301
          expect(@model.child_el).toBe 3000