TODO
====

cell/Collection
  @toM does not create @model (instead it's Model)

cell/util/extend
  - Should save super class constructor, so it can be called in deep inheritance situations
    - cell/Resource needs to be updated for it's ModelInstance/CollectionInstance to call the right constructor

cell/Resource
  - More flexible
    - customizable...
      - request (and data)
      - parse method
      - Collection 
      - Model