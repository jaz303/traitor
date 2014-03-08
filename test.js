var traits = require('./');

traits.register('position', function(def) {

    def.init(function(opts) {
        this.x = opts.x || 0;
        this.y = opts.y || 0;
    });

});

traits.register('physics', function(def) {

    def.init(function(opts) {
        this.vx = 0;
        this.vy = 0;
        this.inverseMass = Infinity;
    });

});

traits.register('foo', function() {
    
});

var sup = traits.make(['position']);

var point = traits.extend(sup, ['physics', 'emitter', 'foo'], {
    initializer: 'closure'
}, {initializer: 'eval'});

console.log(sup, sup.prototype.traits);
console.log(point, point.prototype.traits);

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

console.log(p1.traits);

// console.log(p1);