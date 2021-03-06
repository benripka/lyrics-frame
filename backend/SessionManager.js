
class Session {
    constructor(id) {
        this.id = id
        this.token = null
        this.lastAccess = Date.now()
    }
}

export class SessionManager {

    static SESSION_TIMEOUT = 60 * 60 * 1000

    constructor() {
        this.sessions = []
        setInterval(this.cleanup, 60 * 60 * 1000)
    }

    cleanup() {
        this.sessions.forEach((session, index) => {
            // If it's been more than the session timeout since last access
            if (Date.now() - session.lastAccess > SessionManager.SESSION_TIMEOUT) {
                this.sessions.splice(index, 1)
            }
        })
    }

    newSession(id) {
        this.sessions.push(new Session(id))
    }

    getSessionToken(id) {
        return this.sessions.find((session) => session.id === id).token
    }

    setSessionToken(id, token) {
        this.sessions.forEach((session) => {
            if(session.id === id) {
                session.token = token
            }
        })
    }
}