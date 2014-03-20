exports.make = make;
exports.register = register;
exports.extend = extend;

var INIT = '__init__';

var registry = {};

function lookup(trait) {
    if (trait in registry) {
        return registry[trait];
    } else {
        throw new Error("unknown trait: " + trait);
    }
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

    var builder = new TraitBuilder();
    
    traits.forEach(function(tn) {
        if (typeof tn === 'string') {
            lookup(tn)(builder);
        } else if (typeof tn === 'function') {
            tn(builder);
        } else {
            throw new Error("traits must strings or functions");
        }
    });

    var ctor = null;

    var initializers = builder._chains[INIT] || [];
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
        if (k === INIT) continue;
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

function register(trait, cb) {
    registry[trait] = cb;
}

//
// TraitBuilder

function TraitBuilder() {
    this._chains = {};
    this._properties = {};
}

TraitBuilder.prototype.init = function(fn) {
    return this.chain(INIT, fn);
}

TraitBuilder.prototype.chain = function(name, fn, prepend) {
    var chain = this._chains[name] || (this._chains[name] = []);
    if (prepend) {
        chain.unshift(fn);
    } else {
        chain.push(fn);
    }
}

TraitBuilder.prototype.method = function(name, fn) {
    this._properties[name] = fn;
}

TraitBuilder.prototype.property = function(name, descriptor) {
    Object.defineProperty(this._properties, name, descriptor);
}

//
// Builtin traits

register('meta', function(def) {

    def.method('hasTrait', function(trait) {
        return this._traits.indexOf(trait) >= 0;
    });

});

register('emitter', function(def) {

    var slice = Array.prototype.slice;

    def.init(function() {
        this._emitterHandlers = {};
    });

    def.method('on', function(ev, callback) {
        var lst = this._emitterHandlers[ev] || (this._emitterHandlers[ev] = []);
        lst.push(callback);

        var removed = false;
        return function() {
            if (!removed) {
                lst.splice(lst.indexOf(callback), 1);
                removed = true;
            }
        }
    });

    def.method('once', function(ev, callback) {
        var cancel = this.on(ev, function() {
            callback.apply(null, arguments);
            cancel();
        });
        return cancel;
    });

    def.method('emit', function(ev) {
        var lst = this._emitterHandlers[ev];
        if (lst) {
            var args = slice.call(arguments, 1);
            for (var i = 0, l = lst.length; i < l; ++i) {
                lst[i].apply(null, args);
            }
        }
    });

});

register('methods', function(def) {

    def.method('boundMethod', function(method) {
        return this[method].bind(this);
    });

    def.method('lazyMethod', function(method) {
        var self = this;
        return function() {
            return self[method].apply(self, arguments);
        }
    });

});