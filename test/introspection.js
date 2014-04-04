var traits  = require('../'),
    test    = require('tape');

var TraitInstance = require('../lib/TraitInstance');

test('def.has reports presence of trait correctly', function(a) {

    traits.register('t1', function(def) {});
    traits.register('t2', function(def) {});

    traits.register('t3', function(def) {
        a.ok(def.has('t1'));
        a.notOk(def.has('t2'));
        a.ok(def.has('t3'));
    });

    var ctor = traits.make(['t1', 't3']);

    a.end();

});

test('def.get returns instance of TraitInstance where trait has been added', function(a) {

    traits.register('t4', function(def) {});
    traits.register('t5', function(def) {
        var i4 = def.get('t4');
        a.ok(i4 instanceof TraitInstance);
    });

    var ctor = traits.make(['t4', 't5']);

    a.end();

});

test('def.get returns nothing where trait has not been added', function(a) {

    traits.register('t6', function(def) {
        var t = def.get('no-such-trait');
        a.notOk(t);
    });
    
    a.end();

});