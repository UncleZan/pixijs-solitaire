import { Container, Sprite } from "pixi.js";

export class Background {

    public view = new Container();

    private leftPanel!: Sprite;
    private topPanel!: Sprite;
    private rightPanel!: Sprite;
    private bg!: Sprite;

    constructor(w: number, h: number)
    {
        this.bg = Sprite.from('background-wood-main');
        this.topPanel = Sprite.from('top-panel');
        this.leftPanel = Sprite.from('left-panel');
        this.rightPanel = Sprite.from('right-panel');

        this.view.addChild(this.bg, this.rightPanel, this.topPanel, this.leftPanel);

        this.resize(w, h)
    }

    public getLeftPanelWidth()
    {
        return this.leftPanel.width - this.getLeftPanelShadowWidth() + this.leftPanel.x;
    }

    public getRightPanelWidth()
    {
        return this.rightPanel.width;
    }

    public getRightPanelX()
    {
        return this.rightPanel.x;
    }

    public getTopPanelWidth()
    {
        return this.topPanel.width - this.getLeftPanelWidth();
    }

    public getPlaygroundWidth()
    {
        return this.bg.width;
    }

    public getPlaygroundX()
    {
        return this.bg.x;
    }

    public getPlaygroundY()
    {
        return this.topPanel.height;
    }

    /**
     * A helper function to factor the empty space in the texture due for the drop shadow.
     * @returns The width of the texture drop shadow.
     */
    private getLeftPanelShadowWidth()
    {
        return this.leftPanel.width * 0.245;
    }

    public resize(w: number, h: number)
    {
        this.topPanel.width = w;
        this.topPanel.scale.y = this.topPanel.scale.x;
        this.leftPanel.height = h;
        this.leftPanel.scale.x = this.leftPanel.scale.y;
        this.leftPanel.x = Math.min((w * 0.15) + this.getLeftPanelShadowWidth() - this.leftPanel.width, 0);
        this.rightPanel.width = w * 0.1;
        this.rightPanel.height = h;
        this.rightPanel.x = w - this.rightPanel.width;
        this.rightPanel.y = this.topPanel.height;
        
        this.bg.x = this.getLeftPanelWidth();
        this.bg.y = this.topPanel.height;
        this.bg.width = this.rightPanel.x - this.bg.x + 6;
        this.bg.height = h - this.topPanel.height;
    }
}
