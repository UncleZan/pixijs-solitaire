import {Container} from 'pixi.js';

import {cardSuits, NUMBER_OF_CARDS, NUMBER_OF_SUITS} from '../data/CardData';
import {models} from '../model/Model';
import {Card} from './Card';
import {Game} from './Game';

export class GameCards
{
    /** The root view of the class. */
    public view = new Container();
    
    private all: Card[] = [];
    /** TODO: Temporary, needed for debug. */
    private game: Game;

    constructor(game: Game)
    {
        this.game = game;

        for (let i = 1; i <= NUMBER_OF_CARDS / NUMBER_OF_SUITS; i++)
        {
            for (let j = 0; j < NUMBER_OF_SUITS; j++)
            {
                const suit = cardSuits[j];
                const card = new Card(suit, i, models.game.cardSkin);

                this.view.addChild(card.view);
                this.all.push(card);
            }
        }
    }

    public get cards(): Card[]
    {
        return this.all;
    }

    public async reset()
    {
        const allTweens: Promise<void>[] = [];
        
        this.all.forEach((card) =>
        {
            card.reset();
            allTweens.push(this.game.deck.addCard(card));
        });
        await Promise.all(allTweens);
    }

    public debugCompleteGame()
    {
        this.all.sort((a, b) => a.value - b.value);
        for (let i = 0; i < this.all.length - 3; i++)
        {
            const card = this.all[i];

            setTimeout(() =>
            {
                card.faceUp();
                this.game.deck.removeCard(card);
                this.game.deck['cardIndex']++;
                this.game['interactions'].moveToSuits(card);
            }, 20 * card.value);
        }
    }
}