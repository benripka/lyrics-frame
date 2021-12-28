
class Session {
    constructor(id) {
        this.id = id
        this.token = null
        this.lastAccess = Date.now()
    }
}

export class SessionManager {

    static SESSION_TIMOUT = 60 * 60 * 1000

    constructor() {
        this.sessions = []
        // setInterval(this.cleanup, 60 * 60 * 1000)
    }

    cleanup() {
        this.sessions.forEach((session, index) => {
            // If it's been more than the session timeout since last access
            if (Date.now() - session.lastAccess > SessionManager.SESSION_TIMOUT) {
                this.sessions.splice(index, 1)
            }
        })
    }

    newSession(id) {
        this.sessions.push(new Session(id))
    }

    getSessionToken(id) {
        this.sessions.forEach((session) => {
            if(session.id === id) {
                session.lastAccess = Date.now()
                return session.token
            }
        })
        throw new Error(`Could no fetch spotify code for id ${id}`)
    }

    setSessionToken(id, token) {
        this.sessions.forEach((session) => {
            if(session.id === id) {
                session.token = token
            }
        })
        throw Error(`Failed to set the session token: ${id}, ${token}`)
    }
}