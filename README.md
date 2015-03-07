# traitor

Traitor is a traits library for Javascript.

## Installation

Get it:

```shell
$ npm install --save traitor
```

Require it:

```javascript
var traits = require('traitor');
````

## Defining Traits

To define a new trait, use `traits.register(traitName, callback)`. The callback receives a `TraitBuilder` instance, documented blow, that is used to define the new trait's characteristics.

```javascript
traits.register('has-name', function(def) {

	def.init(function() {
		this._name = "";
	});
	
	def.method('getName', function() {
		return this._name;
	});

	def.method('setName', function(newName) {
		this._name = (newName || '').trim();
	});

});
```

#### `def.value(name, value)`

Add a named property and corresponding value to this trait. If assigning a complex value, i.e. array or object, remember that this will be shared between all object instances that include this trait.

Example:

```javascript
traits.register('autoResizable', function(def) {
	def.value('autoResize', true);
});

var ctor = traits.make(['autoResizable']);
var obj = new ctor();

obj.autoResize; // => true
```

#### `def.method(name, fn)`

Add a method to this trait. In the method body, `this` should be assumed to refer to the object instance upon which the method is being called.

Example:

```javascript
traits.register('greeter', function(def) {
	def.method('greet', function(name) {
		console.log("hello " + name);
	});
});

var ctor = traits.make(['greeter']);
var greeter = new ctor();

greeter.greet('ice king'); // => "hello ice king"
```

#### `def.property(name, propertyDescriptor)`

Add a property to this trait. `propertyDescriptor` should be an object compatible with `Object.definieProperty`.

#### `def.init(fn)`

Define an initializer for this trait. `traitor` allows every trait to define its own initializer and will arrange for each of these to be called when an object is instantiated.

Initializers are forwarded any arguments that were passed to the object's actual constructor. A common pattern is for all initializers to accept an `options` object and pluck out whichever keys they require.

Trait initializers will not be invoked automatically if you specified an explicit constructor when creating the class. Each initializer may still be invoked manually, however, by calling its associated instance method whose is name is based on convention (see 2nd example below)

Example 1: auto-generated constructor

```javsacript
traits.register('has-title', function(def) {
	def.init(function() {
		this.title = "untitled";
	});
});

var ctor = new traits.make(['has-title']);
var obj = new ctor();
obj.title; // => "untitled"
```

Example 2: manual constructor

```javsacript
traits.register('has-title', function(def) {
	def.init(function() {
		this.title = "untitled";
	});
});

var ctor = new traits.make(['has-title'], function() {
	// do some other initialization
	// ...
	// ...
	// call has-title initializer explicitly;
	// format is __init_ + trait name, with all special chars replaced by _
	this.__init_has_title();
});

var obj = new ctor();
obj.title; // => "untitled"
```

#### `def.chain(name, fn, [prepend])`

Define a named chained method.

A chained method is similiar to an initializer in the sense that multiple traits can bind callbacks that are all invoked by a single method call on the contained object.

Example:

```javascript
traits.register('saveable', function(def) {
	def.method('save', function() {
		// save this object
		// ...
		this._afterSave();
	});
});

traits.register('thing1', function(def) {
	def.chain('_afterSave', function() {
		console.log("afterSave in thing1");
	});
});

traits.register('thing2', function(def) {
	def.chain('_afterSave', function() {
		console.log("afterSave in thing2");
	});
});

var ctor = traits.make(['saveable', 'thing1', 'thing2']);
var obj = new ctor();
obj.save(); // => "afterSave in thing1\nafterSave in thing2\n"

## Creating a class


## Built-in Traits

### `meta`

#### `hasTrait(name)`

#### `traitNames()`

### `events`

#### `off(ev)`

#### `on(ev, callback)`

#### `once(ev, callback)`

#### `emit(ev, [args...])`

#### `emitArray(ev, args)`

#### `emitAfter(delay, ev, [args...])`

#### `emitEvery(interval, ev, [args...])`

### `methods`

#### `boundMethod(method)`

#### `lazyMethod(method)`