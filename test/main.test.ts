#!/usr/bin/env -S node -r ts-node/register/transpile-only
import type { AssertionError } from 'assert';
import assert from 'assert/strict';
import { unityToDepGraph } from '../src/main';
import { loadFixture } from './helpers/load-fixture';

const scenarios = ['simple'];

async function test() {
  for (const scenario of scenarios) {
    const { manifest, lockfile, expectedDepGraph } = await loadFixture(
      scenario,
    );

    const { depGraph } = await unityToDepGraph(
      scenario,
      '1.0.0',
      manifest,
      lockfile,
    );
    const depGraphJson = depGraph.toJSON();

    assert.deepStrictEqual(depGraphJson, expectedDepGraph);
  }
}

test()
  .then(() => {
    console.log('\x1b[32m✓ All tests passed!\x1b[0m');
  })
  .catch((err: unknown) => {
    console.error((err as AssertionError).message);
    console.log('\x1b[31m⨯ Tests failed!\x1b[0m');
    process.exit(1);
  });
