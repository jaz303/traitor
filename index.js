var registry        = require('./lib/registry'),
    TraitBuilder    = require('./lib/TraitBuilder'),
    TraitInstance   = require('./lib/TraitInstance');

exports.register    = registry.register;
exports.make        = make;
exports.extend      = extend;

function expand(traits) {
    var out = [];
    traits.forEach(function(t) {
        if (typeof t === 'string' && Array.isArray(registry[t])) {
            out = out.concat(expand(registry[t]));
        } else {
            out.push(t);
        }
    });
    return out;
}

function makeChain(fns) {
    return function() {
        var args = arguments;
        fns.forEach(function(f) {
            f.apply(this, args);
        }, this);
    }
}

function make(traits, opts) {

    opts = opts || {};

    traits = registry.expand(traits);

    var builder = new TraitBuilder();

    traits.forEach(function(t) {
        builder.require(t);
    });

    builder._prepares.forEach(function(fn) {
        fn();
    });

    var ctor = null;

    var initializers = builder._chains['__init__'] || [];
    switch (opts.initializer || 'closure') {
        case 'closure':
            ctor = function(args) {
                initializers.forEach(function(i) {
                    i.call(this, args);
                }, this);
            }
            break;
        case 'eval':
            var initializer = "(function(args) {\n";
            initializers.forEach(function(i) {
                initializer += '(' + i + ").call(this, args);\n";
            });
            initializer += "})";
            ctor = eval(initializer);
            break;
        default:
            throw new Error("invalid initializer style: " + opts.initializer);
    }

    var ps = builder._properties;
    Object.getOwnPropertyNames(ps).forEach(function(k) {
        Object.defineProperty(ctor.prototype, k, Object.getOwnPropertyDescriptor(ps, k));
    });

    for (var k in builder._chains) {
        if (k === '__init__') continue;
        ctor.prototype[k] = makeChain(builder._chains[k]);
    }

    Object.defineProperty(ctor.prototype, '_traits', {
        get: function() { return traits.slice(0); }
    });

    return ctor;

}

function extend(sup, traits, opts) {
    return make(sup.prototype._traits.concat(traits), opts);
}

require('./lib/builtins');