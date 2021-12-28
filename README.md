# reshala

[![npm](https://img.shields.io/npm/v/reshala?color=cc3534)](https://www.npmjs.com/package/reshala)
[![Tests](https://github.com/yungvldai/reshala/actions/workflows/main.yml/badge.svg)](https://github.com/yungvldai/reshala/actions/workflows/main.yml)

A simple CLI tool to resolve `package.json` merge conflicts.
`reshala` automatically finds all your conflicted `package.json` files.
Also, `reshala` automatically determines version of any dependency and resolves the newer one.
If there will any problems, `reshala` will ask you what to do.

Special thanks to [my colleague](https://github.com/IvanAbramow) for giving a name for this tool 🤙.

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
* `-i, --include` - by default, `reshala` will ask you if key exists in ours/theirs but not in the other. You can specify this option to include all keys without prompt.