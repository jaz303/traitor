var registry = require('./registry');

registry.register('meta', function(def) {

    def.method('hasTrait', function(trait) {
        return def.has(trait);
    });

    def.property('traitNames', {
        get: function() { return Object.keys(def._namedTraits); }
    });

});

registry.register('events', {
    
    requires: [],
    
    prepare: function(def) {

    },
    
    apply: function(def) {

        var slice = Array.prototype.slice;

        def.method('off', function(ev) {
        
            if (!this._eventHandlers) {
                return;
            }
            
            if (ev) {
                this._eventHandlers[ev] = [];
            } else if (!ev) {
                this._eventHandlers = {};
            }

        });

        def.method('on', function(ev, callback) {

            var hnds    = this._eventHandlers || (this._eventHandlers = {}),
                lst     = hnds[ev] || (hnds[ev] = []);

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

            var args = null;

            var hnds = this._eventHandlers;
            if (!hnds) return;

            var lst = hnds[ev];
            if (lst) {
                args = slice.call(arguments, 1);
                for (var i = 0, l = lst.length; i < l; ++i) {
                    lst[i].apply(null, args);
                }
            }

            var cix = ev.lastIndexOf(':');
            if (cix >= 0) {
                if (args === null) {
                    args = slice.call(arguments, 1);
                }
                this.emitArray(ev.substring(0, cix), args);
            }

        });

        def.method('emitArray', function(ev, args) {

            var hnds = this._eventHandlers;
            if (!hnds) return;
            
            var lst = hnds[ev];
            if (lst) {
                for (var i = 0, l = lst.length; i < l; ++i) {
                    lst[i].apply(null, args);
                }
            }

            var cix = ev.lastIndexOf(':');
            if (cix >= 0) {
                this.emitArray(ev.substring(0, cix), args);
            }

        });

        def.method('emitAfter', function(delay, ev) {

            var self    = this,
                timer   = null,
                args    = slice.call(arguments, 2);

            timer = setTimeout(function() {
                self.emitArray(ev, args);
            }, delay);

            return function() { clearTimeout(timer); }

        });

        def.method('emitEvery', function(interval, ev) {

            var self    = this,
                timer   = null,
                args    = slice.call(arguments, 2);

            var timer = setInterval(function() {
                self.emitArray(ev, args);
            }, delay);

            return function() { clearInterval(timer); }

        });

    }
    
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