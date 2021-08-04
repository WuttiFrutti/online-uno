const { CardTypes:Types, CardColours:Colours } = require('../cards');


class Settings {
    constructor(playRules = {}, deckRules = {}){
        this.playRules = playRules;
        this.deckRules = deckRules;
    }


    createDeck() {
        const cards = [];

        Object.entries(Colours).filter((([key, value]) => value !== Colours.UNIVERSAL)).forEach(([key, value]) => {
            for (let i = 1; i <= 9; i++) {
                for(let ii = 0; ii < (this.deckRules.standards || 1); ii++){
                    cards.push({ type: Types.STANDARD, number: i, colour: value });
                }
            }
            for(let i = 0; i < this.deckRules.zeros; i++){
                cards.push({ type: Types.STANDARD, number: 0, colour: value });
            }
            for(let i = 0; i < this.deckRules.skips; i++){
                cards.push({ type: Types.SKIP, colour: value });
            }
            for(let i = 0; i < this.deckRules.reverses; i++){
                cards.push({ type: Types.REVERSE, colour: value });
            }
            for(let i = 0; i < this.deckRules.plus2s; i++){
                cards.push({ type: Types.PLUS2, colour: value });
            } 
        })
        for(let i = 0; i < this.deckRules.plus4s; i++){
            cards.push({ type: Types.PLUS4, colour: Colours.UNIVERSAL });
        }
        for(let i = 0; i < this.deckRules.switches; i++){
            cards.push({ type: Types.SWITCH, colour: Colours.UNIVERSAL });
        }
        
        return cards;
    }

    isPlayable(playingCard, currentCard, tally){
        return (currentCard === null) ||
        (Number.isFinite(playingCard.number) && playingCard.number === currentCard.number) ||
        (currentCard.type !== Types.PLUS2 && currentCard.type !== Types.PLUS4 && playingCard.colour && playingCard.colour === currentCard.colour) ||
        (playingCard.colour === Colours.UNIVERSAL && currentCard.type !== Types.PLUS4 && currentCard.type !== Types.PLUS2) ||
        (this.playRules["4on2"] && playingCard.type === Types.PLUS4 && currentCard.type === Types.PLUS2) ||
        (playingCard.type !== Types.STANDARD && playingCard.type === currentCard.type) ||
        (currentCard.type === Types.PLUS4 && !tally) ||
        (currentCard.type === Types.PLUS2 && (currentCard.colour === playingCard.colour || playingCard.colour === Colours.UNIVERSAL) && !tally) ||
        (this.playRules["2on4"] && playingCard.type === Types.PLUS2 && currentCard.type === Types.PLUS4);
    }
        

    isJumpable(playingCard, currentCard){
        return this.playRules.jump && (currentCard && currentCard.type === Types.STANDARD && playingCard && playingCard.type === Types.STANDARD) &&
        (currentCard.colour === playingCard.colour) &&
        (currentCard.number === playingCard.number);
    }
        

}


module.exports = Settings;