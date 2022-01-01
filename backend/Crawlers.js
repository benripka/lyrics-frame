import axios from "axios";
import cheerio from "cheerio";

export class LyricsCrawler {
    constructor(baseURL) {
        this.baseURL = baseURL
    }

    extractLyrics(html, song) {
        throw new Error("Method Not Implemented")
    }

    getPath(song, artist) {
        throw new Error("Method Not Implemented")
    }

    buildUrl(song, artist) {
        let path = this.getPath(song, artist)
        return `${this.baseURL}${path}`
    }

    async getLyrics(song, artist) {
        try {
            let url = this.buildUrl(song, artist)
            console.log(`Hitting ${url}`)
            let res = await axios.get(url)
                return this.extractLyrics(res.data, song)
        } catch (e) {
            throw new Error(`Failed to get the lyrics for: ${song} by ${artist}`)
        }
    }
}

export class AZLyricsCrawler extends LyricsCrawler {

    constructor() {
        super("https://www.azlyrics.com/lyrics");
    }

    extractLyrics(html, song) {
        const $ = cheerio.load(html)
        return $(`b:contains(${song})`).siblings().next().text()
    }

    getPath(song, artist) {
        return `/${artist.split(" ").join("").toLowerCase()}/${song.split(" ").join("").toLowerCase()}.html`
    }
}

export class LyricsDotComCrawler extends LyricsCrawler {

    constructor() {
        super("http://www.songlyrics.com");
    }

    extractLyrics(html, song) {
        const $ = cheerio.load(html)
        return $(`#songLyricsDiv`).text()
    }

    getPath(song, artist) {
        return `/${artist.split(" ").join("-").toLowerCase()}/${song.split(" ").join("-").toLowerCase()}-lyrics/`
    }
}

export class GeniusCrawler extends LyricsCrawler {
    constructor() {
        super("https://genius.com");
    }

    getPath(song, artist) {
        let path = `/${artist.split(" ").join("-").toLowerCase()}/${song.split(" ").join("-").toLowerCase()}-lyrics/`
        return path.charAt(0).toUpperCase() + path.slice(1)
    }

    extractLyrics(html, song) {
        const $ = cheerio.load(html)
        return $("data-lyrics-container[value='true']" ).text()
    }
}

Object.setPrototypeOf(AZLyricsCrawler.prototype, LyricsCrawler.prototype);
Object.setPrototypeOf(LyricsDotComCrawler.prototype, LyricsCrawler.prototype);

