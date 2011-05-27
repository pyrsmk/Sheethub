/*
    Sheethub, the CSS API for polyfills
    
    Version : 0.1.8a
    Author  : Aurélien Delogu <dev@dreamysource.fr>
    URL     : <https://github.com/pyrsmk/sheethub> 
    License : MIT
    
    [ ] imports management
    [ ] addRule/deleteRule/insertRule/removeRule
    
    could be interesting: http://closure-library.googlecode.com/svn/docs/closure_goog_cssom_cssom.js.source.html
*/

var Sheethub={},
    Stylesheet;

(function(window,document){
    
    /*========================================================================
        Event manager
    ========================================================================*/

    function EventManager(){
        
        // Array listeners: the listeners stack
        var listeners=[];
        
        /*
            Adds a listener to the stack
            
            String event        : the event to listen
            Function callback   : the callback to trigger
            
            Returns             : EventManager
        */
        this.addListener=function(event,callback){
            if(listeners[event=event.toLowerCase()]===undefined){
                listeners[event]=[];
            }
            listeners[event].push(callback);
            return this;
        };
        
        /*
            Removes a listener from the stack
            
            String event        : the event from the listener must be removed
            Function callback   : the callback
            
            Returns             : EventManager
        */
        this.removeListener=function(event,callback){
            var subscribers=listeners[event=event.toLowerCase()];
            for(var i in subscribers){
                if(subscribers[i]===callback){
                    subscribers.splice(i,1);
                    break;
                }
            }
            listeners[event]=subscribers;
            return this;
        };
        
        /*
            Return the listeners for an event, or all
            
            String event    : the event from which to return listeners
            
            Returns         : Array, Object
        */
        this.getListeners=function(event){
            return listeners[event=event.toLowerCase()]!==undefined?
                   listeners[event]:
                   listeners;
        };
        
        /*
            Clear the stack
            
            Returns: EventManager
        */
        this.clearListeners=function(){
            listeners=[];
            return this;
        };
        
        /*
            Dispatches an event
            
            string event        : the event to trigger
            
            Returns             : EventManager
        */
        this.dispatch=function(event){
            var subscribers=listeners[event=event.toLowerCase()];
            for(var i in subscribers){
                subscribers[i]();
            }
            return this;
        };
        
    }
    
    /*========================================================================
        Stylesheet object
    ========================================================================*/
    
    /*
        Constructor
        
        DOMNode|string contents: a LINK node, a STYLE node or CSS rules
    */
    Stylesheet=function(contents){
        
        // Boolean ready    : the init state
        var ready=false,
        // DOMNode node     : the DOM node of the stylesheet
            node,
        // EventManager events: the event manager
            events=new EventManager();
        
        // Event manager overlay
        this.addListener=function(event,callback){return events.addListener(event,callback);};
        this.removeListener=function(event,callback){return events.removeListener(event,callback);};
        this.getListeners=function(event){return events.getListeners(event);};
        this.clearListeners=function(){return events.clearListeners();};
        var dispatch=function(event){return events.dispatch(event);};
        
        /*
            Creates a new STYLE node and links with
        */
        var createNewNode=function(){
            node=document.createElement('style');
            node.type='text/css';
            node.rel='stylesheet';
            document.getElementsByTagName('head')[0].appendChild(node);
        },
        
         /*
            Returns the stylesheet object from the document.styleSheets API, with title matching
            
            Returns: CSSStyleSheet
        */
        getCSSStyleSheet=function(){
            // General browsers
            if(node.sheet!==undefined){
                return node.sheet;
            }
            // IE
            else{
                return node.styleSheet;
            }
        },
        
        /*
            Returns a new XMLHttpRequest object
            
            Returns: Object, false
            
            Documentation: <http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx>
        */
        getXHRObject=function(){
            var attempts=[
                function(){return new window.ActiveXObject('Msxml2.XMLHTTP.3.0');},
                function(){return new window.ActiveXObject('Msxml2.XMLHTTP.6.0');},
                function(){return new window.XMLHttpRequest();}
            ],i=attempts.length;
            while(i--){
                try{
                    return attempts[i]();
                }
                catch(e){}
            }
            return false;
        },
        
        /*
            Retrieves remote stylesheet contents
            
            String url  : the stylesheet URL
        */
        retrieveStylesheet=function(){
            // Retrieves the XHR object
            var xhr=getXHRObject();
            if(xhr===undefined){
                throw 'XmlHttpRequest is not available';
            }
            // Creates the request
            xhr.open('GET',node.href,true);
            xhr.onreadystatechange=function(){
                if(xhr.readyState==4){
                    if(xhr.status!=200 && xhr.status!=304){
                        throw 'Ouch! Bad returned state: '+xhr.statusText;
                    }
                    // Update contents
                    try{
                        // General browsers
                        node.appendChild(document.createTextNode(xhr.responseText));
                    }
                    catch(e){
                        // IE
                        node.text=xhr.responseText;
                    }
                    // Load complete
                    ready=true;
                    dispatch('ready');
                }
            };
            // Sends the request
            xhr.send(null);
        };
        
        /*
            Verifies the init state
            
            Returns: Boolean
        */
        this.isReady=function(){
            return ready;
        };
        
        /*
            Verifies the node state
            
            Returns: Boolean
        */
        this.isDetached=function(){
            return node===null;
        };
        
        /*
            Detaches the object from the node and removes it
            
            Returns: Stylesheet
        */
        this.detach=function(){
            node.parentNode.removeChild(node);
            node=null;
            return this;
        };
        
        /*
            Sets stylesheet contents
            
            String contents : the contents
            
            Return          : Stylesheet
        */
        this.setContents=function(contents){
            // Convert linked node to embedded node
            if(node.tagName=='LINK'){
                this.detach();
                this.createNewNode();
            }
            // Set new contents
            try{
                var child=node.firstChild;
                if(child){
                    node.removeChild(child);
                }
                node.appendChild(document.createTextNode(contents));
            }
            catch(e){
                // IE fallback
                node.text=contents;
            }
            return this;
        };
        
        /*
            Returns the stylesheet contents
            
            Returns: String
        */
        this.getContents=function(){
            if(node.textContent!==undefined){
                return node.textContent;
            }
            return node.text;
        };
        
        /*
            Sets the media types list for the stylesheet
            
            Array medias    : the media types list
            
            Returns         : Stylesheet
        */
        this.setMedias=function(medias){
            node.media=medias.join(',');
            return this;
        };
        
        /*
            Returns the media types list
            
            Returns: Array
        */
        this.getMedias=function(){
            var medias=node.media.split(',');
            if(medias[0]===''){
                medias.splice(0,1);
            }
            return medias;
        };
        
        /*
            Adds a new media type to the existing list
            
            String media    : the media type
            
            Returns         : Stylesheet
        */
        this.addMedia=function(media){
            var medias=this.getMedias();
            medias.push(media);
            this.setMedias(medias);
            return this;
        };
        
        /*
            Removes a media type from the list
            
            String media    : the media to remove
            
            Returns         : Stylesheet
        */
        this.removeMedia=function(media){
            var medias=this.getMedias();
            for(var i in medias){
                if(medias[i]==media){
                    medias.splice(i,1);
                    break;
                }
            }
            this.setMedias(medias);
            return this;
        };
        
        /*
            Get rules from the document.styleSheets API
            
            Returns: CSSRuleList
        */
        this.getRules=function(){
            var cssstylesheet=getCSSStyleSheet();
            // General browsers
            if(cssstylesheet.cssRules){
                return cssstylesheet.cssRules;
            }
            // IE
            else{
                return cssstylesheet.rules;
            }
        };
        
        /*
            Verifies if the stylesheet is disabled or not
            
            Returns: Boolean
        */
        this.isDisabled=function(){
            return getCSSStyleSheet().disabled;
        };
        
        /*
            Enables the stylesheet
            
            Returns: Stylesheet
        */
        this.enable=function(){
            getCSSStyleSheet().disabled=false;
            return this;
        };
        
         /*
            Disables the stylesheet
            
            Returns: Stylesheet
        */
        this.disable=function(){
            getCSSStyleSheet().disabled=true;
            return this;
        };
        
        /*----------------------------------------
            Construction
        ----------------------------------------*/
        if(contents===undefined){
            createNewNode();
            ready=true;
            dispatch('ready');
        }
        else if(typeof contents=='string'){
            createNewNode();
            this.setContents(contents);
            ready=true;
            dispatch('ready');
        }
        else{
            node=contents;
            if(node.tagName=='LINK'){
                retrieveStylesheet();
            }
        }
        
    };
    
    /*========================================================================
        Sheethub object
    ========================================================================*/
    
    // boolean ready: the init state (true when all native stylesheets are loaded)
    var ready=false,
    // Array stylesheets: the stylesheets
        stylesheets=[],
    // integer sheetsToLoad: the number of stylesheets to load, used to trigger the 'ready' event
        sheetsToLoad=0,
    // EventManager events: the event manager
        events=new EventManager();
    
    // Event manager overlay
    Sheethub.addListener=function(event,callback){return events.addListener(event,callback);};
    Sheethub.removeListener=function(event,callback){return events.removeListener(event,callback);};
    Sheethub.getListeners=function(event){return events.getListeners(event);};
    Sheethub.clearListeners=function(){return events.clearListeners();};
    var dispatch=function(event){return events.dispatch(event);};
    
    /*
        Verifies the init state
        
        Returns: Boolean
    */
    Sheethub.isReady=function(){
        return ready;
    };
    
    /*
        Verifies if a stylesheet is in the stylesheets
        
        String id: the stylesheet id 
        
        Returns: Array
    */
    Sheethub.hasStylesheet=function(id){
        return stylesheets[id]!==undefined;
    };
    
    /*
        Adds a new stylesheet

        String id               : the stylesheet id 
        Stylesheet stylesheet   : a Stylesheet object
        
        Returns                 : Sheethub
        Throws an exception     : if the stylesheet already exists
                                : if the stylesheet is not a Stylesheet object
    */
    Sheethub.addStylesheet=function(id,stylesheet){
        if(Sheethub.hasStylesheet(id)){
            throw "The '"+id+"' stylesheet already exists";
        }
        if(!(stylesheet instanceof Stylesheet)){
            throw 'The stylesheet object must be of type Stylesheet';
        }
        // Add the new stylesheet
        stylesheets[id]=stylesheet;
        return this;
    };
    
    /*
        Gets a stylesheet
        
        String id           : the stylesheet id
        
        Returns             : Stylesheet
        Throws an exception : if the stylesheet doesn't exist
    */
    Sheethub.getStylesheet=function(id){
        if(!Sheethub.hasStylesheet(id)){
            throw "The '"+id+"' stylesheet doesn't exist";
        }
        return stylesheets[id];
    };
    
    /*
        Removes a stylesheet from the stylesheets
        
        String id           : the stylesheet id
        
        Returns             : Sheethub
        Throws an exception : if the stylesheet doesn't exist
    */
    Sheethub.removeStylesheet=function(id){
        if(!Sheethub.hasStylesheet(id)){
            throw "The '"+id+"' stylesheet doesn't exist";
        }
        stylesheets[id].detach();
        delete stylesheets[id];
        return this;
    };
    
    /*
        Gets all stylesheets
        
        Returns: Array
    */
    Sheethub.getStylesheets=function(){
        return stylesheets;
    };
    
    /*========================================================================
        Initializes the whole stuff
    ========================================================================*/
    var nodes=[],
        links=document.getElementsByTagName('link'),
        styles=document.getElementsByTagName('style'),
        j=links.length;
    // Get linked stylesheets
    for(var i=0;i<j;++i){
        nodes.push(links[i]);
        // One more to load!
        ++sheetsToLoad;
    }
    // Get embedded stylesheets
    j=styles.length;
    for(i=0;i<j;++i){
        nodes.push(styles[i]);
    }
    // Create the callback to trigger the 'ready' event
    var callback=function(){
        if(--sheetsToLoad===0){
            ready=true;
            dispatch('ready');
        }
    };
    // Create Stylesheet objects
    for(i in nodes){
        var node=nodes[i];
        // Get the stylesheet title or create one
        var id;
        if((id=node.title)==='' || Sheethub.hasStylesheet(id)){
            while(Sheethub.hasStylesheet(id='stylesheet'+Math.round(Math.random()*8999+1000))){}
        }
        // Add the stylesheet
        stylesheets[id]=new Stylesheet(node);        
        // Watch the load state
        if(stylesheets[id].isReady()){
            callback();
        }
        else{
            stylesheets[id].addListener('ready',callback);
        }
    }
    
})(this,this.document);
