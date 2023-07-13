import {Strong} from 'gsap';
import {Container, Sprite, Text, Texture} from 'pixi.js';

import {CardSkin, CardSuit} from '../data/CardData';
import {sfx} from '../utils/audio';
import {getCardColor, getCardId} from '../utils/cardUtils';
import {lerp} from '../utils/maths';
import {resolveAndKillTweens, tween} from '../utils/tweens';

/** Whether the flip should be performed horizontally or vertically. */
export type FlipOrientation = 'horizontal'|'vertical';

/**
 * A wrapper for the visual elements of a card.
 * Each card in the game consists in a card base, a symbol, a value and an icon.
 */
export class CardView extends Container
{
    /** The target scale of the card view being dragged. */
    public static dragScale = 1;
    /**
     * The original scale of the card view.
     * Used to reset the card position after a card has been dragged.
     */
    public originalScale = 1;
    /**
     * The real width of the card view.
     * Used to factor the card shadow's empty pixels.
     */
    public realWidth = 1;
    /**
     * The real height of the card view.
     * Used to factor the card shadow's empty pixels.
     */
    public realHeight = 1;
    /** The target rotation of the card view. */
    public tr = 0;

    /** The target x position of the card view. */
    private tx = 0;
    /** The target y position of the card view. */
    private ty = 0;
    /** A flag used to lerp the card view position and scale when it's being dragged. */
    private dragForce = 0;
    /** A handle for the card view animations. */
    private animationContainer = new Container();
    /** The container for the card stats. Such as the value, the icon and the symbol. */
    private stats = new Container();
    /** The drop shadow of the card view. */
    private shadow: Sprite;
    /** The base view of the card. */
    private base: Sprite;
    /** The main central symbol of the card view. */
    private symbol: Sprite;
    /** The upper right icon of the card view. */
    private icon: Sprite;
    /** The upper left alphanumeric value of the card. */
    private value: Text;
    /** The custom texture of the card back. */
    private skin: CardSkin;
    
    constructor(suit: CardSuit, value: number, skin: CardSkin)
    {
        super();

        this.skin = skin;

        this.base = Sprite.from(skin);
        this.base.anchor.set(0.5);

        this.shadow = Sprite.from('card-shadow');
        this.shadow.anchor.set(0.5);

        const color = getCardColor(suit);
        const id = getCardId(value);
        let symbol: string = suit;

        // If the card is either a J, a Q or a K.
        if (value > 10) symbol = `${id.toLowerCase()}-${color}`;

        this.symbol = Sprite.from(symbol);
        this.symbol.anchor.set(0.5);
        // If the card is neither a J, a Q or a K. We need to offset the symbol y position.
        this.symbol.y = (40 * Number(value <= 10));

        const paddingTop = 40;
        const paddingSide = 10;

        this.icon = Sprite.from(suit);
        this.icon.scale.set(0.4);
        this.icon.x = paddingSide;
        this.icon.y = -this.base.height * 0.5 + paddingTop;
        
        this.value = new Text(id, {fill: color, fontWeight: 'bolder'});
        this.value.anchor.x = 1;
        this.value.scale.set(this.icon.height / this.value.height);
        this.value.x = -paddingSide - (this.icon.width * 0.5) + (this.value.width * 0.5);
        this.value.y = -this.base.height * 0.5 + paddingTop;

        // The stats of the card are only visible once the card view is flipped up.
        this.stats.visible = false;

        // Center the animation container pivot and offset its position of the same amount.
        // This way the view will be in the same position but when we skew and rotate the container,
        // it will do it nicely on the bottom edge of the card's view.
        this.animationContainer.pivot.x = this.base.width * 0.5;
        this.animationContainer.x = this.base.width * 0.5;
        this.animationContainer.pivot.y = this.base.height * 0.5;
        this.animationContainer.y = this.base.height * 0.5;

        this.stats.addChild(this.value, this.icon, this.symbol);
        this.animationContainer.addChild(this.shadow, this.base, this.stats);
        this.addChild(this.animationContainer);
        
    }

    public get shadowEnabled()
    {
        return this.shadow.visible;
    }

    public set shadowEnabled(value: boolean)
    {
        this.shadow.visible = value;
    }

    /**
     * Handles the scale of the view. This should be the only way of setting a card's scale.
     */
    public setScale(scale: number)
    {
        this.originalScale = scale;
        this.realWidth = this.base.width * scale;
        this.realHeight = this.base.height * scale;
    }

    /** Sets the card's view position. Returns a promise which is fulfilled once all the tweens are completed. */
    public setPosition(opts: PIXITweenVars, playDrop = true)
    {
        // Ensure the card view is rendered on the top.
        this.parent.addChild(this);

        // Default x and y props to the view values.
        opts.x = opts.x || this.x;
        opts.y = opts.y || this.y;

        const allTweens: Promise<GSAPTween>[] = [];

        // Replicate a card droppping on the floor if the card is not returning to its origin after being dragged.
        if (playDrop)
        {
            allTweens.push(tween(this.animationContainer.skew, {duration: 0.15, x: -1}));
            allTweens.push(tween(this.animationContainer.scale, {duration: 0.15, y: 0.3}));
            allTweens.push(tween(this.animationContainer.skew, {duration: 0.35, x: 0, ease: Strong.easeIn, delay: 0.15}));
            allTweens.push(tween(this.animationContainer.scale, {duration: 0.35, y: 1, ease: Strong.easeIn, delay: 0.15}));
        }

        allTweens.push(tween(this, {duration: 0.3, ...opts}));

        return Promise.all(allTweens);
    }

