Sheethub 0.2.0
==============

__MAJOR UPDATE, NOT COMPATIBLE AT ALL WITH 0.1.x BECAUSE IT HAS BEEN CONSIDERABLY SIMPLIFIED, PLEASE READ THE NEW DOCUMENTATION!__

Sheethub is a CSS backdoor library, with the aim of bringing simplicity and centralization to CSS polyfills, making them work together. Shortly: Sheethub retrieves stylesheets itself to be able to access to CSS rules that are not currently applied for incompatibility reasons.

- tiny: less than 2k uglified
- robust: with a full unit testing suite
- cross-browser: IE5.5-10, Chrome 4-12, FF2-4, Safari 3-5, Opera 9-11 (if it works on other browsers/versions, please tell me)

Documentation
-------------

### The ready state

Sheethub provides an event to inform that all native stylesheets have been retrieved. Here's how listen it:

    Sheethub.listen(function(){});

But be careful. Depending on your code, Sheethub can be ready _before_ you've plugged in to the event. Then, you can also verify the state with:

    if(Sheethub.ready()){
        // ready!
    }

### Managing stylesheets

Sheethub manages Stylesheet internal objects. Each one represents a stylesheet with transparent management across browsers specifications and different DOM nodes. All Stylesheet objects have an id. Basically, it will take the node title as a name, otherwise it will generate a numerical one.

Get all stylesheet objects:

    Sheethub.getAll();

Get only one Stylesheet object:

    Sheethub.get('some stylesheet name');

You can of course verify if a stylesheet is registered:

    Sheethub.has('some stylesheet name');

Add a new stylesheet:

    // Create a new Stylesheet with a LINK node
    Sheethub.add('foo','a{color:red;}');
    // Create a new empty Stylesheet
    Sheethub.add('foo');
    // Plug to an existing STYLE node (that you've previously created)
    Sheethub.add('foo',node);
    
Remove a stylesheet:

    Sheethub.remove('some stylesheet name');

### The Stylesheet object

Stylesheet object provides some useful functions to interact with the stylesheet. Firstly, Stylesheet also has a ready state and can be listened with same way as we saw earlier with Sheethub, so you'll be able to know when you're new appended stylesheet will be loaded.

The most interesting part of the API is the hability to set/get CSS contents:

    var sheet=Sheethub.get('pinky');
    // Get contents
    if(sheet.contents()=='*{color:pink}'){
        // Set contents
        sheet.contents('*{color:brown}');
    }

Anterior versions of Sheethub provided methods to interact with specific node attributes. All of these have been removed but they're still accessible by the stylesheet node:

    // Return the attached node
    var node=sheet.get();
    // Verify if the stylesheet is disabled
    if(node.disabled){
        // Enable it
        node.disabled=false;
    }

### Sheethub scripts

Please share your [Sheethub scripts](https://github.com/pyrsmk/Sheethub/wiki/Awesome-scripts) with the community and let us know how they're awesome!