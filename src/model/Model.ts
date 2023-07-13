import type {ModelKeys, SolitaireState} from './all/all-settings';
import {GameModel} from './all/GameModel';
import {SettingsModel} from './all/SettingsModel';

export abstract class BaseModel<T extends ModelKeys>
{
    public abstract name: string; // override this name for any unique model you have

    /**
     * Defines the base object for user state
     *
     * Override with your own implementation to customize what is persisted
     */
    public abstract getInitData(): SolitaireState[T];
    /**
     * Additional checks this model may perform before loading the state from storage
     */
    public abstract onLoad(state: SolitaireState[T]): SolitaireState[T];
    /**
     * Additional checks this model may perform before saving the state to storage
     */
    public abstract getPersistentData(): Partial<SolitaireState[T]>;
}

/**
 * A simple state manager
 */
export class ModelClass
{
    public readonly models = {
        settings: new SettingsModel(),
        game: new GameModel(),
    };

    public getModel<T extends BaseModel<ModelKeys>>(name: ModelKeys): T
    {
        return this.models[name] as unknown as T;
    }

    /**
     * A fresh representation of a user's state
     */
    public loadState()
    {
        const newState = {} as SolitaireState;

        for (const key in this.models)
        {
            const mk = key as ModelKeys;

            const storedEntry = JSON.parse(localStorage.getItem(mk) || '{}');
            const newEntry = this.models[mk].getInitData();
            const entry = {...newEntry, ...storedEntry};

            this.models[mk].onLoad(entry);
            newState[mk] = entry;
        }

        return Object.assign({}, newState);
    }

    /** Saves an object to storage, which will expire the next day. */
    public saveState()
    {
        for (const key in this.models)
        {
            const mk = key as ModelKeys;

            const persistentData = this.models[mk].getPersistentData();

            localStorage.setItem(mk, JSON.stringify(persistentData));
        }
    }
}

export const model = new ModelClass();
export const models = model.models;
