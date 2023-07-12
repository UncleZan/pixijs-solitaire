import { Container, Sprite, Text } from 'pixi.js';

export class CardButton extends Container {
        
    private readonly base: Sprite;
    private label: Text;
    
    constructor(label: string, texture: string) {
        super();

        this.base = Sprite.from(texture);
        this.base.anchor.set(0, 0.5);
        this.base.y = -this.base.height * 0.205;

        this.label = new Text(label, { fontFamily: 'FatFrank', fill: 0x414141, fontSize: 70,
            stroke: 0xFFFFFF, strokeThickness: 16, fontWeight: 'bolder' });
        this.label.anchor.set(0.5, 0);
        this.label.x = this.base.width * 0.5;

        this.label.scale.set(0.9);

        this.addChild(this.base, this.label);

        this.interactive = true;
        this.cursor = 'pointer';
    }
}
