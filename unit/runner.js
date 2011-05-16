window.log = function(){
  log.history = log.history || [];
  log.history.push(arguments);
  if(this.console) {
      arguments.callee = arguments.callee.caller;
      console.log( Array.prototype.slice.call(arguments) );
  }
};

/*=========================================================
    Stylesheet object
=========================================================*/

describe('Stylesheet object',function(){
    
    var stylesheet;
    
    beforeEach(function(){
        this.addMatchers({
		    toBeAnInstanceOf:function(expected){
			    return this.actual instanceof expected;
		    }
	    });
        stylesheet=new Stylesheet;
    });
    
    afterEach(function(){
        if(!stylesheet.isDetached()){
        	stylesheet.detach();
        }
    });
    
    it("should return a Stylesheet object",function(){
        expect(stylesheet).toBeAnInstanceOf(Stylesheet);
    });
    
    it("should not be detached",function(){
        expect(stylesheet.isDetached()).toBeFalsy();
    });
    
    it("should be detached",function(){
        stylesheet.detach();
        expect(stylesheet.isDetached()).toBeTruthy();
    });
    
    it("should not be empty",function(){
    	stylesheet.setContents('html{display:block;}');
        expect(stylesheet.getContents()).toContain('html{display:block;}');
    });
    
    it("should have a 'screen' media type",function(){
    	stylesheet.addMedia('screen');
        expect(stylesheet.getMedias()[0]).toBe('screen');
    });
    
    it("should have no media types",function(){
    	stylesheet.addMedia('screen');
    	stylesheet.removeMedia('screen');
        expect(stylesheet.getMedias()).not.toContain('screen');
    });
    
    it("should have 'screen' and 'print' media types",function(){
    	stylesheet.setMedias(['screen','print']);
        expect(stylesheet.getMedias()).toContain('screen');
        expect(stylesheet.getMedias()).toContain('print');
    });
	
	it("should return a CSSStyleSheet object",function(){
        expect(stylesheet.getCSSStyleSheet()).toBeAnInstanceOf(CSSStyleSheet);
    });
	
	it("should return a CSSRuleList object",function(){
        expect(stylesheet.getRules()).toBeAnInstanceOf(CSSRuleList);
    });
	
	it("should be natively enabled",function(){
        expect(stylesheet.isDisabled()).toBeFalsy();
    });
    
    it("should be disabled",function(){
    	stylesheet.disable();
        expect(stylesheet.isDisabled()).toBeTruthy();
    });
    
    it("should be enabled",function(){
    	stylesheet.disable();
    	stylesheet.enable();
        expect(stylesheet.isDisabled()).toBeFalsy();
    });
    
});

/*=========================================================
    Events manager
=========================================================*/

/*describe('Event manager',function(){
    
    // Cleaning
    afterEach(function(){
        var listeners=Sheethub.events.listeners['ready'];
        for(var i in listeners){
            log('supprimé: '+listeners[i]);
            Sheethub.events.removeListener('ready',listeners[i]);
        }
    });
    
    it("shouldn't have listeners natively",function(){
        var callbacks=0;
        for(var i in Sheethub.events.listeners['ready']){
            ++callbacks;
        }
        expect(callbacks).toBe(0);
    });
    
    it("should have two callbacks for the 'ready' event",function(){
        log("ajouté: function(){'callback1'}");
        Sheethub.events.addListener('ready',function(){'callback1'});
        log("ajouté: function(){'callback2'}");
        Sheethub.events.addListener('ready',function(){'callback2'});
        var callbacks=0;
        for(var i in Sheethub.events.listeners['ready']){
            ++callbacks;
        }
        expect(callbacks).toBe(2);
    });

});*/

/*=========================================================
    Sheethub manager
=========================================================*/

describe('Sheethub manager',function(){
    
    // Sheethub must be ready to work with
    /*var called=false; 
    if(!called){
        var callback=function(){called=true};
        log("ajouté: function(){called=true}");
        Sheethub.events.addListener('ready',callback);
        waitsFor(function(){return called});
        log("supprimé: function(){called=true}");
        Sheethub.events.removeListener('ready',callback);
    }*/
    
    it("should have 4 native stylesheets loaded",function(){
        var sheets=0;
        for(var i in Sheethub.getStylesheets()){
            ++sheets;
        }
        expect(sheets).toEqual(4);
    });
    
    it("should have a 'test' stylesheet",function(){
        Sheethub.addStylesheet('test',new Stylesheet('html{display:block}'));
        expect(Sheethub.hasStylesheet('test')).toBeTruthy();
        Sheethub.removeStylesheet('test');
    });
    
    it("should have identical 'test' stylesheet contents",function(){
        Sheethub.addStylesheet('test',new Stylesheet('html{display:block}'));
        expect(Sheethub.getStylesheet('test').getContents()).toBe('html{display:block}');
        Sheethub.removeStylesheet('test');
    });

});
