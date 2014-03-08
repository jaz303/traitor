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
            }).filter(function(init) {
                return typeof init === 'function';
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

register('emitter', function() {

    var slice = Array.prototype.slice;

    return {
        init: function() {
            this._emitterHandlers = {};
        },
        on: function(ev, callback) {
            var lst = this._emitterHandlers[ev] || (this._emitterHandlers[ev] = []);
            lst.push(callback);

            var removed = false;
            return function() {
                if (!removed) {
                    lst.splice(lst.indexOf(callback), 1);
                    removed = true;
                }
            }
        },
        once: function(ev, callback) {
            var cancel = this.on(ev, function() {
                callback.apply(null, arguments);
                cancel();
            });
        },
        emit: function(ev) {
            var lst = this._emitterHandlers[ev];
            if (lst) {
                var args = slice.call(arguments, 1);
                for (var i = 0, l = lst.length; i < l; ++i) {
                    lst[i].apply(null, args);
                }
            }
        }
    };

});
