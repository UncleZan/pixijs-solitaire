import {Container, FederatedPointerEvent, Point} from 'pixi.js';

import {Card} from './Card';
import {Game} from './Game';
import {GameStack} from './GameStack';

export class GameInteractions
{
    /** The root view of the class. */
    public target: Container;
    
    private game: Game;
    private cards: Card[] = [];
    private hitPoint = new Point(Infinity, Infinity);
    private selectedCard?: Card;

    constructor(game: Game, cards: Card[])
    {
        this.game = game;
        this.cards = cards;
        
        this.target = game.view;

        // Add interactions
        this.target.interactive = true;
        this.target.on('pointerdown', this.onDown.bind(this));
        this.target.on('pointermove', this.onMove.bind(this));
        this.target.on('pointerup', this.onUp.bind(this));
        this.target.on('pointerupoutside', this.onUp.bind(this));

        this.cards.forEach((c) => c.onTapSignal.connect(this.onCardTapped.bind(this)));
        this.game.deck.onTapSignal.connect(this.onDeckTapped.bind(this));
    }

    private onDown(e: FederatedPointerEvent)
    {
        this.hitPoint = this.target.toLocal(e.global);
        this.selectedCard = undefined;
    }

    private onMove(e: FederatedPointerEvent)
    {
        const local = this.target.toLocal(e.global);
        // Let's add a bit of threshold for the user taps. This means that the cards won't start moving unless
        // it's an obvious dragging action.
        const tapped = Math.abs(this.hitPoint.x - local.x) + Math.abs(this.hitPoint.y - local.y) < 10;
            
        if (tapped) return;
        this.selectedCard = this.cards.find((card) => card.isDown);
            
        if (this.selectedCard)
        {
            const x = local.x - this.hitPoint.x;
            const y = local.y - this.hitPoint.y;
            const cards = this.game.gameStacks.getAllCardsSelected(this.selectedCard);
                

            cards.forEach((card) =>
            {
                const angle = Math.atan2(this.hitPoint.y - local.y, this.hitPoint.x - local.x);

                card.view.drag(card.origin.x + x, card.origin.y + y, angle, 1);
            });
        }
    }

    private onUp()
    {
        const sc = this.selectedCard;
        
        // If a card is being dragged, let's handle it
        if (sc)
        {
            const cards = this.game.gameStacks.getAllCardsSelected(sc);
    
            cards.forEach((c) => c.view.drag(0));

            let wasPlaced = this.game.suitsStacks.intersect(sc);

            if (wasPlaced)
            {
                this.moveToSuits(sc);
            }
            else
            {
                const stack = this.game.gameStacks.intersect(sc);

                if (stack) this.moveToStack(sc, stack);
                wasPlaced = !!stack;
            }
            
            // If the card was not placed on any compatible slot, let's return it to its origin.
            if (!wasPlaced)
            {
                cards.forEach((card, i) =>
                {
                    card.place({x: card.origin.x, y: card.origin.y, delay: 0.04 * i}, false);
                });
            }
        }
    }

    private onCardPlaced(coords: XY)
    {
        this.game.smokeExplosion.play(coords.x, coords.y);
        this.game.hud.incrementMove();
    }

    private onCardTapped(card: Card)
    {
        if (this.selectedCard) return;

        const moveToSuits = this.game.suitsStacks.canAccomodate(card);

        if (moveToSuits) this.moveToSuits(card);
        else
        {
            const stack = this.game.gameStacks.canAccomodate(card);

            if (stack) this.moveToStack(card, stack);
        }
    }

    private onDeckTapped()
    {
        this.game.hud.incrementMove();
    }

    /**
     * Move a card to its suit stack
     * @param card The card to move
     */
    public moveToSuits(card: Card)
    {
        this.game.suitsStacks.placeCard(card).then(() => this.onCardPlaced({x: card.view.x, y: card.view.y}));
        this.removeCard(card);
    }

    /**
     * Move a card or cards to the given stack
     * @param card The card to move
     * @param stackTo The stack the card should be moved to
     */
    private moveToStack(card: Card, stackTo: GameStack)
    {
        this.game.gameStacks.placeCard(card, stackTo).then(() => this.onCardPlaced({x: card.view.x, y: card.view.y}));
        this.removeCard(card);
    }

    /**
     * Remove the given card from its current position
     * @param card The card to be removed
     */
    private removeCard(card: Card)
    {
        if (card.previousState === 'placed') this.game.suitsStacks.removeCard(card);
        else if (card.previousState === 'dealt') this.game.deck.removeCard(card);
        else if (card.previousState === 'played') this.game.gameStacks.removeCard(card);
    }
}