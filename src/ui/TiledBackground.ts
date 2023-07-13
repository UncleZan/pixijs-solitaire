import {Container, Texture, TilingSprite} from 'pixi.js';

import {app} from '../main';

export class TiledBackground extends Container
{
    public direction = -Math.PI * 0.15;
    private sprite: TilingSprite;

    constructor()
    {
        super();

        this.sprite = new TilingSprite(
            Texture.from('scrolling-tile'),
            app.screen.width,
            app.screen.height,
        );
        this.sprite.tileTransform.rotation = this.direction;
        this.addChild(this.sprite);
    }

    public get width()
    {
        return this.sprite.width;
    }

    public set width(value: number)
    {
        this.sprite.width = value;
    }

    public get height()
    {
        return this.sprite.height;
    }

    public set height(value: number)
    {
        this.sprite.height = value;
    }

    public update(delta: number)
    {
        this.sprite.tilePosition.x -= Math.sin(-this.direction) * delta;
        this.sprite.tilePosition.y -= Math.cos(-this.direction) * delta;
    }

    public resize(w: number, h: number)
    {
        this.width = w;
        this.height = h;
    }
}
