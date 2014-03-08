exports.make = make;
exports.register = register;

var registry = {};

function lookup(trait) {
    if (trait in registry) {
        return registry[trait];
    } else {
        throw new Error("unknown trait: " + trait);
    }
}

function make(traits, opts) {

    opts = opts || {};

    var ctor = null;

    switch (opts.initializer || 'closure') {
        case 'closure':
            var initializers = traits.map(function(t) {
                return lookup(t).init;
            });
            ctor = function(args) {
                initializers.forEach(function(i) {
                    i.call(this, args);
                }, this);
            }
            break;
        case 'eval':
            var initializer = "(function(args) {\n";
            traits.forEach(function(tn) {
                var t = lookup(tn);
                if ('init' in t) {
                    initializer += '(' + (t.init) + ").call(this, args);\n";
                }
            });
            initializer += "})";
            ctor = eval(initializer);
            break;
        default:
            throw new Error("invalid initializer style: " + opts.initializer);
    }

    traits.forEach(function(tn) {
        var t = lookup(tn);
        for (var k in t) {
            if (k !== 'init') {
                ctor.prototype[k] = t[k];
            }
        }
    });

    return ctor;

}

function register(trait, cb) {
    
    var descriptor = cb();

    registry[trait] = descriptor;

}
