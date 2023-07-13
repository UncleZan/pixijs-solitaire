import {Container} from 'pixi.js';

import {NUMBER_OF_STACKS} from '../data/CardData';
import {Card} from './Card';
import {Game} from './Game';
import {GameStack} from './GameStack';
import {table} from './Table';

export class GameStacks
{
    public view = new Container();
    public all: GameStack[] = [];

    private game: Game;

    constructor(game: Game)
    {
        this.game = game;
        this.setup();
    }

    private setup()
    {
        for (let i = 0; i < NUMBER_OF_STACKS; i++)
        {
            // Create and position the stack on the screen
            const stack = new GameStack();
            
            this.all.push(stack);
            this.view.addChild(stack.view);
        }
    }
    
    public async populate()
    {
        const allTweens: Promise<void>[] = [];

        for (let i = 0; i < this.all.length; i++)
        {
            // For each stack deal n + 1 cards from the deck
            const stackSize = 1 + i;
            const cards = this.game.deck.dealCards(stackSize);

            const delay = 0.06 * i;
            const stack = this.all[i];
 
            // Make an array of promises that resolve once each card in the stack has been positioned
            // Move each card from the deck to the stack
            allTweens.push(Promise.all(cards.map((card) => stack.addCard(card, {delay}, false)))
            // Turn face up the last card in each stack
                .then(() => cards[cards.length - 1].faceUp((0.075 * NUMBER_OF_STACKS))));
        }

        return Promise.all(allTweens);
    }

    public intersect(card: Card)
    {
        for (const stack of this.all)
        {
            if (stack.hasCard(card)) continue;

            const av = card.view;
            const bv = stack.view;
            const ax1 = av.x - (av.width * 0.5);
            const ax2 = av.x + (av.width * 0.5);
            const bx1 = bv.x;
            const bx2 = bv.x + bv.width;
            const ay2 = av.y + (av.height * 0.5);
            const by1 = bv.y;
                
            const touchStackX = (ax1 > bx1 && ax1 < bx2) || (ax2 > bx1 && ax2 < bx2);
            const isBelowY = ay2 > by1;

            if (touchStackX && isBelowY && stack.canAccomodate(card))
            {
                return stack;
            }
        }

        return null;
    }

    /**
     * Move a card or cards to the given stack
     * @param card The card to move
     * @param stackTo The stack the card should be moved to
     */
    public async placeCard(card: Card, stackTo: GameStack)
    {
        // The stack the card would move from
        const stackFrom = this.all.find((stack) => stack.hasCard(card));
        const cards = stackFrom?.getCardsOnTop(card);
        const allTweens: Promise<GSAPTween>[] = [];

        // Let's see if we need to move a stack of cards
        if (cards?.length)
        {
            cards.forEach((c, i) => allTweens.push(stackTo.addCard(c, {delay: 0.04 * i})));
        }
        else allTweens.push(stackTo.addCard(card));

        await Promise.all(allTweens);
    }

    public canAccomodate(card: Card)
    {
        return this.all.find((stack) => stack.canAccomodate(card));
    }

    /**
     * Remove the given card from its current position
     * @param card The card to be removed
     */
    public removeCard(card: Card)
    {
        const stack = this.all.find((stack) => stack.hasCard(card)) as GameStack;

        stack?.removeCard(card);
    }

    public getAllCardsSelected(card: Card)
    {
        const stackFrom = this.all.find((stack) => stack.hasCard(card));
        const cards = stackFrom?.getCardsOnTop(card);

        return cards || [card];
    }

    public async reset()
    {
        this.all.forEach((stack) => stack.reset());
    }

    public resize()
    {

        for (let i = 0; i < this.all.length; i++)
        {
            // Create and position the stack on the screen
            const stack = this.all[i];
            const stackScale = (table.playgroundWidth * 0.9) / ((stack.base.texture.width) * NUMBER_OF_STACKS);

            stack.view.scale.set(stackScale);

            const padding = (table.playgroundWidth - (stack.view.width * NUMBER_OF_STACKS)) / (NUMBER_OF_STACKS + 1);
            
            stack.view.x = table.playgroundLeft + padding + ((stack.view.width + padding) * (i));
            stack.view.y = table.playgroundTop + 10;

            stack.cards.forEach((card) =>
            {
                card.place({x: stack.getCardX(), y: stack.getCardY(card), duration: 0}, false);
                card.view.setScale(stackScale);
            });
        }
    }

}