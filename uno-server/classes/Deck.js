const { CardTypes, CardColours } = require("../cards");

class Deck {
    constructor(deck) {
        this.deck = deck;
        this.stack = [];
        this.shuffle();
    }

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    refillDeck(){
        if(this.stack.length === 0) throw new HttpError("Deck and stack are empty", 400);
        this.deck = this.deck.concat(this.stack.splice(0, this.stack.length - 1));
        this.deck.forEach(c => {
            if(c.type === CardTypes.SWITCH){
                c.colour = CardColours.UNIVERSAL;
            }
        })
        this.shuffle();
    }

    takeFromDeck(amount){
        return this.deck.splice(0, amount);
    }


    get currentCard() {
        if (!this.stack.length) return null;
        return this.stack[this.stack.length - 1]
    }

}


module.exports = Deck;
