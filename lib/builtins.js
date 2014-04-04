var registry = require('./registry');

registry.register('meta', function(def) {

    def.method('hasTrait', function(trait) {
        return def.has(trait);
    });

    def.property('traitNames', {
        get: function() { return Object.keys(def._namedTraits); }
    });

});

registry.register('emitter', function(def) {

    var slice = Array.prototype.slice;

    def.init(function() {
        this._emitterHandlers = {};
    });

    def.method('on', function(ev, callback) {
        var lst = this._emitterHandlers[ev] || (this._emitterHandlers[ev] = []);
        lst.push(callback);

        var removed = false;
        return function() {
            if (!removed) {
                lst.splice(lst.indexOf(callback), 1);
                removed = true;
            }
        }
    });

    def.method('once', function(ev, callback) {
        var cancel = this.on(ev, function() {
            callback.apply(null, arguments);
            cancel();
        });
        return cancel;
    });

    def.method('emit', function(ev) {
        var lst = this._emitterHandlers[ev];
        if (lst) {
            var args = slice.call(arguments, 1);
            for (var i = 0, l = lst.length; i < l; ++i) {
                lst[i].apply(null, args);
            }
        }
    });

});

registry.register('methods', function(def) {

    def.method('boundMethod', function(method) {
        return this[method].bind(this);
    });

    def.method('lazyMethod', function(method) {
        var self = this;
        return function() {
            return self[method].apply(self, arguments);
        }
    });

});