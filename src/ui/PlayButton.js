export default class PlayButton extends PIXI.Sprite {
    constructor(balance, bet) {
        super();
        this.interactive = true;
        this.buttonMode = true;
        this.anchor.set(0.5);
        this.activeTexture = new PIXI.Texture.from("play");
        this.inactiveTexture = new PIXI.Texture.from("play_disabled");
        this.active = false;
        this.spinning = false;

        this.updateButton(balance, bet);

        this.on("pointerdown", this.onAction, this);
    }

    updateButton(balance, bet) {
        this.currentBet = bet;
        if ((balance - bet) >= 0) {
            this.texture = this.activeTexture;
            this.active = true;
        } else {
            this.texture = this.inactiveTexture;
            this.active = false;
        }
    }

    onAction() {
        if (this.spinning) this.emit("stopSpin");
        if (!this.active) return;
        this.emit("spin");
        this.emit("balanceUpdate", -this.currentBet);
    }

    spinStarted() {
        this.spinning = true;
    }

    spinStoped() {
        this.spinning = false;
    }
}