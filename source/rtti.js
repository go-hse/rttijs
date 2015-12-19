/* global log, isArray, forEachIn */


function rttiFactory() {
	'use strict';

	var rtti = {};
	var types = {};
	var proto = {};

	function type(obj) {
		if (isArray(obj) ) {
			return 'array';
		} else {
			return typeof obj;
		}
	}

	rtti.is = function(name, obj) {
		if (types[name] !== undefined) {
			if (types[name] === type(obj)) {
				if (types[name] === 'object') {
					var is_same = true;
					forEachIn(proto[name], function(key, value) {
						if (type(obj[key]) !== type(value) ) {
							is_same = false;
						}
						if (! rtti.is(name+'.'+key, obj[key]) ) {
							is_same = false;
						}
					});
					return is_same;
				}
				if (types[name] === 'array' && obj[0] !== undefined) {
					return rtti.is(name+'.0', obj[0]);
				}
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	rtti.add = function(name, obj) {
		if (types[name] === undefined) {
			types[name] = type(obj);
			proto[name] = obj;
			if (types[name] === 'object') {
				forEachIn(obj, function(key, value) {
					rtti.add(name+'.'+key, value);
				});
			}
			if (types[name] === 'array' && obj[0] !== undefined) {
				rtti.add(name+'.0', obj[0]);
			}
		}
	};


	rtti.toJSON = function(name) {
		var json = {};
		var obj = {type: types[name]};
		json[name] = obj;
		if (types[name] !== undefined) {
			if (types[name] === 'object') {
				obj.content = {}
				forEachIn(proto[name], function(key, value) {
					obj.content[key] = rtti.toJSON(name+'.'+key);
				});
			}
			if (types[name] === 'array' && proto[name][0] !== undefined) {
				obj.content = [];
				obj.content.push(rtti.toJSON(name+'.0'));
			}
		}
		return json;
	};


	return rtti;
}

var typeinfo = rttiFactory();
typeinfo.add('first', {
	test: 'Andreas',
	zahl: 42
});


typeinfo.add('second', {
	test: 'Andreas',
	zahlen: [1, 2, 3]
});

var json = typeinfo.toJSON('second');
log(JSON.stringify(json, undefined, '\t' ));


log("Test 1 " + typeinfo.is('first', {
	test: 'Peter',
	zahl: 52
}));

log("Test 2 " + typeinfo.is('first', {
	test: 72,
	zahl: 52
}));

log("Test 3 " + typeinfo.is('second', {
	test: 72,
	zahl: 52
}));

log("Test 4 " + typeinfo.is('second', {
	test: 72,
	zahlen: 52
}));

log("Test 5 " + typeinfo.is('second', {
	test: '',
	zahlen: ['']
}));


log("Test 6 " + typeinfo.is('second', {
	test: '',
	zahlen: [13]
}));

