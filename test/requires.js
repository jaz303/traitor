var traits  = require('../'),
    test    = require('tape');

test('trait requirements are expanded correctly', function(a) {

    traits.register('a', {
        requires: ['b', 'c', 'd'],
        apply: function() {}
    });

    traits.register('b', {
        requires: ['d'],
        apply: function() {}
    });

    traits.register('c', function() {});
    traits.register('d', function() {});

    var ctor = traits.make(['a']);

    var instance = new ctor();

    a.deepEqual(instance._traits, ['d', 'b', 'c', 'a']);
    a.end();

});
