/*
    Sheethub, the CSS backdoor API

    Version     : 0.6.1
    Author      : Aurélien Delogu (dev@dreamysource.fr)
    Homepage    : https://github.com/pyrsmk/Sheethub
    License     : MIT

    TODO
        Stylesheet.init(url): download the stylesheet even it doesn't exist as a node
*/

(function(def){
    if(typeof define=='function'){
		define(def);
	}
    else if(typeof module!='undefined'){
        module.exports=def;
    }
    else{
        this.Sheethub=def;
    }
}(function(){

    var doc=document,
        getElementsByTagName='getElementsByTagName',
        head=doc[getElementsByTagName]('head')[0],
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
        a,
        b,
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
            Object, string stylesheet: a LINK node, a STYLE node or CSS rules
    */
    Stylesheet=function(stylesheet){

        var node,
            ready=false,
            listeners=[],
            contents,
            appendChild='appendChild',
            styleSheet='styleSheet',
            a,

        /*
            Create a new STYLE node
        */
        createNewNode=function(){
            head[appendChild](node=doc.createElement('style'));
            // IE doesn't support creating a text node into a STYLE block
            if(!node[styleSheet]){
                node[appendChild](doc.createTextNode(''));
            }
        },

        /*
            Stylesheet is now considered as ready
        */
        complete=function(){
            ready=true;
            a=listeners.length;
            while(a){
                listeners[--a]();
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
                Set stylesheet contents

                Parameters
                    string text
            */
            set:function(text){
                // Convert linked to embedded node
                if(node.tagName=='LINK'){
                    node[parentNode][removeChild](node);
                    createNewNode();
                }
                // IE
                if(node[styleSheet]){
                    node[styleSheet].cssText=text;
                }
                // Other browsers
                else{
                    // innerHTML fails on Safari 3/4 and perhaps other browsers
                    node.firstChild.nodeValue=text;
                }
                contents=text;
            },

            /*
                Get stylesheet contents

                Return
                    string
            */
            get:function(){
                return contents;
            },

            /*
                Return the stylesheet node

                Return
                    Object
            */
            node:function(){
                return node;
            }

        },

        /*---------------------------------
            Initialize the stylesheet
        ---------------------------------*/

        isDOMReady=function(){
            if(head){
                if(typeof stylesheet=='object'){
                    // Set node
                    node=stylesheet;
                    // Retrieve LINK stylesheet
                    if(node.tagName=='LINK'){
                        // Retrieve XHR object
                        if(this.XMLHttpRequest){
                            a=new XMLHttpRequest();
                        }
                        else{
                            a=new ActiveXObject('Microsoft.XMLHTTP');
                        }
                        // Create ajax request
                        a.open('GET',node.href,true);
                        a.onreadystatechange=function(){
                            if(a.readyState==4){
                                // Change CSS scope and save contents
                                contents=a.responseText.replace(/\.\.\//g,'');
                                // Loading complete
                                complete();
                            }
                        };
                        a.send(null);
                    }
                    // Get native STYLE contents
                    else{
                        contents=
                            node[styleSheet]?
                            node[styleSheet].cssText:
                            node.innerHTML;
                    }
                }
                else{
                    createNewNode();
                    if(typeof stylesheet=='string'){
                        Stylesheet.set(stylesheet);
                    }
                    complete();
                }
            }
            else{
                setTimeout(isDOMReady,250);
            }
        };

        isDOMReady();

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
            List all registered stylesheets

            Return
                Object
        */
        list:function(){
            return stylesheets;
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
            Get one stylesheet or all

            Parameters
                string id   : stylesheet id

            Return
                Stylesheet
        */
        get:function(id){
            if(!id){
                return stylesheets;
            }
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
                a=stylesheets[id].node();
                a[parentNode][removeChild](a);
                delete stylesheets[id];
            }
        }

    };

    /*---------------------------------
        Initialize the whole stuff
    ---------------------------------*/

    // Get linked stylesheets
    a=-1;
    while(b=links[++a]){
        if(b.rel.toLowerCase()=='stylesheet'){
            nodes.push(b);
            // One more to load!
            ++sheetsToLoad;
        }
    }
    // Get embedded stylesheets
    a=styles.length;
    while(a){
        nodes.push(styles[--a]);
    }
    // Create Stylesheet objects
    a=-1;
    while(node=nodes[++a]){
        // Get the stylesheet name
        if(!(b=node.title) && node.href){
            b='sheet'+Math.round(Math.random()*9000+1000);
        }
        if(b){
            // Add the stylesheet
            Sheethub.add(b,node);
            // Watch the load state
            if(stylesheets[b].ready()){
                callback();
            }
            else{
                stylesheets[b].listen(callback);
            }
        }
    }
    return Sheethub;

}()));
