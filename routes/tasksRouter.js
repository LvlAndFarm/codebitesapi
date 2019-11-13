var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var jwtVerify = require('./common/jwt')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/list', function(req, res, next) {
    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    let taskList = LoadTasks(db, (tasks) => {
        res.json(tasks);
        db.close();
    })
});

router.get('/active', function(req, res, next) {
    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    let taskList = LoadTasks(db, (tasks) => {
        res.json(tasks);
        db.close();
    })
});

async function LoadTasks(db, callback, assignee=null) {
    let query = `
SELECT 
*
FROM tasks;
    `;

    if (assignee!=null) {
        query = `
        SELECT 
*
FROM tasks
INNER JOIN users ON tasks.AssigneeID=users.ID;
        `
    }

    await db.all(query, [], async function(err, rows) {
        if (err) {
            console.log(err)
        }
        callback(rows);
    });
}



module.exports = router;
