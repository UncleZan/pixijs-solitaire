import { AssetPack } from '@assetpack/core';
import { webfont } from '@assetpack/plugin-webfont';
import { compressJpg, compressPng } from '@assetpack/plugin-compress';
import { audio } from '@assetpack/plugin-ffmpeg';
import { json } from '@assetpack/plugin-json';
import { pixiTexturePacker } from '@assetpack/plugin-texture-packer';

const assetpack = new AssetPack({
    entry: './raw-assets',
    output: './public/assets',
    plugins: {
        webfont: webfont(),
        compressJpg: compressJpg(),
        compressPng: compressPng(),
        audio: audio(),
        json: json(),
        texture: pixiTexturePacker({
            resolutionOptions: {
                template: '',
                resolutions: { default: 1 },
            },
            texturePacker: {
                removeFileExtension: true
            }
        }),
    },
});

assetpack.run();
