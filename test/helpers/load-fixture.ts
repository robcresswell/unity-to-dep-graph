import type { DepGraphData } from '@snyk/dep-graph';
import { promises as fsp } from 'fs';
import path from 'path';

export async function loadFixture(
  name: string,
): Promise<{
  manifest: string;
  lockfile: string;
  expectedDepGraph: DepGraphData;
}> {
  const fixtureDir = path.resolve(__dirname, '..', 'fixtures');
  const [manifest, lockfile, expectedDepGraph] = await Promise.all([
    fsp.readFile(path.join(fixtureDir, name, 'manifest.json'), 'utf8'),
    fsp.readFile(path.join(fixtureDir, name, 'packages-lock.json'), 'utf8'),
    fsp.readFile(
      path.join(fixtureDir, name, 'expected-dep-graph.json'),
      'utf8',
    ),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return { manifest, lockfile, expectedDepGraph: JSON.parse(expectedDepGraph) };
}
