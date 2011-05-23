/*=========================================================
    Stylesheet object
=========================================================*/

domReady(function(){

sink('Stylesheet object',function(test,ok,before,after){
    
    var stylesheet;
    
    before(function(){
        stylesheet=new Stylesheet();
    });
    
    after(function(){
        if(!stylesheet.isDetached()){
            stylesheet.detach();
        }
    });
    
    test('detach()',2,function(){
        ok(!stylesheet.isDetached(),"is detached");
        stylesheet.detach();
        ok(stylesheet.isDetached(),"is not detached");
    });
    
    test('Stylesheet contents',1,function(){
        stylesheet.setContents('html{display:block}');
        ok(stylesheet.getContents()=='html{display:block}',"is 'html{display:block}'");
    });
    
    test('Media types support',3,function(){
        stylesheet.addMedia('screen');
        ok(stylesheet.getMedias()[0]=='screen',"has 'screen' media type");
        stylesheet.removeMedia('screen');
        ok(stylesheet.getMedias().length===0,'has no media types');
        stylesheet.setMedias(['screen','print']);
        ok(stylesheet.getMedias()[0]=='screen' && stylesheet.getMedias()[1]=='print',"has 'screen' and 'print' media types");
    });
	
	test('Browser API support',2,function(){
        ok(function(){
            var cssstylesheet=stylesheet.getCSSStyleSheet();
            try{
                if(cssstylesheet instanceof CSSStyleSheet){
                    return true;
                }
            }
            catch(e){
                if(cssstylesheet.disabled!==undefined && (cssstylesheet.cssRules!==undefined || cssstylesheet.rules!==undefined)){
                    return true;
                }
            }
            return false;
		},"CSSStylesheet compatibility");
        ok(function(){
            var rules=stylesheet.getRules();
            try{
                if(rules instanceof CSSRuleList){
                    return true;
                }
            }
            catch(e){
                if(typeof rules=='object'){
                    return true;
                }
            }
            return false;
        },"CSSRuleList compatibility");
    });
	
	test('CSS display',3,function(){
        ok(!stylesheet.isDisabled(),'is natively enabled');
        stylesheet.disable();
        ok(stylesheet.isDisabled(),'is disabled');
        stylesheet.enable();
        ok(!stylesheet.isDisabled(),'is enabled');
    });

});

/*=========================================================
    Sheethub manager
=========================================================*/

sink('Sheethub manager',function(test,ok,before,after){
    
    test('Event manager',5,function(){
        ok(Sheethub.getListeners('ready').length===0,'has no listeners natively');
        var callback1=function(){ok(true,"'ready' event dispatched to callback1");};
        var callback2=function(){ok(true,"'ready' event dispatched to callback2");};
        if(Sheethub.isReady()){
            callback1();
            callback2();
        }
        Sheethub.addListener('ready',callback1);
        Sheethub.addListener('ready',callback2);
        ok(Sheethub.getListeners('ready').length==2,'has two listeners');
        Sheethub.clearListeners();
        ok(Sheethub.getListeners('ready').length===0,'has no listeners');
    });
    
    test('Stylesheets',4,function(){
        var sheets=0;
        for(var i in Sheethub.getStylesheets()){
            ++sheets;
        }
        ok(sheets==3,'has loaded 3 stylesheets');
        Sheethub.addStylesheet('test',new Stylesheet('html{display:block}'));
        ok(Sheethub.hasStylesheet('test'),"has 'test' stylesheet");
        Sheethub.removeStylesheet('test');
        ok(!Sheethub.hasStylesheet('test'),"has no 'test' stylesheet");
        ok(Sheethub.getStylesheet('desktop').getContents()=="body{max-width:700px;margin-left:200px;}\n","'desktop' stylesheet has 'body{max-width:700px;margin-left:200px;}' contents");
    });

});

start();

});
