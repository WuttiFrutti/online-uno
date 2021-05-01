const Game = require("./Game");
const { HttpError } = require("../errors"); 
const { GameStates } = require("../enums");

class Games {
    constructor() {
        if (!Games.instance) {
            Games.instance = this;
        }
        this._games = []
    }
    getInstance() {
        return Games.instance;
    }

    new(owner, token, players = []) {
        this._games.push(new Game(owner.token, token, [owner, ...players]));
        return this._games[this._games.length - 1];
    }

    get(gameToken) {
        const game = this._games.find(game => game.token === gameToken);
        if(!game) throw new HttpError("Game not found", 404);
        return game;
    }

    getByPlayer(playerToken) {
        return this._games.find(game => game.players.find(player => player.token === playerToken));
    }

    getPlayer(token){
        for(const game of this._games){
            const res = game.getPlayer(token);
            if(res) return res;
        }
        return null
    }

    getId(gameToken){
        return this._games.findIndex(game => game.token === gameToken);
    }

    end(gameToken){
        const game = this.get(gameToken);
        game.state = GameStates.ENDED;
    }
}





module.exports = new Games();