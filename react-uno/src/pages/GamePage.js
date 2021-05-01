import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCookie from 'react-use-cookie';
import useWebSocket from 'react-use-websocket';
import StatusBar from '../components/Nav';
import PlayerInfo from '../components/PlayerInfo';
import { GameStore, refreshGameState, websocketReducer } from "../gameState"
import CardGroup from 'react-bootstrap/CardGroup'
import UserInfo from './../components/UserInfo';
import CardDeck from './../components/CardDeck';
import DeckCard from '../components/DeckCard';
import LastCard from '../components/LastCard';
import CurrentCard from '../components/CurrentCard';



const GamePage = () => {
    const [userToken, setUserToken] = useCookie("token", false);
    const { players, gameState } = GameStore.useState(s => s);


    useEffect(() => {
        if (userToken) {
            refreshGameState();
        }
    }, [userToken])

    const {
        sendJsonMessage: sendMessage,
        readyState,
    } = useWebSocket((process.env.REACT_APP_WS_BACKEND_SSL ? "wss://" : "ws://") + window.location.hostname + ":" + window.location.port + process.env.REACT_APP_WS_BACKEND_PATH, {
        onMessage: websocketReducer,
        shouldReconnect: (closeEvent) => {
            if (closeEvent.reason === "NOT_LOGGED_IN") {
                setUserToken("");
            }
            return !(closeEvent.code >= 4000 && closeEvent.code < 5000);
        },
    });

    useEffect(() => {
        GameStore.update(s => { s.sendMessage = sendMessage; s.websocketState = readyState; });
    })

    const getStyle = width => ({ bottom: "1rem", width: `${width}rem`, right: gameState === "JOINING" ? `calc(50% - (${width}rem / 2))` : "1rem" })

    return (
        <>
            <StatusBar />
            { !userToken ?
                <p className="p-3">
                    You have to login first! go <Link to="/">here</Link>
                </p>
                :
                <>
                    <CardGroup className="p-3">
                        {players.map(p => <PlayerInfo key={p.username} {...p} />)}
                    </CardGroup>
                    <UserInfo className="position-absolute" style={getStyle(gameState === "JOINING" ? 15 : 9)} />
                    <LastCard />
                    <CurrentCard />
                    <DeckCard />
                    {gameState === "RUNNING" ? <CardDeck /> : null}
                </>
            }
        </>
    )
}

export default GamePage