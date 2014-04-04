module.exports = TraitInstance;

function TraitInstance(trait, args) {
    
    if (args.length === 0) {
        args.push({});
    }

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

    if (!(typeof this.args[opts] === 'object')) {
        throw new Error("cannot set trait option - trait's first arg is not an object!");
    }

    this.args[0][opt] = value;

}

TraitInstance.prototype.applyTo = function(builder) {
    this.trait.apply(null, [builder].concat(this.args));
}