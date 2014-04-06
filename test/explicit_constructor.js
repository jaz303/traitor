var traits  = require('../'),
    test    = require('tape');

test('explicit constructor is used if supplied', function(a) {

    traits.register('t1', function() {});

    var myCtor = function(b) {
        this.a = b;
    };

    var ctor = traits.make(['t1'], myCtor);
    a.ok(ctor === myCtor);

    var instance = new ctor(10);
    a.ok(instance.a === 10);

    a.end();

});

test('when explicit constructor is specified, trait initializers are not automatically invoked', function(a) {

    traits.register('t2', function(def) {
        def.init(function() {
            this.t2 = true;
        });
    });

    traits.register('t3', function(def) {
        def.init(function() {
            this.t3 = true;
        });
    });

    var ctor = traits.make(['t2', 't3'], function() {});

    var instance = new ctor();

    a.ok(!instance.t2);
    a.ok(!instance.t3);

    a.end();

});