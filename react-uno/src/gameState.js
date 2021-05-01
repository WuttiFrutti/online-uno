import { Store } from "pullstate";
import axios from './config/axios';
import { addToast } from './toasts';
import { setCookie } from 'react-use-cookie';
import { addModal } from "./modals";

export const GameStore = new Store({ players: [], you: {}, token: null, websocketState: null, sendMessage: null, gameState: "JOINING", currentCard: {}, currentPlayer: 0, tally: 0, lastCard: null, lastPlayer: null, playerRanks: [] });


export const websocketReducer = async ({ data }) => {
    const message = JSON.parse(data);
    switch (message.action) {
        case "PLAYER_DISCONNECTED":
        case "PLAYER_CONNECTED":
        case "PLAYER_JOINED":
        case "PLAYER_LEFT": {
            const { data } = await axios.get("game");
            GameStore.update(s => { s.players = data.players; });
        }
            break;
        case "GAME_ENDED":
            setCookie("token", "");
            addToast({ title: "Game Ended", message: "The game has ended. You cannot interact with it now" });
            break;
        case "STATE_CHANGE": {
            const { data } = await axios.get("game");
            GameStore.update(s => { s.gameState = data.state; s.players = data.players; s.you = data.you });
        }
            break;
        case "CARD_DRAWN":
        case "CARD_PLAYED": {
            const { data } = await axios.get("game");
            GameStore.update(s => {
                s.lastCard = s.currentCard;
                s.lastPlayer = data.lastPlayer;
                s.currentCard = data.currentCard; s.currentPlayer = data.currentPlayer; s.players = data.players; s.tally = data.tally;
                s.you.hasDrawn = data.you.hasDrawn
                if (s.you.cards.length !== data.you.cards.length || s.currentPlayer === s.you.id) {
                }
                s.you.cards = s.you.cards.map(c => ({...c, playable:!data.you.hasDrawn}));
                const newCards = data.you.cards.filter(c => !s.you.cards.map(c2 => c2.id).includes(c.id)).map(c => ({...c, isNew: true}));
                s.you.cards = s.you.cards.concat(newCards);
                s.you.cards = s.you.cards.filter(c => data.you.cards.map(c2 => c2.id).includes(c.id));
                s.you.cards = s.you.cards.map(c => ({...c, playable:data.you.cards.find(c2 => c2.id === c.id).playable}))
                if (message.action === "CARD_PLAYED" && s.lastPlayer !== s.you.id) {
                    s.currentCard.isNew = true;
                }
            });
        }
            break;
        case "PLAYER_OUT": {
            const { data } = await axios.get("game");
            GameStore.update(s => {
                s.playerRanks = data.playerRanks;
                const lastPlayerId = s.playerRanks[s.playerRanks.length - 1];
                const getPlayer = (id) => s.players.find(p => p.id === id) || s.you;
                const lastPlayer = getPlayer(lastPlayerId);
                addModal({
                    title: `Player ${lastPlayer.id}: ${lastPlayer.username} has finished!`,
                    body: <ol>
                        {s.playerRanks.map(playerId => <li>Player {getPlayer(playerId).id}: {getPlayer(playerId).username}</li>)}
                    </ol>
                })
            });

        }
            break;
        default:

            break;
    }
}

export const refreshGameState = async () => {
    try {
        const { data } = await axios.get("game");
        GameStore.update(s => {
            s.players = data.players;
            s.you = data.you;
            s.token = data.token;
            s.gameState = data.state;
            s.currentPlayer = data.currentPlayer;
            s.currentCard = data.currentCard;
            s.lastCard = null;
            s.lastPlayer = null;
            s.playerRanks = null;
            s.tally = data.tally;
        });
    } catch (err) { }
}

export const setSorted = (sort) => {
    GameStore.update(s => {
        s.you.cards = getSorted(sort, [...s.you.cards])
        console.log(s.you.cards);
    });
}

export const getSorted = (sort, cards) => {
    switch (sort) {
        case "NUMBER":
            return cards.sort((card1, card2) => {
                if (Number.isFinite(card1.number) && Number.isFinite(card2.number)) {
                    return card1.number - card2.number
                }
                if (!Number.isFinite(card1.number)) {
                    if (!Number.isFinite(card2.number)) {
                        if (card1.type > card2.type) {
                            return 1;
                        } else if (card1.type < card2.type) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                    return 1;
                }
                return -1;
            });
        case "COLOUR": {
            return getSorted("NUMBER", cards).sort((card1, card2) => {
                if (card1.colour > card2.colour) {
                    return 1;
                } else if (card1.colour < card2.colour) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }
        default:
            return cards;
    }
}