import { Container, NineSlicePlane, Texture } from 'pixi.js';

export class RoundedRectangle extends Container {
    private image: NineSlicePlane;

    constructor() {
        super();
        this.image = new NineSlicePlane(Texture.from('rounded-rectangle'), 32, 32, 32, 46);
        this.addChild(this.image);
    }

    public get tint() {
        return this.image.tint;
    }
}
