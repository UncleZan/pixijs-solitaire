import {Back, Linear} from 'gsap';
import {Container, Sprite} from 'pixi.js';

import {navigation} from '../navigation';
import {ImageButton} from '../ui/buttons/ImageButton';
import {DeckSelector} from '../ui/DeckSelector';
import {SettingsButtons} from '../ui/SettingsButtons';
import {i18n} from '../utils/i18n';
import {tween} from '../utils/tweens';
import {GameScreen} from './GameScreen';

export class HomeScreen extends Container
{
    public static assetBundles = ['home', 'common'];

    private settingsButtons: SettingsButtons;
    private githubButton: ImageButton;
    private pixiButton: ImageButton;
    private topContainer = new Container();
    private pickADeck: DeckSelector;
    private bg: Sprite;
    private title: Sprite;
    private cta: Sprite;

    constructor()
    {
        super();

        this.bg = Sprite.from('home-bg');
        this.bg.anchor.set(0.5);
        this.title = Sprite.from('home-title');
        this.title.anchor.set(1, 0.75);
        this.title.x = this.title.width * 0.5;
        this.title.y = this.title.height * this.title.anchor.y;
        this.cta = Sprite.from('home-cta');
        this.cta.x = -this.cta.width * 0.5;

        this.pickADeck = new DeckSelector();

        this.githubButton = new ImageButton({image: 'home-github-button', scaleOverride: 0.2});
        this.githubButton.onPress.connect(() => window.open(i18n.githubUrl, 'blank'));

        this.pixiButton = new ImageButton({image: 'logo-pixi', scaleOverride: 0.6});
        this.pixiButton.onPress.connect(() => window.open(i18n.pixiUrl, 'blank'));

        this.settingsButtons = new SettingsButtons();

        this.topContainer.addChild(this.cta, this.title);
        this.addChild(this.bg, this.settingsButtons.view, this.topContainer,
            this.pickADeck.view, this.githubButton, this.pixiButton);
    }

    public async show()
    {
        this.pickADeck.onCardSelectedSignal.connect(() => navigation.showScreen(GameScreen));
        this.githubButton.hide(false);
        this.pixiButton.hide(false);
        this.pickADeck.hide(false);
        this.settingsButtons.hide();
        await this.revealScreen();
        
        await this.pickADeck.show();
        this.settingsButtons.show();
        this.githubButton.show();
        await this.pixiButton.show();
    }

    private async revealScreen()
    {
        const duration = 0.5;
        const delay = 0.1;

        this.cta.scale.x = 0;
        this.cta.pivot.y = 400;
        this.cta.rotation = -Math.PI * 0.2;

        this.title.pivot.x = 600;
        this.title.pivot.y = 1200;
        this.title.rotation = Math.PI * 0.2;

        await tween(this.title.pivot, {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: Linear.easeOut,
            delay,
        });
        tween(this.title, {
            rotation: 0,
            duration,
            ease: Back.easeOut.config(2),
        });
        
        tween(this.cta.scale, {
            x: 1,
            duration: 0.1,
            ease: Linear.easeOut,
            delay: 0.4,
        });
        await tween(this.cta.pivot, {
            x: 0,
            y: 0,
            duration: 0.2,
            ease: Linear.easeOut,
            delay: 0.4,
        });
        await tween(this.cta, {
            rotation: 0,
            duration,
            ease: Back.easeOut.config(2),
        });
    }

    public async hide()
    {
        await tween(this, {alpha: 0, duration: 0.2, ease: 'linear'});
    }

    public resize(w: number, h: number)
    {
        this.githubButton.x = w - 55;
        this.githubButton.y = h - 40;
        this.pixiButton.x = 70;
        this.pixiButton.y = h - 40;
        this.cta.y = this.title.height - (this.cta.height * 0.2);

        const minWidth = w > h ? 1440 : 1024;
        const minHeight = w > h ? 1024 : 1440;

        this.bg.rotation = Math.PI * 0.5 * Number(h > w);
        this.bg.scale.set(Math.max(w / minWidth, h / minHeight));
        this.bg.position.set(w * 0.5, h * 0.5);

        this.topContainer.x = w * 0.5;
        this.topContainer.scale.set(Math.min(w * 0.9 / 1860, h * 0.35 / 700));

        const availableWidth = w * 0.96;
        
        this.pickADeck.view.scale.set(Math.min(availableWidth / 1024, h * 0.6 / 700));
        this.pickADeck.view.x = w * 0.5;
        const availableHeight = h - this.topContainer.height - this.pickADeck.view.height;
        
        this.pickADeck.view.y = h - this.pickADeck.view.height * 0.8 - (availableHeight * 0.3);

        this.settingsButtons.resize(h);
    }

}