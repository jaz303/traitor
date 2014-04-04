module.exports      = TraitBuilder;

var registry        = require('./registry'),
    TraitInstance   = require('./TraitInstance');

function TraitBuilder() {

    this._traits = [];
    this._namedTraits = {};
    
    this._chains = {};
    this._properties = {};
    this._prepares = [];

}

TraitBuilder.prototype.require = function(traitDesc) {

    var trait, args, resolved;

    if (typeof traitDesc === 'string' || typeof traitDesc === 'function') {
        trait = traitDesc;
        args = [];
    } else if (Array.isArray(traitDesc)) {
        trait = traitDesc[0];
        args = traitDesc.slice(1);
    } else if (trait && (typeof trait === 'object')) {
        trait = trait.trait;
        args = [trait];
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

TraitBuilder.prototype.has = function(traitName) {
    return traitName in this._traits;
}

TraitBuilder.prototype.get = function(traitName) {
    return this._traits[traitName];
}

TraitBuilder.prototype.init = function(fn) {
    return this.chain('__init__', fn);
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