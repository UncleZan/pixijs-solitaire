// Whether the card is still in the deck, on the dealt tray, being moved to a suit stack or to a game stack.
export type CardState = 'undealt' | 'dealt' | 'played' | 'placed';
// The id of the back-texture of the cards.
export type CardSkin = 'face-down-red' | 'face-down-blue' | 'face-down-green' | 'face-down-black';
// The color of the card.
export type CardColor = 'red' | 'black';
// The suit of the card.
export type CardSuit = 'clubs' | 'spades' | 'hearts' | 'diamonds';
// A litst of possible suits, handy to loop through.
export const cardSuits: CardSuit[] = ['hearts', 'spades', 'diamonds', 'clubs'];
// How many game stack are in the game.
export const NUMBER_OF_STACKS = 7;
// How many cards are in the deck.
export const NUMBER_OF_CARDS = 52;
// How many suits are in a deck of cards.
export const NUMBER_OF_SUITS = 4;
// The score assigned for placing an Ace to a suit stack.
export const ACE_PLACE_SCORE = 15;
// The score assigned for placing any other card to a suit stack.
export const CARD_PLACE_SCORE = 5;
// The score assigned for playing a card to a game stack.
export const CARD_PLAY_SCORE = 5;