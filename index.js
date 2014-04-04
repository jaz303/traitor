var registry        = require('./lib/registry'),
    TraitBuilder    = require('./lib/TraitBuilder'),
    TraitInstance   = require('./lib/TraitInstance');

exports.register    = registry.register;
exports.make        = make;
exports.extend      = extend;

function make(traits, opts) {

    var builder = new TraitBuilder();

    traits = registry.expand(traits);

    traits.forEach(function(t) {
        builder.require(t);
    });

    var ctor = builder.__compile__(opts || {});

    // FIXME: this is a total hack and should be destroyed
    Object.defineProperty(ctor.prototype, '_traits', {
        get: function() { return traits.slice(0); }
    });

    return ctor;

}

function extend(sup, traits, opts) {
    return make(sup.prototype._traits.concat(traits), opts);
}

require('./lib/builtins');