import { GameStore } from './../gameState';
import UnoCard from './UnoCard';
import { useEffect } from 'react';
import styled, { keyframes } from "styled-components"

const PositionedUnoCard = styled(UnoCard)`
    animation: ${props => props.animation} ${props => props.ms}ms;
    position: fixed !important;
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

const CurrentCard = ({duration = 500}) => {
    const { currentCard, lastPlayer, players } = GameStore.useState(s => s);
    const isNew = currentCard?.isNew || false;


    useEffect(() => {
        if (isNew) {
            setTimeout(() => GameStore.update(s => {
                s.currentCard.isNew = false;
            }), duration)
        }
    }, [isNew, duration]);

    const getPlayerIndex = players.findIndex(player => player.id === lastPlayer);
    return currentCard ? <PositionedUnoCard className="current-card" ms={duration} animation={isNew && getPlayerIndex !== -1 ? moveAnimation(getPlayerIndex) : null} {...currentCard} /> : null
}

export default CurrentCard;