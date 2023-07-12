import { Assets, ResolverManifest } from 'pixi.js';

/** List of all assets available for this game, organised in bundles */
const assetsManifest: ResolverManifest = {
    bundles: [
        {
            name: 'preload',
            assets: [
                {
                    name: 'preload-atlas',
                    srcs: 'assets/preload-atlas/preload-atlas.json',
                },
            ],
        },
        {
            name: 'common',
            assets: [
                {
                    name: 'common-atlas',
                    srcs: 'assets/common-atlas/common-atlas.json',
                },
            ],
        },
        {
            name: 'game',
            assets: [
                {
                    name: 'game-atlas',
                    srcs: 'assets/game-atlas/game-atlas.json',
                }
            ],
        },
        {
            name: 'fonts',
            assets: [
                {
                    name: 'FatFrank',
                    srcs: 'assets/fonts/FatFrank.woff2',
                }
            ],
        },
    ],
};

/** Store bundles already loaded */
const loadedBundles: string[] = [];

/** Load assets bundles that have nott been loaded yet */
export async function loadBundles(bundles: string | string[]) {
    if (typeof bundles === 'string') bundles = [bundles];

    // Filter out bundles already loaded
    const loadList = bundles.filter((bundle) => !loadedBundles.includes(bundle));

    // Skip if there is no bundle left to be loaded
    if (!loadList.length) return;

    // Load bundles
    console.log('[Assets] Load:', loadList.join(', '));
    await Assets.loadBundle(loadList);

    // Append loaded bundles to the loaded list
    loadedBundles.push(...loadList);
}

/** Check if all bundles are loaded, return false if any of them is not loaded yet  */
export function areBundlesLoaded(bundles: string[]) {
    for (const name of bundles) {
        // Return false if a single bundle is not present in the loaded list
        if (!loadedBundles.includes(name)) {
            return false;
        }
    }

    // All provided bundles are loaded
    return true;
}

/** Initialise and start background loading of all assets */
export async function initAssets() {
    // Init PixiJS assets with this asset manifest
    await Assets.init({ manifest: assetsManifest });

    // Load assets for the load screen
    await loadBundles('preload');

    // List all existing bundles names
    const allBundles = assetsManifest.bundles.map((item) => item.name);

    // Start up background loading of all bundles
    Assets.backgroundLoadBundle(allBundles);
}
