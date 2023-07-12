import { Container, Sprite } from "pixi.js";
import { Card } from "./Card";
import { CardColor } from "../data/CardData";

export class CardStack {

    public view = new Container();
    public cards: Card[] = [];
    
    private y = 0;

    constructor()
    {
        const bg = Sprite.from('card-frame');

        this.view.addChild(bg);
    }

    /**
     * Check whether the stack can accomodate a given card.
     * A card can be moved to a stack if at least one of the following statements is true:
     * - the colour of the card and the stack are opposite and 
     * the value of the stack is bigger by 1 compared to the value of the card
     * - the stack is empty and the card is a K (value === 13)
     * @param card The card to check
     * @returns Whether a given card can be moved to the stack
     */
    public canAccomodate(card: Card)
    {
        const firstCondition = (this.value === card.value + 1) && (card.colour !== this.colour);
        const secondCondition = (card.value === 13 && this.amount === 0);


        return firstCondition || secondCondition;
    }

    /**
     * Use to check if a stacked card can be moved to a pile.
     * @param card The card to check
     * @returns Whether the given card is on the top of the stack.
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

    public addCard(card: Card)
    {
        card.state = 'stacked';
        
        this.y = this.view.y + (this.yIncrease * this.cards.length);
        this.cards.push(card);

        return card.place({ x: this.getCardX(card), y: this.y });
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
        }

        return cardsRemoved;
    }

    /**
     * Return a stack of cards starting from the given card.
     * @param card The card to start counting from
     * @returns A stack of c
     */
    public getCardsFromCard(card: Card): Card[]
    {
        const index = this.cards.indexOf(card);

        if (index !== -1)
        {
            return this.cards.slice(index);
        }

        return [];
    }

    public getCardX(card: Card)
    {
        return this.view.x + ((this.view.width - card.view.width) * 0.5);
    }

    public getCardY(card: Card)
    {
        const index = this.cards.indexOf(card);

        return this.view.y + ((this.view.height - card.view.height) * 0.5) + (this.yIncrease * (index));
    }

    get yIncrease()
    {
        return this.view.height * 0.2;
    }

    get amount(): number
    {
        return this.cards.length;
    }
    
    /**
     * If there is a card on the stack, return its value.
     * Otherwise returns 0;
     */
    get value(): number
    {
        return this.cards[this.cards.length - 1]?.value || 0;
    }
    
    /**
     * If there is a card on the stack, return its color.
     * Otherwise returns undefined;
     */
    get colour(): CardColor
    {
        return this.cards[this.cards.length - 1]?.colour;
    }

    public reset(){
        this.cards.length = 0;
    }
}
