# unity-to-dep-graph

A small library that converts Unity package manager files (a
`manifest.json` and its respective `packages-lock.json`) into a
[dependency graph](https://www.npmjs.com/package/@snyk/dep-graph)

## Getting started

```console
npm i unity-to-dep-graph
```

```ts
import { unityToDepGraph } from 'unity-to-dep-graph';

const depGraph = await unityToDepGraph(
  'project name',
  'project version',
  'manifest.json file contents',
  'packages-lock.json file contents',
);
```
