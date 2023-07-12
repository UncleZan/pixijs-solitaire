import gsap from 'gsap';
import { Container, Point } from "pixi.js";
import { CardSuit, cardSuits, NUMBER_OF_STACKS, SUITS_OF_CARDS } from "../data/CardData";
import { Background } from './Background';
import { Card } from "./Card";
import { CardPile } from "./CardPile";
import { CardStack } from './CardStack';
import { Deck } from "./Deck";
import { Hud } from './Hud';

const PADDING_LEFT = 20;

export class PlayingTable {

    public view = new Container();
    public bottomLayer = new Container();
    public topLayer = new Container();
    public cardsContainer = new Container();
    
    private bg!: Background;
    private deck!: Deck;
    private piles = {} as Record<CardSuit, CardPile>;
    private stacks: CardStack[] = [];
    private hitPoint = new Point(Infinity, Infinity);
    private allCards!: Card[];
    private selectedCard?: Card;
    private hud!: Hud;
    private width!: number;
    private height!: number;
    private inited = false;

    public init()
    {
        this.inited = true;
        this.bg = new Background(this.width, this.height);

        this.deck = new Deck();
        this.view.interactive = true;

        this.allCards = this.deck.cards.slice();

        this.hud = new Hud(this.deck);
        this.hud.onResetTapSignal.connect(this.reset.bind(this))

        // Add interactions
        this.deck.cards.forEach((c) => c.onTapSignal.connect(this.onCardTapped.bind(this)));
        this.deck.onTapSignal.connect(this.onDeckTapped.bind(this));
        this.view.on('pointerdown', (e) => { this.hitPoint = this.view.toLocal(e.global); });
        this.view.on('pointermove', (e) => 
        {
            const local = this.view.toLocal(e.global);
            // Let's add a bit of threshold for the user taps. This means that the cards won't start moving unless
            // it's an obvious dragging action.
            const tapped = Math.abs(this.hitPoint.x - local.x) + Math.abs(this.hitPoint.y - local.y) < 10;

            if (tapped) return;
            this.selectedCard = this.allCards.find((card) => card.isDown);
            
            if (this.selectedCard) {
                const x = local.x - this.hitPoint.x;
                const y = local.y - this.hitPoint.y;
                const cards = this.getSelectedCards(this.selectedCard);
                
                cards.forEach((card) => 
                {
                    this.cardsContainer.addChild(card.view);
                    card.view.x = card.origin.x + x;
                    card.view.y = card.origin.y + y;
                });
            }
        });
        this.view.on('pointerup', () => { 
            const sc = this.selectedCard;

            // If a card is being dragged, let's return it to its origin
            if(sc) {
                const av = sc.view;
                let touchStackX = false;
                let wasPlaced = false;

                for (const stack of this.stacks) {
                    const bv = stack.view;
                    const ax1 = av.x;
                    const ax2 = av.x + av.width;
                    const bx1 = bv.x;
                    const bx2 = bv.x + bv.width;

                    touchStackX = (ax1 > bx1 && ax1 < bx2) || (ax2 > bx1 && ax2 < bx2);
                    
                    if (touchStackX && this.canBeStacked(sc, stack))
                    {
                        wasPlaced = true;
                        continue;
                    } 
                }

                // If the card was not placed on any compatible slot, let's return it to its origin.
                if (!wasPlaced){
                    const cards = this.getSelectedCards(sc);
                
                    cards.forEach((card) => 
                    {
                        gsap.to(card.view, { duration: 0.2, x: card.origin.x, y: card.origin.y });
                    });
                }
            }
         });

        this.buildPiles();

        this.bottomLayer.addChild(this.bg.view, this.deck.view, this.cardsContainer);
        this.topLayer.addChild(this.hud);
        this.view.addChild(this.bottomLayer, this.topLayer);
        this.shuffleDeck();
        this.buildStacks();
        this.hud.reset();
        this.resize(this.width, this.height);
    }

