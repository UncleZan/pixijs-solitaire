import {Container} from 'pixi.js';
import {Signal} from 'typed-signals';

import {models} from '../model/Model';
import {navigation} from '../navigation';
import {HomeScreen} from '../screens/HomeScreen';
import {CardButton} from '../ui/buttons/CardButton';
import {CardTag} from '../ui/CardTag';
import {SettingsButtons} from '../ui/SettingsButtons';
import {sfx} from '../utils/audio';
import {i18n} from '../utils/i18n';
import {isMobile} from '../utils/isMobile';
import {orientation} from '../utils/orientation';
import {tween} from '../utils/tweens';
import {table} from './Table';
import {Timer} from './Timer';

export class Hud extends Container
{
    public topContainer = new Container();
    public settingsButtons: SettingsButtons;
    public onResetTapSignal = new Signal();
    public onUndoTapSignal = new Signal();
    public timer = new Timer();
    public enabled = false;

    private padding = 20;
    private time: CardTag;
    private score: CardTag;
    private moves: CardTag;
    private resetBtn: CardButton;
    private quitBtn: CardButton;
    private undoBtn: CardButton;
    private buttons:CardButton[] = [];

    constructor()
    {
        super();

        this.padding = 20;

        this.time = new CardTag(i18n.ucTime);
        this.time.scale.set(0.5);
        
        this.score = new CardTag(i18n.ucScore);
        this.score.scale.set(0.5);
        this.score.x = this.time.width + this.padding;
        
        this.moves = new CardTag(i18n.ucMoves);
        this.moves.scale.set(0.5);
        this.moves.x = this.score.x + this.score.width + this.padding;
        
        this.resetBtn = new CardButton({defaultView: 'face-down-green', label: i18n.ucNew});
        this.resetBtn.scale.set(0.5);
        this.resetBtn.x = this.moves.x + this.moves.width + this.padding;
        this.resetBtn.y = -(this.resetBtn.height - this.moves.height) * 0.5;
        this.resetBtn.on('pointertap', this.onResetTap.bind(this));
        
        this.quitBtn = new CardButton({defaultView: 'face-down-red', label: i18n.ucQuit});
        this.quitBtn.scale.set(0.5);
        this.quitBtn.x = this.resetBtn.x + this.resetBtn.width + this.padding;
        this.quitBtn.y = -(this.quitBtn.height - this.moves.height) * 0.5;
        this.quitBtn.on('pointertap', this.onQuitTap.bind(this));
        
        this.undoBtn = new CardButton({label: i18n.ucUndo, textOffset: {y: -160}});
        this.undoBtn.scale.set(0.3);
        this.undoBtn.on('pointertap', this.onUndoTap.bind(this));

        this.buttons.push(this.resetBtn, this.quitBtn, this.undoBtn);
        this.buttons.forEach((btn) =>
        {
            const reverse = btn === this.undoBtn;

            btn.on('pointertap', this.onButtonTap.bind(this, btn, reverse));
            btn.on('mouseover', this.onButtonOver.bind(this, btn, reverse));
            btn.on('mouseleave', this.onButtonOut.bind(this, btn));
        });

        this.settingsButtons = new SettingsButtons();

        this.topContainer.addChild(this.time, this.score, this.moves, this.resetBtn, this.quitBtn);
        this.addChild(this.topContainer, this.settingsButtons.view, this.undoBtn);
    }

    public updateTransform()
    {
        super.updateTransform();

        this.score.value = models.game.score;
        this.timer.update();
        this.time.value = Math.floor(this.timer.getTime() / 1000);
    }

    public incrementMove()
    {
        this.moves.value++;
    }

    public incrementScore(score: number)
    {
        this.score.value += score;
    }

    private onButtonTap(btn: CardButton, reverse = false)
    {
        sfx.play('card-flip', {volume: 0.5});
        if (isMobile()) this.onButtonOver(btn, reverse).then(() => this.onButtonOut(btn));
        else this.onButtonOut(btn).then(() => this.onButtonOver(btn, reverse));
    }

    private onButtonOver(btn: CardButton, reverse = false)
    {
        const y = reverse ? 30 : -30;

        return tween(btn.pivot, {duration: 0.1, y});
    }

    private onButtonOut(btn: CardButton)
    {
        return tween(btn.pivot, {duration: 0.1, y: 0});
    }

    private onQuitTap()
    {
        navigation.showScreen(HomeScreen);
    }

    private onResetTap()
    {
        if (!this.enabled) return;
        sfx.play('deck-shuffle');
        
        this.enabled = false;
        this.onResetTapSignal.emit();
    }

    private onUndoTap()
    {
        if (!this.enabled) return;

        this.onUndoTapSignal.emit();
    }

    public reset()
    {
        this.time.value = 0;
        models.game.score = 0;
        this.moves.value = 0;
        this.timer.reset();
    }


    public resize(w: number, h: number)
    {
        const topBarWidth = table.topBarWidth;

        this.topContainer.width = topBarWidth * 0.95;
        this.topContainer.scale.y = this.topContainer.scale.x;
        this.topContainer.x = w - topBarWidth + ((topBarWidth - this.topContainer.width) * 0.5);
        this.topContainer.y = -5;

        const isPortrait = orientation === 'portrait';
        const sbv = this.settingsButtons.view;

        this.undoBtn.scale.set(0.5 * this.topContainer.scale.x);
        if (isPortrait)
        {
            this.undoBtn.x = w - this.undoBtn.width - 10;

            const suitsHeight = table.suitsHeight;
            
            sbv.width = suitsHeight * 0.9;
            sbv.scale.y = sbv.scale.x;
            sbv.x = 5;
            sbv.y = table.topBarHeight + (suitsHeight * 0.5) + (sbv.width * 0.5);
            sbv.rotation = -Math.PI * 0.5;
        }
        else
        {
            const deckWidth = table.deckWidth;

            this.undoBtn.x = (deckWidth * 0.5) - (this.undoBtn.width * 0.5);

            sbv.width = deckWidth * 0.9;
            sbv.scale.y = sbv.scale.x;
            sbv.x = (deckWidth - sbv.width) * 0.5;
            sbv.y = 0;
            sbv.rotation = 0;
        }

        this.undoBtn.y = h + (this.undoBtn.height * 0.25);
        

        this.settingsButtons.orientation = orientation;
        this.settingsButtons.resizeButtonIcons();
    }
}
