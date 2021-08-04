import Button from 'react-bootstrap/esm/Button';
import UnoCard from './UnoCard';
import { GameStore } from './../gameState';
import axios, { defaultCatch } from './../config/axios';
const DeckCard = () => {
    const {currentPlayer, you:{id,hasDrawn}, forcedDraw, gameState, tally} = GameStore.useState(s => s);
    const isInTurn = currentPlayer === id;

    const draw = () => {
        axios.post("game/card").catch(defaultCatch);
    }

    

    return gameState === "RUNNING" ? (
        <div className="deck-card">
            <UnoCard  type={"BACK"} colour={"black"} />
            {isInTurn && (forcedDraw ? true : !hasDrawn) ? <Button onClick={draw} className="draw-button" variant="light">{!tally ? <>Draw</> : <>Take {tally}</>}</Button> : null}
        </div>
    ) : null
}


export default DeckCard;