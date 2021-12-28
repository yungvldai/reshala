# reshala

A simple CLI tool to resolve `package.json` merge conflicts.
`reshala` automatically determines version of any dependency and resolves the newer one.
If there will any problems, `reshala` will ask you what to do.

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
* `-v, --version` - print version of package
* `-i, --include` - by default, `reshala` will ask you if key exists in ours/theirs but not in the other. You can specify this option to include all keys.