import { Container, Graphics } from "pixi.js";
import { Signal } from "typed-signals";
import { CardButton } from "./CardButton";
import { CardTag } from "./CardTag";
import { Deck } from "./Deck";
import { Timer } from "./Timer";

export class Hud extends Container {

    public topContainer = new Container();
    public onResetTapSignal = new Signal();

    private timer = new Timer();
    private deckInteractionArea = new Graphics();
    private deck: Deck;
    private time: CardTag;
    private score: CardTag;
    private moves: CardTag;
    private newBtn: CardButton;
    private quitBtn: CardButton;

    constructor(deck: Deck)
    {
        super();

        this.deck = deck;

        // Setting the alpha value to a small value (0.001) allows us to interact 
        // with the graphic object but it will hide it from the scene.
        this.deckInteractionArea.beginFill(0xFFFFFF, 0.001)
            .drawRect(0, 0, 1, 1);
        this.deckInteractionArea.cursor = 'pointer';
        this.deckInteractionArea.interactive = true;

        // Add interactions
        this.deckInteractionArea.on('pointertap', deck.tap.bind(deck));

        this.time = new CardTag('TIME');
        this.time.scale.set(0.5);
        this.score = new CardTag('SCORE');
        this.score.scale.set(0.5);
        this.score.x = this.time.width + 20;
        this.moves = new CardTag('MOVES');
        this.moves.scale.set(0.5);
        this.moves.x = this.score.x + this.score.width + 20;
        this.newBtn = new CardButton('NEW', 'card-back-green-shadow');
        this.newBtn.scale.set(0.5);
        this.newBtn.x = this.moves.x + this.moves.width + 10;
        this.newBtn.on('pointertap', this.onResetTap.bind(this));
        this.quitBtn = new CardButton('QUIT', 'card-back-red-shadow');
        this.quitBtn.scale.set(0.5);
        this.quitBtn.x = this.newBtn.x + this.newBtn.width;
        
        this.topContainer.addChild(this.time, this.score, this.moves, this.newBtn, this.quitBtn);
        this.addChild(this.deckInteractionArea, this.topContainer);
    }

    public updateTransform() 
    {
        super.updateTransform();

        this.timer.update();
        this.time.value = Math.floor(this.timer.getTime() / 1000);
    }

    public setTopWidth(width: number)
    {
        this.topContainer.width = width;
        this.topContainer.scale.y = this.topContainer.scale.x;
    }

    public incrementMove()
    {
        this.moves.value++;
    }

    public incrementScore(score: number)
    {
        this.score.value += score;
    }

    private onResetTap()
    {
        this.interactiveChildren = false;
        this.onResetTapSignal.emit();
    }

    public reset()
    {
        this.time.value = 0;
        this.score.value = 0;
        this.moves.value = 0;
        this.timer.reset();
        this.timer.start();
        this.interactiveChildren = true;
    }

    public resize(w: number, _h: number)
    {
        const deck = this.deck;
        const tray = deck.deckTray;

        this.deckInteractionArea.position.set(this.deck.view.x, this.deck.view.y);
        this.deckInteractionArea.scale.set(tray.width * deck.view.scale.x, tray.height * deck.view.scale.y);
        this.topContainer.x = w - this.topContainer.width;
    }
}
