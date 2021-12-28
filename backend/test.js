import {SessionManager} from "./SessionManager.js";


const sessionManager = new SessionManager()

sessionManager.newSession("ben")
sessionManager.setSessionToken("ben", "token")
sessionManager.setSessionToken("ben", "oldToken")

console.log(sessionManager.getSessionToken("ben"))