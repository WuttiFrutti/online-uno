const { v4: uuid } = require('uuid');

class Player{
    #ws;
    #totalCards;

    constructor(username, ws, token = uuid(), cards = []){
        this.username = username;
        this.token = token;
        this.cards = cards;
        this.#ws = ws;
        this.#totalCards = 0;
        this.hasDrawn = false;
    }

    send(message){
        if(!this.isReady) {
            console.log(`Websocket for ${this.username} not ready or not set`);
        }else{
            this.#ws.send(JSON.stringify(message));
        }
    }

    setWebsocket(ws){
        this.#ws = ws;
    }

    takeFromCards(id){
        return this.cards.splice(this.cards.findIndex(card => card.id === id), 1)[0];
    }

    addCards(cards){
        cards.forEach(card => {
            this.cards.push({...card, id:this.#totalCards});
            this.#totalCards++;
        })
    }

    get isReady(){
        return !!this.#ws && this.#ws.readyState === 1;
    }

    get info(){
        return { username: this.username, cards: this.cards.length, connected: this.isReady, id:this.id }
    }
}

module.exports = Player;