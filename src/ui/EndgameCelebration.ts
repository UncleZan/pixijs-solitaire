
import {Card} from '../game/Card';
import {table} from '../game/Table';
import {sfx} from '../utils/audio';
import {Bouncer} from '../utils/Bouncer';
import {orientation} from '../utils/orientation';
import {sattoloCycle} from '../utils/sattoloCycle';
import {CardsPrintsView} from './CardsPrintsView';


/** A class that plays an endgame celebrations.*/
export class EndgameCelebration
{
    /** The view of the celebration effect. */
    public view = new CardsPrintsView();

    private width = 1;

    private cards: Card[];
    private currentCard!: Card;
    private index: number;

    private bouncer = new Bouncer();
    private playing = false;

    private randomBounces = [2, 3, 4];
    private bounces = 0;
    private bouncesIndex = 0;

    constructor(cards: Card[])
    {
        this.cards = cards;
        this.index = cards.length;
    }

    public async play()
    {
        sfx.play('game-win');
        this.playing = true;
        this.nextCard();

        this.resize(this.width);
    }

    
    public update(delta: number)
    {
        if (this.playing)
        {
            this.bouncer.update(delta);

            const card = this.currentCard;
            
            card.view.x = this.bouncer.x;
            card.view.y = this.bouncer.y;
            
            this.view.print(card.view.x, card.view.y);
            
            if (this.bouncer.bouncesX === this.bounces)
            {
                const left = -card.view.realWidth * 0.5;
                const right = this.width + (card.view.realWidth * 0.5);
        
                this.bouncer.minX = left;
                this.bouncer.maxX = right;
            }
            else if (this.bouncer.bouncesX === this.bounces + 1)
            {
                if (this.index === 0) this.stop();
                else
                {
                    this.nextCard();
                }
            }
        }
    }
    
    private nextCard()
    {
        this.index--;

        const card = this.cards[this.index];

        card.view.parent.addChild(card.view);
        this.view.setTexture(card.view);
        this.currentCard = card;

        this.setBounces();
        this.setBouncer();
    }

    private setBouncer()
    {
        const card = this.currentCard;
        
        const {left, right, top, bottom} = this.getBounceBoundaries();
        
        let rSign = Math.sign(Math.random() - 0.5);
        let bounciness = (Math.random() * 0.15) + 0.7;
        
        this.bouncer.reset();
        if (orientation === 'landscape')
        {
            rSign = -1;
            
            this.bouncer.ay = -4 - ((card.view.y - top) / (bottom - top)) * (bottom - top) * 0.02;
            bounciness += 0.14;
        }
     
        this.bouncer.bounciness = bounciness;
        this.bouncer.dampX = ((Math.random() * 0.3) + 0.01);
        this.bouncer.tax = 7 * rSign;
        this.bouncer.x = card.view.x;
        this.bouncer.y = card.view.y;
        this.bouncer.minX = left;
        this.bouncer.maxX = right;
        this.bouncer.minY = top;
        this.bouncer.maxY = bottom;
    }

    private setBounces()
    {
        this.bouncesIndex++;
        if (this.bouncesIndex === this.randomBounces.length)
        {
            this.bouncesIndex = 0;
            sattoloCycle(this.randomBounces);
        }

        this.bounces = this.randomBounces[this.bouncesIndex];
    }

    private getBounceBoundaries()
    {
        const card = this.currentCard;
        const halfW = card.view.realWidth * 0.5;
        let left = halfW;
        let right = table.playgroundWidth - (halfW);
        const top = table.playgroundTop + card.view.realHeight * 0.5;
        const bottom = table.playgroundBottom - card.view.realHeight * 0.5;
        
        if (orientation === 'landscape')
        {
            left += table.deckRight;
            right = table.suitsLeft - (halfW);
        }

        return {left, right, top, bottom};
    }

    private getPrintBoundaries()
    {
        let x = 0;
        const y = table.playgroundTop;

        // left, top, right - left, bottom - top
        if (orientation === 'landscape')
        {
            x += table.deckRight;
        }
        const w = table.playgroundWidth;
        const h = table.playgroundBottom - y;

        return {x, y, w, h};
    }

    public async stop()
    {
        this.playing = false;
    }

    public async reset()
    {
        this.bouncesIndex = 0;
        this.index = this.cards.length;
        this.view.reset();
        this.stop();
    }

    public resize(w: number)
    {
        this.width = w;

        if (this.playing)
        {
            const {left, right, top, bottom} = this.getBounceBoundaries();
            const {x, y, w, h} = this.getPrintBoundaries();

            this.view.setPrintArea(x, y, w, h);

            this.bouncer.minX = left;
            this.bouncer.maxX = right;
            this.bouncer.minY = top;
            this.bouncer.maxY = bottom;
        }
    }
}