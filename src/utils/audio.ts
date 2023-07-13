import {PlayOptions, Sound, sound} from '@pixi/sound';

import {tween} from './tweens';

let enabled = false;
const aliasMap: Record<string, string> = {};

function getActualAlias(alias: string)
{
    const sounds = (sound as any)._sounds;
    let actualAlias = aliasMap[alias];

    if (!actualAlias)
    {
        for (const key in sounds)
        {
            if (key.includes(alias)) actualAlias = key;
        }
    }

    return actualAlias;
}

document.addEventListener('pointerdown', () =>
{
    enabled = true;
});

/**
 * Handles music background, playing onle one audio file in loop at time,
 * and fade/stop the music if a new one is requested. Also provide volume
 * control for music background only, leaving other sounds volumes unchanged.
 */
class BGM
{
    public currentAlias?: string;
    public current?: Sound;
    private volume = 1;

    /** Play a background music, fading out and stopping the previous, if there is one */
    public async play(alias: string, options?: PlayOptions)
    {
        // Do nothing if the requested music is already being played
        if (this.currentAlias === alias || !enabled) return;

        // Fade out then stop current music
        if (this.current)
        {
            const current = this.current;

            tween(current, {volume: 0, duration: 1, ease: 'linear'}).then(() =>
            {
                current.stop();
            });
        }

        // Find out the new instance to be played
        this.current = sound.find(getActualAlias(alias));

        // Play and fade in the new music
        this.currentAlias = alias;
        this.current.play({loop: true, ...options});
        this.current.volume = 0;
        tween(this.current, {volume: this.volume, duration: 1, ease: 'linear'});
    }

    /** Get background music volume */
    public getVolume()
    {
        return this.volume;
    }

    /** Set background music volume */
    public setVolume(v: number)
    {
        this.volume = v;
        if (this.current) this.current.volume = this.volume;
    }
}

/**
 * Handles short sound special effects, mainly for having its own volume settings.
 * The volume control is only a workaround to make it work only with this type of sound,
 * with a limitation of not controlling volume of currently playing instances - only the new ones will
 * have their volume changed. But because most of sound effects are short sounds, this is generally fine.
 */
class SFX
{
    private volume = 1;

    /** Play an one-shot sound effect */
    public play(alias: string, options?: PlayOptions)
    {
        if (!enabled) return;
        
        const volume = this.volume * (options?.volume ?? 1);
        
        sound.play(getActualAlias(alias), {...options, volume});
    }

    /** Set sound effects volume */
    public getVolume()
    {
        return this.volume;
    }

    /** Set sound effects volume. Does not affect instances that are currently playing */
    public setVolume(v: number)
    {
        this.volume = v;
    }
}

/** Get overall sound volume */
export function getMasterVolume()
{
    return sound.volumeAll;
}

/** Set the overall sound volume, affecting all music and sound effects */
export function setMasterVolume(v: number)
{
    sound.volumeAll = v;
    if (!v)
    {
        sound.muteAll();
    }
    else
    {
        sound.unmuteAll();
    }
}
/** Shared background music controller */
export const bgm = new BGM();

/** Shared sound effects controller */
export const sfx = new SFX();
