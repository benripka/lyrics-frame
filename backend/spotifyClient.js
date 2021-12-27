import axios from "axios"
import qs from "qs"

class SpotifyClient {

    constructor() {
    }

    async getCurrentlyPlayingSong(token) {
        try {
            return this.getEndpoint("/me/player/currently-playing", token)
        } catch (e) {
            throw new Error(`Failed to get the currently playing song from Spotify`)
        }
    }

    async getEndpoint(endpoint, token) {
        let config = {
            headers: this.getHeaders(token),
        };
        return axios.get(`https://api.spotify.com/v1${endpoint}`, config)
    }

    getHeaders(token) {
        return {
            'Authorization': 'Bearer ' + token
        }
    }
}

export default SpotifyClient