module.exports      = TraitBuilder;

var registry        = require('./registry'),
    TraitInstance   = require('./TraitInstance');

var INIT = '__init__';

function makeChain(fns) {
    return function() {
        var args = arguments;
        fns.forEach(function(f) {
            f.apply(this, args);
        }, this);
    }
}

function TraitBuilder() {

    this._traits = [];
    this._namedTraits = {};
    
    this._chains = {};
    this._properties = {};
    this._prepares = [];

}

TraitBuilder.prototype.__compile__ = function(opts) {

    this._prepares.forEach(function(fn) {
        fn();
    });

    var initializers    = this._chains[INIT] || [],
        ctor            = null;
    
    switch (opts.initializer || 'closure') {
        case 'closure':
            ctor = makeChain(initializers);
            break;
        case 'eval':
            ctor = eval(
                "(function() {\n" +
                    initializers.map(function(i) {
                        return '(' + i + ").apply(this, arguments);";
                    }).join("\n") + "\n})");
            break;
        default:
            throw new Error("invalid initializer style: " + opts.initializer);
    }

    var ps = this._properties;
    Object.getOwnPropertyNames(ps).forEach(function(k) {
        Object.defineProperty(ctor.prototype, k, Object.getOwnPropertyDescriptor(ps, k));
    });

    for (var k in this._chains) {
        if (k === INIT) continue;
        ctor.prototype[k] = makeChain(this._chains[k]);
    }

    return ctor;

}

/*
 * Add a trait to this definition.
 *
 * This method is a no-op if traitDesc has already been added.
 *
 * @param traitDesc trait descriptor, either:
 *          - string (trait name)
 *          - function (anonymous trait)
 *          - [{string|function}, args...] (trait with arguments)
 *          - object (equivalent to [object.trait, object])
 */
TraitBuilder.prototype.require = function(traitDesc) {

    var trait, args, resolved;

    if (typeof traitDesc === 'string' || typeof traitDesc === 'function') {
        trait = traitDesc;
        args = [];
    } else if (Array.isArray(traitDesc)) {
        trait = traitDesc[0];
        args = traitDesc.slice(1);
    } else if (traitDesc && (typeof traitDesc === 'object')) {
        trait = traitDesc.trait;
        args = [traitDesc];
    }

    if (typeof trait !== 'string' && typeof trait !== 'function') {
        throw new Error("trait must be either string or function!");
    }

    var resolved = registry.get(trait);

    // don't add duplicate traits
    if (this._traits.indexOf(resolved) >= 0) {
        return;
    }

    var instance = new TraitInstance(resolved, args);

    if (typeof trait === 'string') {
        this._namedTraits[trait] = instance;
    }

    this._traits.push(instance);
    instance.applyTo(this);

}

/*
 * Returns true if traitName has been added to this definition.
 */
TraitBuilder.prototype.has = function(traitName) {
    return traitName in this._namedTraits;
}

/*
 * Returns the TraitInstance associated with traitName.
 */
TraitBuilder.prototype.get = function(traitName) {
    return this._namedTraits[traitName];
}

/*
 * Added an initializer function to this definition.
 */
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

TraitBuilder.prototype.value = function(name, value) {
    this._properties[name] = value;
}

TraitBuilder.prototype.method = function(name, fn) {
    this._properties[name] = fn;
}

TraitBuilder.prototype.property = function(name, descriptor) {
    Object.defineProperty(this._properties, name, descriptor);
}

TraitBuilder.prototype.prepare = function(fn) {
    this._prepares.push(fn);
}