import { Container, NineSlicePlane, Texture } from 'pixi.js';
import { navigation } from '../navigation';
import { GameScreen } from './GameScreen';
import gsap from 'gsap';
import { i18n } from '../utils/i18n';
import { RectangleButton } from '../ui/RectangleButton';
import { customBackOut } from '../utils/customEases';

export class HomeScreen extends Container {
    public static assetBundles = ['home', 'common'];
    private playButton: RectangleButton;
    private base: NineSlicePlane;

    constructor() {
        super();

        this.base = new NineSlicePlane(Texture.from('rounded-rectangle'), 32, 32, 32, 32);
        this.base.tint = 0x44268f;
        this.addChild(this.base);

        this.playButton = new RectangleButton({ text: i18n.playButton });
        this.addChild(this.playButton);
        this.playButton.onPress.connect(() => navigation.showScreen(GameScreen));
    }

    public update() {
        //
    }

    public resize(w: number, h: number) {
        this.playButton.x = w * 0.5;
        this.playButton.y = h - 130;
        this.base.width = w;
        this.base.y = h - 140;
    }

    public async show() {
        this.revealScreen();

        gsap.killTweensOf(this.playButton.pivot);
        this.playButton.pivot.y = -200;
        await gsap.to(this.playButton.pivot, { y: 0, duration: 0.4, ease: 'back.out', delay: 0.2 });
    }

    private async revealScreen() {
        const duration = 0.3;
        const ease = customBackOut;
        const delay = 0.1;

        gsap.killTweensOf(this.base);
        this.base.height = navigation.height * 1.25;
        this.base.pivot.y = navigation.height;

        gsap.to(this.base, {
            height: 200,
            duration,
            ease,
            delay,
        });
        await gsap.to(this.base.pivot, {
            y: 0,
            duration,
            ease,
            delay,
        });
    }

    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }
}
