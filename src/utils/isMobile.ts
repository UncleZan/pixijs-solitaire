export function isMobile()
{
    return 'ontouchstart' in document.documentElement;
}