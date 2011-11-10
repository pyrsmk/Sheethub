domReady(function(){

    sink('Sheethub',function(test,ok,before,after){
        
        test('Events',2,function(){
            var callback1=function(){ok(true," event dispatched to callback1");};
            var callback2=function(){ok(true," event dispatched to callback2");};
            if(Sheethub.ready()){
                callback1();
                callback2();
            }
            Sheethub.listen(callback1);
            Sheethub.listen(callback2);
        });
        
        test('Stylesheets',7,function(){
            // Already set stylesheets
            var i=0;
            for(var j in Sheethub.getAll()){
                ++i;
            }
            ok(i==3,'has 3 loaded stylesheets');
            ok(Sheethub.get('desktop').contents()=="body{max-width:700px;margin-left:200px;}\n","'desktop' stylesheet has contents set");
            ok(Sheethub.get('embedded').contents().toLowerCase().replace(/\s+/g,'')=="body{max-width:none}","'embedded' stylesheet has contents set");
            // New stylesheet
            Sheethub.add('test','html{display:block}');
            ok(Sheethub.has('test'),"has added 'test' stylesheet");
            ok(Sheethub.get('test').contents()=="html{display:block}","'test' stylesheet has native contents set");
            Sheethub.get('test').contents('html{}');
            ok(Sheethub.get('test').contents()=="html{}","'test' stylesheet has contents set");
            Sheethub.remove('test');
            ok(!Sheethub.has('test'),"has removed 'test' stylesheet");
        });

    });

    start();

});
