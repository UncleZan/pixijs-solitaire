// Whether the card is still in the deck, on the dealt tray, being moved to a pile or to a stack.
export type CardState = 'undealt' | 'dealt' | 'piled' | 'stacked';

export type CardColor = 'red' | 'black';

export type CardSuit = 'clubs' | 'spades' | 'hearts' | 'diamonds';

export const cardSuits: CardSuit[] = ['hearts', 'spades', 'diamonds', 'clubs'];

export const NUMBER_OF_STACKS = 7;
export const NUMBER_OF_CARDS = 52;
export const SUITS_OF_CARDS = 4;


export const MIN_CARD_WIDTH = 54;
export const MAX_CARD_WIDTH = 100;