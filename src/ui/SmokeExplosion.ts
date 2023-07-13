
import {AnimatedSprite, Container, Texture} from 'pixi.js';

import {lerp} from '../utils/maths';

/** A class that generates smoke explosions.*/
export class SmokeExplosion
{
    /** The view of the smoke explosion. */
    public view = new Container();
    
    /** A flag that indicates whether the smoke explosion effect is currently active. */
    private playing = false;
    /** The texture of the smoke explosion effect. */
    private smokeSprite!: AnimatedSprite;
    /** Elapsed time since the smoke explosion started. */
    private tick = 0;
    /** The radius of the smoke explosion. */
    private radius = 80;

    constructor()
    {
        // Gather all the texture frames
        const frames: Texture[] = [];
        let d1 = 0;

        for (let i = 0; i < 24; i++)
        {
            const d2 = i % 10;

            if (i > 0 && d2 === 0) d1++;

            frames.push(Texture.from(`smoke-explosion-${d1}${d2}`));
        }
        // Prepare the animated sprite
        this.smokeSprite = new AnimatedSprite(frames);
        this.smokeSprite.anchor.set(0.5);
        this.smokeSprite.animationSpeed = 0.33;
        this.smokeSprite.scale.set(0);
        
        this.view.addChild(this.smokeSprite);
    }

    /**
     * Activates the smoke explosion effect.
     * @param x The x-coordinate of the smoke explosion's center.
     * @param y The y-coordinate of the smoke explosion's center.
     */
    public play(x: number, y: number)
    {
        this.reset();

        this.playing = true;

        this.smokeSprite.gotoAndPlay(0);
        // Set the center of the smoke explosion filter to the specified x and y coordinates
        this.smokeSprite.position.set(x, y);
    }

    /**
     * Stops the smoke explosion effect that is currently active.
     */
    public stop()
    {
        this.playing = false;

        // Reset the properties of the smoke explosion texture
        this.smokeSprite.scale.set(0);
        this.smokeSprite.alpha = 0.5;
        this.tick = 0;
    }
    
    /**
     * Called every frame.
     * The main update loop of the system, which maintains the smoke explosion effect in function of the time.
     * @param delta - The time elapsed since the last update.
     */
    public update(delta: number)
    {
        if (!this.playing) return;
        
        const sms = this.smokeSprite;

        // Stop the smoke explosion effect if the time has exceeded a certain threshold.
        if (sms.currentFrame === 23) this.stop();
        else
        {
            this.tick += ((delta / 60));

            // Update the smoke explosion scale and alpha over time
            sms.scale.set(lerp(sms.scale.x, (this.radius * 2) / sms.texture.width, this.tick));
            sms.alpha = lerp(sms.scale.x, 0.2, this.tick);
        }
    }

    /** Resets the state of the system back to its initial state. */
    public reset()
    {
        // End the smoke explosion animation
        this.stop();
    }
}