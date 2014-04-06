var registry        = require('./lib/registry'),
    TraitBuilder    = require('./lib/TraitBuilder'),
    TraitInstance   = require('./lib/TraitInstance');

exports.register    = registry.register;
exports.make        = make;
exports.extend      = extend;

function make(traits, methods) {

    methods = methods || {};

    if (typeof methods === 'function') {
        methods = { __construct: methods };
    }

    var builder = new TraitBuilder(registry.expand(traits), methods);

    ctor = builder.__compile__();

    // FIXME: this is a total hack and should be destroyed
    // (only exists because some tests still rely on it)
    var namedTraits = Object.keys(builder._namedTraits);
    if (Object.freeze) {
        Object.freeze(namedTraits);
        ctor.prototype._traits = namedTraits;
    } else {
        Object.defineProperty(ctor.prototype, '_traits', {
            get: function() { return namedTraits.slice(0); }
        });
    }

    return ctor;

}

function extend(sup, traits, opts) {
    return make(sup.prototype._traits.concat(traits), opts);
}

require('./lib/builtins');