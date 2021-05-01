import Card from 'react-bootstrap/Card'
import { cardColours } from '../enums';

const UnoCard = ({ colour, number, type, style, addPlay, playable, className, children}) => {
    const cardTypes = {
        REVERSE: <img className="img-fluid" src="/assets/images/cards/reverse.png" alt="REVERSE" />,
        PLUS2: <span className="type-div">+2</span>,
        PLUS4: <span className="type-div">+4</span>,
        SKIP: <img className="img-fluid" src="/assets/images/cards/skip.png" alt="SKIP" />,
        SWITCH: <img className="img-fluid" src="/assets/images/cards/switch.png" alt="SWITCH" />,
        BACK: <img className="img-fluid" src="/assets/images/cards/back.png" alt="BACK" />
    }

    return (<Card className={className} bg={cardColours[colour]} text="white" style={style}>
        <Card.Body className="d-flex">
            <Card.Text className="text-center m-auto uno-text d-flex">
                {Number.isFinite(number) ? number : cardTypes[type]}
            </Card.Text>
            {children}
        </Card.Body>
    </Card>)
}

export default UnoCard;