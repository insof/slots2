export default class Bet extends PIXI.Sprite {
    constructor() {
        super();
        this.anchor.set(0.5);

        this.bet = 1;
        this.blocked = false;
        this.addBetText();

        this.plus = this.addChild(new PIXI.Sprite.from("plus"));
        this.plus.scale.set(0.4);
        this.plus.anchor.set(0.5);
        this.plus.x = 200;
        this.plus.interactive = true;
        this.plus.buttonMode = true;
        this.plus.on("pointerdown", this.increaseBet, this);

        this.minus = this.addChild(new PIXI.Sprite.from("minus"));
        this.minus.scale.set(0.4);
        this.minus.anchor.set(0.5);
        this.minus.x = -200;
        this.minus.interactive = true;
        this.minus.buttonMode = true;
        this.minus.on("pointerdown", this.decreaseBet, this);
    }

    set bet(value) {
        this.betPrice = value;
        this.emit("betChange", this.bet);
        this.addBetText();
    }

    get bet() {
        return this.betPrice;
    }

    increaseBet() {
        if(this.blocked) return;
        this.bet = this.bet + 1;
    }

    decreaseBet() {
        if(this.blocked) return;
        if ((this.bet - 1) > 0) this.bet = this.bet - 1;
    }

    addBetText() {
        let newText = 'Current bet: ' + this.bet + "$";
        if (this.betText) {
            this.betText.text = newText;
        } else {
            this.betText = new PIXI.Text(newText, {
                fill: 0xffffff,
                fontFamily: 'Arcade',
                fontSize: 36,
                fontWeight: 'bold',
            });
            this.betText.anchor.set(0.5);
            this.addChild(this.betText);
        }
    }

    block() {
        this.blocked = true;
    }

    unblock() {
        this.blocked = false;
    }
}