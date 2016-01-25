/*
 json2.js
 2013-05-26

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate()) + 'T' +
                f(this.getUTCHours()) + ':' +
                f(this.getUTCMinutes()) + ':' +
                f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
                Boolean.prototype.toJSON = function () {
                    return this.valueOf();
                };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

                return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

            case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

                if (!value) {
                    return 'null';
                }

// Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

// Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

// If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

// Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }

// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
var X = 0;
var Y = 1;

function removeZValue(frames) {
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].v.length > 2) {
            frames[i].v.pop();
        }
    }

    return frames;
}

function roundValue(frames, prcsn) {

    var precision = prcsn || 1;

    for (var i = 0; i < frames.length; i++) {
        if (frames[i].v instanceof Array) {
            for (var j = 0; j < frames[i].v.length; j++) {
                frames[i].v[j] = Math.round(frames[i].v[j] * precision) / precision;
            }
        } else {
            frames[i].v = Math.round(frames[i].v * precision) / precision;
        }
    }

    return frames;
}

function divideValue(frames, divider) {
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].v instanceof Array) {
            for (var j = 0; j < frames[i].v.length; j++) {
                frames[i].v[j] = frames[i].v[j] / divider;
            }
        } else {
            frames[i].v = frames[i].v / divider;
        }
    }

    return frames;
}

function multiplyValue(frames, multiplier) {
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].v instanceof Array) {
            for (var j = 0; j < frames[i].v.length; j++) {
                frames[i].v[j] = frames[i].v[j] * multiplier;
            }
        } else {
            frames[i].v = frames[i].v * multiplier;
        }
    }

    return frames;
}

function clampValue(frames, from, to) {
    for (var i = 0; i < frames.length; i++) {
        if (frames[i].v instanceof Array) {
            for (var j = 0; j < frames[i].v.length; j++) {
                if (frames[i].v[j] > to) frames[i].v[j] = to;
                else if (frames[i].v[j] < from) frames[i].v[j] = from;
            }
        } else {
            if (frames[i].v > to) frames[i].v = to;
            else if (frames[i].v < from) frames[i].v = from;
        }
    }

    return frames;
}

function getArcLength(path) {

    var steps = 500,
        t = 1 / steps,
        aX = 0,
        aY = 0,
        bX = path[0],
        bY = path[1],
        dX = 0,
        dY = 0,
        dS = 0,
        sumArc = 0,
        j = 0;

    for (var i = 0; i < steps; j = j + t) {
        aX = cubicN(j, path[0], path[2], path[4], path[6]);
        aY = cubicN(j, path[1], path[3], path[5], path[7]);
        dX = aX - bX;
        dY = aY - bY;
        dS = Math.sqrt((dX * dX) + (dY * dY));
        sumArc = sumArc + dS;
        bX = aX;
        bY = aY;
        i++;
    }

    return sumArc;
}

function cubicN(pct, a, b, c, d) {
    var t2 = pct * pct;
    var t3 = t2 * pct;
    return a + (-a * 3 + pct * (3 * a - a * pct)) * pct
        + (3 * b + pct * (-6 * b + b * 3 * pct)) * pct
        + (c * 3 - c * 3 * pct) * t2
        + d * t3;
}

function getValueDifference(lastKey, key) {

    var x, y, z, diff;

    // multidimensional properties, e.g. fill array has 4 fields. don't need last one
    if (key.v instanceof Array && key.v.length > 2) {
        x = key.v[0] - lastKey.v[0];
        y = key.v[1] - lastKey.v[1];
        z = key.v[2] - lastKey.v[2];
        diff = Math.pow(x * x + y * y + z * z, 1 / 3);
    } else if (key.v instanceof Array && key.v.length === 2) {
        x = key.v[0] - lastKey.v[0];
        y = key.v[1] - lastKey.v[1];
        diff = Math.sqrt(x * x + y * y);
    } else {
        diff = key.v - lastKey.v;
    }

    return diff;
}

function dist2d(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function printObj(obj) {
    $.writeln('-----------------------');
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'function') {
                $.writeln(key + ': function');
            } else {
                $.writeln(key + ': ' + obj[key]);
            }
        }
    }
    $.writeln('-----------------------');
}

function reflectObj(obj) {
    var props = obj.reflect.properties;
    for (var i = 0; i < props.length; i++) {
        $.writeln(props[i].name + ': ' + f[props[i].name]);
    }
}

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

function clearConsole() {
    var bt = new BridgeTalk();
    bt.target = 'estoolkit-4.0';
    bt.body = function () {
        app.clc();
    }.toSource() + "()";
    bt.send(5);
}

function normalizeToId(str) {
    return str.replace(/(\s+)/g, '-');
}

function rel(value, over) {
    return ( value / over );
}


function timestampString() {
    var now = new Date();

    return "" + now.getFullYear()
        + (now.getMonth() + 1)
        + (now.getDate())
        + "T"
        + now.getHours() + ":"
        + now.getMinutes() + ":"
        + now.getSeconds();
}


function normalizeKeyframes(frames) {

    for (var i = 1; i < frames.length; i++) {

        var lastKey = frames[i - 1],
            key = frames[i],
            duration = key.t - lastKey.t,
            diff,
            easeOut, easeIn,
            normInfluenceIn, normSpeedIn,
            normInfluenceOut, normSpeedOut;

        if (lastKey.outType === KeyframeInterpolationType.LINEAR && key.inType === KeyframeInterpolationType.LINEAR) {
            delete lastKey.outType;
            delete lastKey.easeOut;
            delete lastKey.outTangent;
            delete key.inType;
            delete key.easeIn;
            delete key.inTangent;
            continue;
        }

        diff = lastKey.len ? lastKey.len : getValueDifference(lastKey, key);

        var sign = 1;
        if (diff < 0.01 && diff > -0.01) {
            diff = 0.01;
            if (key.v instanceof Array) {
                for (var j = 0; j < key.v.length; j++) {
                    key.v[j] = lastKey.v[j] + 0.01 * sign;
                }
            } else {
                key.v = lastKey.v + 0.01 * sign;
            }

            sign = sign * -1;
        }

        var averageTempo = diff / duration * 1000;

        if (key.easeIn) {
            normInfluenceIn = key.easeIn[0] / 100;
            normSpeedIn = key.easeIn[1] / averageTempo * normInfluenceIn;
            easeIn = [];

            easeIn[0] = Math.round((1 - normInfluenceIn) * 1000) / 1000;
            easeIn[1] = Math.round((1 - normSpeedIn) * 1000) / 1000;

            key.easeIn = easeIn;
        }

        if (lastKey.easeOut) {
            normInfluenceOut = lastKey.easeOut[0] / 100;
            normSpeedOut = lastKey.easeOut[1] / averageTempo * normInfluenceOut;
            easeOut = [];

            easeOut[0] = Math.round(normInfluenceOut * 1000) / 1000;
            easeOut[1] = Math.round(normSpeedOut * 1000) / 1000;

            lastKey.easeOut = easeOut;
        }

        if (lastKey.easeOut && !key.easeIn) {
            key.easeIn = [0.16667, 1];
        } else if (key.easeIn && !lastKey.easeOut) {
            lastKey.easeOut = [0.16667, 0];
        }

        if (lastKey.easeOut[0] === lastKey.easeOut[1] && key.easeIn[0] === key.easeIn[1]) {
            delete lastKey.easeOut;
            delete key.easeIn;
        }

        if (key.inType) delete key.inType;
        if (key.outType) delete key.outType;
        if (key.inTangent) delete key.inTangent;
        if (key.outTangent) delete key.outTangent;

        if (lastKey.inType) delete lastKey.inType;
        if (lastKey.outType) delete lastKey.outType;
        if (lastKey.inTangent) delete lastKey.inTangent;
        if (lastKey.outTangent) delete lastKey.outTangent;
    }

    return frames;
}
function getMotionpath(frames) {

    for (var i = 1; i < frames.length; i++) {

        var lastKey = frames[i - 1],
            key = frames[i];

        if (lastKey && key) {

            var startX = lastKey.v[0],
                startY = lastKey.v[1],
                ctrl1X = lastKey.outTangent[0] + lastKey.v[0],
                ctrl1Y = lastKey.outTangent[1] + lastKey.v[1],
                ctrl2X = key.inTangent[0] + key.v[0],
                ctrl2Y = key.inTangent[1] + key.v[1],
                endX = key.v[0],
                endY = key.v[1];

            if (isCurved(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY)) {
                lastKey.motionpath = [
                    startX,
                    startY,
                    ctrl1X,
                    ctrl1Y,
                    ctrl2X,
                    ctrl2Y,
                    endX,
                    endY
                ];

                lastKey.len = getArcLength(lastKey.motionpath);
            }
        }
    }

    return frames;

    function isCurved(startX, startY, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY) {
        var threshold = 5;
        return distanceToLine(startX, startY, endX, endY, ctrl1X, ctrl1Y) > threshold
            || distanceToLine(startX, startY, endX, endY, ctrl2X, ctrl2Y) > threshold;
    }

    function distanceToLine(startX, startY, endX, endY, ctrlX, ctrlY) {
        var m = (endY - startY) / (endX - startX),
            b = startY - (m * startX);

        var pX = (m * ctrlY + ctrlX - m * b) / (m * m + 1),
            pY = (m * m * ctrlY + m * ctrlX + b) / (m * m + 1);

        if (dist2d(pX, pY, startX, startY) > dist2d(startX, startY, endX, endY) || dist2d(pX, pY, endX, endY) > dist2d(startX, startY, endX, endY)) {
            return Infinity
        } else {
            return dist2d(pX, pY, ctrlX, ctrlY);
        }
    }
}
function getTransform(data) {    var transform = {};    getAnchor(data, transform);    getPosition(data, transform);    getScale(data, transform);    getRotation(data, transform);    getOpacity(data, transform);    return transform;}function mulScale(transform, inmatrix) {    var matrix = mat3.create();    var scaleX = 1;    var scaleY = 1;    if (transform.scaleX && transform.scaleX.length > 0) {        scaleX = transform.scaleX[0].v;    }    if (transform.scaleY && transform.scaleY.length > 0) {        scaleY = transform.scaleY[0].v;    }    if (scaleX != 1 || scaleY != 1) {        mat3.scale(            matrix,            inmatrix,            vec2.fromValues(scaleX, scaleY)        );        return matrix;    }    else {        return inmatrix;    }}function transform2mat3(transform) {    var matrix = mat3.create();    var position = {x: 0, y: 0};    if (transform.position && transform.position.length > 0) {        position = {x: transform.position[0].v[X], y: transform.position[0].v[Y]};    }    if (position.x != 0 || position.y != 0) {        mat3.translate(            matrix,            mat3.clone(matrix),            vec2.fromValues(position.x, position.y)        );    }    var anchor = {x: 0, y: 0};    if (transform.anchor && transform.anchor.length > 0) {        anchor = {x: transform.anchor[0].v[X], y: transform.anchor[0].v[Y]};    }    if (anchor.x != 0 || anchor.y != 0) {        mat3.translate(            matrix,            mat3.clone(matrix),            vec2.fromValues(anchor.x * -1, anchor.y * -1)        );    }    matrix = mulScale(transform, mat3.clone(matrix));    return matrix;}function mergeTransforms(transforms) {    var merged = mat3.create();    if (transforms) {        var finalMatrix = mat3.create();        for (var t = 0; t < transforms.length; t++) {            mat3.multiply(merged, mat3.clone(merged), transform2mat3(transforms[t]));        }    }    return merged;}
function getAnchor(data, transform) {    var obj;    if (data.property('ADBE Anchor Point') instanceof Property) {        obj = data.property('ADBE Anchor Point');    } else if (data.property('ADBE Vector Anchor') instanceof Property) {        obj = data.property('ADBE Vector Anchor');    } else {        return null;    }        if (obj.isTimeVarying || obj.value[0] !== 0 || obj.value[1] !== 0) {        var anchor = getProperty(obj);        anchor = removeZValue(anchor);        anchor = roundValue(anchor);        anchor = normalizeKeyframes(anchor);        transform.anchor = anchor;    }}
function getScale(data, transform) {

    var obj;

    if (data.property('ADBE Scale')instanceof Property) {
        obj = data.property('ADBE Scale');
    } else if (data.property('ADBE Vector Scale')instanceof Property) {
        obj = data.property('ADBE Vector Scale');
    } else {
        return null;
    }

    //scale can have two different easing, needs always two separate properties
    if (obj.isTimeVarying || obj.value[0] !== 100 || obj.value[1] !== 100) {

        var scaleX = getProperty(obj, 0);
        scaleX = normalizeKeyframes(scaleX);
        scaleX = divideValue(scaleX, 100);
        scaleX = roundValue(scaleX, 10000);

        var scaleY = getProperty(obj, 1);
        scaleY = normalizeKeyframes(scaleY);
        scaleY = divideValue(scaleY, 100);
        scaleY = roundValue(scaleY, 10000);

        transform.scaleX = scaleX;
        transform.scaleY = scaleY;
    }
}
function getPosition(data, transform) {
    var obj;

    if (data.property('ADBE Position') instanceof Property) {
        obj = data.property('ADBE Position');
    } else if (data.property('ADBE Vector Position') instanceof Property) {
        obj = data.property('ADBE Vector Position');
    } else {
        return null;
    }

    if (obj.isTimeVarying ||
        obj.value[0] !== 0 ||
        obj.value[1] !== 0) {

        var position = getProperty(obj);
        position = removeZValue(position);
        position = roundValue(position);

        if (position.length > 1) {
            position = getMotionpath(position);
            position = normalizeKeyframes(position);
        }

        transform.position = position;
    }
}
function getRotation(data, transform) {
    var obj;

    if (data.property('ADBE Rotate Z')instanceof Property) {
        obj = data.property('ADBE Rotate Z');
    } else if (data.property('ADBE Vector Rotation')instanceof Property) {
        obj = data.property('ADBE Vector Rotation');
    } else {
        return null;
    }

    if (obj.isTimeVarying || obj.value !== 0) {
        var rotation = getProperty(obj);
        rotation = roundValue(rotation, 10000);
        if (rotation.length > 1) rotation = normalizeKeyframes(rotation);

        transform.rotation = rotation;
    }
}
function getOpacity(data, transform) {
    var obj;

    if (data.property('ADBE Opacity')instanceof Property) {
        obj = data.property('ADBE Opacity');
    } else if (data.property('ADBE Vector Group Opacity')instanceof Property) {
        obj = data.property('ADBE Vector Group Opacity');
    } else {
        return null;
    }

    if (obj.isTimeVarying || obj.value !== 100) {
        var opacity = getProperty(obj);
        opacity = normalizeKeyframes(opacity);
        opacity = divideValue(opacity, 100);

        transform.opacity = opacity;
    }
}
function getComp(config, comp) {    var data = {};    data.version = config.versionCode;    data.comment = ""        + timestampString() + " '"        + config.file.name + "' exported by "        + config.name + " v"        + config.versionString;    data.type = "stage";    data.aspectRatio = (comp.width / comp.height);    data.size = {        "width": comp.width,        "height": comp.height    };    data.animations = [];    // reverse order so z order of layers is preserved    for (var i = comp.numLayers; i > 0; i--) {        var layer = comp.layer(i);        if (!layer.enabled) {            continue;        }        if (layer instanceof ShapeLayer || layer instanceof AVLayer || layer instanceof TextLayer) {            data.animations.push(getAnimationGroup(config, layer, data.animations));        }    }    return data;}
function getRect(data) {

    var rect = {};
    var x = 0, y = 1;

    rect.name = data.name;
    rect.type = 'rect';

    rect.size = getProperty(data.property('ADBE Vector Rect Size'));
    rect.size = roundValue(rect.size);
    rect.size = normalizeKeyframes(rect.size);

    //optional
    var offsetX = 0;
    var offsetY = 0;
    var position = data.property('ADBE Vector Rect Position');
    if (position.isTimeVarying || position.value[0] !== 0 || position.value[1] !== 0) {
        position = getProperty(position);
        position = normalizeKeyframes(position);
        rect.position = position;
        offsetX = position[0].v[x];
        offsetY = position[0].v[y];
    }

    var roundness = data.property('ADBE Vector Rect Roundness');
    if (roundness.isTimeVarying || roundness.value !== 0) {
        roundness = getProperty(roundness);
        roundness = normalizeKeyframes(roundness);
        rect.roundness = roundness;
    }

    // calculate the vertices based on the size of the rect
    rect.vertices = [];
    for (var i = 0; i < rect.size.length; i++) {
        rect.vertices.push(
            {
                x: (rect.size[i].v[x] * 0.5) + offsetX, y: (rect.size[i].v[y] * 0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * 0.5) + offsetX, y: (rect.size[i].v[y] * -0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * -0.5) + offsetX, y: (rect.size[i].v[y] * -0.5) + offsetY
            },
            {
                x: (rect.size[i].v[x] * -0.5) + offsetX, y: (rect.size[i].v[y] * 0.5) + offsetY
            });
    }

    rect.getWidth = function () {
        return this.vertices[0].x - this.vertices[2].x;
    };

    rect.getHeight = function () {
        return this.vertices[0].y - this.vertices[1].y;
    };

    rect.getCenter = function () {
        return {
            x: this.vertices[2].x + (this.getWidth() / 2),
            y: this.vertices[1].y + (this.getHeight() / 2)
        };
    };


    return rect;
}



function getEllipse(data) {    var ellipse = {};    ellipse.name = data.name;    ellipse.index = data.propertyIndex;    ellipse.type = 'ellipse';    ellipse.size = getProperty(data.property('ADBE Vector Ellipse Size'));    ellipse.size = normalizeKeyframes(ellipse.size);    //optional    var position = data.property('ADBE Vector Ellipse Position');    if (position.isTimeVarying || position.value[0] !== 0 || position.value[1] !== 0) {        ellipse.position = getProperty(position);        ellipse.position = normalizeKeyframes(ellipse.position);    }    ellipse.getWidth = function () {        return ellipse.size[0].v[0];    };    ellipse.getHeight = function () {        return ellipse.size[0].v[1];    };    ellipse.getCenter = function () {        return {            x: position.value[0],            y: position.value[1]        };    };    return ellipse;}
function getFill(data) {
    var fill = {};

    fill.index = data.propertyIndex;
    //fill.composite = data.property('ADBE Vector Composite Order');

    fill.color = getProperty(data.property('ADBE Vector Fill Color'));
    fill.color = multiplyValue(fill.color, 255);
    fill.color = normalizeKeyframes(fill.color);
    fill.color[0].rgb = {
        "r": fill.color[0].v[0] / 255.0,
        "g": fill.color[0].v[1] / 255.0,
        "b": fill.color[0].v[2] / 255.0,
        "a": fill.color[0].v[3] / 255.0
    };

    //optional
    var opacity = data.property('ADBE Vector Fill Opacity');

    if (opacity.isTimeVarying || opacity.value !== 100) {
        opacity = getProperty(opacity);
        opacity = normalizeKeyframes(opacity);
        opacity = divideValue(opacity, 100);
        fill.opacity = opacity;
    }

    return fill;
}


function getProperty(data, split) {
    if (data.numKeys < 1) {
        return getStaticProperty(data, split);
    } else {
        return getAnimatedProperty(data, split);
    }
}
function getStaticProperty(data, split) {
    var arr = [];

    if (data.value instanceof Array && typeof split === 'number') {
        arr.push({
            t: 0,
            v: data.value[split]
        });
    } else {
        arr.push({
            t: 0,
            v: data.value
        });
    }
    return arr;
}
function getAnimatedProperty(data, split) {

    var arr = [],
        numKeys = data.numKeys;

    for (var i = 1; i <= numKeys; i++) {

        var obj = {},
            inType,
            outType,
            easeIn,
            easeOut;

        obj.t = data.keyTime(i) * 1000;

        inType = data.keyInInterpolationType(i);
        outType = data.keyOutInterpolationType(i);

        if (typeof split === 'number' && data.keyInTemporalEase(i)[split] && data.keyOutTemporalEase(i)[split]) {
            easeIn = data.keyInTemporalEase(i)[split];
            easeOut = data.keyOutTemporalEase(i)[split];
        } else {
            // is always array
            easeIn = data.keyInTemporalEase(i)[0];
            easeOut = data.keyOutTemporalEase(i)[0];
        }

        if (typeof split === 'number') {
            obj.v = data.keyValue(i)[split];
        } else {
            obj.v = data.keyValue(i);
        }

        if (i > 1 && inType !== KeyframeInterpolationType.HOLD) {
            obj.inType = inType;
            obj.easeIn = [];
            obj.easeIn[0] = easeIn.influence;
            obj.easeIn[1] = easeIn.speed;
        }

        if (i < numKeys && outType !== KeyframeInterpolationType.HOLD) {
            obj.outType = outType;
            obj.easeOut = [];
            obj.easeOut[0] = easeOut.influence;
            obj.easeOut[1] = easeOut.speed;
        }

//        position
        if (data.propertyValueType === PropertyValueType.TwoD_SPATIAL || data.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {

            if (i > 1) {
                obj.inTangent = data.keyInSpatialTangent(i);
                obj.easeIn = [];
                obj.easeIn[0] = easeIn.influence;
                obj.easeIn[1] = easeIn.speed;
            }

            if (i < numKeys) {
                obj.outTangent = data.keyOutSpatialTangent(i);
                obj.easeOut = [];
                obj.easeOut[0] = easeOut.influence;
                obj.easeOut[1] = easeOut.speed;
            }
        }

        arr.push(obj);
    }

    return arr;
}
var fs = new FileSystem();    function main() {    clearConsole();    var btfyConfig = {        versionCode: 1,        versionString: "0.01",        name: "Brundlefly Exporter",        file: app.project.file    };    var data = getComp(btfyConfig, app.project.activeItem);    var json = JSON.stringify(data, null, "  ");    var outFile = File.saveDialog('Save the json file');    if (outFile != null) {        outFile.open("w", "TEXT", "????");        outFile.write(json);        outFile.close();    }    btfyConfig.destdir = outFile.path;    //btfyConfig.destdir = '~/Src/github.com/ae2canvas';    //var outFile = new File('~/Src/github.com/ae2canvas/out.json');    //if (outFile != null) {    //    outFile.open("w", "TEXT", "????");    //    outFile.write(json);    //    outFile.close();    //}    //    //outFile = new File('~/Src/github.com/Brundlefly/Example/btfy/sample.btfy');    //if (outFile != null) {    //    outFile.open("w", "TEXT", "????");    //    outFile.write(json);    //    outFile.close();    //}    //    //outFile = new File('~/Src/github.com/BrundleflyAndroid/app/src/main/assets/sample.btfy');    //if (outFile != null) {    //    outFile.open("w", "TEXT", "????");    //    outFile.write(json);    //    outFile.close();    //}    alert("Composition exported:\n" + outFile.path + "/" + outFile.name);}main();