import gsap from 'gsap';
import { FederatedPointerEvent, Point } from 'pixi.js';
import { Signal } from 'typed-signals';
import { CardColor as CardColour, CardState, CardSuit } from '../data/CardData';
import { getCardColour } from '../utils/cardUtils';
import { CardView } from './CardView';

export class Card {

    public onTapSignal = new Signal<(card: Card) => void>();
    public onMoveSignal = new Signal<(coords: XY) => void>();
    public value: number;
    public suit: CardSuit;
    public flipped = false;
    public state: CardState = 'undealt'; 
    public colour!: CardColour; 
    public hitPoint = new Point(Infinity, Infinity);
    public origin = new Point(Infinity, Infinity);
    public isDown = false;
    
    public _piled = false;
    public _stacked = false;
    private _score = 10; 
    private readonly _view: CardView;

    constructor(suit: CardSuit, value: number) 
    {
        this._view = new CardView(suit, value);
        
        this.value = value;
        if (value === 1) this._score = 20;

        this.suit = suit;
        this.colour = getCardColour(suit);
        
        this.view.on('pointerdown', this.onDown.bind(this));
        this.view.on('pointertap', this.onTap.bind(this));
        this.view.on('pointerup', this.onUp.bind(this));
        this.view.on('pointerupoutside', this.onUp.bind(this));
    }

    public faceUp(): void 
    {
        this.view.showFront();
        this.flipped = true;
        this.view.cursor = 'pointer';
        this.view.interactive = true;
    }

    public faceDown(): void 
    {
        this.view.showBack();
        this.flipped = false;
        this.view.cursor = 'default';
        this.view.interactive = false;
    }

    /**
     * Takes care
     * @param opts 
     */
    public async place(opts: GSAPTweenVars & XorY)
    {
        // Ensure the card view is rendered on the top
        this.view.parent.addChild(this.view);

        gsap.killTweensOf(this.view);
        opts.x = opts.x || this.view.x;
        opts.y = opts.y || this.view.y;
        
        
        this.origin.set(opts.x, opts.y);
        await gsap.to(this.view, { duration: 0.3, ...opts });
    }

    private onDown(e: FederatedPointerEvent)
    {
        this.hitPoint.copyFrom(this.view.parent.toLocal(e.global));
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

    get view(): CardView
    {
        return this._view;
    }

    public get score()
    {
        return this._score;
    }
    
    public get piled() {
        return this._piled;
    }
    
    public set piled(v) {
        this._piled = v;

        if (v) this._score = 0;
        else this._score = this.value === 1 ? 20 : 10;
    }

    public get stacked() {
        return this._stacked;
    }
    
    public set stacked(v) {
        this._stacked = v;

        if (v) this._score -= 5;
    }
    
    

    public reset()
    {
        gsap.killTweensOf(this.view);
        this.state = 'undealt';
        this.piled = false;
        this.stacked = false;
        this.faceDown();
    }
}
