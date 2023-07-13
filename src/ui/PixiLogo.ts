import {Container, Sprite} from 'pixi.js';

export class PixiLogo extends Container
{
    private image: Sprite;

    constructor()
    {
        super();
        this.image = Sprite.from('logo-pixi');
        this.image.anchor.set(0.5);
        this.addChild(this.image);
    }
}
