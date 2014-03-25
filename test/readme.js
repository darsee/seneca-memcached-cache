var seneca = require('seneca')()
seneca.use('..')

seneca.ready(function(){
    test1(function(){
        test2(function(){
            seneca.close();
        });
    });
});

function test1(done) {
    seneca.act({role:'cache', cmd:'set', key:'k1', val:'v1'}, function(err){
        seneca.act({role:'cache', cmd:'get', key:'k1'}, function(err,out){
            console.log('value = '+out.val);
            return done();
        });
    });
}

function test2(done){
    var cache = seneca.pin({role:'cache',cmd:'*'});
    cache.set({key:'k2', val:'v2'}, function(err){
        cache.get({key:'k2'}, function(err,out){
            console.log('value = '+out.val)
            done();
        });
    });
}
