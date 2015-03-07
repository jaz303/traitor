# traitor

`traitor` is a traits library for Javascript, allowing classes to be composed from distinct slices of functionality ("traits") instead of relying on traditional inheritance.

`traitor` strives to be efficient and the classes it generates should carry minimal overhead when compared to traditional Javascript objects.

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

Example:

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

### `TraitBuilder` documentation

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
```

## Creating a class

Creating a class based on previously defined traits is as simple as calling `traits.make()`, passing a list of the traits to include, as well as any additional methods to be added to the class.

Rather than an object instance, `traits.make()` returns a constructor function that can be used to create instances via `new`. `traits.make()` is quite an expensive operation - and it's common to make many objects featuring the same list of traits - so it makes sense to "compile" class definitions to conventional Javascript constructor functions, allowing multiple instances to be created relatively cheaply.

Traits are added to the generated class in the order in which they appear in the call to `traits.make()`; in the event of any naming conflict the latest definition wins.

#### `traits.make(traitList, [extraMethods])`

Create a class using the trait names listed in `traitList`. These traits will be added to the resultant class in order and in the event of naming conflicts the latest definition wins.

`extraMethods` is an optional parameter that can be used to add ad-hoc methods onto the class definition without having to make a dedicated trait. These methods will be added after all other traits have been added to the class and will therefore any override any previous definitions in the event of naming conflicts.

An explicit constructor can be defined by assigning a function to the `__construct` key of `extraMethods`. You can also just pass a function to `extraMethods` if no other extra methods besides a constructor are required.

## Built-in Traits

### `meta`

Objects including the `meta` trait can introspect their own traits.

#### `hasTrait(name)`

Returns `true` if this object includes trait `name`, `false` otherwise.

#### `traitNames()`

Returns an array of the names of all traits included by this object.

### `events`

`events` provides objects with a hierarchical event system.

#### `off([ev])`

Remove all registered handlers for event `ev`, or all registered event handlers if `ev` is unspecified.

#### `on(ev, callback)`

Bind `callback` to be invoked whenever event `ev` is emitted.

Returns a cancellation function that can be used to remove the binding.

#### `once(ev, callback)`

Bind `callback` to be called the next time `ev` is emitted. The event binding will then be removed.

Returns a cancellation function that can be used to remove the binding.

#### `emit(ev, [args...])`

Emit event `ev`, triggering all defined handlers in unspecified order. Any additional arguments passed will be forwarded to the event handlers.

Events are organised into a hierarchy using `:`; triggering a child event will also invoke any parent handlers. For example, emitting `change:set`, `change:sort` or `change:remove` would invoke handlers registered for the `change` event in addition to handlers registered for the original event.

#### `emitArray(ev, args)`

Same as `emit()`, but accepts an array of event arguments rather than extracting them positionally.

#### `emitAfter(delay, ev, [args...])`

Emit event `ev` after `delay` milliseconds. Returns a cancellation function that can be used to cancel the event before it is fired.

#### `emitEvery(interval, ev, [args...])`

Emit event `ev` every `interval` milliseconds. Returns a cancellation function that be used to stop the events.

### `methods`

#### `boundMethod(method)`

Returns a function which binds `receiver[method]` to `receiver`. The value of `receiver[method]` is captured at the time this function is called and is thereafter immutable.

#### `lazyMethod(method)`

Returns a function which binds `receiver[method]` to `receiver`. The value of `receiver[method]` will be looked up each time the returned function is called.

## Copyright &amp; License

&copy; 2014-2015 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.