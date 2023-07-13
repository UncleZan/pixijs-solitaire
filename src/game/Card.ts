import {Point} from 'pixi.js';
import {Signal} from 'typed-signals';

import {ACE_PLACE_SCORE, CARD_PLACE_SCORE, CARD_PLAY_SCORE, CardColor,
    CardSkin, CardState, CardSuit} from '../data/CardData';
import {models} from '../model/Model';
import {getCardColor} from '../utils/cardUtils';
import {CardView, FlipOrientation} from './CardView';

/** The class representing the state of a game card. */
export class Card
{
    /** Fired when the user tap on a card facing up. */
    public onTapSignal = new Signal<(card: Card) => void>();
    /** The numeric value of a card. Going from 1 to 13. */
    public value: number;
    /**
     * The suit of the card. This affects the card view and determines
     * whether a card can be stacked on top of another in a suit stack.
     */
    public suit: CardSuit;
    /**
     * The color of the card. This affects the card view and determines
     * whether a card can be stacked on top of another in a game stack.
     */
    public color!: CardColor;
    /** The origin of the card used to move back a card after a card has been dragged. */
    public origin = new Point(Infinity, Infinity);
    /** Flags whether a card was hit by a 'pointerdown' event. Used by the game to select cards. */
    public isDown = false;
    /**
     * Flags whether the card is the last card of a game stack.
     * Used to check if the card can me moved to a suit stack.
     */
    public isOnTop = false;
    /** Flags whether the card is curently moving through the place function. */
    private moving = false;
    /** The current state of the card. */
    private _state!: CardState;
    /** The previous state of the card. */
    private _previousState!: CardState;
    /** How much score the user gets for placing the card on the suit stack. */
    private score: number;
    /** Cotains all the visual components of the card. */
    private readonly _view: CardView;
    /**
     * A small random angle.
     * Used to give the undealt cards on the deck a bit of "depth".
     */
    private randomRotation = (Math.random() * Math.PI) * 0.1;
    /** Flags whether the card is facing up or down. */
    private isUp = false;

    constructor(suit: CardSuit, value: number, skin: CardSkin)
    {
        this._view = new CardView(suit, value, skin);
        
        this.value = value;
        this.score = this.defaultPlaceScore + CARD_PLAY_SCORE;
        this.suit = suit;
        this.state = 'undealt';
        this.color = getCardColor(suit);
        
        this.view.on('pointerdown', this.onDown.bind(this));
        this.view.on('pointertap', this.onTap.bind(this));
        this.view.on('pointerup', this.onUp.bind(this));
        this.view.on('pointerupoutside', this.onUp.bind(this));
    }

    /**
     * Flips the card up and then makes the card interactive.
     * @param delay - A delay in seconds for the flip animation.
     * @param orientation - Whether the card should flip horizontally or vertically.
     * @returns a promise which is fulfilled once the card flipped completely.
     */
    public async faceUp(delay = 0.2, orientation: FlipOrientation = 'horizontal')
    {
        if (!this.isUp)
        {
            this.isUp = true;
            await this.view.showFront(delay, orientation);
            this.toggleInteractions(true);
        }
    }

    /** Flips the card down and then makes the card non-interactive. */
    public faceDown(): void
    {
        this.isUp = false;
        this.view.showBack();
        this.toggleInteractions(false);
    }

    /**
     * Changes the card interactivity and the mouse pointer when hovering the card.
     * @param v - Whether or not the card should be interactive.
     */
    public toggleInteractions(v: boolean)
    {
        this.view.cursor = v ? 'pointer' : 'default';
        this.view.interactive = v;
    }

    /**
     * Sets the card position. The main function to move a card from one place to another.
     * @param opts - The properties for the Tween.
     * @param playDrop - Whether or not the card should play the drop effect.
     * @returns a promise which is fulfilled once the the card completed its movement.
     */
    public async place(opts: PIXITweenVars, playDrop = true)
    {
        // Flag the card as moving.
        this.moving = true;
        // Set the card origin.
        this.setOrigin(opts.x, opts.y);
        // Wait for the card to reach the target position.
        await this.view.setPosition(opts, playDrop);
        // Flag the card as not moving.
        this.moving = false;
    }

    /**
     * Whether or not the card is in place.
     * A card is in place if it's moving and facing up.
     */
    public get animating()
    {
        return this.moving || !this.view.interactive;
    }

    /**
     * Sets the origin of the card.
     * @param x - The x origin of the card.
     * @param y - The y origin of the card.
     */
    public setOrigin(x = 0, y = x)
    {
        this.origin.set(x, y);
    }

    private onDown()
    {
        this.isDown = true;
    }

    private onTap()
    {
        this.onTapSignal.emit(this);
    }
    
    private onUp()
    {
        this.isDown = false;
    }

    public get view(): CardView
    {
        return this._view;
    }

    /** The default score for placing the card. The Ace has the biggest score. */
    public get defaultPlaceScore()
    {
        return this.value === 1 ? ACE_PLACE_SCORE : CARD_PLACE_SCORE;
    }

    public get previousState()
    {
        return this._previousState;
    }

    public get state()
    {
        return this._state;
    }

    /** Handle the different card states. */
    public set state(v: CardState)
    {
        // Sets the view's target rotation to 0.
        this.view.tr = 0;

        // Flags the card as placed.
        if (v === 'placed') this.placed = true;
        // Gives the card a random rotation if it's undealt, hence it's on the deck.
        else if (v === 'undealt') this.view.tr = this.randomRotation;
        // Flags the card as played, if it's moved to the stack and it's not coming from the deck.
        else if (this.state !== 'undealt' && v === 'played') this.played = true;

        this._previousState = this.state;
        this._state = v;
    }
    
    /** Whether the card has already been moved to a suit stack for the first time. */
    public get placed()
    {
        // If a card has no score it means it was already placed on the suit stack before.
        return this.score === 0;
    }
    
    /** Handles the card placed state. */
    private set placed(v)
    {
        if (v === this.placed) return;

        // Assigns the user the card's score and then sets it to 0,
        // if it's the first time the card is placed on the suit stack.
        if (v)
        {
            models.game.score += this.score;
            this.score = 0;
        }
        else this.score = this.defaultPlaceScore + CARD_PLAY_SCORE;
    }

    /** Whether the card has already been moved to a game stack for the first time. */
    public get played()
    {
        // If a card's score is equal to the card's place score it means it was already played on a game stack before.
        return this.score === this.defaultPlaceScore;
    }
    
    /** Handles the card played state. */
    private set played(v)
    {
        if (v === this.played || this.placed) return;
        
        // Assigns the user the card's play score and then subtracts it from the total score,
        // if it's the first time the card is played on a game stack.
        if (v)
        {
            models.game.score += CARD_PLAY_SCORE;
            this.score -= CARD_PLAY_SCORE;
        }
    }

    /**
     * Reset the card to it's original state.
     * @returns a promise which is fulfilled once the view's components have been reset.
     */
    public async reset()
    {
        this.randomRotation = (Math.random() * Math.PI) * 0.1;
        this.state = 'undealt';
        this.placed = false;
        this.played = false;
        await this.view.reset();
        this.faceDown();
    }
}
