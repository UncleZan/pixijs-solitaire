import {Container, Sprite} from 'pixi.js';

import {orientation} from '../utils/orientation';

class TableClass
{
    public view = new Container();
    public woodContainer = new Container();
    
    private width = 1;
    private height = 1;
    private deckBar!: Sprite;
    private deckBarShadow!: Sprite;
    private topBar!: Sprite;
    private suitsBar!: Sprite;
    private middle!: Sprite;

    constructor()
    {
        this.middle = Sprite.from('wood-middle');
        this.topBar = Sprite.from('top-bar');
        this.deckBar = Sprite.from('wood-deck');
        this.deckBarShadow = Sprite.from('wood-deck-shadow');
        this.suitsBar = Sprite.from('wood-suits');

        this.woodContainer.addChild(this.middle, this.suitsBar, this.topBar, this.deckBar, this.deckBarShadow);
        this.view.addChild(this.woodContainer);
    }

    public get suitsWidth()
    {
        if (orientation === 'landscape') return this.suitsBar.width;
        
        return this.suitsBar.height;
    }

    public get suitsHeight()
    {

        if (orientation === 'landscape') return this.suitsBar.height - this.topBar.height;

        return this.suitsBar.width - this.topBar.height;
    }

    public get suitsLeft()
    {
        if (orientation === 'landscape') return this.suitsBar.x;
        
        return 0;
    }

    public get topBarWidth()
    {
        if (orientation === 'landscape') return this.topBar.width - this.deckWidth;
        
        return this.topBar.width;
    }

    public get topBarHeight()
    {
        return this.topBar.height;
    }

    public get playgroundWidth()
    {
        if (orientation === 'landscape') return this.width - this.deckBar.width - this.suitsBar.width;

        return this.width;
    }

    public get playgroundHeight()
    {
        if (orientation === 'landscape') return this.height - this.topBar.height;

        return this.height - this.deckBar.width - this.suitsBar.width;
    }

    public get playgroundLeft()
    {
        if (orientation === 'landscape') return this.deckWidth;

        return 0;
    }
    
    public get playgroundTop()
    {
        if (orientation === 'landscape') return this.topBar.height;
            
        return this.suitsBar.width;
    }

    public get playgroundBottom()
    {
        if (orientation === 'landscape') return this.height;
            
        return this.height - this.deckBar.width;
    }

    public get deckTop()
    {
        if (orientation === 'landscape') return 0;

        return this.height - this.deckBar.width;
    }

    public get deckRight()
    {
        return this.deckBar.width;
    }

    public get deckWidth()
    {
        if (orientation === 'landscape') return this.deckBar.width;

        return this.deckBar.height;
    }

    public get deckHeight()
    {
        if (orientation === 'landscape') return this.deckBar.height;

        return this.deckBar.width;
    }

    public resize(w: number, h: number)
    {
        this.width = w;
        this.height = h;

        if (orientation === 'landscape')
        {
            this.topBar.width = w;
            this.topBar.scale.y = this.topBar.scale.x * 0.9;
            this.deckBar.height = h;
            this.deckBar.width = w * 0.2;
            this.deckBarShadow.scale.copyFrom(this.deckBar.scale);
            this.deckBarShadow.x = this.deckWidth - 1;
            this.suitsBar.height = h;
            this.suitsBar.width = w * 0.1;
            this.suitsBar.x = w - this.suitsBar.width;
            
            const mw = this.middle.texture.baseTexture.width * 0.2;
            const mh = this.middle.texture.baseTexture.height * 0.2;
            const scaleX = w < mw ? mw / w : 1;
            const scaleY = h < mh ? mh / h : 1;
            const scale = scaleX > scaleY ? scaleX : scaleY;
    
            this.middle.width = w * scale;
            this.middle.height = h * scale;

            this.woodContainer.rotation = 0;
            this.woodContainer.addChildAt(this.topBar, 2);
            this.woodContainer.y = 0;
        }
        else
        {
            this.topBar.width = w;
            this.topBar.scale.y = this.topBar.scale.x * 1.2;
            this.deckBar.height = w;
            this.deckBar.width = h * 0.2;
            this.deckBarShadow.scale.copyFrom(this.deckBar.scale);
            this.deckBarShadow.x = this.deckRight - 1;
            this.suitsBar.height = w;
            this.suitsBar.width = h * 0.16;
            this.suitsBar.x = h - this.suitsBar.width;
            
            const mw = this.middle.texture.baseTexture.width * 0.7;
            const mh = this.middle.texture.baseTexture.height * 0.7;
            const scaleX = h < mw ? mw / h : 1;
            const scaleY = w < mh ? mh / w : 1;
            const scale = scaleX > scaleY ? scaleX : scaleY;
    
            this.middle.width = h * scale;
            this.middle.height = w * scale;

            this.woodContainer.rotation = -Math.PI * 0.5;
            this.view.addChild(this.topBar);
            this.woodContainer.y = h;
        }
    }
}

export let table: TableClass;

export function prepareTable()
{
    if (!table) table = new TableClass();
    
    return table;
}
