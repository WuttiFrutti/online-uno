import BCardDeck from 'react-bootstrap/CardDeck'
import { GameStore } from './../gameState';
import PlayingCard from './PlayingCard';


const CardDeck = () => {
    const cards = GameStore.useState(s => s.you.cards);

    return (
        <BCardDeck>
           {cards.map((card, id) => <PlayingCard key={id} cardId={card.id} addPlay={true} {...card} style={{left:`min(${(id * (100 / cards.length))}%,${id * 10.5}rem )`}}/>)}
        </BCardDeck>
    )
}

export default CardDeck;