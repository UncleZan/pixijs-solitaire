import {Container} from 'pixi.js';

import {GameState} from '../model/all/all-settings';
import {models} from '../model/Model';
import {EndgameCelebration} from '../ui/EndgameCelebration';
import {SmokeExplosion} from '../ui/SmokeExplosion';
import {getUrlParam} from '../utils/getUrlParams';
import {Deck} from './Deck';
import {GameCards} from './GameCards';
import {GameInteractions} from './GameInteractions';
import {GameStacks} from './GameStacks';
import {Hud} from './Hud';
import {SuitStacks} from './SuitStacks';
import {prepareTable, table} from './Table';

export class Game
{
    /** The root view of the class. */
    public view = new Container();
    /** The deck containing all the cards in the game. */
    public deck!: Deck;
    public gameStacks!: GameStacks;
    public suitsStacks!: SuitStacks;
    public hud!: Hud;
    public smokeExplosion!: SmokeExplosion;
    
    /** All the cards in the game. */
    private gameCards!: GameCards;
    /** The view containing all the elements of the game. */
    private bottomLayer = new Container();
    /** The view containing all high level UI elements such as HUD and the deck interaction area. */
    private topLayer = new Container();
    private width!: number;
    private height!: number;
    private inited = false;
    private endGameCelebration!: EndgameCelebration;
    private interactions!: GameInteractions;

    public async init()
    {
        this.inited = true;
        prepareTable();
        
        this.gameCards = new GameCards(this);
        // Assign a copy of the cards list to the deck
        this.deck = new Deck(this.gameCards.cards.slice());

        this.gameStacks = new GameStacks(this);
        this.suitsStacks = new SuitStacks();
        this.interactions = new GameInteractions(this, this.gameCards.cards);
        
        this.hud = new Hud();
        this.hud.onResetTapSignal.connect(this.reset.bind(this));

        this.smokeExplosion = new SmokeExplosion();
        this.endGameCelebration = new EndgameCelebration(this.gameCards.cards);

        // Add all the components' views
        this.bottomLayer.addChild(table.view, this.deck.view, this.gameStacks.view, this.suitsStacks.view,
            this.smokeExplosion.view, this.endGameCelebration.view, this.gameCards.view);
        this.topLayer.addChild(this.deck.interactionArea, this.hud);
        this.view.addChild(this.bottomLayer, this.topLayer);

        this.resize(this.width, this.height);
        this.startGame();
    }

    private async startGame()
    {
        this.deck.shuffle();
        this.hud.reset();
        
        if (getUrlParam('gameEnd') !== null) this.gameCards.debugCompleteGame();
        else await this.gameStacks.populate();
        
        this.hud.timer.start();
        models.game.state = GameState.RUNNING;
    }

    public update(delta: number)
    {
        this.deck.update();
        this.bottomLayer.interactiveChildren = models.game.isRunning;
        this.hud.enabled = models.game.isRunning;

        this.smokeExplosion.update(delta);
        this.endGameCelebration.update(delta);
        
        const complete = this.suitsStacks.completed();
        const alreadyComplete = models.game.state === GameState.COMPLETE;

        if (complete && !alreadyComplete)
        {
            models.game.state = GameState.COMPLETE;
            this.endGameCelebration.play();
        }
    }

    public async reset()
    {
        models.game.state = GameState.WAITING;
        
        this.endGameCelebration.reset();
        this.hud.reset();
        this.gameStacks.reset();
        this.suitsStacks.reset();
        this.deck.reset();

        await this.gameCards.reset();

        this.deck.shuffle();

        await this.gameStacks.populate();

        this.hud.timer.start();
        models.game.state = GameState.RUNNING;
    }

    public resize(w: number, h: number)
    {
        this.width = w;
        this.height = h;
        if (!this.inited) return;
        
        table.resize(w, h);
        this.hud.resize(w, h);
        
        this.endGameCelebration.resize(w);
        this.deck.resize();
        this.gameStacks.resize();
        this.suitsStacks.resize();
    }
}