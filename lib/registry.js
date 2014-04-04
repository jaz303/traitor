exports.get = get;
exports.register = register;
exports.expand = expand;

var REGISTRY = {};

function get(trait) {
    if (typeof trait === 'function') {
        return trait;
    } else if (trait in REGISTRY) {
        return REGISTRY[trait];
    } else {
        throw new Error("unknown trait: " + trait);
    }
}

function register(trait, cb) {
    if (trait in REGISTRY) {
        throw new Error("duplicate trait: " + trait);
    } else {
        REGISTRY[trait] = cb;   
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