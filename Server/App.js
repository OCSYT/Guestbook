import express from "express";
import cors from "cors";
import pg from "pg"
import dotenv from "dotenv"
import session from "express-session";
import { shouldSendSameSiteNone } from "should-send-same-site-none";
dotenv.config();
const App = express();
const Port = process.env.PORT || 8080;
const Database = new pg.Pool({
    connectionString: process.env.DB_URL,
});

// Generate random session secret if not found
let SessionSecret = process.env.SESSION_SECRET;
if (!SessionSecret) {
    SessionSecret = Math.random().toString(36).slice(2) + Date.now().toString(36);
}
App.use(cors({ credentials: true, origin: true }));
App.use(express.json());
App.set("trust proxy", true);
App.use(
    session({
        secret: SessionSecret,
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
        },
    })
);
App.use(shouldSendSameSiteNone);


function CheckDatabaseConnection() {
    Database.connect()
        .then(() => {
            console.log("Database connected successfully");
        })
        .catch((err) => {
            console.error("Database connection error:", err);
            process.exit(1);
        });
}
CheckDatabaseConnection();

App.get("/", (Request, Response) => {
    Response.json({ Response: "Connection successful!" });
});


function GetSessionID(Request) {
    return Request.session.id;
}

App.get("/get-session", (Request, Response) => {
    const SessionID = GetSessionID(Request);
    Response.json({ SessionID: SessionID });
});


App.get("/fetch-messages", async (Request, Response) => {
    try {
        const Result = await Database.query(
            "SELECT * FROM Guestbook ORDER BY MessageID DESC LIMIT $1",
            [process.env.FETCH_LIMIT || 100]
        );
        Response.json(Result.rows);
    } catch (Error) {
        Response.status(500).json({ Error: "Internal server error" });
    }
});

App.post("/add-message", async (Request, Response) => {
    const { Username, MessageContent } = Request.body;
    if (!Username || !MessageContent) {
        return Response.status(400).json({
            Error: "Name and message are required",
        });
    }
    const SessionID = GetSessionID(Request);
    try {
        await Database.query(
            "INSERT INTO Guestbook (Username, MessageContent, SessionID) VALUES ($1, $2, $3)",
            [Username, MessageContent, SessionID]
        );
        Response.status(201).json({ Success: "Message added successfully" });
    } catch (Error) {
        console.error("Error adding message:", Error);
        Response.status(500).json({ Error: "Internal server error" });
    }
});

App.post("/delete-message", async (Request, Response) => {
    const { MessageID } = Request.body;
    if (!MessageID) {
        return Response.status(400).json({ Error: "Message ID is required" });
    }
    const SessionID = GetSessionID(Request);
    try {
        const Result = await Database.query(
            "DELETE FROM Guestbook WHERE MessageID = $1 AND SessionID = $2",
            [MessageID, SessionID]
        );
        if (Result.rowCount === 0) {
            return Response.status(404).json({
                Error: "Message not found or unauthorized",
            });
        }
        Response.json({ Success: "Message deleted successfully" });
    } catch (Error) {
        Response.status(500).json({ Error: "Internal server error" });
    }
});

App.listen(Port, () => {
    console.log(`Server running on port ${Port}`);
});