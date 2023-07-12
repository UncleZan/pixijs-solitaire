import { Container } from 'pixi.js';
import { areBundlesLoaded, loadBundles } from './assets';
import { app } from './main';

/** Interface for app screens */
interface AppScreen extends Container {
    show?(): Promise<void>;
    hide?(): Promise<void>;
    update?(delta: number): void;
    resize?(w: number, h: number): void;
}

/** Interface for app screens constructors */
interface AppScreenConstructor {
    new (): AppScreen;
    assetBundles?: string[];
}

class Navigation {
    /** Constant background view for all screens */
    private background?: AppScreen;

    /** Current screen being displayed */
    private currentScreen?: AppScreen;

    /** Application width */
    public width = 0;

    /** Application height */
    public height = 0;

    /** Set the  default load screen */
    public setBackground(ctor: AppScreenConstructor) {
        this.background = new ctor();
        if (this.background.update) {
            app.ticker.add(this.background.update, this.background);
        }
        app.stage.addChild(this.background);
    }

    /** Add screen to the stage, link update & resize functions */
    private async addAndShowScreen(screen: AppScreen) {
        // Add screen to stage
        app.stage.addChild(screen);

        // Add screen's resize handler, if available
        if (screen.resize) {
            // Trigger a first resize
            screen.resize(this.width, this.height);
        }

        // Add update function if available
        if (screen.update) {
            app.ticker.add(screen.update, screen);
        }

        // Show the new screen
        if (screen.show) {
            screen.interactiveChildren = false;
            await screen.show();
            screen.interactiveChildren = true;
        }
    }

    /** Remove screen from the stage, unlink update & resize functions */
    private async hideAndRemoveScreen(screen: AppScreen) {
        // Prevent interaction in the screen
        screen.interactiveChildren = false;

        // Hide screen if method is available
        if (screen.hide) {
            await screen.hide();
        }

        // Unlink update function if method is available
        if (screen.update) {
            app.ticker.remove(screen.update, screen);
        }

        // Remove screen from its parent (usually app.stage, if not changed)
        if (screen.parent) {
            screen.parent.removeChild(screen);
        }
    }

    /**
     * Hide current screen (if there is one) and present a new screen.
     * Any class that matches AppScreen interface can be used here.
     */
    public async showScreen(ctor: AppScreenConstructor) {
        // Block interactivity in current screen
        if (this.currentScreen) {
            this.currentScreen.interactiveChildren = false;
        }

        // Load assets for the new screen, if available
        if (ctor.assetBundles && !areBundlesLoaded(ctor.assetBundles)) {
            // Load all assets required by this new screen
            await loadBundles(ctor.assetBundles);
        }

        // If there is a screen already created, hide and destroy it
        if (this.currentScreen) {
            await this.hideAndRemoveScreen(this.currentScreen);
            this.currentScreen.destroy();
        }

        // Create the new screen and add that to the stage
        this.currentScreen = new ctor();
        await this.addAndShowScreen(this.currentScreen);
    }

    public resize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.currentScreen?.resize?.(w, h);
        this.background?.resize?.(w, h);
    }
}

export const navigation = new Navigation();
