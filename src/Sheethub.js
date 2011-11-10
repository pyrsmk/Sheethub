/*
    Sheethub, the CSS backdoor library

    Version     : 0.2.4
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
        stylesheets={},
        ready=false,
        listeners=[],
        sheetsToLoad=0,
        node,
        nodes=[],
        links=doc[getElementsByTagName]('link'),
        styles=doc[getElementsByTagName]('style'),
        i,
        a,
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
            status='status',
            attempts=[
                function(){return new win[ActiveXObject](XMLHTTP+'3.0');},
                function(){return new win[ActiveXObject](XMLHTTP+'6.0');},
                function(){return new win.XMLHttpRequest();}
            ],

        /*
            Create a new STYLE node
        */
        createNewNode=function(){
            doc[getElementsByTagName]('head')[0][appendChild](node=doc.createElement('style'));
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
        },

        Stylesheet={
            
            /*
                Add a listener
                
                Parameters
                    Function callback
            */
            listen:function(callback){
                listeners.push(callback);
            },

            /*
                Verify init state

                Return
                    boolean
            */
            ready:function(){
                return ready;
            },

            /*
                Set/get stylesheet contents
                
                Parameters
                    string contents: if empty, the function will return current contents
            */
            contents:function(contents){
                if(!contents){
                    return node.innerHTML || node.text;
                }
                else{
                    // Convert linked to embedded node
                    if(node.tagName=='LINK'){
                        node[parentNode][removeChild](node);
                        createNewNode();
                    }
                    // Set contents
                    try{
                        node.innerHTML=contents;
                    }
                    catch(e){
                        node.text=contents;
                    }
                }
            },

            /*
                Return the stylesheet node

                Return
                    Object
            */
            get:function(){
                return node;
            }
        
        };

        /*---------------------------------
            Initialize the stylesheet
        ---------------------------------*/

        if(typeof contents=='object'){
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
                // We WON'T verify if the xhr is well loaded since it will rarely failed
                // Create request
                xhr.open('GET',node.href,true);
                xhr.onreadystatechange=function(){
                    if(xhr.readyState==4){
                        if(!!xhr[status] && xhr[status]!=200 && xhr[status]!=304){
                            throw xhr.statusText;
                        }
                        // Change CSS scope and update contents
                        Stylesheet.contents(xhr[responseText].replace(/\.\.\//g,''));
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
                Stylesheet.contents(contents);
            }
            complete();
        }
        return Stylesheet;

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
        ready:function(){
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
                i=stylesheets[id].get();
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
    i=-1;
    while(a=links[++i]){
        if(a.rel!='icon'){
            nodes.push(a);
            // One more to load!
            ++sheetsToLoad;
        }
    }
    // Get embedded stylesheets
    i=styles.length;
    while(i){
        nodes.push(styles[--i]);
    }
    // Create Stylesheet objects
    i=-1;
    while(node=nodes[++i]){
        // Get the stylesheet title as id or create one
        if((a=node.title)==='' || Sheethub.has(a)){
            while(Sheethub.has(a=Math.round(Math.random()*89+10))){}
        }
        // Add the stylesheet
        Sheethub.add(a,node);
        // Watch the load state
        if(stylesheets[a].ready()){
            callback();
        }
        else{
            stylesheets[a].listen(callback);
        }
    }
    return Sheethub;

}();