    private shuffleDeck()
    {
        // Shuffle the cards
        this.deck.shuffle();

        for (let i = this.deck.cards.length - 1; i >= 0; i--) {
            const card = this.deck.cards[i];

            // Make sure the card views have the same order of the cards object within the "deck.cards",
            // so that when they are dealt they will always go on the top of the pile.
            this.cardsContainer.addChild(card.view);
        }
    }

    private buildPiles()
    {
        // Build the 4 card piles used for the game progression
        for (let i = 0; i < SUITS_OF_CARDS; i++) {
            const suit = cardSuits[i];
            const pile = new CardPile(suit);

            this.cardsContainer.addChild(pile.view);
            this.piles[pile.suit] = pile;
        }
    }

    private buildStacks()
    {
        for (let i = 0; i < NUMBER_OF_STACKS; i++) {
            // Create and position the stack on the screen
            const stack = new CardStack();   
            
            this.stacks.push(stack);
        }
        this.populateStacks();
    }

    private populateStacks() 
    {
        const allPromises: Promise<void>[] = [];
        
        for (let i = 0; i < NUMBER_OF_STACKS; i++) {
            allPromises.push(new Promise((resolve) =>
            {
                setTimeout(() => {
                    // Create and position the stack on the screen
                    const stack = this.stacks[i];   
                    const allTweens: Promise<void>[] = [];
                    
                    // Move cards from the deck to the stack
                    const stackSize = 1 + i;
                    const cards = this.deck.dealCards(stackSize);
    
    
                    cards.forEach((card)=> {
                        card.view.scale.set(this.stacks[0].view.scale.x * 1.05);
                        allTweens.push(stack.addCard(card));
                    });
                    
                    this.cardsContainer.addChildAt(stack.view, 0);
                    // Make the top card of the stack face up
                    Promise.all(allTweens).then(() => resolve());
                }, i * 70);
            }));
        }

        return Promise.all(allPromises).then(() => 
        {
            for (let i = 0; i < NUMBER_OF_STACKS; i++) {
                // Time to flip the cards
                const stack = this.stacks[i];   
                const cards = stack.cards;
                
                setTimeout(() => {
                    
                    cards[cards.length - 1].faceUp();
                }, i * 70);
            } 
        });
    }

    private onDeckTapped()
    {
        // Add functional game behaviour here
        this.hud.incrementMove();
    }

    private onCardTapped(card: Card)
    {
        if (this.selectedCard) return;

        this.canBePiled(card) || this.stacks.find((stack)=> this.canBeStacked(card, stack));
    }

    private canBePiled(card: Card)
    {
        const pile = this.piles[card.suit];
        // The stack the card would move from
        const stackFrom = this.stacks.find((stack) => stack.hasCard(card));
        
        // If the card is on a stack let's check if it's on top of the stack.
        const isOnTop = !!(stackFrom?.isCardOnTop(card));
        const canBePiled = (card.state === 'dealt' || isOnTop) && (card.value === pile.value + 1);

        if (canBePiled) {
            card.view.scale.set(this.stacks[0].view.scale.x * 1.05);
            this.hud.incrementMove();
            if(!card.piled) {
                this.hud.incrementScore(card.score);
                card.piled = true;
            }
            // Remove the card from its current position
            switch (card.state) {
                case 'dealt': this.deck.removeCard(card);
                    break;
                case 'stacked': stackFrom?.removeCard(card);
                    break;
                default: console.warn('[PlayingTable.ts] Something is wrong, check the card state management.');
                    break;
            }

            // Add the card to the pile
            pile.addCard(card);
        }

        return canBePiled;
    }

