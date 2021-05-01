const Colours = {
    RED: "red",
    YELLOW: "yellow",
    GREEN: "green",
    BLUE: "blue",
    UNIVERSAL: "black"
}

const Types = {
    STANDARD: "STANDARD",
    SKIP: "SKIP",
    REVERSE: "REVERSE",
    PLUS2: "PLUS2",
    PLUS4: "PLUS4",
    SWITCH: "SWITCH",
}

module.exports.CardColours = Colours;
module.exports.CardTypes = Types;

module.exports.createDeck = () => {
    const cards = [];

    Object.entries(Colours).filter((([key, value]) => value !== Colours.UNIVERSAL)).forEach(([key, value]) => {
        for (let i = 1; i <= 9; i++) {
            cards.push({ type: Types.STANDARD, number: i, colour: value });
            cards.push({ type: Types.STANDARD, number: i, colour: value });
        }
        cards.push({ type: Types.STANDARD, number: 0, colour: value });

        cards.push({ type: Types.SKIP, colour: value });
        cards.push({ type: Types.SKIP, colour: value });
        cards.push({ type: Types.REVERSE, colour: value });
        cards.push({ type: Types.REVERSE, colour: value });
        cards.push({ type: Types.PLUS2, colour: value });
        cards.push({ type: Types.PLUS2, colour: value });

        cards.push({ type: Types.PLUS4, colour: Colours.UNIVERSAL });
        cards.push({ type: Types.SWITCH, colour: Colours.UNIVERSAL });
    })

    return cards;
}

module.exports.isPlayable = (playingCard, currentCard, tally) =>
    (currentCard === null) ||
    (Number.isFinite(playingCard.number) && playingCard.number === currentCard.number) ||
    (currentCard.type !== Types.PLUS2 && currentCard.type !== Types.PLUS4 && playingCard.colour && playingCard.colour === currentCard.colour) ||
    (playingCard.colour === Colours.UNIVERSAL && currentCard.type !== Types.PLUS4 && currentCard.type !== Types.PLUS2) ||
    (playingCard.type === Types.PLUS4 && currentCard.type === Types.PLUS2) ||
    (playingCard.type !== Types.STANDARD && playingCard.type === currentCard.type) ||
    (currentCard.type === Types.PLUS4 && !tally) ||
    (currentCard.type === Types.PLUS2 && (currentCard.colour === playingCard.colour || playingCard.colour === Colours.UNIVERSAL) && !tally);

module.exports.isJumpable = (playingCard, currentCard) =>
    (currentCard && currentCard.type === Types.STANDARD && playingCard && playingCard.type === Types.STANDARD) &&
    (currentCard.colour === playingCard.colour) &&
    (currentCard.number === playingCard.number);