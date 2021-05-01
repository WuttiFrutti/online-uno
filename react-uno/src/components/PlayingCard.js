import Button from 'react-bootstrap/Button'
import { GameStore } from './../gameState';
import axios from './../config/axios';
import { addModal, hideModal } from './../modals';
import { cardColours } from './../enums';
import { useEffect } from 'react';
import UnoCard from './UnoCard';

const PlayingCard = ({cardId, addPlay, playable, className, isNew, ...card }) => {
    const {  you: { cards } } = GameStore.useState(s => s);
    const isPlayable = addPlay && playable;

    const playCard = async (cardIndex, colour) => {
        if (!colour && cards.find(card => card.id === cardIndex).type === "SWITCH") {
            addModal({
                title: "Choose Colour",
                body: <div className="d-flex justify-content-around">
                    {Object.entries(cardColours).filter(([key]) => key !== "black").map(([key, value]) => <Button onClick={() => { playCard(cardIndex, key); hideModal() }} variant={value}>{key.capitalize()}</Button>)}
                </div>
            })
        } else {
            GameStore.update(s => {
                s.you.lastPlayedIndex = cards.findIndex(c => c.id === cardIndex);
            });
            await axios.put("game/card", { card: cardIndex, colour: colour });
        }
    }

    useEffect(() => {
        if (isNew === true && cardId) {
            setTimeout(() => GameStore.update(s => {
                s.you.cards.find(card => card.id === cardId).isNew = false;
            }), 10)
        }
    }, [cardId, isNew])

    return (<UnoCard {...card} className={className ? className + " "  : "" +  (isNew === true ? "card-move" : "")} >
        {isPlayable ? <Button onClick={() => playCard(cardId)} className="play-card-button" variant="light">
            Play
        </Button> : null}
    </UnoCard>)
}

export default PlayingCard;