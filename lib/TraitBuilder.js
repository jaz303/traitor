module.exports      = TraitBuilder;

var registry        = require('./registry'),
    TraitInstance   = require('./TraitInstance');

var nextInit = 1;

function makeChain(fns) {
    return function() {
        var args = arguments;
        fns.forEach(function(f) {
            f.apply(this, args);
        }, this);
    }
}

function TraitBuilder(traits, methods) {

    this._traits = [];
    this._methods = methods;
    
    this._namedTraits = {};
    this._initializers = [];
    this._chains = {};
    this._properties = {};

    traits.forEach(function(t) { add(this, t); }, this);
    
}

TraitBuilder.prototype.__compile__ = function() {

    this._traits.forEach(function(instance) {
        try {
            this._currentTrait = instance;
            instance.prepare(this);
        } finally {
            this._currentTrait = null;
        }
    }, this);

    this._traits.forEach(function(instance) {
        try {
            this._currentTrait = instance;
            instance.applyTo(this);
        } finally {
            this._currentTrait = null;
        }
    }, this);

    var ctor = this._methods.__construct;
    if (!ctor) {
        ctor = this.__generateConstructor__();
    }

    this._initializers.forEach(function(init) {
        ctor.prototype[init[0]] = init[1];
    });

    var ps = this._properties;
    Object.getOwnPropertyNames(ps).forEach(function(k) {
        Object.defineProperty(ctor.prototype, k, Object.getOwnPropertyDescriptor(ps, k));
    });

    for (var k in this._chains) {
        ctor.prototype[k] = makeChain(this._chains[k]);
    }

    for (var k in this._methods) {
        if (k === 'constructor') continue;
        ctor.prototype[k] = this._methods[k];
    }

    return ctor;

}

TraitBuilder.prototype.__generateConstructor__ = function() {
    
    // TODO: inspect all initializers, find max arity, and generate
    // explicit calls rather than using .apply()
    var source = (
        "(function() {\n" +
            this._initializers.map(function(i) {
                return "    this." + i[0] + ".apply(this, arguments);"
            }).join("\n") + "\n})"
    );

    return eval(source);

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

    var name        = (typeof trait === 'string') ? trait : null,
        resolved    = registry.get(trait);

    // don't add duplicate traits
    if (name && self._namedTraits[trait]) {
        return;
    }

    var instance = new TraitInstance(name, resolved, args);

    if (name) {
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
    var name;
    if (this._currentTrait.name) {
        name = '__init_' + this._currentTrait.name.replace(/[^a-z0-9_]/ig, '_');
    } else {
        name = ('__init_$anonymous_' + (nextInit++));
    }
    this._initializers.push([name, fn]);
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
