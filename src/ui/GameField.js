import Layout from "../utils/Layout";
import Tile from "../engine/Tile";
import Slots from "../engine/Slots";
import {Tween, Easing, autoPlay} from 'es6-tween';
import PlayButton from "./PlayButton";
import Balance from "../engine/Balance";
import Bet from "../engine/Bet";

import '../vendor/pixi-4.5.1.js';

class GameField extends PIXI.Sprite {

    constructor() {
        super();
        autoPlay(true);
        this.back = this.addChild(new PIXI.Sprite.from("back"));
        this.back.anchor.set(0.5);

        this.forceStop = false;

        this.slots = null;
        this.addSlots();

        this.betElement = null;
        this.addBetElement();

        this.balanceElement = null;
        this.addBalanceElement();

        this.playButton = null;
        this.addPlayButton();

        this.winText = null;
        this.addWinText();

        // ACTIVATION
        this.chargeSpin();

        this.shader = this.addChild(new PIXI.Graphics());
        this.shader.visible = false;
        this.shader.interactive = true;

        this.rotateImage = this.shader.addChild(new PIXI.Sprite.from("rotate"));
        this.rotateImage.anchor.set(0.5);

        this.onResize();

    }

    addBalanceElement() {
        this.balanceElement = this.addChild(new Balance());
        this.balanceElement.on("balanceChange", (newBalance) => {
                this.playButton.updateButton(newBalance, this.betElement.bet);
            }
        )
    }

    addWinText(value) {
        let newText = 'YOU WIN: ' + value + "$";
        if (this.winText) {
            this.winText.text = newText;
            this.winText.visible = true;
        } else {
            this.winText = new PIXI.Text(newText, {
                fill: "#ff0000",
                fontFamily: 'Arcade',
                fontSize: 100,
                fontWeight: 'bold',
            });
            this.winText.anchor.set(0.5);
            this.addChild(this.winText);
            this.winText.visible = false;
        }
    }

    addBetElement() {
        this.betElement = this.addChild(new Bet());
        this.betElement.on("betChange", (newBet) => {
                this.playButton.updateButton(this.balanceElement.balance, newBet);
            }
        )
    }

