import { Application } from 'pixi.js';
import { initAssets } from './assets';
import { navigation } from './navigation';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoadScreen } from './screens/LoadScreen';
import { TiledBackground } from './ui/TiledBackground';
import { getUrlParam } from './utils/getUrlParams';
import { requestFullScreen } from './utils/requestFullScreen';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application<HTMLCanvasElement>({
    resolution: Math.max(window.devicePixelRatio, 2),
    backgroundColor: 0xffffff,
});

/** Set up a resize function for the app */
function resize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const minWidth = 375;
    const minHeight = 700;

    // Calculate renderer and canvas sizes based on current dimensions
    const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
    const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
    const scale = scaleX > scaleY ? scaleX : scaleY;
    const width = windowWidth * scale;
    const height = windowHeight * scale;

    // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
    app.renderer.view.style.width = `${windowWidth}px`;
    app.renderer.view.style.height = `${windowHeight}px`;
    window.scrollTo(0, 0);

    // Update renderer  and navigation screens dimensions
    app.renderer.resize(width, height);
    navigation.resize(width, height);
}

/** Setup app and initialise assets */
async function init() {
    // Add pixi canvas element (app.view) to the document's body
    document.body.appendChild(app.view);

    // Whenever the window resizes, call the 'resize' function
    window.addEventListener('resize', resize);

    // Trigger the first resize
    resize();

    // Setup assets bundles (see assets.ts) and start up loading everything in background
    await initAssets();

    navigation.setBackground(TiledBackground);

    await navigation.showScreen(LoadScreen);

    document.addEventListener('pointerdown', () =>
    {
        requestFullScreen();
    });

    // Show first screen - go straight to game if '?game' param is present in url
    if (getUrlParam('game') !== null) {
        await navigation.showScreen(GameScreen);
    } else if (getUrlParam('load') !== null) {
        await navigation.showScreen(LoadScreen);
    } else {
        await navigation.showScreen(HomeScreen);
    }
}

// Init everything
init();
