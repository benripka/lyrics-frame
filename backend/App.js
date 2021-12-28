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
        res.send("Success")
    }).catch(e => {
        console.log(e)
        res.send("Failed")
    })
})

app.get('/lyrics', async (req, res) => {
    let sessionId = req.query["sessionId"] || null
    let token = sessionManager.getSessionToken(sessionId)
    getLyrics(token).then((info) => {
        res.status(200).send(info)
    }).catch(e => {
        res.status(404).send( e)
    })
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
    console.log(`Example app listening at http://13.114.161.124:3000:${port}`)
})
