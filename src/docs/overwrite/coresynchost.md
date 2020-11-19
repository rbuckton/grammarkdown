---
uid: 'grammarkdown!CoreSyncHost:class'
example:
  - *content
---

The following example shows how you can create a @grammarkdown!CoreSyncHost:class from a `Map`:

```ts
const files = new Map([
  ["a.grammar", "..."],
  ["b.grammar", "..."]
]);
const host = new CoreSyncHost({
  ignoreCase: false,
  useBuiltinGrammars: false,
  resolveFile: file => file,
  readFileSync: file => files.get(file)
});
```

---
uid: 'grammarkdown!CoreSyncHost.forFile:member(1)'
example:
  - *content
---

The following example shows how you can create a @grammarkdown!CoreSyncHost:class for a `string`:

```ts
const content = "...";
const host = CoreSyncHost.forFile(content);
```
