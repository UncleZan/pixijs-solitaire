import {Container} from 'pixi.js';

import {Game} from '../game/Game';
import {tween} from '../utils/tweens';
export class GameScreen extends Container
{
    public static assetBundles = ['game', 'common'];
    public w!: number;
    public h!: number;

    private game = new Game();

    public update(delta: number)
    {
        this.game.update(delta);
    }

    public resize(w: number, h: number)
    {
        this.game.resize(w, h);
        this.w = w;
        this.h = h;
    }

    public async show()
    {
        this.alpha = 0;

        this.game.init();
        this.addChild(this.game.view);

        await tween(this, {alpha: 1, duration: 0.2, ease: 'linear'});
    }

    public async hide()
    {
        await tween(this, {alpha: 0, duration: 0.2, ease: 'linear'});
    }
}
