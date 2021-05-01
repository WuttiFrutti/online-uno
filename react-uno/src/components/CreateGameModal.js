import axios, { defaultCatch } from './../config/axios';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import { backendURL } from './../config/defaults';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { hideModal } from './../modals';


const CreateGameModal = () => {
    const history = useHistory();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [invalid, setInvalid] = useState({
        username: false,
    });
    const [fields, setFields] = useState({
        username: "",
        roomId: "",
        deckRules: {
            standards: 2,
            reverses: 2,
            zeros: 1,
            skips: 2,
            plus2s: 2,
            plus4s: 1,
            switches: 1,
        }
    })

    const start = (e) => {
        e.preventDefault();
        if(fields.username === "") return setInvalid({username:true});
        axios.post("game", { username: fields.username, settings: {deckRules: fields.deckRules, roomId: fields.roomId === "" ? null : fields.roomId} })
            .then(res => {
                history.push("/game")
            }).catch(defaultCatch);
        hideModal();
    }

    const setField = (change) => {
        setFields({ ...fields, ...change });
    }

    const setDeckRule = (e) => {
        setField({
            deckRules: {
                ...fields.deckRules,
                [`${e.target.attributes.field.value}`]: e.target.value,
            }
        })
    }




    return (<>
        <Form onSubmit={start} className="m-auto" style={{ maxWidth: "550px" }}>
            <Form.Group>
                <Form.Label>Name</Form.Label>
                <Form.Control isInvalid={invalid["username"]} value={fields["username"]} onChange={e => setField({ username: e.target.value })} type="text" placeholder="Enter username" />
                <Form.Text className="text-muted">
                    This is the username that will be used during the game
                    </Form.Text>
            </Form.Group>
            <Form.Group>
                <Form.Control value={fields["roomId"]} onChange={e => setField({ roomId: e.target.value })} type="text" placeholder="Room Name" />
                <Form.Text className="text-muted">
                    Name that others use to enter the game. Leave blank for auto-generated
                    </Form.Text>
            </Form.Group>
            <Collapse in={settingsOpen}>
                <div>
                    <hr className="m-0" />
                    <Form.Group className="m-0 py-3">
                        <Form.Label>Deck Rules</Form.Label>
                        <br /><span className="text-muted">Per colour</span>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Standard</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["standards"]} field="standards" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Zero</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["zeros"]} field="zeros" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Reverse</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["reverses"]} field="reverses" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Skip</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["skips"]} field="skips" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Plus 2</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["plus2s"]} field="plus2s" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <span className="text-muted">In Total</span>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Plus 4</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["plus4s"]} field="plus4s" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                        <InputGroup className="mb-1">
                            <InputGroup.Prepend>
                                <InputGroup.Text>Switch</InputGroup.Text>
                            </InputGroup.Prepend>
                            <FormControl value={fields["deckRules"]["switches"]} field="switches" onChange={setDeckRule} type="number" placeholder="Amount" />
                        </InputGroup>
                    </Form.Group>
                </div>
            </Collapse>
            <div className="d-flex justify-content-between">
                <Button variant="primary" type="submit">
                    Start!
                </Button>
                <Button variant="link" onClick={() => setSettingsOpen(!settingsOpen)}>
                    Settings
                </Button>
            </div>

        </Form>
    </>)

}

export default CreateGameModal;