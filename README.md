# reshala

[![npm](https://img.shields.io/npm/v/reshala?color=cc3534)](https://www.npmjs.com/package/reshala)
[![Tests](https://github.com/yungvldai/reshala/actions/workflows/main.yml/badge.svg)](https://github.com/yungvldai/reshala/actions/workflows/main.yml)

A simple CLI tool to resolve `package.json` merge conflicts.
`reshala` automatically finds all of your conflicted `package.json` files.
Also, `reshala` automatically determines version of any dependency and resolves the newer one.
If there will any problems, `reshala` will ask you what to do.

Special thanks to [my colleague](https://github.com/IvanAbramow) for giving a name for this tool 🤙.


![meme](https://github.com/yungvldai/reshala/blob/master/media/meme.png?raw=true)

## Changelog
[CHANGELOG.md](https://github.com/yungvldai/reshala/blob/master/CHANGELOG.md)

## Installing
```
$ npm i -g reshala
```

## Usage
```
$ reshala
```

## Options

* `-h, --help` - print short reference
* `-d, --debug` - run in debug mode (additional output)
* `-v, --version` - print version of package
* `-i, --include-all` - by default, `reshala` will ask you what to do in cases when key exists in ours/theirs but not in the other. You can specify this option to include all keys without question.
* `-e, --exclude-all` - opposite of previous
* `-d, --driver <path>` - custom merge driver. See more in the section below.

If options `-i, --include-all` and `-e, --exclude-all` are used both an error will be generated.

## Drivers API (comes with 4.x, experimental 🧪)

For example, we have two `package.json` files, which contains something like this:

A.json
```json
{
  "name": "reshala",
  "stars": 5
}
```

B.json
```json
{
  "name": "reshala",
  "stars": 4
}
```

So, if we just run `reshala`, it will ask us what value the `stars` key should take and this is normal behavior. `reshala` doesn't know merge rules for this key, however we can define it with a drivers API to merge everything automatically.

Let's say we want to take a higher number as value of `stars` key.
Then we should describe a driver as:

```js
(key, a, b) => {
  if (key === 'stars') {
    return { [key]: Math.max(a, b) };
  }

  return null;
}
```

Note that this is just anonymous JavaScript function. Also, it can be asynchronous. It takes up to 3 arguments:

* key - which key is currently being processed
* a - value from ours
* b - value from theirs

Driver function will be called for EVERY key of an union of A and B keys.
Driver function is called before standart handlers, so you can fully override normal behavior. Driver function should return `null` to go to the standart checks or object to merge to the resulting object (and go to the next key).

For example, you can cut specified key from your resulting `package.json`:
```js
(key) => key === 'unnecessaryKey' ? {} : null;
```

The last expression of the driver code must be functional. But you can use any JavaScript features in driver code.
Furthermore, you have `logger`, `chalk`, `require` and `ab` functions in the global scope of driver file. 

Probably, you are already familiar with the first three functions. But what about the forth?

```ts
type ABFunc = <A, B>(params: { a: A, b?: B, message: string }) => Promise<A | B | boolean>;
```

`ab` is special `inquirer` wrapper. You can offer to choose between `a` and `b` (if passed both), or you can ask if key is needed to include (is passed `a` only). In the first option you will get `a` or `b` (depends on user's choice). In the second one you will get `true` or `false` (depends on user's choice too).

Every question you see when work with `reshala` is just `ab` and you can use it in your own merge algorithms!