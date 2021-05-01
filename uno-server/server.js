const express = require("express");
const gameRouter = require('./routes/game');
const Games = require('./classes/Games');

const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');
const cors = require('cors')
const { json, urlencoded } = require('body-parser');
const { HttpError } = require("./errors");
const { getGame } = require("./middleware");


const app = express();


app.use(cors( {
    origin: 'http://localhost:3001',
    credentials: true,
}))
app.use(json())
app.use(urlencoded({
    extended: true
}))
app.use(cookieParser(uuid()));

app.use(`/api/game`,getGame);
app.use(`/api/game`,gameRouter);

const ws = require('express-ws')(app);

app.ws('/ws', (ws, req) => {
	try{
		const game = Games.getByPlayer(req.cookies.token);
		const player = game.getPlayer(req.cookies.token);
		player.setWebsocket(ws);
		game.send({action:"PLAYER_CONNECTED"}, req.cookies.token);
		ws.on('close', () => {
			game.send({action:"PLAYER_DISCONNECTED"}, req.cookies.token);
		})
	}catch(err){
		ws.close(4000, "NOT_LOGGED_IN");
	}
});

app.use((err, req, res, next) => {
    console.log(err)
    res.status(err.code ? err.code : 500).send(err.code ? err.toJson() : {message: err.message});
})

const path = require('path');
app.use(express.static(path.join(__dirname, '/../react-uno/build')));
app.use("/game",express.static(path.join(__dirname, '/../react-uno/build')));




const server = app.listen(process.env.PORT || 3000, () => {
	const host = server.address().address
	const port = server.address().port
	console.log(`Server started on: ${host}:${port}`)
});
