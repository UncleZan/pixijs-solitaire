import {IGenerateTextureOptions, IRenderableObject, MSAA_QUALITY, RenderTexture} from 'pixi.js';

import {app} from '../main';

export function generateTexture(container: IRenderableObject, options?: IGenerateTextureOptions): RenderTexture
{
    return app.renderer.generateTexture(container, {scaleMode: 1, resolution: 2,
        multisample: MSAA_QUALITY.MEDIUM, ...options});
}