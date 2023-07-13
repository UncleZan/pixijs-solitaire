import {Container, Graphics, Sprite} from 'pixi.js';
import {Signal} from 'typed-signals';

import {models} from '../model/Model';
import {orientation} from '../utils/orientation';
import {sattoloCycle} from '../utils/sattoloCycle';
import {Card} from './Card';
import {CardView} from './CardView';
import {table} from './Table';

/** Class responsible of dealing cards to the table. */
export class Deck
{
    /** The root view of the class. */
    public view = new Container();
    /** The interaction area of the deck. */
    public interactionArea = new Graphics();
    /** A list of all the cards currently in the deck. */
    public cards: Card[] = [];
    /** A list of all the cards dealt from the deck to the card tray. */
    public dealtCards: Card[] = [];
    /** A signal to notify when a tap event is fired from the deck's interaction area. */
    public onTapSignal = new Signal<(card: Card) => void>();
    /** The view of the tray for the dealt cards. */
    public dealtTray!: Sprite;
    /** The view of the tray for the deck. */
    public deckTray: Sprite;
    
    /** Keep track of how many cards have been handed. */
    private cardIndex = 0;
    /** Flags whther the deck is currently resetting to its beginning state. */
    private resetting = false;

    constructor()
    {
        this.deckTray = Sprite.from('card-frame');

        // Add an icon to the deck tray.
        const icon = Sprite.from('refresh-deck-icon');

        icon.anchor.set(0.5);
        icon.position.set(this.deckTray.width * 0.5, this.deckTray.height * 0.5);
        this.deckTray.addChild(icon);

        this.dealtTray = Sprite.from('deck-cards-frame');
        this.dealtTray.y = this.deckTray.height + 40;
        
        // Setting the alpha value to a small value (0.001) prevents the graphic object
        // from being hidden disabled but it will hide it from the scene.
        this.interactionArea.beginFill(0xFFFFFF, 0.001).drawRect(0, 0, 1, 1);

        // Add tap interaction.
        this.interactionArea.cursor = 'pointer';
        this.interactionArea.interactive = true;
        this.interactionArea.on('pointertap', this.tap.bind(this));

        this.view.addChild(this.deckTray, this.dealtTray);
    }

    /**
     * Shuffles all the cards currently in the deck. Making sure that:
     * - each card is in a different array position then its current one.
     * - each card is rendered in the correct order.
     */
    public shuffle(): void
    {
        this.dealtCards.length = 0;
        sattoloCycle(this.cards);

        for (let i = this.cards.length - 1; i >= 0; i--)
        {
            const card = this.cards[i];

            // Make sure the card views have the same order of the cards object within the "CardsDealer.cards",
            // so that when they are dealt they will always go on the top of the stack.
            card.view.parent.addChild(card.view);
        }
        
        this.cards[this.cards.length - 1].view.shadowEnabled = true;
    }

    /** Handles the state of the cards on the dealt tray. */
    private handleDealtCards()
    {
        const nOfCards = 3;
        const startIndex = Math.max(0, this.dealtCards.length - nOfCards);

        // Enable the shadow of the last 3 cards on the dealt tray.
        this.dealtCards.forEach((card, i) =>
        {
            card.view.shadowEnabled = this.dealtCards.length - i <= nOfCards;
        });
        
        for (let i = 0; i < nOfCards; i++)
        {
            const card = this.dealtCards[startIndex + i];

            if (!card) break;
            
            const {x, y} = this.getCardCoords(card);

            // Set the card position.
            card.place({duration: 0.5, x, y, delay: 0.1}, false).then(() =>
            {
                // Enable the interaction of the last card only.
                card.toggleInteractions(startIndex + i === this.dealtCards.length - 1);
            });
        }
    }

    /**
     * Calculates the coordinates of the provided card depending on its state.
     * @param card - The card to get the coordinates for.
     * @returns The X and Y coordinates of the card on the tray.
     */
    private getCardCoords(card: Card)
    {
        const scale = this.view.scale.x;
        const halfScale = scale * 0.5;

        // The position on the deck tray of any undealt card.
        let x = this.view.x + (this.deckTray.width * halfScale);
        let y = this.view.y + (this.deckTray.height * halfScale);

        // Calculate the position of the card on the dealt tray.
        if (card.state !== 'undealt')
        {
            let i = this.dealtCards.indexOf(card);
            const global = this.view.toGlobal(this.dealtTray);
            const isPortrait = orientation === 'portrait';
            const nOfCards = 3;

            // Calculate the index for the padding offset (0 to 2).
            if (this.dealtCards.length > nOfCards) i = Math.max(0, nOfCards - (this.dealtCards.length - i));

            const trayHeight = this.dealtTray.height * scale;
            let padding = ((trayHeight * 0.9) - card.view.realHeight) / 2;

            x = this.view.x + (this.deckTray.width * halfScale);
            y = global.y + trayHeight * 0.05 + (card.view.realHeight * 0.5) + (padding * i);
            
            // If it's portrait, calculate the padding vertically.
            if (isPortrait)
            {
                padding = ((trayHeight * 0.84) - card.view.realWidth) / 2;
                x = global.x + trayHeight * 0.08 + (card.view.realWidth * 0.5) + (padding * i);
                y = this.view.y + (this.dealtTray.width * halfScale);
            }
        }

        return {x, y};
    }

