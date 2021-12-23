import {AZLyricsCrawler, LyricsDotComCrawler} from "./Crawlers.js";

class LyricsClient {

    CRAWLERS = [
        new LyricsDotComCrawler(),
        new AZLyricsCrawler()
    ]

    async getLyrics(song, artist) {
        for (let i in this.CRAWLERS) {
            try {
                return this.CRAWLERS[i].getLyrics(song, artist)
            } catch (e) {
                console.log(`Failed to getch lyrics for ${song} by ${artist} from ${crawler.constructor.name}`)
            }
        }
        throw new Error(`Failed to fetch lyrics for ${song} by ${artist}`)
    }
}

export default LyricsClient
