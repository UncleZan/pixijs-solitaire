import { Container, Text } from 'pixi.js';
import gsap from 'gsap';
import { i18n } from '../utils/i18n';
import { PixiLogo } from '../ui/PixiLogo';

export class LoadScreen extends Container {
    public static assetBundles = ['preload'];
    private pixiLogo: PixiLogo;
    private message: Text;

    constructor() {
        super();

        this.message = new Text(i18n.loadingMessage, {
            fill: 0x5c5c5c,
            fontFamily: 'Verdana',
            align: 'center',
        });
        this.message.anchor.set(0.5);
        this.addChild(this.message);

        this.pixiLogo = new PixiLogo();
        this.addChild(this.pixiLogo);
    }

    public resize(w: number, h: number) {
        this.message.x = w * 0.5;
        this.message.y = h * 0.75;
        this.pixiLogo.x = w * 0.5;
        this.pixiLogo.y = h - 50;
    }

    public async show() {
        gsap.killTweensOf(this.message);
        this.message.alpha = 1;
    }

    public async hide() {
        gsap.killTweensOf(this.message);
        gsap.to(this.message, {
            alpha: 0,
            duration: 0.3,
            ease: 'linear',
            delay: 0.5,
        });
    }
}
