import {setMasterVolume} from '../../utils/audio';
import type {BaseModel} from '../Model';
import {ModelKeys, SolitaireState, state} from './all-settings';

type SolitaireSettings = SolitaireState['settings'];

export class SettingsModel implements BaseModel<ModelKeys.SETTINGS>
{
    public name = ModelKeys.SETTINGS;
    private _data: SolitaireSettings;

    constructor()
    {
        this._data = this.getInitData();
    }

    public get muted(): boolean
    {
        return this._data.muted;
    }

    public set muted(v: boolean)
    {
        if (v !== this._data.muted)
        {
            this._data.muted = v;
            setMasterVolume(v ? 0 : 1);
            this._saveModel();
        }
    }

    private _saveModel()
    {
        localStorage.setItem(this.name, JSON.stringify(this.getPersistentData()));
    }

    public getInitData(): SolitaireSettings
    {
        return Object.assign({}, state.settings);
    }

    public onLoad(state: SolitaireSettings): SolitaireSettings
    {
        this._data = Object.assign({}, state);

        setMasterVolume(this._data.muted ? 0 : 1);

        return this._data;
    }

    public getPersistentData(): Partial<SolitaireSettings>
    {
        return {
            muted: this.muted,
        };
    }
}
