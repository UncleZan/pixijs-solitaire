import {Signal} from 'typed-signals';

export type Orientation = 'landscape'|'portrait'

export let orientation: Orientation = 'portrait';

export const onOrientationChange = new Signal<(orientation: Orientation) => void>();

export function setOrientation(_orientation: Orientation)
{
    if (_orientation !== orientation)
    {
        orientation = _orientation;
        onOrientationChange.emit(orientation);
    }
}