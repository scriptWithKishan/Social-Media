const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const app = express();

const dbPath = path.join(__dirname, "project.db");
let db = null;

// Use CORS middleware
const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(cors(corsOptions));

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(8000, () => {
      console.log("Server Running at http://localhost:8000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const authenticationToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }

  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT token1");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT token2");
      } else {
        request.username = payload.username;
        next();
      }
    });
  }
};

app.post("/users/register", async (request, response) => {
  const { id, username, email, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    const createUserQuery = `
            INSERT INTO 
                Users (id, username, email, password)
            VALUES (
                '${id}',
                '${username}',
                '${email}',
                '${hashedPassword}'
            );
        `;
    const dbResponse = await db.run(createUserQuery);
    console.log(dbResponse);
    const newUserId = dbResponse.lastID;
    response.send(`Created New User Successfully`);
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/users/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM Users WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const payload = {
        username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.get("/profile", authenticationToken, async (request, response) => {
  const { username } = request;
  const getUserDetailsQuery = `SELECT * FROM Users WHERE username = '${username}';`;
  const userDetails = await db.get(getUserDetailsQuery);
  response.send(userDetails);
});
