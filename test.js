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

var point = traits.make(['position', 'physics'], {
    initializer: 'eval'
});

var p1 = new point({x: 1, y: 2});

console.log(p1);