    addSlots() {
        let back = this.addChild(new PIXI.Sprite.from("reel"));
        back.anchor.set(0.5);

        let config = {
            background: back,
            margin: 2,
            preRollTiles: 0.5,
            postRollTiles: 0.5,
            xPeriod: 130,
            yPeriod: 130,
            rollEasing: false,
            // showMask: true, // shows masks
        };

        let elements = [
            Tile.create('sym1'),
            Tile.create('sym2'),
            Tile.create('sym3'),
            Tile.create('sym3'),
            Tile.create('sym4'),
            Tile.create('sym4'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym4'),
            Tile.create('sym4'),
            Tile.create('sym4'),
            Tile.create('sym4'),
            Tile.create('sym2'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym3'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym5'),
            Tile.create('sym5'),
            Tile.create('sym5'),
            Tile.create('sym2'),
            Tile.create('sym2'),
            Tile.create('sym1'),
            Tile.create('sym3'),
            Tile.create('sym5'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym1'),
            Tile.create('sym5'),
            Tile.create('sym5'),
            Tile.create('sym4'),
            Tile.create('sym3'),
            Tile.create('sym2'),
            Tile.create('sym1'),
            Tile.create('sym1')
        ];


        this.slots = this.addChild(Slots.fromObjects(elements, 1, config));

        // SIDE MARKERS

        let marker = new PIXI.Graphics()
            .beginFill(0xff5500)
            .drawRect(-20, -5, 40, 10)
            .endFill();
        marker = this.slots.addChild(marker.clone());
        marker.x -= 130;
        marker = this.slots.addChild(marker.clone());
        marker.x += 130;
    }

    addPlayButton() {
        this.playButton = this.addChild(new PlayButton(this.balanceElement.balance, this.betElement.bet));
        this.playButton.on("stopSpin", this.stopSpin, this);
    }

    stopSpin() {
        this.playButton.spinning = false;
        this.predictionText.text = "Unpredictable stop by user";
        this.forceStop = true;
        this.slots.doForceStop();
    }

    showMatch(data) {
        let row = [],
            type, tile,
            matchTiles = [],
            tempMatchTiles = [],
            i, j, tileType;

        for (let j = 0; j < 3; j++) {
            row.push(data.tilesMap[0][j]);
        }

        for (i = 0; i < row.length; i++) {
            type = row[i].type;
            tempMatchTiles = [];
            for (j = 0; j < row.length; j++) {
                tileType = row[j].type;
                if (type === tileType) {
                    tempMatchTiles.push(row[j]);
                }
            }
            if (tempMatchTiles.length >= 2) {
                matchTiles = tempMatchTiles;
            }
        }

        if (matchTiles.length >= row.length - 1) {
            let winAmmount = this.betElement.bet*matchTiles.length;
            this.addWinText(winAmmount);
            this.balanceElement.updateBalance(winAmmount);

            // MATCH ANIMATION
            for (let i = 0; i < matchTiles.length; i++) {
                tile = matchTiles[i];
                tile.showWinBack();
                tile.tween = new Tween(tile.winBack)
                    .to({alpha: 0.5}, 300)
                    .repeat(Infinity)
                    .easing(Easing.Elastic.InOut)
                    .yoyo(true)
                    .start();
            }
        } else {
            this.addWinText(0);
        }
    };

    balanceUpdate(value) {
        this.balanceElement.updateBalance(value);
    }

    chargeSpin() {
        this.forceStop = false;
        this.betElement.unblock();
        this.playButton.spinStoped();
        this.playButton.once("spin", this.spinRandom, this);
        this.playButton.once("balanceUpdate", this.balanceUpdate, this);
        this.slots.once('finish', this.showMatch, this);
        this.slots.once('finish', this.chargeSpin, this);
        this.slots.once('predictedResult', this.computePredictedResult, this);
    };

    computePredictedResult(data) {
        this.tempTiles = data.tilesMap;
        let row = [],
            type,
            matchTiles = [],
            tempMatchTiles = [],
            i, j, tileType;

        for (let j = 0; j < 3; j++) {
            row.push(data.tilesMap[0][j]);
        }

        console.log("predicted spin result = " + row);
        this.showPrediction(row);

        for (i = 0; i < row.length; i++) {
            type = row[i];
            tempMatchTiles = [];
            for (j = 0; j < row.length; j++) {
                tileType = row[j];
                if (type === tileType) {
                    tempMatchTiles.push(tileType);
                }
            }
            if (tempMatchTiles.length >= 2) {
                matchTiles = tempMatchTiles;
            }
        }

        if (matchTiles.length >= row.length - 1) {
            console.log("SPIN WILL BE WINNING! x" + matchTiles.length);
            console.log("predicted win result = " + matchTiles);
        }
    }

    showPrediction(arr) {
        let text = 'Predicted spin result = ' + arr.join(", ");
        if (this.predictionText) {
            this.predictionText.text = text;
        } else {
            this.predictionText = new PIXI.Text(text, {
                fill: 0xffffff,
                fontFamily: 'Arcade',
                fontSize: 45,
                fontWeight: 'bold',
            });
            this.predictionText.anchor.set(0.5);
            this.addChild(this.predictionText);
            this.predictionText.y = -430;
        }
    }

    spinRandom() {
        this.playButton.spinStarted();
        this.winText.visible = false;
        this.betElement.block();
        // STOP TWEENS
        this.slots.tilesMap.forEach(function (ree) {
            for (let i = 0; i < ree.length; i++) {
                if (ree[i].tween) {
                    ree[i].tween.stop();
                    ree[i].hideWinBack();
                    ree[i].tween = null;
                }
            }
        });

        let spinTiles = [100 + Math.random() * 19];

        this.slots.rollBy(spinTiles);
    };

    onResize() {
        if (Layout.orientation === Layout.LANDSCAPE) {
            this.shader.visible = false;
            if (this.predictionText) this.predictionText.visible = true;
            this.back.height = Layout.gameHeight;
            this.back.scale.x = this.back.scale.y;
            this.slots.position.set(0, -200);
            this.winText.position.set(0, 90);
            this.balanceElement.position.set(0, 170);
            this.playButton.position.set(0, 300);
            this.betElement.position.set(0, 420);
        } else {
            if (this.predictionText) this.predictionText.visible = false;
            this.shader.clear();
            this.shader.beginFill(0x555555, 1);
            this.shader.drawRect(-Layout.gameWidth / 2, -Layout.gameHeight / 2, Layout.gameWidth, Layout.gameHeight);
            this.shader.endFill();
            this.shader.visible = true;
        }
    }

    tick(delta) {
        if (this.slots && this.slots.tick) this.slots.tick(delta);
    }
}

export default GameField;