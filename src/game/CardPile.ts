import { Container, Sprite } from "pixi.js";
import { Card } from "./Card";
import { CardSuit } from "../data/CardData";

export class CardPile {

    public view = new Container();
    public suit: CardSuit;
    public cards: Card[] = [];
    
    private bg: Sprite;
    
    constructor(suit: CardSuit) 
    {
        this.suit = suit;

        this.bg = Sprite.from('card-frame');
        const suitSymbol = Sprite.from(`wooden-${suit}`);

        suitSymbol.anchor.set(0.5);
        suitSymbol.x = this.bg.width * 0.5;
        suitSymbol.y = this.bg.height * 0.5;
        suitSymbol.scale.set((this.bg.width - 60) / suitSymbol.width);

        this.bg.addChild(suitSymbol);
        this.view.addChild(this.bg);
    }

    public addCard(card: Card): void
    {
        card.state = 'piled';
        this.cards.push(card);
        card.place({ x: this.getCardX(card), y: this.getCardY(card) });
    }

    public removeCard(card: Card): void
    {
        const index = this.cards.indexOf(card);

        if (index !== -1)
        {
            this.cards.splice(index, 1);
        }
    }

    public getCardX(card: Card)
    {
        return this.view.x + ((this.view.width - card.view.width) * 0.5);
    }

    public getCardY(card: Card)
    {
        return this.view.y + ((this.view.height - card.view.height) * 0.5);
    }

    get value(): number
    {
        return this.cards.length;
    }

    public reset(){
        this.cards.length = 0;
    }
}
