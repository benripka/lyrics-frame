import axios from "axios"
import qs from "qs"

class SpotifyClient {

    constructor() {
        this.token = "BQBAMvVJbWd8lWsumFtXvF4QRDp9IwRBSULibvfM_NKjheCf5s0VZ9f-M-_Q9sZG-LTGEEzSwzjM_mI2MjIhELRMpGan3aCVblsQj0BWZ1UTDRTQNOrgDupEDUjOyEbcr0SiPF0V7gbC8ryDd5AugHmVvFk2JiF3bhUhy8u5"
    }

    async getCurrentlyPlayingSong() {
        try {
            return this.getEndpoint("/me/player/currently-playing")
        } catch (e) {
            throw new Error(`Failed to get the currently playing song from Spotify`)
        }
    }

    async getEndpoint(endpoint) {
        let config = {
            headers: this.getHeaders(),
        };
        return axios.get(`https://api.spotify.com/v1${endpoint}`, config)
    }

    getHeaders() {
        return {
            'Authorization': 'Bearer ' + this.token
        }
    }
}

export default SpotifyClient