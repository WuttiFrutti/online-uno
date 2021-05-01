import Card from 'react-bootstrap/Card'
import StatusCircle from './StatusCircle';
import { ReadyState } from 'react-use-websocket';
import { GameStore } from './../gameState';


const PlayerInfo = ({ username, connected, cards, id, className, style }) => {
    const currentPlayer = GameStore.useState(s => s.currentPlayer);


    return (
        <Card bg={currentPlayer === id ? "info" : "light"} text={currentPlayer === id ? "white" : "dark"} className={`${className} player-card`} style={{maxWidth:"10rem",zIndex:"10",...style}}>
            <Card.Header className="d-flex">{username} <div className="ml-auto"><StatusCircle state={connected ? ReadyState.OPEN : ReadyState.CLOSED} /></div></Card.Header>
            <Card.Body>
                <Card.Subtitle>Player {id}</Card.Subtitle>
                <Card.Text>
                    Cards: {cards}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default PlayerInfo;