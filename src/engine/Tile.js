export default class Tile extends PIXI.Container {
    constructor(regular, type) {
        super();

        this.parts = {//parts needed for other tiles stateds, like blured
            regular: null
        };

        this.winBack = this.addChild(new PIXI.Sprite.from("win_bg"));
        this.winBack.anchor.set(0.5);
        this.hideWinBack();

        this.type = type;

        this.zIndex = 100;

        if (regular) {
            this.parts.regular = this.addChild(regular);
        }
    }

    static create(frameRegular) {

        let regular = frameRegular ? new PIXI.Sprite.from(frameRegular) : null;
        regular.anchor.set(0.5);

        return new Tile(regular, frameRegular);
    };

    showWinBack() {
        this.winBack.visible = true;
    }

    hideWinBack() {
        this.winBack.visible = false;
    }
};