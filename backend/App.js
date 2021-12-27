import SpotifyClient from "./spotifyClient.js";
import LyricsClient from "./lyricsCrawler.js";
import express from "express"
import path from "path";
import {URL} from 'url';
import qs from "qs"; // in Browser, the URL in native accessible on window
// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const CLIENT_ID = "c910df0d95ee4391959317ecdcceeb78"
const REDIRECT_URI = "http://13.114.161.124:3000/"

const app = express()
const port = 3000

let lyrics = ""
let song = ""
let artist = ""

app.use(express.static(path.join(__dirname, "/public")))

app.get('/login', (req, res) => {

    let state = "state"
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

app.get('/lyrics', (req, res) => {
    res.send({
        song: song,
        artist: artist,
        lyrics: lyrics
    })
})

const updateLyrics = async () => {

    // Initialize data providers
    const spotifyClient = new SpotifyClient()
    const lyricsClient = new LyricsClient()
    while (true) {
        try {
            const res = await spotifyClient.getCurrentlyPlayingSong()
            let newSong = res.data["item"]["name"]
            let newArtist = res.data["item"]["artists"][0]["name"]
            let newLyrics = await lyricsClient.getLyrics(newSong, newArtist)

            if (song !== newSong) {
                lyrics = newLyrics
                song = newSong
                artist = newArtist
            }
            await snooze(1000)
        } catch (e) {
            console.log(e)
            await snooze(1000)
        }
    }
}

(async () => {
    try {
        await updateLyrics();
    } catch (e) {
        // Deal with the fact the chain failed
    }
})();

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
