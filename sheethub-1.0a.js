/*
    Sheethub 1.0a, the CSS API for polyfills
    
    Copyright © Aurélien Delogu <dev@dreamysource.fr>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
The Software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the Software.
    
    [ ] gestion des imports
    [ ] addRule/deleteRule/insertRule/removeRule
    [ ] unit testing
*/

(function(win){
    
    /*========================================================================
        Very simple event manager
    ========================================================================*/

    function EventManager(){
        
        this.listeners=[];
        
        this.addListener=function(event,callback){
            event=event.toLowerCase();
            this.listeners[event]=[];
            this.listeners[event].push(callback);
        };
        
        this.removeListener=function(event,callback){
            var subscribers=this.listeners[event.toLowerCase()];
            for(var i in subscribers){
                if(subscribers[i]===callback){
                    subscribers.splice(i,1);
                    break;
                }
            }
            return this;
        };
        
        this.dispatch=function(event){
            var subscribers=this.listeners[event.toLowerCase()];
            for(var i in subscribers){
                subscribers[i]();
            }
            return this;
        };
        
    }
    
    /*========================================================================
        Stylesheet object
    ========================================================================*/
    
    win.Stylesheet={};
    
    /*
        Constructor
        
        DOMNode node: the node to link with
    */
    function Stylesheet(stylesheet_node){
        
        // DOMNode node: a node that represents the stylesheet
        this.node=stylesheet_node;
        
        //EventManager events: the event manager
        this.events=new EventManager;
        
        /*
            Verifies the node state
            
            Returns: boolean
        */
        this.isDetached=function(){
            return this.node===null;
        };
        
        /*
            Detaches the object from the node and removes it
            
            Returns: Stylesheet
        */
        this.detach=function(){
            this.node.parentNode.removeChild(this.node);
            this.node=null;
            return this;
        };
        
        /*
            Sets stylesheet contents
            
            string contents : the contents
            
            Return          : Stylesheet
        */
        this.setContents=function(contents){
            // Convert linked node to embedded node
            if(this.node.tagName=='LINK'){
                this.detach();
                this.createNewNode();
            }
            // Set new contents
            try{
                var child=this.node.firstChild;
                if(child) this.node.removeChild(child);
                this.node.appendChild(document.createTextNode(contents));
            }
            catch(e){
                // IE fallback
                this.node.text=contents;
            }
            return this;
        };
        
        /*
            Returns the stylesheet contents
            
            Returns: string
        */
        this.getContents=function(){
            try{
                return this.node.innerText;
            }
            catch(e){
                return this.node.text;
            }
        };
        
        /*
            Sets the media types list for the stylesheet
            
            array medias    : the media types list
            
            Returns         : Stylesheet
        */
        this.setMedias=function(medias){
            this.node.media=medias.join(',');
            return this;
        };
        
        /*
            Returns the media types list
            
            Returns: array
        */
        this.getMedias=function(){
            return this.node.media.split(',');
        };
        
        /*
            Adds a new media type to the existing list
            
            string media    : the media type
            
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
            
            string media    : the media to remove
            
            Returns         : Stylesheet
        */
        this.removeMedia=function(media){
            var medias=this.getMedias();
            for(var i in medias){
                if(medias[i]==media){
                    medias[i].splice(i,1);
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
            var cssstylesheet=this.getCSSStylesheet();
            if(cssstylesheet.cssRules)  return cssstylesheet.cssRules;  // General browsers
            else                        return cssstylesheet.rules;     // IE
        };
        
        /*
            Verifies if the stylesheet is disabled or not
            
            Returns: boolean
        */
        this.isDisabled=function(){
            return this.getCSSStylesheet().disabled;
        };
        
        /*
            Enables the stylesheet
            
            Returns: Stylesheet
        */
        this.enable=function(){
            this.getCSSStylesheet().disabled=false;
            return this;
        };
        
         /*
            Disables the stylesheet
            
            Returns: Stylesheet
        */
        this.disable=function(){
            this.getCSSStylesheet().disabled=true;
            return this;
        };
        
        /*
            Creates a new STYLE node and links with
        */
        this.createNewNode=function(){
            this.node=document.createElement('style');
            this.node.type='text/css';
            this.node.rel='stylesheet';
            document.getElementsByTagName('head')[0].appendChild(node);
        };
        
        /*
            Returns the stylesheet object from the document.styleSheets API, with title matching
            
            Returns: CSSStyleSheet
        */
        this.getCSSStylesheet=function(){
            if(this.node.sheet!==undefined) return this.node.sheet;      // General browsers
            else                            return this.node.styleSheet; // IE
        };
        
        /*
            Returns a new XMLHttpRequest object
            
            Returns: object or false
            
            Documentation: <http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx>
        */
        this.getXHRObject=function(){
            var attempts=[
                function(){return new ActiveXObject('Msxml2.XMLHTTP.3.0');},
                function(){return new ActiveXObject('Msxml2.XMLHTTP.6.0');},
                function(){return new XMLHttpRequest();}
            ],i=attempts.length;
            while(i--){
                try{
                    return attempts[i]();
                }
                catch(e){}
            }
            return false;
        };
        
        /*
            Retrieves remote stylesheet contents
            
            string url  : the stylesheet URL
        */
        this.retrieveStylesheet=function(){
            // Scope
            var node=this.node;
            var events=this.events;
            // Retrieves the XHR object
            var xhr=this.getXHRObject();
            if(xhr===undefined) throw 'XmlHttpRequest is not available';
            // Creates the request
            xhr.open('GET',node.href,true);
            xhr.onreadystatechange=function(){
                if(xhr.readyState==4){
                    if(xhr.status!=200 && xhr.status!=304){
                        throw 'Ouch! Bad returned state: '+xhr.statusText;
                    }
                    // Update contents
                    try{
                        node.appendChild(document.createTextNode(xhr.responseText));    // General browsers
                    }
                    catch(e){
                        node.text=xhr.responseText;                                     // IE
                    }
                    // Load complete
                    events.dispatch('ready');
                }
            };
            // Sends the request
            xhr.send();
        };
        
        /*
            Construction
        */
        
        // Fill the node
        if(this.node.tagName=='LINK'){
            this.retrieveStylesheet();
        }
        // Or create a new node
        else if(this.node.tagName!='STYLE'){
            this.createNewNode();
        }
        
    }
    
    /*========================================================================
        Sheethub object
    ========================================================================*/
    
    // Singleton
    if(win.Sheethub!==undefined) return;
    win.Sheethub={};
    
    // EventManager events: the event manager
    Sheethub.events=new EventManager;
    
    /*
        Verifies if a stylesheet is in the stylesheets
        
        string id: the stylesheet id 
        
        Returns: array
    */
    Sheethub.hasStylesheet=function(id){
        return stylesheets[id]!==undefined;
    };
    
    /*
        Adds a new stylesheet

        string id               : the stylesheet id 
        Stylesheet stylesheet   : a Stylesheet object
        
        Returns                 : Sheethub
        Throws an exception     : if the stylesheet already exists
                                : if the stylesheet is not a Stylesheet object
    */
    Sheethub.addStylesheet=function(id,stylesheet){
        if(Sheethub.hasStylesheet(id)){
            throw "The '"+id+"' stylesheet already exists";
        }
        if(stylesheet instanceof Stylesheet){
            throw 'The stylesheet object must be of type Stylesheet';
        }
        // Add the new stylesheet
        stylesheets[id]=stylesheet;
        return this;
    };
    
    /*
        Gets a stylesheet
        
        string id           : the stylesheet id
        
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
        
        string id           : the stylesheet id
        
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
        
        Returns: array
    */
    Sheethub.getStylesheets=function(){
        return stylesheets;
    };
    
    /*========================================================================
        Initializes the whole stuff
    ========================================================================*/
    
    var stylesheets=[];
    var sheetsToLoad=0;
    // Get linked stylesheets
    var nodes=[];
    var links=document.getElementsByTagName('link');
    var j=links.length;
    for(var i=0;i<j;++i){
        nodes.push(links[i]);
    }
    // Get embedded stylesheets
    var styles=document.getElementsByTagName('style');
    var j=styles.length;
    for(var i=0;i<j;++i){
        nodes.push(styles[i]);
    }
    // Create Stylesheet objects
    for(var i in nodes){
        var node=nodes[i];
        // One more to load!
        ++sheetsToLoad;
        // Get the stylesheet title or create one
        var id;
        if(node.title!==undefined){
            id=node.title;
        }
        if(id===undefined || Sheethub.hasStylesheet(id)){
            while(Sheethub.hasStylesheet(id='stylesheet'+Math.random()*8999+1000)){}
        }
        // Add the stylesheet
        stylesheets[id]=new Stylesheet(node);
        // Watch the load state
        stylesheets[id].events.addListener(
            'ready',
            function(){
                if(!(--sheetsToLoad)){
                    Sheethub.events.dispatch('ready');
                    Sheethub.events.removeListener('ready',Sheethub);
                }
            }
        );
    }
    
})(this);
