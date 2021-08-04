const express = require('express');
const { CardTypes } = require('../cards');
const router = express.Router();
const { v4: uuid } = require('uuid');

const Games = require('../classes/Games');
const Player = require('../classes/Player');
const { GameStates } = require('../enums');
const { HttpError } = require("../errors");
const { isCurrentPlayer, isOwner } = require('../middleware');




router.post('/login', (req, res) => {
    const game = Games.get(req.body.token);
    if (game.state === GameStates.JOINING) {
        const { token } = game.addPlayer(new Player(req.body.username));
        res.cookie("token", token);
        res.send({ token: token });
    } else {
        throw new HttpError("Game has already started", 403)
    }
})

router.get('/:token', (req, res) => {
    const game = Games.get(req.params.token);
    res.send(game.getInfoForPlayer(req.cookies.token))
})

router.get('', (req, res) => {
    const game = Games.getByPlayer(req.cookies.token);
    if (game) {
        res.send(game.getInfoForPlayer(req.cookies.token))
    } else {
        throw new HttpError("First log in to a game", 400)
    }
})

router.post('', (req, res) => {
    if (!req.game) {
        if (req.body.settings?.roomId) {
            let game = null;
            try {
                game = Games.get(req.body.settings.roomId)
            } catch (err) { }
            if (game && game.state === GameStates.ENDED) {
                Games.remove(game.token);
            } else if (game) {
                throw new HttpError("Game already exists", 401);
            }
        }
        const { owner: userToken, token } = Games.new(new Player(req.body.username), req.body.settings || {}, req.body.settings?.roomId || uuid().slice(-6));
        res.cookie("token", userToken);
        res.send({ token: token, userToken: userToken });
    } else {
        throw new HttpError("You are already in a game. First end or leave that one", 401);
    }
})

router.put("/state", isOwner, (req, res) => {
    req.game.state = GameStates[req.body.state];
    if (req.game.state === GameStates.RUNNING) req.game.dealCards();
    req.game.send({ action: "STATE_CHANGE" });
    res.send({ message: "Game state set to: " + req.game.state })
});

router.delete("", (req, res) => {
    if (!!req.game && req.owner) {
        req.game.send({ action: "GAME_ENDED" });
        Games.end(req.game.token);
        res.clearCookie("token");
        res.send({ message: `${req.game.token} deleted` });
    } else if (!!req.game && req.game.state) {
        req.game.removePlayer(req.cookies.token)
        req.game.send({ action: "PLAYER_LEFT" });
        res.send({ message: `left ${req.game.token}` });
    } else {
        throw new HttpError("Unauthorized", 401)
    }
});


router.put("/card", isCurrentPlayer, (req, res) => {
    const player = req.game.getPlayer(req.cookies.token);
    const card = player.takeFromCards(req.body.card);
    if (card.type === CardTypes.SWITCH) {
        card.switchColour = req.body.colour;
    }
    req.game.playCard(card);
    res.send({ message: "Played: " + req.body.card });
});

router.post("/card", isCurrentPlayer, (req, res) => {
    const player = req.game.getPlayer(req.cookies.token);
    if (player.hasDrawn && req.game.settings.isPlayable(player.cards[player.cards.length - 1], req.game.deck.currentCard)) {
        throw new HttpError("Play your playable card", 400)
    } else {
        let cards = req.game.takeFromDeck(req.game.tally || 1);
        player.hasDrawn = true;
        player.addCards(cards);
        if (req.game.tally) {
            req.game.tally = 0;
            req.game.advancePlayer();
        }
        req.game.send({ action: "CARD_DRAWN" });
        res.send({ message: "Drawn: " + cards.length });
    }
});

router.post("/keep", isCurrentPlayer, (req,res) => {
    const player = req.game.getPlayer(req.cookies.token);
    if(player.hasDrawn && !req.game.settings.playRules.forcedDraw){
        req.game.advancePlayer();
        req.game.send({ action: "CARD_KEPT" });
        res.send({ message: "Kept: card" });
    }
})





module.exports = router;
