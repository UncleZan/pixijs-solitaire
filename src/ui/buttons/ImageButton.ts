import {FancyButton} from '@pixi/ui';
import {BLEND_MODES, Sprite} from 'pixi.js';

import {sfx} from '../../utils/audio';
import {tween} from '../../utils/tweens';


const defaultImageButtonOptions = {
    image: '',
    scaleOverride: 1,
};

type ImageButtonOptions = typeof defaultImageButtonOptions;

export class ImageButton extends FancyButton
{
    private image: Sprite;
    private scaleOverride: number;

    constructor(options: Partial<ImageButtonOptions> = {})
    {
        const opts = {...defaultImageButtonOptions, ...options};

        const defaultView = Sprite.from(opts.image);

        super({
            defaultView,
            anchor: 0.5,
        });

        this.image = defaultView;
        this.scaleOverride = opts.scaleOverride;
        this.scale.set(opts.scaleOverride);
        
        this.onHover.connect(this.handleHover.bind(this));
        this.onOut.connect(this.handleOut.bind(this));
        this.onDown.connect(this.handleDown.bind(this));
        this.onUp.connect(this.handleUp.bind(this));
        this.on('pointerupoutside', this.handleUp.bind(this));
    }

    private handleHover()
    {
        sfx.play('sfx-hover');
        this.image.blendMode = BLEND_MODES.ADD;
    }

    private handleOut()
    {
        this.image.blendMode = BLEND_MODES.NORMAL;
    }

    private handleDown()
    {
        sfx.play('sfx-press');
        this.image.alpha = 0.5;
    }

    private handleUp()
    {
        this.image.alpha = 1;
    }

    public async show(animated = true)
    {
        this.visible = true;
        if (animated)
        {
            this.scale.set(0);
            await tween(this.scale, {
                x: this.scaleOverride,
                y: this.scaleOverride,
                duration: 0.3,
                ease: 'back.out',
            });
        }
        else
        {
            this.scale.set(this.scaleOverride);
        }
    }

    public async hide(animated = true)
    {
        if (animated)
        {
            await tween(this.scale, {x: 0.5, y: 0.5, duration: 0.3, ease: 'back.in'});
        }
        else
        {
            this.scale.set(0);
        }
        this.visible = false;
    }
}
