/**
 * Randomly shuffle an array so that each element ends up in a new position.
 * @param arr - The array to be shuffled.
 * @returns
 */
export function sattoloCycle<T>(arr: T[]): T[]
{
    for (let i = arr.length; i-- > 1;)
    {
        const j = Math.floor(Math.random() * i);
        const tmp = arr[i];

        arr[i] = arr[j];
        arr[j] = tmp;
    }

    return arr;
}
