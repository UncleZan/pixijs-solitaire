import {CardSkin} from '../../data/CardData';
import type {BaseModel} from '../Model';
import {GameState, ModelKeys, SolitaireState, state} from './all-settings';

type GameSettings = SolitaireState['game'];

export class GameModel implements BaseModel<ModelKeys.GAME>
{
    public name = ModelKeys.SETTINGS;
    private _data: GameSettings;

    constructor()
    {
        this._data = this.getInitData();
    }

    public get isRunning(): boolean
    {
        return this.state === GameState.RUNNING;
    }

    public get state(): GameState
    {
        return this._data.state;
    }

    public set state(v: GameState)
    {
        this._data.state = v;
    }

    public get score(): number
    {
        return this._data.score;
    }

    public set score(v: number)
    {
        this._data.score = v;
    }

    public get cardSkin(): CardSkin
    {
        return this._data.cardSkin;
    }

    public set cardSkin(v: CardSkin)
    {
        if (v !== this._data.cardSkin)
        {
            this._data.cardSkin = v;
        }
    }

    public getInitData(): GameSettings
    {
        return Object.assign({}, state.game);
    }

    public onLoad(state: GameSettings): GameSettings
    {
        this._data = Object.assign({}, state);

        return this._data;
    }

    public getPersistentData(): Partial<GameSettings>
    {
        return {
        };
    }
}
