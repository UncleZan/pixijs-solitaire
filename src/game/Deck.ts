import { Container, Sprite } from 'pixi.js';
import { sattoloCycle } from '../utils/sattoloCycle';
import { Card } from './Card';
import { cardSuits, NUMBER_OF_CARDS, SUITS_OF_CARDS } from '../data/CardData';
import { Signal } from 'typed-signals';


export class Deck {

    public view = new Container();
    public cards: Card[] = [];
    public dealtCards: Card[] = [];
    public onTapSignal = new Signal<(card: Card) => void>();
    public dealtTray!: Sprite;
    public deckTray: Sprite;

    
    /**
     * Keep track of how many cards have been handed.
     */
    private cardIndex = 0;

    constructor()
    {
        this.deckTray = Sprite.from('card-frame');

        this.dealtTray = Sprite.from('deck-cards-frame');
        this.dealtTray.y = this.deckTray.height + 40;
        
        this.view.addChild(this.deckTray, this.dealtTray);

        for (let i = 1; i <= NUMBER_OF_CARDS / SUITS_OF_CARDS; i++) {
            for (let j = 0; j < SUITS_OF_CARDS; j++) {
                const suit = cardSuits[j];
                const card = new Card(suit, i);

                this.cards.push(card);
            }
        }
    }

    public shuffle(): void
    {
        sattoloCycle(this.cards);
    }

    public placeOnDeck(card: Card)
    {
        card.view.x = this.view.x + ((this.view.width - card.view.width) * 0.5);
        if (card.state === 'undealt') {
            card.view.y = this.view.y + (((this.deckTray.height * this.view.scale.y) - card.view.height) * 0.5);
        }
        else
        {
            const global = this.view.toGlobal(this.dealtTray);
            const i = Math.max(0, this.dealtCards.indexOf(card))
            const padding = (this.dealtTray.height * this.view.scale.y) * 0.18;

            card.view.y = global.y + 15 + (padding * i);
        }
    }

    public tap()
    {
        // Time to cycle through the deck again
        if (this.cardIndex === this.cards.length) {
            this.reset();
        }
        else
        {
            const card = this.cards[this.cardIndex];
            const global = this.view.toGlobal(this.dealtTray);
            const padding = (this.dealtTray.height * this.view.scale.y) * 0.18;

            card.faceUp();
            card.state = 'dealt';

            if (this.dealtCards.length >= 3) {
                
                for (let i = this.dealtCards.length - 2; i < this.dealtCards.length; i++) {
                    const card = this.dealtCards[i];
                    const j = 2 - (this.dealtCards.length - i);
                    const y = global.y + 15 + (padding * j);
                    
                    card.place({ duration: 0.25, y });
                }
            }
            this.dealtCards.push(card);

            // We need the global position of the dealt tray to position the card on top of it
            const y = global.y + 15 + (padding * Math.min(this.dealtCards.length - 1, 2));


            card.place({ duration: 0.25, y });
            this.onTapSignal.emit(card);
        };

            this.cardIndex = (this.cardIndex + 1) % (this.cards.length + 1);
    }

    public dealCards(size: number): Card[]
    {
        return this.cards.splice(0, size);
    }

    public removeCard(card: Card)
    {
        const index = this.cards.indexOf(card);

        if (index !== -1) {
            this.cards.splice(index, 1);
            this.cardIndex--;
            this.dealtCards.pop();

            const global = this.view.toGlobal(this.dealtTray);
            const padding = (this.dealtTray.height * this.view.scale.y) * 0.18;
            
            for (let i = this.dealtCards.length - 2; i < this.dealtCards.length; i++) {
                if (i < 1) return;

                const card = this.dealtCards[i];
                const j = ((this.dealtCards.length - i) % 2) + 1;
                const y = global.y + 15 + (padding * j);
                
                card.place({ duration: 0.25, y });
            }
        }
    }

    public addCard(card: Card) 
    {
        if (!this.cards.includes(card)) this.cards.push(card);

        const x = this.view.x + ((this.view.width - card.view.width) * 0.5);
        const y = this.view.y + (((this.deckTray.height * this.view.scale.y) - card.view.height) * 0.5);

        return card.place({ x: x, y: y });
    }

    public reset(): void 
    {
        this.dealtCards.length = 0;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            
            card.reset();
            this.addCard(card);
        }
    }

    get amount(): number
    {
        return this.cards.length;
    }
}
