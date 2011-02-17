# Our basic **Todo** model has `content`, `order`, and `done` attributes.
window.Todo = Backbone.Model.extend
 # Default attributes for the todo.
 defaults:
   content: 'empty todo...'
   done: false

 # Ensure that each todo created has `content`.
 initialize: ->
   if not @get 'content'
     @set content: @defaults.content

 # Toggle the `done` state of this todo item.
 toggle: -> @save done: not @get 'done'

 # Remove this Todo from *localStorage* and delete its view.
 clear: ->
   @destroy()
   @view.remove()


# Todo Collection
# ---------------

# The collection of todos is backed by *localStorage* instead of a remote
# server.
window.TodoList = Backbone.Collection.extend

 # Reference to this collection's model.
 model: Todo

 # Save all of the todo items under the `"todos"` namespace.
 localStorage: new Store('todos')

 # Filter down the list of all todo items that are finished.
 done: -> @filter (todo)-> todo.get 'done'

 # Filter down the list to only todo items that are still not finished.
 remaining: -> @without.apply this, @done()

 # We keep the Todos in sequential order, despite being saved by unordered
 # GUID in the database. This generates the next order number for new items.
 nextOrder: ->
   not @length and 1 or
      @last().get('order') + 1

 # Todos are sorted by their original insertion order.
 comparator: (todo)-> todo.get('order')

window.Todos = new TodoList
