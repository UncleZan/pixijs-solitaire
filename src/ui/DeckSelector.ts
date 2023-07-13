import {Back} from 'gsap';
import {Container, Sprite, Text} from 'pixi.js';
import {Signal} from 'typed-signals';

import {CardSkin} from '../data/CardData';
import {models} from '../model/Model';
import {sfx} from '../utils/audio';
import {i18n} from '../utils/i18n';
import {tween} from '../utils/tweens';

export class DeckSelector
{
    public view = new Container();
    public cardsContainer = new Container<Sprite>();
    public onCardSelectedSignal = new Signal();

    private highlights: Sprite[] = [];
    private cardAnimationData: ({origin:XY, direction:XY, skin: CardSkin})[];
    private playText: Text;
    private blueCard: Sprite;
    private redCard: Sprite;
    private greenCard: Sprite;
    private blackCard: Sprite;
    
    constructor()
    {
        const paddIncrement = 0.33;
        let padding = 0.5;

        this.redCard = Sprite.from('face-down-red');
        this.redCard.y = this.redCard.height;
        this.redCard.anchor.set(0.5, 1);
        
        this.blueCard = Sprite.from('face-down-blue');
        this.blueCard.y = this.blueCard.height;
        this.blueCard.anchor.set(0.5, 1);


        this.greenCard = Sprite.from('face-down-green');
        this.greenCard.y = this.greenCard.height;
        this.greenCard.anchor.set(0.5, 1);
        
        this.blackCard = Sprite.from('face-down-black');
        this.blackCard.y = this.blackCard.height;
        this.blackCard.anchor.set(0.5, 1);

        this.cardsContainer.addChild(this.redCard, this.blueCard, this.greenCard, this.blackCard);

        this.cardAnimationData = [
            {origin: {x: 0, y: 0}, direction: {x: -30, y: -30}, skin: 'face-down-red'},
            {origin: {x: 0, y: 0}, direction: {x: -20, y: -40}, skin: 'face-down-blue'},
            {origin: {x: 0, y: 0}, direction: {x: 20, y: -40}, skin: 'face-down-green'},
            {origin: {x: 0, y: 0}, direction: {x: 30, y: -30}, skin: 'face-down-black'},
        ];

        this.cardsContainer.children.forEach((child, i) =>
        {
            const highlight = Sprite.from('card-highlight');
    
            highlight.anchor.set(0.5, 0.975);
            highlight.alpha = 0;
            this.highlights.push(highlight);

            child.addChild(highlight);
            
            child.x = child.width * padding;
            padding += paddIncrement;
            
            this.cardAnimationData[i].origin = {x: child.x, y: child.y};
            this.setupCardAnimations(child, i);
        });

        this.redCard.pivot.set(-20, -50);
        this.blackCard.pivot.set(20, -80);
        this.cardsContainer.x = -this.cardsContainer.width * 0.5;
        this.redCard.rotation = -35 * Math.PI / 180;
        this.blueCard.rotation = -10 * Math.PI / 180;
        this.greenCard.rotation = 10 * Math.PI / 180;
        this.blackCard.rotation = 35 * Math.PI / 180;
        this.playText = new Text(i18n.ucPlay, {fontFamily: 'FatFrank', fontSize: 45});
        this.playText.anchor.set(0.5, 1);
        this.playText.alpha = 0;
        this.playText.y = -this.redCard.height - 15;


        this.view.addChild(this.cardsContainer);
        this.cardsContainer.interactive = true;
    }

    public setupCardAnimations(card: Sprite, i: number)
    {
        const data = this.cardAnimationData[i];
        const x = data.origin.x;
        const y = data.origin.y;
        const dx = data.direction.x;
        const dy = data.direction.y;
        const highlight = this.highlights[i];

        const overAnimation = async () =>
        {
            card.addChild(this.playText);
            
            tween(card, {duration: 0.2, x: x + dx, y: y + dy});
            await tween([this.playText, highlight], {duration: 0.2, alpha: 1});
        };

        card.on('pointerover', () =>
        {
            sfx.play('sfx-hover');
            overAnimation();
        });

        card.on('pointerout', () =>
        {
            tween(card, {duration: 0.2, x, y});
            tween([this.playText, highlight], {duration: 0.2, alpha: 0});
        });
        
        card.on('touchend', async () =>
        {
            await overAnimation();
            this.onCardSelected(data.skin);
        });
        card.on('click', this.onCardSelected.bind(this, data.skin));
        
        card.interactive = true;
        card.cursor = 'pointer';
    }

    public async hide(animated = true)
    {
        const allTweens: Promise<GSAPTween>[] = [];
        const dist = this.view.y + this.view.height;

        if (animated)
        {
            this.cardsContainer.children.forEach((child, i) =>
            {
                const data = this.cardAnimationData[i];
                const x = data.origin.x - (data.direction.x * Math.abs(dist / data.direction.x));
                const y = data.origin.y - (data.direction.y * Math.abs(dist / data.direction.y));

                allTweens.push(tween(child, {duration: 0.3, x, y, delay: 0.2 * i, ease: Back.easeIn.config(1)}));
            });
        }
        else
        {
            this.cardsContainer.children.forEach((child, i) =>
            {
                const data = this.cardAnimationData[i];
                const x = data.origin.x - (data.direction.x * Math.abs(dist / data.direction.x));
                const y = data.origin.y - (data.direction.y * Math.abs(dist / data.direction.y));

                child.position.set(x, y);
            });
        }

        return Promise.all(allTweens);
    }

    public async show()
    {
        const allTweens: Promise<GSAPTween>[] = [];

        this.cardsContainer.children.forEach((child, i) =>
        {
            const data = this.cardAnimationData[i];
            const {x, y} = data.origin;
                
            allTweens.push(tween(child, {duration: 0.3, x, y, delay: 0.2 * i, ease: Back.easeOut.config(1)}));
        });

        return Promise.all(allTweens);
    }

    private onCardSelected(skin: CardSkin)
    {
        sfx.play('sfx-press');
        this.onCardSelectedSignal.emit();
        models.game.cardSkin = skin;
    }
}