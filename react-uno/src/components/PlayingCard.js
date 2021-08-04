import Button from 'react-bootstrap/Button'
import { GameStore } from './../gameState';
import axios, { defaultCatch } from './../config/axios';
import { addModal, hideModal } from './../modals';
import { cardColours } from './../enums';
import { useEffect } from 'react';
import UnoCard from './UnoCard';
import styled, { keyframes } from "styled-components"


const PlayingCard = ({cardId, addPlay, playable, className, isNew, ...card }) => {
    const {currentPlayer,  you: { cards, id, hasDrawn }, forcedDraw } = GameStore.useState(s => s);
    const isInTurn = currentPlayer === id;
    const isPlayable = addPlay && playable;
    const duration = 500;

    const keep = () => {
        axios.post("game/keep").catch(defaultCatch);
    }

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
            }), duration)
        }
    }, [cardId, isNew])

    return (<PositionedUnoCard {...card} className={className} >
        {isPlayable ? <Button onClick={() => playCard(cardId)} className="play-card-button" variant="light">
            Play
        </Button> : null}
        {isInTurn && hasDrawn && cardId === cards[cards.length - 1].id && !forcedDraw ? <Button onClick={keep} className="keep-card-button" variant="light">Keep</Button> : null}
    </PositionedUnoCard>)
}

export default PlayingCard;


const PositionedUnoCard = styled(UnoCard)`
    animation: ${props => props.animation} ${props => props.ms}ms;
    margin: 0 !important;
`

const moveAnimation = (playerIndex) =>  keyframes`
    from {
        top: 15rem;
        left: calc(6rem + ${playerIndex * 5}rem)
    }

    to {
        left: calc(50vw + 11rem) !important;
        top: 50vh;
        transform: translate(-50%, -50%);
    }
`