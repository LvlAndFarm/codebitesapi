var express = require('express');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();

const argon2 = require('argon2');

const jwtlib = require('jsonwebtoken');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('404 Not found');
});

router.get('/login', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    const hash = await argon2.hash(req.query.password);

    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    let userInfo = await LoadUser(req.query.username, req.query.password, db, async (status) => {

        console.log("USE RINFO:")
        console.log(status);

        const token = jwtlib.sign({
            username: status.username,
            first_name: status.first_name,
            last_name: status.last_name,
            type: status.type
        }, 'notsosecret', {
            expiresIn: 10000000,
        });

        await res.json({
            status: status == false ? "fail" : "success",
            username: status != false ? status.username : null,
            token
        });

        db.close();
    });
});

router.get('/signup', async function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    const hash = await argon2.hash(req.query.password);

    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    db.run(`
INSERT INTO users (
 username,
 first_name,
 last_name,
 password
 )
VALUES
 (
 ?,
 ?,
 ?,
 ?);
    `, [req.query.username, req.query.firstname, req.query.lastname, hash], function(err) {
        if (err) {
            return console.log(err.message);
        }


        res.json({
            username: req.query.username,
            firstname: req.query.firstname,
            lastname: req.query.lastname
        });

        // close the database connection
        db.close();
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
});

async function LoadUser(username, password, db, callback) {
    console.log(username);

    let status = false;

    await db.get(`
SELECT 
*
FROM users
WHERE
username = ?;
    `, [username], async function(err, row) {
        if (err) {
            console.log(err)
        }


        try {
            if (await argon2.verify(row.password, password)) {
                // password match
                status = row;
                console.log("MATCHED")
                console.log(status);
            } else {
                // password did not match
            }
        } catch (err) {
            // internal failure
        }

        callback(status);
    });

    return null;
}

module.exports = router;
