import {CardColor, CardSuit} from '../data/CardData';

/**
 * Map the numeric value of the card to its correspondent string value.
 * @param value - The numeric value of the card
 */
export function getCardId(value: number): string
{
    let id: string;

    switch (value)
    {
        case 1: id = 'A';
            break;
        case 11: id = 'J';
            break;
        case 12: id = 'Q';
            break;
        case 13: id = 'K';
            break;
    
        default: id = `${value}`;
            break;
    }

    return id;
}

/**
 * Maps the suit of the card to its correspondent color string value.
 * Clubs and Spades are black, Hearts and Diamonds are red.
 * @param value - The string value of the card color.
 */
export function getCardColor(suit: CardSuit): CardColor
{
    if (suit === 'clubs' || suit === 'spades') return 'black';

    return 'red';
}
