const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { get } = require("http");

const app = express();

const dbPath = path.join(__dirname, "project.db");
let db = null;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.put(
  "/update-profile",
  authenticationToken,
  upload.single("image"),
  async (request, response) => {
    const { username } = request;
    const { firstName, lastName, bio } = request.body;

    let updateFields = [];
    if (firstName !== undefined)
      updateFields.push(`first_name = '${firstName}'`);
    if (lastName !== undefined) updateFields.push(`last_name = '${lastName}'`);
    if (bio !== undefined) updateFields.push(`bio = '${bio}'`);
    if (request.file) {
      const imageUrl = `http://localhost:8000/uploads/${request.file.filename}`;
      updateFields.push(`profile_image = '${imageUrl}'`);
    }

    if (updateFields.length > 0) {
      const updateUserProfileQuery = `
        UPDATE Users
        SET ${updateFields.join(", ")}
        WHERE username = '${username}';
      `;

      await db.run(updateUserProfileQuery);
      response.send("Profile Updated Successfully");
    } else {
      response.status(400);
      response.send("No fields to update");
    }
  }
);

app.get("/users/search", authenticationToken, async (request, response) => {
  const { search } = request.query;
  const { username } = request;

  const searchUsersQuery = `
    SELECT
      *
    FROM
      Users
    WHERE
      username LIKE '%${search}%' AND
      NOT username = '${username}' 
    LIMIT 10;
  `;

  const usersList = await db.all(searchUsersQuery);
  response.send(usersList);
});

app.get(
  "/users/:id/follow-status",
  authenticationToken,
  async (request, response) => {
    const { id } = request.params;
    const { username } = request;

    try {
      const getFollowerIDQuery = `SELECT id FROM Users WHERE username = '${username}';`;
      const followerData = await db.get(getFollowerIDQuery);
      const followerID = followerData.id;

      const checkFollowStatusQuery = `
        SELECT 1 FROM Followers
        WHERE follower_id = '${followerID}' AND following_id = '${id}';
      `;

      const followStatus = await db.get(checkFollowStatusQuery);
      if (followStatus) {
        response.send({ isFollowing: true });
      } else {
        response.send({ isFollowing: false });
      }
    } catch (error) {
      response.status(500).send("Error checking follow status");
    }
  }
);

app.post("/users/follow", authenticationToken, async (request, response) => {
  const { username } = request;
  const { id, followingID } = request.body;

  try {
    const getFollowerIDQuery = `SELECT id FROM Users WHERE username = '${username}';`;
    const followerData = await db.get(getFollowerIDQuery);
    const followerID = followerData.id;

    const createFollowQuery = `
      INSERT INTO Followers (id, follower_id, following_id)
      VALUES ('${id}', '${followerID}', '${followingID}');
    `;

    await db.run(createFollowQuery);
    response.send("Followed Successfully");
  } catch (error) {
    response.status(500).send("Error following user");
  }
});

app.delete(
  "/users/unfollow",
  authenticationToken,
  async (request, response) => {
    const { username } = request;
    const { followingID } = request.body;

    try {
      const getUserQuery = `SELECT id FROM Users WHERE username = '${username}'`;
      const followerData = await db.get(getUserQuery);
      const followerID = followerData.id;

      const deleteFollowQuery = `
        DELETE FROM Followers
        WHERE follower_id = '${followerID}' AND following_id = '${followingID}';
      `;

      await db.run(deleteFollowQuery);
      response.send("Unfollowed Successfully");
    } catch (error) {
      response.status(500).send("Error unfollowing user");
    }
  }
);

app.post(
  "/post",
  authenticationToken,
  upload.single("image"),
  async (request, response) => {
    const { username } = request;
    const { id, content } = request.body;

    const getUserQuery = `SELECT id FROM Users WHERE username = '${username}'`;
    const userData = await db.get(getUserQuery);
    const userID = userData.id;

    let imageUrl = null;
    if (request.file) {
      imageUrl = `http://localhost:8000/uploads/${request.file.filename}`;
    }

    try {
      const postQuery = `
    INSERT INTO Posts
      (id, user_id, content, image)
    VALUES (
      '${id}',
      '${userID}',
      '${content}',
      '${imageUrl}'
    );
  `;
      await db.run(postQuery);
      response.send("Posted Successfully");
    } catch (err) {
      response.status(500).send("Error in Posting");
    }
  }
);

app.get("/feeds", authenticationToken, async (request, response) => {
  const { username } = request;

  const getUserQuery = `SELECT id FROM Users WHERE username = '${username}'`;
  const userData = await db.get(getUserQuery);
  const userID = userData.id;

  try {
    const getFeedsQuery = `
    SELECT 
      Posts.image, Posts.content, Posts.created_at, Posts.id
    FROM
      Posts
    INNER JOIN Followers
      ON Posts.user_id = Followers.following_id
    WHERE
      Followers.follower_id = '${userID}'
    ORDER BY Posts.created_at DESC;
  `;

    const feedsData = await db.all(getFeedsQuery);
    response.send(feedsData);
  } catch (err) {
    response.status(400).send("Failed to Fetch the data");
  }
});
