import {Container, Sprite, Text} from 'pixi.js';

import {tween} from '../utils/tweens';

export class CardTag extends Container
{
    private readonly base: Sprite;
    private label: Text;
    private baseLabel: string;
    private _value = 0;
    
    constructor(label: string)
    {
        super();

        this.base = Sprite.from(`face-down-grey`);
        this.base.anchor.set(0, 0.5);
        this.base.alpha = 0.5;

        this.baseLabel = label;
        
        this.label = new Text(`${this.baseLabel}: 0`, {fontFamily: 'FatFrank', fill: 0x414141, fontSize: 64,
            stroke: 0xFFFFFF, strokeThickness: 16, fontWeight: 'bolder'});
        this.label.anchor.set(0, 1);
        this.label.x = (this.base.width * 0.15);
        this.label.y = this.base.height * 0.4;

        this.addChild(this.base, this.label);
    }
    
    public get value()
    {
        return this._value;
    }
    
    public set value(value: number)
    {
        if (this._value !== value)
        {
            tween(this, {duration: 0.5, _value: value, onUpdate: () =>
            {
                this.label.text = `${this.baseLabel}: ${this.value.toFixed(0)}`;
            }}).then(() =>
            {
                if (this.label.width > this.base.width * 0.8)
                {
                    const scale = this.base.width * 0.7 / this.label.width;
        
                    tween(this.label.scale, {duration: 0.05, x: scale, y: scale});
                }
            });
        }
    }
}
