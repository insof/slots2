let CURRENT_BALLANCE = 0;

export default class Balance extends PIXI.Sprite {
    constructor() {
        super();
        this.balance = 100;
        this.anchor.set(0.5);
        this.addBalanceText();
    }

    updateBalance(diff) {
        this.balance += diff;
        this.addBalanceText();
    }

    get balance() {
        return CURRENT_BALLANCE;
    }

    set balance(value) {
        CURRENT_BALLANCE = value;
        this.emit("balanceChange", this.balance);
    }

    addBalanceText() {
        let newText = 'Current balance: ' + this.balance + "$";
        if (this.balText) {
            this.balText.text = newText;
        } else {
            this.balText = new PIXI.Text(newText, {
                fill: 0xffffff,
                fontFamily: 'Arcade',
                fontSize: 44,
                fontWeight: 'bold',
            });
            this.balText.anchor.set(0.5);
            this.addChild(this.balText);
        }
    }
}