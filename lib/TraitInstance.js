module.exports = TraitInstance;

function TraitInstance(name, trait, args) {
    
    if (args.length === 0) {
        args.push({});
    }

    this.name = name;
    this.trait = trait;
    this.args = args;

}

TraitInstance.prototype.hasOpt = function(opt) {
    return (typeof this.args[0] === 'object') && (opt in this.args[0]);
}

TraitInstance.prototype.setOpt = function(opt, value) {
    
    if (this.args.length === 0) {
        this.args.push({});
    }

    if (!(typeof this.args[0] === 'object')) {
        throw new Error("cannot set trait option - trait's first arg is not an object!");
    }

    this.args[0][opt] = value;

}

TraitInstance.prototype.prepare = function(builder) {
    if (this.trait.prepare) {
        this.trait.prepare.apply(null, [builder].concat(this.args));    
    }
}

TraitInstance.prototype.applyTo = function(builder) {
    this.trait.apply.apply(null, [builder].concat(this.args));
}