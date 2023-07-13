import {CardSkin} from '../../data/CardData';

export enum GameState
{
    WAITING = 'waiting',
    PAUSED = 'paused',
    RUNNING = 'running',
    COMPLETE = 'complete'
}

export enum ModelKeys {
    SETTINGS = 'settings',
    GAME = 'game',
}

export interface SolitaireState
{
    settings: {
        muted: boolean;
    };
    game: {
        cardSkin: CardSkin;
        state: GameState;
        score: number;
    };
}

export const state: SolitaireState = {
    [ModelKeys.SETTINGS]: {
        muted: false,
    },
    [ModelKeys.GAME]: {
        cardSkin: 'face-down-red',
        state: GameState.WAITING,
        score: 0,
    },
};
