import {Container, Sprite} from 'pixi.js';

import {CardSuit} from '../data/CardData';
import {Card} from './Card';

export class SuitStack
{

    public view = new Container();
    public suit: CardSuit;
    public cards: Card[] = [];
    public base: Sprite;
    
    constructor(suit: CardSuit)
    {
        this.suit = suit;

        this.base = Sprite.from('card-frame');
        const suitSymbol = Sprite.from(`wooden-${suit}`);

        suitSymbol.anchor.set(0.5);
        suitSymbol.x = this.base.width * 0.5;
        suitSymbol.y = this.base.height * 0.5;
        suitSymbol.scale.set(2.2);

        this.base.addChild(suitSymbol);
        this.view.addChild(this.base);
    }

    public canAccomodate(card: Card)
    {
        const sameSuit = (card.suit === this.suit);
        const nextInValue = (card.value === this.value + 1);
        const alreadyStacked = this.cards.includes(card);

        return sameSuit && nextInValue && !alreadyStacked && (card.isOnTop || card.state === 'dealt');
    }
    

    public async addCard(card: Card)
    {
        card.state = 'placed';
        card.view.setScale(this.view.scale.x);
        
        this.cards.push(card);
        await card.place({x: this.getCardX(), y: this.getCardY()});
    }

    public removeCard(card: Card): void
    {
        const index = this.cards.indexOf(card);

        if (index !== -1)
        {
            this.cards.splice(index, 1);
        }
    }

    public getCardX()
    {
        return this.view.x + (this.view.width * 0.5);
    }

    public getCardY()
    {
        return this.view.y + (this.view.height * 0.5);
    }

    public get value(): number
    {
        return this.cards.length;
    }

    public reset()
    {
        this.cards.length = 0;
    }
}
