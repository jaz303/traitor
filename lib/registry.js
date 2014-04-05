exports.get = get;
exports.register = register;
exports.expand = expand;

var REGISTRY = {};

function makeTrait(trait) {

    if (typeof trait === 'function') {
        trait = { apply: trait };
    }

    if (!(typeof trait === 'object')) {
        throw new Error("trait must be object");
    }

    if (typeof trait.apply !== 'function') {
        throw new Error("trait must contain an 'apply' function");
    }

    return trait;

}

function get(trait) {
    if (typeof trait === 'string') {
        if (trait in REGISTRY) {
            return REGISTRY[trait];    
        } else {
            throw new Error("unknown trait name: " + trait);    
        }
    } else {
        return makeTrait(trait);
    }
}

function register(trait, cb) {

    // duplicate check
    if (trait in REGISTRY) {
        throw new Error("duplicate trait: " + trait);

    // array is an expansion; just store it
    } else if (Array.isArray(cb)) {
        REGISTRY[trait] = cb;

    // otherwise coerce cb into a trait object
    } else {
        REGISTRY[trait] = makeTrait(cb);

    }

}

function expand_r(trait, collector) {
    if (typeof trait === 'string') {
        var impl = get(trait);
        if (Array.isArray(impl)) {
            impl.forEach(function(t) {
                expand_r(t, collector);
            });
        } else {
            collector.push(trait);
        }
    } else {
        collector.push(trait);
    }
}

function expand(traits) {
    var expanded = [];
    traits.forEach(function(t) {
        expand_r(t, expanded);
    });
    return expanded;
}