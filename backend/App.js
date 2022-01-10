import SpotifyClient from "./spotifyClient.js";
import LyricsClient from "./lyricsCrawler.js";
import express from "express"
import path from "path";
import {URL} from 'url';
import qs from "qs";
import axios from "axios";
import {SessionManager} from "./SessionManager.js"; // in Browser, the URL in native accessible on window
// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const CLIENT_ID = "c910df0d95ee4391959317ecdcceeb78"
const CLIENT_SECRET = "2556e031b28a405490062a2c7a680f4a"
const REDIRECT_URI = "http://13.114.161.124:3000/code"

const app = express()
const port = 3000

const sessionManager = new SessionManager()
const spotifyClient = new SpotifyClient()
const lyricsClient = new LyricsClient()

const tokens = {
    "D8:F1:5B:13:13:37": "BQCMCeCqJVMbkEHZxnW6_y9lxl8K-QrlzQkbHLn-sdV1vGdut4i0NT8e4SIVArjRoHJJ-pwFHPfRjursmjt9OLFA4yrNm6yZalQdNSIxmfG2rtVElE2B7CSyOfowfAmoNNqbccEF7_R0fhyM--A2dKgLorAfS_QWZTUlSLUQ"
}

app.use(express.static(path.join(__dirname, "/public")))

app.get('/login', (req, res) => {
    let state = req.query["sessionId"]
    let scope = 'user-read-currently-playing'
    res.redirect('https://accounts.spotify.com/authorize?' +
        qs.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope: scope,
            redirect_uri: REDIRECT_URI,
            state: state
        }))
})

app.get("/code", (req, res) => {
    let sessionId = req.query["state"]
    let code = req.query["code"]

    let body = qs.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
    })

    axios({
        method: "post",
        url: 'https://accounts.spotify.com/api/token',
        data: body,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        }
    }).then((auth_res) => {
        let accessToken = auth_res.data["access_token"]
        let refreshToken = auth_res.data["refresh_token"]
        sessionManager.newSession(sessionId)
        sessionManager.setSessionToken(sessionId, accessToken)
        res.send("Successful Login! Return to the other tab!")
    }).catch(e => {
        console.log(e)
        res.send("Failed")
    })
})

app.get('/lyrics', async (req, res) => {
    try {
        let sessionId = req.query["sessionId"]
        let token = sessionManager.getSessionToken(sessionId)
        getLyrics(token).then((info) => {
            res.status(200).send(info)
        }).catch(e => {
            res.status(404).send( e)
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

app.get("/lyrics/test", (req, res) => {
    try {
        let lyrics = '{"song":"Secrets (Cellar Door)","artist":"Radical Face","lyrics":"Drawn into the frost on the glass was a map pointing to my secret hiding place\nIt lead you to the tree with the split in its trunk on the way into your familys yard\nIn that tree you saw I brought the dog back to life\n\nI watch you from the branches while you stared from the ground with a look I couldnt understand\nSo I said \"leave me alone, if your only words are ugly ones\"\nAnd you just smiled and said \"come and show me how its done\"\n\nYou dug up your old bird, and you held her to your chest as I breathed life back into her lungs\nAnd she blinked and flapped her wings, she sang a familiar song\nBefore she took to the air and cut a path into the woods\n\nAnd then I cried, because all my life I have known something was off\nBut you just shrugged and said: \"it aint just you\"\nSlipping on the pavement where we ran from the ghosts that you saw behind the cellar door\nThats the way that you showed me that I wasnt quite alone\nThat youd also touched the dead before"}'
        res.status(200).send(lyrics)
    } catch (e) {
        res.status(400).send("Failed")
    }
})

app.get("/lyrics/frame", async (req, res) => {
    try {
        let macAddress = req.query["mac"]
        let token = tokens[macAddress]
        let lyrics = await getLyrics(token)
        res.status(200).send(lyrics)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

const getLyrics = async (token) => {
    try {
        const res = await spotifyClient.getCurrentlyPlayingSong(token)
        let song = res.data["item"]["name"]
        let artist = res.data["item"]["artists"][0]["name"]
        let lyrics = await lyricsClient.getLyrics(song, artist)
        return {
            song: song,
            artist: artist,
            lyrics: lyrics
        }
    } catch (e) {
        console.log(e)
        await snooze(1000)
    }
}

app.listen(port, () => {
    console.log(`Example app listening at http://13.114.161.124:${port}`)
})
