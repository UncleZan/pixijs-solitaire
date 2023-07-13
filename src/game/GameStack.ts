import gsap from 'gsap';
import {Container, Sprite} from 'pixi.js';

import {CardColor} from '../data/CardData';
import {Card} from './Card';

export class GameStack
{

    public view = new Container();
    public base: Sprite;
    public cards: Card[] = [];
    
    private y = 0;

    constructor()
    {
        this.base = Sprite.from('card-frame');

        this.view.addChild(this.base);
    }

    /**
     * Check whether the stack can accomodate a given card.
     * A card can be moved to a stack if at least one of the following statements is true:
     * - the color of the card and the stack are opposite and
     * the value of the stack is bigger by 1 compared to the value of the card
     * - the stack is empty and the card is a K (value === 13)
     * @param card The card to check
     * @returns Whether the provided card can be moved to the stack
     */
    public canAccomodate(card: Card)
    {
        const firstCondition = (this.value === card.value + 1) && (card.color !== this.color);
        const secondCondition = (card.value === 13 && this.amount === 0);
        const alreadyStacked = this.cards.includes(card);

        return (firstCondition || secondCondition) && !alreadyStacked;
    }

    /**
     * Check whether the provided card is the last card on the stack.
     * @param card The card to check
     */
    public isCardOnTop(card: Card)
    {
        const index = this.cards.indexOf(card);

        return (index !== -1) && (index === this.cards.length - 1);
    }

    public hasCard(card: Card): boolean
    {
        return this.cards.indexOf(card) !== -1;
    }

    public addCard(card: Card, opts?: PIXITweenVars, playDrop?: boolean)
    {
        card.state = 'played';

        return gsap.delayedCall(opts?.delay || 0, () =>
        {
            card.view.shadowEnabled = true;
            
            if (!this.cards.includes(card)) this.cards.push(card);
    
            this.cards.forEach((card) =>
            {
                card.isOnTop = this.isCardOnTop(card);
            });

            this.y = this.getCardY(card);
        }).then(async () =>
        {
            await card.place({x: this.getCardX(), y: this.y, ...opts}, playDrop);
            card.view.setScale(this.view.scale.x);
        });
    }

    /**
     * Remove one or more cards from the stack and turns face up the new card on top of the stack.
     * @param card The card to start removing from
     * @returns An array containing the cards removed
     */
    public removeCard(card: Card)
    {
        const index = this.cards.indexOf(card);
        let cardsRemoved: Card[] = [];
        
        if (index !== -1)
        {
            cardsRemoved = this.cards.splice(index, this.cards.length - index);

            this.cards[this.cards.length - 1]?.faceUp();
            this.cards.forEach((card) =>
            {
                card.isOnTop = this.isCardOnTop(card);
            });
        }

        return cardsRemoved;
    }

    /**
     * Return a stack of cards starting from the given card.
     * @param card The card to start counting from
     * @returns A stack of c
     */
    public getCardsOnTop(card: Card): Card[]
    {
        const index = this.cards.indexOf(card);

        if (index !== -1)
        {
            return this.cards.slice(index);
        }

        return [];
    }

    public getCardX()
    {
        return this.view.x + (this.view.width * 0.5);
    }

    /**
     * Calculates the Y coords of the card provided, whether the card is already on the stack or not.
     * @param card The card to calcolate the Y coord for
     * @returns
     */
    public getCardY(card: Card)
    {
        let index = this.cards.indexOf(card);

        // if the card is not on the stack let's use the index of the last card.
        index = index === -1 ? this.cards.length - 1 : index;

        return this.view.y + (this.view.height * 0.5) + (this.yIncrease * (index));
    }

    public get yIncrease()
    {
        return this.view.height * 0.2;
    }

    public get amount(): number
    {
        return this.cards.length;
    }
    
    /**
     * If there is a card on the stack, return its value.
     * Otherwise returns 0;
     */
    public get value(): number
    {
        return this.cards[this.cards.length - 1]?.value || 0;
    }
    
    /**
     * If there is a card on the stack, return its color.
     * Otherwise returns undefined;
     */
    public get color(): CardColor
    {
        return this.cards[this.cards.length - 1]?.color;
    }

    public reset()
    {
        this.cards.length = 0;
    }
}
