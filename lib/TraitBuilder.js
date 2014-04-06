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

function TraitBuilder(ctor, traits) {

    this._ctor = ctor;

    this._traits = [];
    this._namedTraits = {};
    
    this._chains = {};
    this._properties = {};

    traits.forEach(function(t) { add(this, t); }, this);
    
}

TraitBuilder.prototype.__compile__ = function(opts) {

    this._traits.forEach(function(instance) {
        instance.prepare(this);
    }, this);

    this._traits.forEach(function(instance) {
        instance.applyTo(this);
    }, this);

    var ctor = this._ctor;

    if (!ctor) {
        ctor = this.__generateConstructor__(opts);
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

TraitBuilder.prototype.__generateConstructor__ = function(opts) {

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

    return ctor;

}

function add(self, traitDesc) {

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
    if (typeof trait === 'string' && self._namedTraits[trait]) {
        return;
    }

    var instance = new TraitInstance(resolved, args);

    if (typeof trait === 'string') {
        self._namedTraits[trait] = instance;
    }

    self._traits.push(instance);
    
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
