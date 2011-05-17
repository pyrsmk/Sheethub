Sheethub
========

Sheethub is a CSS API, aiming to bring simplicity and centralization to CSS polyfills, making them work together.

Advantages
----------

- tiny
- robust
- cross-browser

Disadvantages
-------------

- must be included aside the polyfills (with the singleton pattern you could insert it directly to your library but you'll get an increase of the total size if many libs are used)

If someone else see other cons, please let me know...

Documentation
-------------

### The ready state

Sheethub provides an event to inform that all the nodes are loaded, and the specific stylesheets have been retrieved: ready. Currently, there's just this event in the core. Nevertheless, we chose to implement events in a way to manage other events in the future without breaking something in your library.

    var callback=function(){};
    Sheethub.events.addListener('ready',callback);
    /* some code */
    Sheethub.events.removeListener('ready',callback);

### Managing stylesheets

Sheethub manages Stylesheet objects. Each one represents a stylesheet with transparent management across browsers specifications and different DOM nodes.

All Stylesheet objects have a name. Basically, Stylesheet will take the node title as a name, otherwise it will generate one.

That's said, here's the management methods. 

Return an array of Stylesheet objects:

    Sheethub.getStylesheets();

Return a Stylesheet object:

    Sheethub.getStylesheet('some stylesheet name');

Verify if a stylesheet is registered in the manager:

    Sheethub.hasStylesheet('some stylesheet name');

Add a new stylesheet:

    var sheet=new Stylesheet('
        body{
            a{
                color:red;
            }
        }
    ');
    Sheethub.addStylesheet('some stylesheet name',sheet)
    
There's other ways to instantiate Stylesheet, but we'll see this later.

Remove a stylesheet:

    Sheethub.addStylesheet('some stylesheet name');

### The Stylesheet object

Here's the major part of Sheethub. As we said earlier, there's many ways to instantiate it. We could give it a LINK node, a STYLE node or a CSS content directly. Short story:

    // Create and append a LINK node
    var node=document.createElement('link');
    node.rel='stylesheet';
    node.href='path/to/a/new/stylesheet.css';
    document.getElementsByTagName('head')[0].appendChild(node);
    // Stylesheet will automatically retrieve the remote sheet
    new Stylesheet(node);

If you want to know when the object will be ready, you can do exaclty as the Sheethub event example, it has the same 'ready' event and uses the same event manager.

The most interesting part of the API is the hability to modify CSS contents.

    var sheet=Sheethub.getStylesheet('pinky');
    if(sheet.getContents()=='*{color:pink}'){
        sheet.setContents('*{color:brown}');
    }

You may want to disable/enable a stylesheet:

    if(!sheet.isDisabled()){
        sheet.disable();
    }
    // some code
    sheet.enable();

Media queries are emergent CSS properties which permit us to target specific media devices (smartphones, iPads, wide screens, ...). Stylesheet has some methods for that stuff:

    // Let's say the sheet already has 'screen' and 'print' media types
    sheet.getMedias(); // returns ['screen','print']
    sheet.addMedia('handheld');
    sheet.removeMedia('handheld');
    sheet.setMedias(['speech','braille','embossed']);

But, be careful, it will _not_ add the media queries behavior to Internet Explorer 6-8, it's just an overlayer API.

As an addition, we can get CSS rules that the browser actually applies for the stylesheet. But, for now, this API is very incomplete.

    sheet.getRules();

### A concrete example please!

Ok, ok! Let's dive into it!

    var callback=function(){
        var sheets=Sheethub.getStylesheets();
        for(var name in sheets){
            var contents=sheets[name].getContents;
            // just for the example, don't do that or you will have a FOUC
            if(!sheets[name].isDisabled()){
                sheets[name].disable;
            }
            // convertToMediaQueries is just a dummy function
            sheets[name].setContents(convertToMediaQueries(contents));
            // still a dummy function
            sheets[name].setMedias(whichMediaQueries(contents));
            sheets[name].enable;
        }for
    };
    Sheethub.events.addListener('ready',callback);

License
-------
Sheethub is published under the MIT (Expat) license.
