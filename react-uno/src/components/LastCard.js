import { GameStore } from './../gameState';
import UnoCard from './UnoCard';

const LastCard = () => {
    const lastCard = GameStore.useState(s => s.lastCard);

    return lastCard ? <UnoCard className="current-card last-card" {...lastCard} /> : null
}

export default LastCard;