    /**
     * Deals a card from the top of the deck to the dealt tray.
     * Loops through all the cards in the deck once the last one is dealt.
     */
    public async tap()
    {
        // Time to cycle through the deck again
        if (this.cardIndex === this.cards.length)
        {
            await this.reset();
        }
        else
        {
            const card = this.cards[this.cardIndex];
            
            // Add the card to the list of dealt cards
            this.dealtCards.push(card);

            // Set the card state and position
            card.state = 'dealt';
            card.faceUp(0, orientation === 'landscape' ? 'vertical' : 'horizontal');
            
            // Update the position of all the dealt cards.
            this.handleDealtCards();

            this.cardIndex++;

            this.onTapSignal.emit(card);
        }
        
    }

    /**
     * Removes a portion of the cards in the deck.
     * @param amount - The amount of cards to remove from the deck.
     * @returns A list of cards.
     */
    public dealCards(amount: number): Card[]
    {
        return this.cards.splice(0, amount);
    }

    /**
     * Remove the provided card from the deck.
     * @param card - The card to remove from the deck.
     */
    public removeCard(card: Card)
    {
        const index = this.cards.indexOf(card);

        if (index !== -1)
        {
            // Remove the card at the specified index.
            this.cards.splice(index, 1);
            this.cardIndex--;
            // Removes the last card on the deal tray. It's the only card that can be removed from the deck.
            this.dealtCards.pop();
            // Update the position of all the dealt cards.
            this.handleDealtCards();
        }
    }

    /**
     * Add a card into the deck.
     * @param card - The card to move into the deck.
     * @returns A promise which is fulfilled once the card completed its movement.
     */
    public addCard(card: Card)
    {
        if (!this.cards.includes(card)) this.cards.push(card);
        const halfScale = this.view.scale.x * 0.5;

        card.view.setScale(halfScale * 2);

        const {x, y} = this.getCardCoords(card);

        return card.place({x, y}, false);
    }

    /** Resets the deck to its beginning state. All cards are undealt and stacked on the deck tray. */
    public async reset()
    {
        this.resetting = true;
        this.dealtCards.length = 0;
        this.cardIndex = 0;

        const promises: Promise<void>[] = [];

        for (let i = 0; i < this.cards.length; i++)
        {
            const card = this.cards[i];
            
            promises.push(card.reset());
            promises.push(this.addCard(card));
            card.view.shadowEnabled = i === this.cards.length - 1;
        }

        return Promise.all(promises).then(() =>
        {
            this.resetting = false;
        });
    }

    public update()
    {
        // Enable the deck interactions if the game is running and the deck is not resetting.
        this.interactionArea.interactive = models.game.isRunning && !this.resetting;
    }

    /** Takes care of resizing and positioning the visual elements as the screen resizes. */
    public resize()
    {
        const isPortrait = orientation === 'portrait';
        
        let avWidth = table.deckWidth;
        let avHeight = table.deckHeight;
        let deckScaleX: number;
        let deckScaleY: number;

        // Calculate the position and rotation of the dealt tray and the scale of the root view based on
        // the orientation and the available space.
        if (isPortrait)
        {
            avWidth = table.deckWidth * 0.82;
            deckScaleX = avWidth / 1440;
            deckScaleY = avHeight / 600;
            this.dealtTray.width = this.deckTray.height;
            this.dealtTray.height = this.deckTray.width * 2.5;
            this.dealtTray.x = this.deckTray.width + 40;
            this.dealtTray.y = this.dealtTray.width;
            this.dealtTray.rotation = -Math.PI * 0.5;
        }
        else
        {
            avHeight -= (table.topBarHeight * 2) + 10;
            deckScaleX = avWidth / 450;
            deckScaleY = avHeight / 1440;
            this.dealtTray.y = this.deckTray.height + 40;
            this.dealtTray.x = 0;
            this.dealtTray.rotation = 0;
            this.dealtTray.scale.set(1);
        }

        this.view.scale.set(Math.min(deckScaleX, deckScaleY));

        // Calculate the position of the root view.
        const x = (avWidth - this.view.width) * 0.5;
        let y = table.topBarHeight + ((avHeight - this.view.height) * 0.5) + 5;

        if (isPortrait)
        {
            y = table.deckTop + (avHeight - this.view.height) * 0.5;
        }

        this.view.x = x;
        this.view.y = y;
        
        // Position all the cards on the deck/dealt tray.
        for (let i = this.cards.length - 1; i >= 0; i--)
        {
            const card = this.cards[i];
            const scale = this.view.scale.x;

            card.view.setScale(scale);
            CardView.dragScale = scale * 1.05;
    
            // Set the origin of the card.
            const {x, y} = this.getCardCoords(card);
    
            card.view.x = x;
            card.view.y = y;
            card.setOrigin(x, y);
        }

        // Set the interaction area position and scale to match the deck tray.
        this.interactionArea.position.set(this.view.x, this.view.y);
        this.interactionArea.scale.set(this.deckTray.width * this.view.scale.x, this.deckTray.height * this.view.scale.y);
    }
}
