import SpotifyClient from "./spotifyClient.js";
import LyricsClient from "./lyricsCrawler.js";
import express from "express"

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

const app = express()
const port = 3000

let lyrics = ""
let song = ""
let artist = ""

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
