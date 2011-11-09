/*
    Sheethub, the CSS backdoor library

    Version     : 0.2.0
    Author      : Aurélien Delogu (dev@dreamysource.fr)
    Homepage    : https://github.com/pyrsmk/Sheethub
    License     : MIT
*/
/*
    [/] refactoring
    [/] imports support
    [ ] http://dev.w3.org/csswg/cssom/
    [ ] http://www.quirksmode.org/dom/w3c_css.html
*/

this.Sheethub=function(){
    
    var doc=document,
        getElementsByTagName='getElementsByTagName',
        removeChild='removeChild',
        parentNode='parentNode',
        stylesheets=[],
        ready=false,
        listeners=[],
        sheetsToLoad=0,
        node,
        nodes=[],
        links=doc[getElementsByTagName]('link'),
        styles=doc[getElementsByTagName]('style'),
        i,
        id,
        callback=function(){
            if(!--sheetsToLoad){
                ready=true;
                var i=listeners.length;
                while(i){
                    listeners[--i]();
                }
            }
        },
    
    /*========================================================================
        Stylesheet object
    ========================================================================*/
    
    /*
        Create a new stylesheet

        Parameters
            Object, string contents: a LINK node, a STYLE node or CSS rules
    */
    Stylesheet=function(contents){

        var node,
            ready=false,
            listeners=[],
            i,
            disabled='disabled',
            appendChild='appendChild',
            createTextNode='createTextNode',
            win=window,
            ActiveXObject='ActiveXObject',
            XMLHTTP='Msxml2.XMLHTTP.',
            responseText='responseText',
            xhr,
            attempts=[
                function(){return new win[ActiveXObject](XMLHTTP+'3.0');},
                function(){return new win[ActiveXObject](XMLHTTP+'6.0');},
                function(){return new win.XMLHttpRequest();}
            ],

        /*
            Create a new STYLE node
        */
        createNewNode=function(){
            node=doc.createElement('style');
            //node.type='text/css';
            node.rel='stylesheet';
            doc[getElementsByTagName]('head')[0][appendChild](node);
        },

         /*
            Return the stylesheet object from CSSOM API

            Return
                Object
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
            Stylesheet is now considered as ready
        */
        complete=function(){
            ready=true;
            i=listeners.length;
            while(i){
                listeners[--i]();
            }
        };

        /*
            Add a listener
            
            Parameters
                Function callback
        */
        Stylesheet.listen=function(callback){
            listeners.push(callback);
        };

        /*
            Verify init state

            Return
                boolean
        */
        Stylesheet.isReady=function(){
            return ready;
        };

        /*
            Set stylesheet contents
            
            Parameters
                string contents
        */
        Stylesheet.setContents=function(contents){
            // Convert linked to embedded node
            if(node.tagName=='LINK'){
                node[parentNode][removeChild](node);
                createNewNode();
            }
            // General browsers
            try{
                if(i=node.firstChild){
                    node[removeChild](i);
                }
                node[appendChild](doc[createTextNode](contents));
            }
            // IE
            catch(e){
                node.text=contents;
            }
        };

        /*
            Return stylesheet contents

            Return
                string
        */
        Stylesheet.getContents=function(){
            // General browsers
            if(node.textContent!==undefined){
                return node.textContent;
            }
            // IE
            return node.text;
        };

        /*
            Return the stylesheet node

            Return
                Object
        */
        Stylesheet.getNode=function(){
            return node;
        };

        /*---------------------------------
            Initialize the stylesheet
        ---------------------------------*/

        if(typeof node=='object'){
            // Set node
            node=contents;
            // Retrieve LINK stylesheet
            if(node.tagName=='LINK'){
                // Retrieve XHR object
                i=attempts.length;
                while(i){
                    try{
                        xhr=attempts[--i]();
                    }
                    catch(e){}
                }
                // We DON'T verify if the xhr is well loaded since it will rarely happened
                // Create request
                xhr.open('GET',node.href,true);
                xhr.onreadystatechange=function(){
                    if(xhr.readyState==4){
                        if(xhr.status!=200 && xhr.status!=304){
                            throw xhr.statusText;
                        }
                        // Update contents
                        try{
                            // General browsers
                            node[appendChild](doc[createTextNode](xhr[responseText]));
                        }
                        catch(e){
                            // IE
                            node.text=xhr[responseText];
                        }
                        // Load complete
                        complete();
                    }
                };
                // Sends the request
                xhr.send(null);
            }
        }
        else{
            createNewNode();
            if(typeof contents=='string'){
                Stylesheet.setContents(contents);
            }
            complete();
        }

    },
    
    /*========================================================================
        Sheethub object
    ========================================================================*/
    
    Sheethub={
    
        /*
            Add a listener
            
            Parameters
                Function callback
        */
        listen:function(callback){
            listeners.push(callback);
        },

        /*
            Verify the init state

            Return
                boolean
        */
        isReady:function(){
            return ready;
        },

        /*
            Verify if a stylesheet exists

            Parameters
                string id: stylesheet id

            Return
                boolean
        */
        has:function(id){
            return stylesheets[id];
        },

        /*
            Create a new stylesheet

            Parameters
                string id               : stylesheet id
                Object, string contents : a LINK or STYLE node or CSS contents, otherwise create a empty STYLE node
        */
        add:function(id,contents){
            if(!Sheethub.has(id)){
                stylesheets[id]=new Stylesheet(contents);
            }
        },

        /*
            Get a stylesheet

            Parameters
                string id   : stylesheet id

            Return
                Stylesheet
        */
        get:function(id){
            if(Sheethub.has(id)){
                return stylesheets[id];
            }
        },

        /*
            Remove a stylesheet

            Parameters
                string id   : stylesheet id
        */
        remove:function(id){
            if(Sheethub.has(id)){
                i=stylesheets[id].getNode();
                i[parentNode][removeChild](i);
                delete stylesheets[id];
            }
        },

        /*
            Get all stylesheets

            Return
                Array
        */
        getAll:function(){
            return stylesheets;
        }
    
    };

    /*---------------------------------
        Initialize the whole stuff
    ---------------------------------*/

    // Get linked stylesheets
    i=links.length;
    while(i){
        nodes.push(links[--i]);
        // One more to load!
        ++sheetsToLoad;
    }
    // Get embedded stylesheets
    i=styles.length;
    while(i){
        nodes.push(styles[--i]);
    }
    // Create Stylesheet objects
    i=-1;
    while(node=nodes[++i]){
        // Get the stylesheet title or create one
        if((id=node.title)==='' || Sheethub.has(id)){
            while(Sheethub.has(id=Math.round(Math.random()*89+10))){}
        }
        // Add the stylesheet
        Sheethub.add(id,node);
        // Watch the load state
        if(stylesheets[id].isReady()){
            callback();
        }
        else{
            stylesheets[id].listen(callback);
        }
    }

};