    /**
     * Flips the card's view either horizontally or vertically.
     * @param delay - The delay for the animation to start.
     * @param orientation - Whether the card's view should flip horizontally or vertically.
     * @returns a promise which is fulfilled once the last tween is completed.
     */
    public async showFront(delay = 0.2, orientation: FlipOrientation = 'horizontal')
    {

        const x = this.animationContainer.x;
        const y = this.animationContainer.y;

        // A callback to reset the animated properties once the flip is completed.
        const reset = () =>
        {
            this.animationContainer.x = x;
            this.animationContainer.skew.y = 0;
            this.stats.scale.x = 1;
            this.animationContainer.y = y;
            this.animationContainer.skew.x = 0;
            this.stats.scale.y = 1;
        };

        // A callback to:
        // - prepare some properties for the animation
        // - play the flip sfx
        // - update the base texture to show the front of the card
        const onFlip = (axis: 'x'|'y') =>
        {
            this.base.texture = Texture.from('card-front');
            sfx.play('card-flip', {volume: 0.5});
            this.stats.visible = true;
            this.stats.scale[axis] = -1;
        };

        if (orientation === 'horizontal')
        {
            // Wait for the card's view to skew on the y axis of half a PI.
            await tween(this.animationContainer.skew, {duration: 0.3, y: Math.PI * 0.5, delay});
            // Prepare the card view.
            onFlip('x');
            // Move the card's view on the x axis as the it finishes to skew so it looks like it's flipping in place.
            tween(this.animationContainer, {duration: 0.3, x: x - (this.base.width)});

            // Finish to skew the card view, then reset its properties.
            return tween(this.animationContainer.skew, {duration: 0.3, y: Math.PI}).then(() => reset());
        }
        
        // Wait for the card's view to skew on the x axis of minus half a PI.
        await tween(this.animationContainer.skew, {duration: 0.3, x: -Math.PI * 0.5, delay});
        // Prepare the card view.
        onFlip('y');
        // Move the card's view on the y axis as the it finishes to skew so it looks like it's flipping in place.
        tween(this.animationContainer, {duration: 0.3, y: y - this.base.height});

        // Finish to skew the card view, then reset its properties.
        return tween(this.animationContainer.skew, {duration: 0.3, x: -Math.PI}).then(() => reset());
    }

    /** Updates the texture of the view's base to show the back of the card. Hides the stats of the card. */
    public showBack()
    {
        this.base.texture = Texture.from(this.skin);
        this.stats.visible = false;
    }
    
    /**
     * Enables the card dragging.
     * @param x - The target x position.
     * @param y - The target y position.
     * @param a - The angle for the target rotation.
     * @param p - The drag force. Setting it to 0 will disable the dragging.
     */
    public drag(x = 0, y = x, a = x, p = x)
    {
        // Ensure the card view is rendered on the top.
        this.parent.addChild(this);

        this.tx = x;
        this.ty = y;
        this.dragForce = p;
        
        // Sets the target rotation if it hasn't been set or the drag has been disabled.
        if (!this.tr || !p)
        {
            const sin = Math.sin(a + Math.PI * 0.5);
            const cos = Math.cos(a + Math.PI * 0.5);
            
            this.tr = (cos * Math.sign(sin)) * p * 0.6;
        }
    }

    public updateTransform()
    {
        super.updateTransform();

        // Lerp the card's view rotation to its target rotation.
        this.rotation = lerp(this.rotation, this.tr, 0.1);
        // Lerp the card's view position to its target position if the card is being dragged.
        this.x = lerp(this.x, this.tx, this.dragForce * 0.15);
        this.y = lerp(this.y, this.ty, this.dragForce * 0.15);
        // Lerp the card's view scale to its target scale if the card is being dragged.
        const scaleDiff = (this.dragForce * (CardView.dragScale - this.originalScale));

        this.scale.set(lerp(this.scale.x, this.originalScale + scaleDiff, 0.15));
    }

    
    /**
     * Reset the card's view to it's original state.
     * @returns a promise which is fulfilled once the view's components have been reset.
     */
    public async reset()
    {
        const promises: Promise<void>[] = [
            resolveAndKillTweens(this),
            resolveAndKillTweens(this.animationContainer),
            resolveAndKillTweens(this.animationContainer.skew),
        ];

        this.animationContainer.skew.x = 0;
        this.animationContainer.skew.y = 0;
        this.animationContainer.x = this.base.width * 0.5;
        this.animationContainer.y = this.base.height * 0.5;
        this.stats.scale.x = 1;
        this.stats.scale.y = 1;

        return Promise.all(promises);
    }
}
