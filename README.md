Cell is a convention over configuration framework for creating encapsulated HTML user interface widgets.

Installation
============

Copy build/cell.js into the root of the directory which contains your JavaScript files.  In the examples below we assume this directory is called "src".

In your HTML page add the following script tag to the head section:
    <script src='src/cell.js'></script>

Now add the data-cell and data-cell-baseurl attributes to the body tag like this:

    <body data-cell='views/App'data-cell-baseurl='src'>

Now create a cell file for your application in src/views/App.js.  App.js will serve as the top level cell for your application and will attach itself to the DOM.  The name of this top level cell is arbitrary.

FAQ
===

*Q:* How can cell views set stuff up right after instantiation?
*A:* Define a method called init which receives the parameters passed to new.

*Q:* Should my top level cell attach itself to the DOM?
*A:* Cell takes care of this for your.