import { Button } from '@pixi/ui';
import { NineSlicePlane, Text, Texture } from 'pixi.js';

const defaultRectangleButtonOptions = {
    text: '',
    width: 293,
    height: 103,
};

type RectangleButtonOptions = typeof defaultRectangleButtonOptions;

export class RectangleButton extends Button {
    constructor(options: Partial<RectangleButtonOptions> = {}) {
        const opts = { ...defaultRectangleButtonOptions, ...options };

        const view = new NineSlicePlane(Texture.from('button'), 32, 32, 32, 46);
        view.width = opts.width;
        view.height = opts.height;
        view.x = -opts.width * 0.5;
        view.y = -opts.height * 0.5;

        const hoverView = new NineSlicePlane(Texture.from('button-hover'), 32, 32, 32, 46);
        hoverView.width = opts.width;
        hoverView.height = opts.height;
        hoverView.x = -opts.width * 0.5;
        hoverView.y = -opts.height * 0.5;

        const pressedView = new NineSlicePlane(Texture.from('button-press'), 32, 32, 32, 46);
        pressedView.width = opts.width;
        pressedView.height = opts.height;
        pressedView.x = -opts.width * 0.5;
        pressedView.y = -opts.height * 0.5;

        const textView = new Text(opts.text, {
            fill: 0x4a4a4a,
            fontFamily: 'Verdana',
            align: 'center',
        });
        textView.anchor.set(0.5);
        textView.x = -opts.width * 0.5;
        textView.y = -opts.height * 0.5;

        super({
            view,
            hoverView,
            pressedView,
            textView,
        });

        textView.x = 0;
        textView.y = -10;
    }
}
