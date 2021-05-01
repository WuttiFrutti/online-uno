import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'

import StatusCircle from './StatusCircle';
import { GameStore, setSorted } from './../gameState';
import axios from './../config/axios';


const UserInfo = ({className, style}) => {
    const { websocketState:state, gameState ,you:{username, id, owner}, currentPlayer } = GameStore.useState(s => s);

    const start = async () => {
        await axios.put("game/state", { state:"RUNNING" });
    }

    return (
        <Card bg={currentPlayer === id ? "info" : "light"} text={currentPlayer === id ? "white" : "dark"} className={className} style={style}>
            <Card.Header className="d-flex">{username} <div className="ml-auto"><StatusCircle state={state} /></div></Card.Header>
            <Card.Body className="p-3">
                <Card.Subtitle>Player {id}</Card.Subtitle>
                <Card.Text className="d-flex flex-column">
                    {owner && gameState === "JOINING" ? <Button onClick={start} className="ml-auto my-auto" variant="success">Start</Button> : <>
                        <Button className="mx-3 my-1 mt-3 p-0" onClick={() => setSorted("NUMBER")}>Sort by number</Button>
                        <Button className="mx-3 my-1 p-0" onClick={() => setSorted("COLOUR")}>Sort by Colour</Button>
                    </>}
                </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default UserInfo;