import { DepGraph, DepGraphBuilder } from '@snyk/dep-graph';
import { eventLoopSpinner } from 'event-loop-spinner';

/**
 * Produces a depdency graph from a Unity `manifest.json` and
 * `packages-lock.json`
 *
 * @example
 * ```ts
 * import { unityToDepGraph } from 'unity-to-dep-graph';
 *
 * const depGraph = await unityToDepGraph(
 *  'project name',
 *  'project version',
 *  'manifest.json file contents',
 *  'packages-lock.json file contents',
 *);
 * ```
 */
export async function unityToDepGraph(
  projectName: string,
  version: string,
  manifestJsonRaw: string,
  packagesLockRaw: string,
): Promise<{ depGraph: DepGraph }> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const manifest: Manifest = JSON.parse(manifestJsonRaw);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const lockfile: Lockfile = JSON.parse(packagesLockRaw);

  // defaults to true (i.e. undefined === true), so we need to explicitly check for false
  if (manifest.enableLockFile === false) {
    throw new Error(
      'Building a dep graph without a packages-lock.json is not supported. Please remove `enableLockFile: false` from your `manifest.json`',
    );
  }

  const graphBuilder = new DepGraphBuilder(
    { name: 'unity' },
    {
      name: projectName,
      version,
    },
  );

  const queue: {
    parentNodeId: string;
    name: string;
    version: string;
    dependencies: {
      [packageName: string]: string; // packageName : version
    };
  }[] = Object.keys(manifest.dependencies).map((name) => {
    const { version, dependencies } = lockfile.dependencies[name];

    return {
      parentNodeId: 'root-node',
      name,
      version,
      dependencies,
    };
  });

  while (queue.length > 0) {
    if (eventLoopSpinner.isStarving()) {
      await eventLoopSpinner.spin();
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const { name, version, dependencies, parentNodeId } = queue.shift()!;

    const nodeId = `${name}@${version}`;

    graphBuilder.addPkgNode(
      {
        name,
        version,
      },
      nodeId,
    );

    graphBuilder.connectDep(parentNodeId, nodeId);

    const dependenciesArray = Object.entries(dependencies);

    if (dependenciesArray) {
      dependenciesArray.forEach(([dependencyName, dependencyVersion]) => {
        queue.push({
          parentNodeId: nodeId,
          name: dependencyName,
          version: dependencyVersion,
          dependencies: lockfile.dependencies[dependencyName].dependencies,
        });
      });
    }
  }

  return { depGraph: graphBuilder.build() };
}

/**
 * A `manifest.json` file
 */
interface Manifest {
  dependencies: {
    [packageName: string]: string; // packageName : version
  };
  enableLockFile: boolean;
  testables: string[];
  resolutionStrategy: 'lowest' | 'higestPatch' | 'highestMinor' | 'highest';
  scopedRegistries: {
    name: string;
    url: string;
    scopes: string[];
  }[];
}

/**
 * A `packages-lock.json` file
 */
interface Lockfile {
  dependencies: {
    [packageName: string]: {
      version: string;
      depth: number;
      source: string;
      dependencies: {
        [packageName: string]: string; // packageName : version
      };
    };
  };
}
