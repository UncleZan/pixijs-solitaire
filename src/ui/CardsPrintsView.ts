
import {Container, Graphics, IRenderableObject, Point, Sprite, Texture} from 'pixi.js';

import {generateTexture} from '../utils/generateTexture';


/** A class that generates a texture from a given object and it prints on the screen at the provided position.*/
export class CardsPrintsView extends Container
{
    public view = new Container();
    
    /** The texture to print on the screen. */
    private printTexture: Texture = Texture.WHITE;
    /** A mask used to draw a shape on the screen. */
    private printMask = new Graphics();
    /** Elapsed time since the last print occurred. */
    private lastPrint = 0;
    /** How frequent the print texture is printed on the screen. */
    private frequency = 0.1;
    /** The maximum amount of sprite that can be printed on the screen. */
    // private maxPrints = 60;
    /** The scale of the object to print on the screen. */
    private targetScale = new Point();

    constructor()
    {
        super();

        this.printMask.beginFill(0xFFFFFF).drawRect(0, 0, 1, 1);
        this.view.mask = this.printMask;
        
        this.view.addChild(this.printMask);
        this.addChild(this.view);
    }

    /**
     * Activates the smoke explosion effect.
     * @param x The x-coordinate of the smoke explosion's center.
     * @param y The y-coordinate of the smoke explosion's center.
     */
    public setTexture(target: IRenderableObject)
    {
        this.printTexture = generateTexture(target);
        this.targetScale.copyFrom(target.transform.scale);
    }


    /**
     * Prints the print texture on the screen.
     */
    public print(x = 0, y = x)
    {
        if (!this.printMask.containsPoint({x, y})) return;
        
        const now = performance.now() / 1000;
        const elapsed = now - this.lastPrint;

        
        // Check if it's time to print
        if (elapsed >= this.frequency)
        {
            const sprite = Sprite.from(this.printTexture);
    
            sprite.scale.set(this.targetScale.x);
            sprite.anchor.set(0.5);
            sprite.position.set(x, y);
    
            this.view.addChild(sprite);
            this.lastPrint = now;
        }
    }
    
    /** Resets the state of the system back to its initial state. */
    public reset()
    {
        this.lastPrint = 0;
        if (this.view.children.length > 1)
        {
            this.view.removeChildren(1).forEach(child => child.destroy());
        }
    }

    public setPrintArea(x: number, y: number, w: number, h: number)
    {
        this.printMask.position.set(x, y);
        this.printMask.scale.set(w, h);
    }
}