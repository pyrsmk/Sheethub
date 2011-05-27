Sheethub 0.1.8a
===============

Sheethub is a CSS API, aiming to bring simplicity and centralization to CSS polyfills, making them work together.

- tiny  (less than 4k uglified)
- robust (with a full unit-testing suite)
- cross-browser (IE5.5-10, Chrome 4-12, FF2-4, Safari 3-5, Opera 9-11)

Remarks
-------

- Opera 9 and 10 seem to not support CSSStyleSheet.disabled properly, they always report the stylesheet as disabled even though is enabled, and disabling a stylesheet seems to not work too


Documentation
-------------

### The ready state

Sheethub provides an event to inform that all the nodes are loaded, and the specific stylesheets have been retrieved: ready. Currently, there's just this event in the core. Nevertheless, we chose to implement the event manager in a way to deal with other events in the future without breaking something in your library.

    var callback=function(){};
    Sheethub.addListener('ready',callback);
    /* some code */
    Sheethub.removeListener('ready',callback);

Moreover, depending on your code, Sheethub can be ready _before_ you've plugged your library to the event. Then, you can also verify the state with:

    if(Sheethub.isReady()){
        // ready!
    }

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

If you want to know when the object will be ready, you can do exactly as the Sheethub event managing examples, it has the same 'ready' event and uses the same event manager.

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
    if(Sheethub.isReady()){
        callback();
    }
    else{
        Sheethub.addListener('ready',callback);
    }

License
-------

Sheethub is published under the MIT license (Expat version).
