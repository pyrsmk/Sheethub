Sheethub 0.4.4
==============

Sheethub is a CSS backdoor API, with the aim of bringing simplicity and centralization to CSS polyfills, making them work together. Shortly: Sheethub retrieves stylesheets itself to be able to access to CSS rules that are not currently applied for incompatibility reasons.

- tiny: 1.5k uglified
- robust: with a full unit testing suite
- cross-browser: IE5.5+, Chrome, Firefox 2+, Safari 3+, Opera 9+ (if it works on other browsers/versions, please tell me)

Sheethub scripts
----------------

- [mediatizr](https://github.com/pyrsmk/mediatizr): adds media queries support to incapable browsers

If you developed a Sheethub script, feel free to add it to the list ;)

Developping scripts
-------------------

### The ready state

Sheethub provides an event to inform that all native stylesheets have been retrieved. Here's how listen it:

    Sheethub.listen(function(){});

But be careful. Depending on your code, Sheethub can be ready _before_ you've plugged in to the event. Then, you can also verify the state with:

    if(Sheethub.ready()){
        // ready!
    }

### Managing stylesheets

Sheethub manages Stylesheet internal objects. Each one represents a stylesheet with transparent management across browsers specifications and different DOM nodes. All Stylesheet objects have an id determined by the node's `title` attribute, or the filename from the `href` attribute otherwise. But, there's one case where Sheethub won't manage a stylesheet. Let's say you had a `STYLE` stylesheet to your page, without any title. Then, Sheethub can't guess an id for that stylesheet, unlike with `LINK` stylesheets (which have a `href` attribute).

Get all stylesheet objects:

    Sheethub.get();

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

### Stylesheet objects

Stylesheet object provides some useful functions to interact with the stylesheet. Firstly, Stylesheet also has a ready state and can be listened with same way as we saw earlier with Sheethub, so you'll be able to know when you're new appended stylesheet will be loaded.

The most interesting part of the API is the hability to set/get CSS contents:

    var sheet=Sheethub.get('pinky');
    // Get contents
    if(sheet.get()=='*{color:pink}'){
        // Set contents
        sheet.set('*{color:brown}');
    }

Anterior versions of Sheethub provided methods to interact with specific node attributes. All of these have been removed but they're still accessible by the stylesheet node:

    // Return the attached node
    var node=sheet.node();
    // Verify if the stylesheet is disabled
    if(node.disabled){
        // Enable it
        node.disabled=false;
    }
