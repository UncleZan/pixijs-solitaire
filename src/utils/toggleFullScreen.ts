let isFullscreen = false;

/**
 * Requests to make the device go fullscreen
 * @remarks This only works for android devices
 */
export function toggleFullScreen(): void
{
    isFullscreen = !isFullscreen;
    if (isFullscreen)
    {
        const body = document.body as any;

        if (body.mozRequestFullScreen)
        {
            body.mozRequestFullScreen();
        }
        else if (body.webkitRequestFullScreen)
        {
            body.webkitRequestFullScreen();
        }
    }
    else document.exitFullscreen();
}