    private canBeStacked(card: Card, stackTo: CardStack) 
    {        
        const pile = this.piles[card.suit];
        // The stack the card would move from
        const stackFrom = this.stacks.find((stack) => stack.hasCard(card));
        const canBeStacked = stackTo.canAccomodate(card);
        
        if (canBeStacked) 
        {
            card.view.scale.set(this.stacks[0].view.scale.x * 1.05);
            this.hud.incrementMove();
            if(!card.stacked && !card.piled) {
                this.hud.incrementScore(5);
                card.stacked = true;
            }
            // Let's see if we need to move a stack of cards
            const cards = stackFrom?.getCardsFromCard(card);

            switch (card.state) {
                case 'piled': pile.removeCard(card);
                    break;
                case 'dealt': this.deck.removeCard(card);
                    break;
                case 'stacked': stackFrom?.removeCard(card);
                    break;
                default: console.warn('[PlayingTable.ts] Something is wrong, check the card state management.');
                    break;
            }

            // Add the card/cards to the stack
            if (cards?.length) {
                cards.forEach(c => stackTo?.addCard(c));
            }
            else stackTo?.addCard(card);
        }

        return canBeStacked;
    }

    private getSelectedCards(card: Card)
    {
        const stackFrom = this.stacks.find((stack) => stack.hasCard(card));
        const cards = stackFrom?.getCardsFromCard(card);

        return cards || [card];
    }

    public async reset()
    {
        const allTweens: Promise<void>[] = [];

        this.stacks.forEach((stack) => stack.reset());
        for (const key in this.piles) this.piles[key as CardSuit].reset();

        this.deck.reset();
        this.allCards.forEach((card) => {
            card.view.scale.set(this.stacks[0].view.scale.x * 1.5);
            card.reset();
            allTweens.push(this.deck.addCard(card));
        });

        await Promise.all(allTweens);

        this.deck.shuffle();
        await this.populateStacks();
        this.hud.reset();
    }

    public resize(w: number, h: number)
    {
        this.width = w;
        this.height = h;
        if (!this.inited) return;
        
        this.bg.resize(w, h);

        let stackScale = 1;
        const stackRef = this.stacks[0];

        if (stackRef) {
            stackScale = Math.max((this.bg.getPlaygroundWidth() - (PADDING_LEFT * 2)) / ((500) * this.stacks.length), 0.1); 
        }

        const cardScale = stackScale * 1.05;
        const biggerCardScale = stackScale * 1.5;

        const lpw = this.bg.getLeftPanelWidth();

        this.deck.view.scale.set(biggerCardScale);
        this.deck.view.x = (lpw - this.deck.view.width) * 0.5;
        this.deck.view.y = 20;
        
        for (let i = this.deck.cards.length - 1; i >= 0; i--) {
            const card = this.deck.cards[i];

            card.view.scale.set(biggerCardScale);
            this.deck.placeOnDeck(card);
        }
        
        for (let i = 0; i < this.stacks.length; i++) {
            // Create and position the stack on the screen
            const stack = this.stacks[i];   
            const padding = (this.bg.getPlaygroundWidth() - (stack.view.width * this.stacks.length) - (PADDING_LEFT * 2)) / (this.stacks.length + 1);
            
            stack.view.scale.set(stackScale);
            stack.view.x = this.bg.getPlaygroundX() + PADDING_LEFT + padding + ((stack.view.width + padding) * (i));
            stack.view.y = this.bg.getPlaygroundY() * 1.1;
            
            stack.cards.forEach((card)=>
            {
                card.view.scale.set(cardScale);
                card.view.x = stack.getCardX(card);
                card.view.y = stack.getCardY(card);
            });
        }

        let i = 0;

        for (const suit in this.piles) {
            const pile = this.piles[suit as CardSuit];

            pile.view.scale.set(stackScale);
            pile.view.x = this.bg.getRightPanelX() + ((this.bg.getRightPanelWidth() - pile.view.width) * 0.5);
            pile.view.y = this.stacks[0].view.y + ((pile.view.height + 20) * i++);
            pile.cards.forEach((card)=>
            {
                card.view.scale.set(cardScale);
                card.view.x = pile.getCardX(card);
                card.view.y = pile.getCardY(card);
            });
        }

        this.hud.setTopWidth(this.bg.getTopPanelWidth() - 15);
        this.hud?.resize(w, h);
    }
}
