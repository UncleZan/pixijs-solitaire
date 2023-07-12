import { Container } from 'pixi.js';
import gsap from 'gsap';
import { PlayingTable } from '../game/PlayingTable';

const pt: PlayingTable = new PlayingTable();

export class GameScreen extends Container {
    public static assetBundles = ['game', 'fonts'];
    public w!: number;
    public h!: number;

    constructor() {
        super();

    }

    public update() {
        //
    }

    public resize(w: number, h: number) {
        pt.resize(w, h);
        this.w = w;
        this.h = h;
    }

    public async show() {
        gsap.killTweensOf(this);
        this.alpha = 0;

        pt.init();
        this.addChild(pt.view);
        
        this.resize(this.w, this.h);

        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });
    }

    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }
}
