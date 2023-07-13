# PixiJS Solitaire

-   Clone https://github.com/pixijs/assetpack to your machine
-   On assetpack: switch to compression branch
-   On assetpack: npm install and npm run build
-   On your project folder, run npm install ../assetpack
-   Go back assetpack: run npm link from inside of each folder in packages folder
    -   cd packages/webfont then npm link
    -   cd packages/core then npm link
    -   cd packages/compress then npm link
    -   cd packages/ffmpeg then npm link
    -   cd packages/json then npm link
    -   cd packages/mipmap then npm link
    -   cd packages/texture-packer then npm link
-   Move back to your project folder and run this (only works altogether):
    npm link @assetpack/plugin-webfont @assetpack/core @assetpack/plugin-compress @assetpack/plugin-ffmpeg @assetpack/plugin-json @assetpack/plugin-mipmap @assetpack/plugin-texture-packer
