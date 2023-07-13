import gsap from 'gsap';

let killAllTweens = true;

/**
 * Safely kill tweens without breaking their promises. It seems that in gsap,
 * if you kill a tween, its promises hangs forever, without either resolve or reject
 * @param targets - The tween targets that must have related tweens killed
 */
export async function resolveAndKillTweens(targets: gsap.TweenTarget)
{
    const tweens = gsap.getTweensOf(targets);

    for (const tween of tweens)
    {
        // Force resolve tween promise, if exists
        if ((tween as any)._prom) await (tween as any)._prom();
    }
    gsap.killTweensOf(targets);
}


/**
 * Extends the base tween function from gsap and wait any existing tween of the targets to be
 * resolved and "killed" if instructed to do so.
 * @param targets - The target of the Tween.
 * @param targets - The options of the Tween.
 * @returns A Promise incapsulating the instance of the Tween.
 */
export async function tween(targets: GSAPTweenTarget, vars: PIXITweenVars): Promise<GSAPTween>
{
    if (vars.kill || killAllTweens) await resolveAndKillTweens(targets);

    return gsap.to(targets, vars);
}

/**
 * Setter for the global property killAllTweens.
 * @param targets - Whether or not the tween function should kill al tweens.
 */
export function setKillAllTweens(v: boolean)
{
    killAllTweens = v;
}