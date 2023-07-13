import {AnimatedSprite, BlurFilter, Container, Graphics, Text, Texture} from 'pixi.js';

import {PixiLogo} from '../ui/PixiLogo';
import {i18n} from '../utils/i18n';
import {tween} from '../utils/tweens';

export class LoadScreen extends Container
{
    public static assetBundles = ['preload'];

    private pixiLogo: PixiLogo;
    private message = new Container();
    private loadingCard: AnimatedSprite;

    constructor()
    {
        super();
        
        const msg = new Text(`${i18n.loadingMessage}...`, {
            fontFamily: 'BerkshireSwash',
            fill: 0xFFFFFF,
            fontSize: 70,
            align: 'center',
        });

        msg.anchor.set(0.5);
        const msgShadow = new Graphics().beginFill(0x000000, 0.18)
            .drawRoundedRect(-msg.width * 0.5, -msg.height * 0.5, msg.width, msg.height, 30);
        const blur = new BlurFilter(16, 4, 1, 13);

        msgShadow.filters = [blur];

        const frames: Texture[] = [];

        for (let i = 1; i <= 13; i++) frames.push(Texture.from(`cardanimation-frame${i}`));
        this.loadingCard = new AnimatedSprite(frames);
        this.loadingCard.anchor.set(0.5);
        this.loadingCard.animationSpeed = 0.18;
        this.loadingCard.play();
        
        this.pixiLogo = new PixiLogo();
        this.pixiLogo.scale.set(0.6);
        
        this.message.addChild(msgShadow, msg);
        this.addChild(this.message, this.loadingCard, this.pixiLogo);
    }

    public resize(w: number, h: number)
    {
        this.loadingCard.x = w * 0.5;
        this.loadingCard.y = h * 0.5;
        this.message.x = w * 0.5;
        this.message.y = h - 140;
        this.pixiLogo.x = w * 0.5;
        this.pixiLogo.y = h - 50;
    }

    public async show()
    {
        this.message.alpha = 1;
    }

    public async hide()
    {
        tween(this.message, {
            alpha: 0,
            duration: 0.3,
            ease: 'linear',
            delay: 0.5,
        });
    }
}
