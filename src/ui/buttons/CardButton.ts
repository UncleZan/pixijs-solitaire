import {ButtonOptions, FancyButton} from '@pixi/ui';
import {Sprite, Text} from 'pixi.js';


export interface CardButtonOptions extends ButtonOptions
{
    label?: string;
    iconTexture?: string;
}

export const defaultCardButtonOptions: CardButtonOptions = {
    // The default asset for the button view
    defaultView: 'face-down-blue',
    // The default scale of the button
    scale: 1,
    // Set the Y anchor to the center
    anchorY: 0.5,
    // Offset the text by 150 pixels
    textOffset: {
        y: 150,
    },
    // Offset the icon by 110 pixels
    iconOffset: {
        y: 70,
    },
};

export class CardButton extends FancyButton
{
    constructor(options: Partial<CardButtonOptions>)
    {
        const opts = {...defaultCardButtonOptions, ...options};
        
        if (opts.label)
        {
            const text = new Text(opts.label, {fontFamily: 'FatFrank', fill: 0x414141, fontSize: 70,
                stroke: 0xFFFFFF, strokeThickness: 16, fontWeight: 'bolder'});

            text.scale.set(0.9);
            opts.text = text;
        }

        if (opts.iconTexture)
        {
            const icon = Sprite.from(opts.iconTexture);

            icon.scale.set(0.9);
            opts.icon = icon;
        }

        super(opts);

        this.interactive = true;
        this.cursor = 'pointer';
    }
}
