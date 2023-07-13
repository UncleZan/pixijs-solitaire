import {Container, Sprite, Texture} from 'pixi.js';

import {models} from '../model/Model';
import {sfx} from '../utils/audio';
import {isMobile} from '../utils/isMobile';
import {Orientation} from '../utils/orientation';
import {toggleFullScreen} from '../utils/toggleFullScreen';
import {tween} from '../utils/tweens';
import {CardButton} from './buttons/CardButton';

export class SettingsButtons
{
    public view = new Container<CardButton>();
    public orientation: Orientation = 'portrait';

    private padding = 20;
    private muteBtn: CardButton;
    private fullscreenBtn: CardButton;
    private buttons:CardButton[] = [];

    constructor()
    {
        this.padding = 20;
        const iconTexture = models.settings.muted ? 'sound-on-icon' : 'sound-off-icon';

        this.muteBtn = new CardButton({iconTexture, offset: {y: -50}});
        this.muteBtn.scale.set(0.27);
        this.muteBtn.on('pointertap', this.onMuteTap.bind(this));

        this.fullscreenBtn = new CardButton({iconTexture: 'full-screen-icon', offset: {y: -50}});
        this.fullscreenBtn.scale.set(0.27);
        this.fullscreenBtn.on('pointertap', this.onFullscreenTap.bind(this));
        this.fullscreenBtn.x = this.muteBtn.width + (this.padding * 0.5);

        this.buttons.push(this.muteBtn, this.fullscreenBtn);
        this.buttons.forEach((btn) =>
        {
            btn.on('pointertap', this.onButtonTap.bind(this, btn));
            btn.on('mouseover', this.onButtonOver.bind(this, btn));
            btn.on('mouseleave', this.onButtonOut.bind(this, btn));
        });

        this.view.addChild(this.muteBtn, this.fullscreenBtn);
    }

    private onButtonTap(btn: CardButton)
    {
        sfx.play('card-flip', {volume: 0.5});
        if (isMobile()) this.onButtonOver(btn).then(() => this.onButtonOut(btn));
        else this.onButtonOut(btn).then(() => this.onButtonOver(btn));
    }

    private onButtonOver(btn: CardButton)
    {
        return tween(btn.pivot, {duration: 0.1, y: -30});
    }

    private onButtonOut(btn: CardButton)
    {
        return tween(btn.pivot, {duration: 0.1, y: 0});
    }
    
    private onFullscreenTap()
    {
        toggleFullScreen();
    }

    private onMuteTap()
    {
        models.settings.muted = !models.settings.muted;
        (this.muteBtn.iconView as Sprite).texture = Texture.from(models.settings.muted ? 'sound-on-icon' : 'sound-off-icon');
    }

    public hide()
    {
        this.buttons.forEach((btn) => { btn.pivot.y = 200; });
    }

    public async show()
    {
        await tween(this.fullscreenBtn.pivot, {duration: 0.2, y: 0, ease: 'back.out'});
        tween(this.muteBtn.pivot, {duration: 0.2, delay: 0, y: 0, ease: 'back.out'});
    }

    public resizeButtonIcons()
    {
        const isPortrait = this.orientation === 'portrait';
        
        this.view.children.forEach((c) =>
        {
            const dfv = c.defaultView;
            const icv = c.iconView;

            c['adjustIconView'] = () => { /* Hack to prevent automatic resinzing for the icons */ };
            
            if (isPortrait)
            {
                icv.rotation = Math.PI * 0.5;
                icv.x = dfv.width * 0.5 + icv.height * 0.5;
                icv.y = -10;
            }
            else
            {
                c.iconView.rotation = 0;
                icv.x = dfv.width * 0.5 - icv.width * 0.5;
                icv.y = Number(c.iconOffset?.y) - icv.height * 0.5;
            }
        });
    }

    public resize(h: number)
    {
        this.view.y = (h * 0.5) + this.view.height * 0.5;
        this.view.rotation = -Math.PI * 0.5;
            
        this.resizeButtonIcons();
    }
}
