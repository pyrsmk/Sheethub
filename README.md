Sheethub 0.6.2
==============

Sheethub is a CSS backdoor API, with the aim of bringing simplicity and centralization to CSS polyfills, making them work together. Shortly: Sheethub retrieves stylesheets itself to be able to access to CSS rules that are not currently applied for incompatibility reasons.

Install
-------

You can pick the minified library or install it with :

```
jam install pyrsmk-sheethub
bower install Sheethub
npm install pyrsmk-sheethub --save-dev
```

Sheethub scripts
----------------

- [mediatizr](https://github.com/pyrsmk/mediatizr) : media queries polyfill

If you have developed a Sheethub script, feel free to add it to the list ;)

Developping scripts
-------------------

### The ready state

Sheethub provides an event to inform that all native stylesheets have been retrieved. Here's how listen it:

```javascript
Sheethub.listen(function(){});
```

But be careful. Depending on your code, Sheethub can be ready _before_ you've plugged in to the event. Then, you can also verify the state with:

```javascript
if(Sheethub.ready()){
    // ready!
}
```

### Managing stylesheets

Sheethub manages Stylesheet internal objects. Each one represents a stylesheet with transparent management across browsers specifications and different DOM nodes. All Stylesheet object names are determined by the `title` attribute of the CSS link tag. If no `title` is specified then the name will be randomized.

Get all stylesheet objects:

```javascript
Sheethub.get();
```

Get only one Stylesheet object:

```javascript
Sheethub.get('some stylesheet name');
```

You can of course verify if a stylesheet is registered:

```javascript
Sheethub.has('some stylesheet name');
```

Add a new stylesheet:

```javascript
// Create a new Stylesheet with a LINK node
Sheethub.add('foo','a{color:red;}');
// Create a new empty Stylesheet
Sheethub.add('foo');
// Plug to an existing STYLE node (that you've previously created)
Sheethub.add('foo',node);
```

Remove a stylesheet:

```javascript
Sheethub.remove('some stylesheet name');
```

### Stylesheet objects

Stylesheet object provides some useful functions to interact with the stylesheet. Firstly, Stylesheet also has a ready state and can be listened with same way as we saw earlier with Sheethub, so you'll be able to know when you're new appended stylesheet will be loaded.

The most interesting part of the API is the hability to set/get CSS contents:

```javascript
var sheet=Sheethub.get('pinky');
// Get contents
if(sheet.get()=='*{color:pink}'){
    // Set contents
    sheet.set('*{color:brown}');
}
```

Anterior versions of Sheethub provided methods to interact with specific node attributes. All of these have been removed but they're still accessible by the stylesheet node:

```javascript
// Return the attached node
var node=sheet.node();
// Verify if the stylesheet is disabled
if(node.disabled){
    // Enable it
    node.disabled=false;
}
```

License
-------

Sheethub is published under the [MIT license](http://dreamysource.mit-license.org).
