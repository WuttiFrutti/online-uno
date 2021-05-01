const Games = require("../classes/Games");
const { GameStates } = require("../enums");
const { HttpError } = require("../errors")

module.exports.getGame = (req, res, next) => {
    if(req.cookies.token){
        const game = Games.getByPlayer(req.cookies.token);
        if(!game) {
            res.clearCookie("token");
            throw new HttpError(`Game with player:${req.cookies.token} does not exist`, 404);
        }
        req.game = game;
        req.owner = game.owner === req.cookies.token;
    }
    next();
}

module.exports.isCurrentPlayer = (req, res, next) => {
    const player = req.game.getPlayer(req.cookies.token);
    if(!!req.game && req.game.state === GameStates.RUNNING && req.game.currentPlayer === player.id){
        next();
    } else{
        if(Number.isFinite(req.body.card)){
            const card = player.takeFromCards(req.body.card)
            req.game.jumpCard(player.id,card);
            res.send({message: "Jumped card"});
        }else{
            throw new HttpError("Unauthorized",401)
        }
    }
}

module.exports.isOwner = (req, res, next) => {
    if (!!req.game && req.owner) {
        next();
    }else{
        throw new HttpError("Unauthorized", 401)
    }
}