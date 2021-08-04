const { v4: uuid } = require('uuid');
const Settings = require("./Settings")
const { CardTypes } = require('../cards');
const { GameStates } = require('../enums');
const { HttpError } = require('../errors');
const Deck = require('./Deck');

class Game {
    constructor(owner, token = uuid(), players = [], settings = {}) {
        this.token = token;
        this.players = [];
        this.owner = owner;
        this.state = GameStates.JOINING;
        this.currentPlayer = 1;
        this.directionIsFlipped = false;
        this.tally = 0;
        this.settings = new Settings(settings.playRules, settings.deckRules);
        this.deck = new Deck(this.settings.createDeck());
        players.forEach(player => this.addPlayer(player));
        this.playerRanks = [];
        this.lastPlayer = 1;
    }

    get activePlayers() {
        return this.players.filter(p => p.cards.length);
    }

    send(message, exclude) {
        this.players.filter(p => p.token !== exclude).forEach(player => {
            player.send(message, exclude);
        });
    }

    getInfoForPlayer(playerToken) {
        const player = this.players.find(player => player.token === playerToken);
        return playerToken ? ({
            currentPlayer: this.currentPlayer,
            currentCard: this.deck.currentCard,
            state: this.state,
            token: this.token,
            players: this.players.filter(player => player.token !== playerToken).map(player => player.info),
            tally: this.tally,
            you: {
                owner: this.owner === playerToken,
                ...player,
                cards: player.cards.map((card, id) => ({
                    playable: (this.settings.isPlayable(card, this.deck.currentCard, this.tally) &&
                        (!player.hasDrawn || player.cards.length - 1 === id) &&
                        this.currentPlayer === player.id) ||
                        (this.settings.isJumpable(card, this.deck.currentCard) && this.currentPlayer !== player.id),
                    ...card
                })),
            },
            playerRanks: this.playerRanks,
            lastPlayer: this.lastPlayer,
            flipped: this.directionIsFlipped,
            forcedDraw: this.settings.playRules.forcedDraw
        }) : ({
            currentPlayer: this.currentPlayer,
            currentCard: this.deck.currentCard,
            state: this.state,
            token: this.token,
            players: this.players.map(player => ({
                owner: this.owner === playerToken,
                ...player.info,
                cards: player.cards.length,
            })),
            tally: this.tally,
            playerRanks: this.playerRanks,
            lastPlayer: this.lastPlayer,
            flipped: this.directionIsFlipped,
        });
    }

    getPlayer(token) {
        return this.players.find(player => player.token === token)
    }

    getPlayerIndex(token) {
        return this.players.findIndex(player => player.token === token)
    }

    addPlayer(player) {
        player.id = this.players.length + 1;
        this.players.push(player);
        return player;
    }

    removePlayer(player) {
        this.players.splice(this.getPlayerIndex(player), 1);
    }

    dealCards(amount = 6) {
        this.players.forEach(player => {
            player.addCards(this.takeFromDeck(amount));
        })
    }

    takeFromDeck(amount) {
        if (this.deck.deck.length < amount) {
            this.deck.refillDeck();
            this.send({ message: "DECK_REFILLED" });
            console.log("Deck refilled from stack");
        }
        return this.deck.takeFromDeck(amount);
    }

    getPlayerById(playerId = this.currentPlayer) {
        return this.players.find(p => p.id === playerId);
    }

    jumpCard(playerId, card) {
        if (this.settings.isJumpable(card, this.deck.currentCard)) {
            this.currentPlayer = playerId;
            console.log("Next card jumped")
            this.playCard(card);
        } else {
            this.getPlayerById(playerId).cards.push(card);
            throw new HttpError("Card not jumpable", 401);
        }
    }

    playCard(card) {
        const player = this.getPlayerById();
        if (this.settings.isPlayable(card, this.deck.currentCard, this.tally) && (!player.hasDrawn || player.cards[player.cards.length - 1].id < card.id)) {
            let advance = 1;
            switch (card.type) {
                case CardTypes.REVERSE: {
                    this.directionIsFlipped = !this.directionIsFlipped;
                }
                    break;
                case CardTypes.PLUS2: {
                    this.tally += 2;
                }
                    break;
                case CardTypes.PLUS4: {
                    this.tally += 4;
                }
                    break;
                case CardTypes.SKIP: {
                    advance = 2;
                }
                    break;
                case CardTypes.SWITCH: {
                    card.colour = card.switchColour;
                    delete card.switchColour;
                }
                    break;
            }
            this.deck.stack.push(card);
            this.checkGameState();
            this.advancePlayer(advance);
            console.log("PLAYED:", card);
            this.send({ action: "CARD_PLAYED" });
        } else {
            player.cards.push(card);
            throw new HttpError("Card is not allowed to be played!", 401)
        }
    }

    advancePlayer = (amount = 1) => {
        this.lastPlayer = this.currentPlayer;
        this.players.forEach(p => { p.hasDrawn = false; });
        if(!this.activePlayers.length) return console.log("No more players");
        this.currentPlayer = this.getNextPlayer(amount);
    }

    getNextPlayer = (amount) => {
        let actives = [...this.activePlayers];
        if (!actives.map(p => p.id).includes(this.currentPlayer)) {
            actives.push(this.getPlayerById());
            actives = actives.sort((p1, p2) => p1.id - p2.id);
        }
        if (this.directionIsFlipped) {
            actives.reverse();
        }
        const index = actives.findIndex(p => p.id === this.currentPlayer);
        return actives[(amount + index) % actives.length].id
    }

    checkGameState = () => {
        this.players.forEach(player => {
            if (!player.cards.length && !this.playerRanks.includes(player.id)) {
                this.playerRanks.push(player.id);
                this.send({ action: "PLAYER_OUT" });
                if (this.playerRanks.length === this.players.length - 1) {
                    this.send({ action: "GAME_ENDED" });
                    this.state = GameStates.ENDED;
                }
            }
            if (this.currentPlayer === player.id) {
                if (!this.getInfoForPlayer(player.token).you.cards.some(card => card.playable) && this.deck.deck.length === 0) {
                    console.log("Game maybe stuck");
                }
            }
        });
    }


}

module.exports = Game;