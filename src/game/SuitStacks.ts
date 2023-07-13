import {Container} from 'pixi.js';

import {CardSuit, cardSuits, NUMBER_OF_SUITS} from '../data/CardData';
import {orientation} from '../utils/orientation';
import {Card} from './Card';
import {SuitStack} from './SuitStack';
import {table} from './Table';

export class SuitStacks
{
    public view = new Container();
    public all = {} as Record<CardSuit, SuitStack>;

    constructor()
    {
        this.setup();
    }

    public intersect(card: Card)
    {
        const ar = card.view.getBounds(true);

        for (const key in this.all)
        {
            const stack = this.all[key as CardSuit];
            const br = stack.view.getBounds(true);
                
            if (br.intersects(ar) && stack.canAccomodate(card))
            {
                return true;
            }
        }
        

        return false;
    }

    public canAccomodate(card: Card)
    {
        return this.all[card.suit].canAccomodate(card);
    }

    private setup()
    {
        // Build the 4 suits stacks used for the game progression
        for (let i = 0; i < cardSuits.length; i++)
        {
            const suit = cardSuits[i];
            const stack = new SuitStack(suit);

            this.view.addChild(stack.view);
            this.all[stack.suit] = stack;
        }
    }

    /**
     * Move a card to its stack
     * @param card The card to move
     */
    public async placeCard(card: Card)
    {
        const allTweens: Promise<void>[] = [];
        const stack = this.all[card.suit];

        // Add the card to the stack
        allTweens.push(stack.addCard(card));

        await Promise.all(allTweens);
    }

    /**
     * Remove the given card from its current position
     * @param card The card to be removed
     */
    public removeCard(card: Card)
    {
        this.all[card.suit].removeCard(card);
    }

    public reset()
    {
        for (const key in this.all) this.all[key as CardSuit].reset();
    }

    public completed()
    {
        let complete = true;

        for (let i = 0; i < cardSuits.length; i++)
        {
            const stack = this.all[cardSuits[i]];

            complete = complete &&
            stack.value === 13 &&
            this.allCardsArePlaced(stack);
        }

        return complete;
    }

    private allCardsArePlaced(stack: SuitStack)
    {
        return !stack.cards.find((c) => c.animating);
    }

    public resize()
    {
        const isPortrait = orientation === 'portrait';
        const ref = this.all.clubs.base.texture;

        const availableWidth = table.suitsWidth * 0.8;
        let availableHeight = table.suitsHeight * 0.9;
        
        let suitsScaleX = availableWidth / ref.width;
        let suitsScaleY = availableHeight / (ref.height * NUMBER_OF_SUITS);
        
        if (isPortrait)
        {
            availableHeight = Math.min(availableHeight, 120);
            suitsScaleX = availableWidth / (ref.width * NUMBER_OF_SUITS);
            suitsScaleY = availableHeight / ref.height;
        }

        const suitsScale = Math.min(suitsScaleX, suitsScaleY);
        const padding = 10;
        const totalSuitsPadding = padding * (NUMBER_OF_SUITS - 1);

        for (let i = 0; i < cardSuits.length; i++)
        {
            const stack = this.all[cardSuits[i]];

            stack.view.scale.set(suitsScale);


            stack.view.x = table.suitsLeft + ((table.suitsWidth - stack.view.width) * 0.5);
            stack.view.y = table.playgroundTop + padding + ((stack.view.height + padding) * i);
            
            if (isPortrait)
            {
                const offset = (table.suitsWidth - (stack.view.width * NUMBER_OF_SUITS) - totalSuitsPadding) * 0.5;

                stack.view.x = offset + ((stack.view.width + padding) * i);
                stack.view.y = table.topBarHeight + ((table.suitsHeight - stack.view.height) * 0.5);
            }

            stack.cards.forEach((card) =>
            {
                card.view.setScale(suitsScale);
                card.place({x: stack.getCardX(), y: stack.getCardY(), duration: 0}, false);
            });
        }
    }

}