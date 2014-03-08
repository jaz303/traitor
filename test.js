var traits = require('./');

traits.register('position', function() {

    return {
        init: function(opts) {
            this.x = opts.x || 0;
            this.y = opts.y || 0;
        }
    }

});

traits.register('physics', function() {

    return {
        init: function(opts) {
            this.vx = 0;
            this.vy = 0;
            this.inverseMass = Infinity;
        }
    }

});

traits.register('foo', function() {
    return {};
})

var point = traits.make(['position', 'physics', 'emitter', 'foo'], {
    initializer: 'closure'
});

var p1 = new point({x: 1, y: 2});

var cancel = p1.on('foo', function(a, b, c) {
    console.log("foo", a, b, c);
})

p1.emit('foo', 1, 2, 3);
p1.emit('foo', 4, 5, 6);
cancel();
p1.emit('foo', 7, 8, 9);

p1.once('bar', function() {
    console.log('bar!');
});

p1.emit('bar');
p1.emit('bar');
p1.emit('bar');

// console.log(p1);