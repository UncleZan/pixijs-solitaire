import {Bounds} from 'pixi.js';

import {lerp} from './maths';

export class Bouncer extends Bounds
{
    public x = 0;
    public tx = 0;
    public ax = 0;
    public tax = 5;
    public dx = 0;
    public dampX = 0.3;
    public bouncesX = 0;

    public y = 0;
    public ty = 0;
    public ay = -5;
    public tay = 0.1;
    public dy = 0;
    public tdy = -3.5;
    public dampY = 1;

    public bounciness = 0.9;

    public update(delta: number)
    {
        this.ax = lerp(this.ax, this.tax, delta * this.dampX);
        this.dx += this.ax * delta;
        this.x += this.ax * delta;
        
        const bounceRight = this.x >= this.maxX && this.ax > 0;
        const bounceLeft = this.x <= this.minX && this.ax < 0;

        if (bounceRight || bounceLeft)
        {
            this.tax *= -1;
            this.ax *= -1;
            this.bouncesX++;
        }
        
        this.ay = lerp(this.ay, this.tay, 0.5);
        this.dy += this.ay * delta;
        this.y += this.dy;
        
        if (this.y >= this.maxY)
        {
            this.dy = Math.min(this.dy * -this.bounciness, this.tdy);
            this.y = this.maxY;
        }
    }

    public reset()
    {
        this.ax = 0;
        this.x = 0;
        this.dx = 0;
        this.tx = 0;

        this.ay = -5;
        this.y = 0;
        this.dy = 0;
        this.ty = 0;

        this.bouncesX = 0;
    }
}
