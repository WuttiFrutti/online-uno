import { GameStore } from './../gameState';
import UnoCard from './UnoCard';
import { useEffect } from 'react';

const CurrentCard = () => {
    const {currentCard, lastPlayer, players} = GameStore.useState(s => s);
    const isNew = currentCard?.isNew || false;

    useEffect(() => {
        if (isNew) {
            setTimeout(() => GameStore.update(s => {
                s.currentCard.isNew = false;
            }), 10)
        }
    }, [isNew]);

    const getPlayerIndex = players.findIndex(player => player.id === lastPlayer);

    return currentCard ? <UnoCard className={isNew ? "current-card card-current-move " : "current-card"} style={isNew ? {left:`calc(1rem + ${getPlayerIndex * 10}rem)`} : null} {...currentCard} /> : null
}

export default CurrentCard;