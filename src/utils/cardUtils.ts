import { CardColor as CardColour, CardSuit } from "../data/CardData";

/**
 * Map the numeric value of the card to its correspondent string value. 
 * @param value - The numeric value of the card 
 */
export function getCardId(value: number): string
{
    let id: string;

    switch (value) {
        case 11: id = 'J'; 
            break;
        case 12: id = 'Q'; 
            break;
        case 13: id = 'K'; 
            break;
    
        default: id = `${value}`
            break;
    }

    return id;
}

/**
 * Map the suit of the card to its correspondent colour string value. 
 * @param value - The string value of the card colour 
 */
export function getCardColour(suit: CardSuit): CardColour
{
    if (suit === 'clubs' || suit === 'spades') return 'black';
    else return 'red';
}