import { Container, Sprite, Text, Texture } from 'pixi.js';
import { CardSuit } from '../data/CardData';
import { getCardColour, getCardId } from '../utils/cardUtils';

type CardSkin = 'black' | 'blue' | 'green' | 'red';

/**
 * A wrapper for the visual elements of a card. 
 * Each card in the game consists in a card base, a symbol, a value and an icon. 
 */
export class CardView extends Container {
        
    private readonly stats = new Container();
    private readonly base: Sprite;
    private symbol: Sprite;
    private icon: Sprite;
    private value: Text;
    private skin: CardSkin;
    
    constructor(suit: CardSuit, value: number, skin: CardSkin = 'black') {
        super();

        this.base = Sprite.from(`card-back-${skin}-shadow`);
        this.skin = skin;

        const colour = getCardColour(suit);
        const id = getCardId(value);
        let symbol: string = suit;

        if (value > 10) symbol = `${id.toLowerCase()}-${colour}`;

        this.symbol = Sprite.from(symbol);
        this.symbol.anchor.set(0.5);
        this.symbol.x = this.base.width * 0.5;
        this.symbol.y = this.base.height * 0.5 + 1 + (39 * Number(value <= 10));

        const paddingTop = 40;
        const paddingSide = 60;

        this.icon = Sprite.from(suit);
        this.icon.scale.set(0.4);
        this.icon.x = this.base.width - this.icon.width - paddingSide;
        this.icon.y = paddingTop;

        this.value = new Text(id, { fill: colour, fontWeight: 'bolder' });
        this.value.scale.set(this.icon.height / this.value.height);
        this.value.x = paddingSide + (this.icon.width * 0.5) - (this.value.width * 0.5);
        this.value.y = paddingTop;

        this.stats.visible = false;

        this.stats.addChild(this.value, this.icon, this.symbol);
        this.addChild(this.base, this.stats);
    }

    public showFront(): void 
    {
        this.base.texture = Texture.from('card-front-shadow');
        this.stats.visible = true;
    }

    public showBack(): void 
    {
        this.base.texture = Texture.from(`card-back-${this.skin}-shadow`);
        this.stats.visible = false;
    }
}
