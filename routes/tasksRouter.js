var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
var jwtVerify = require('./common/jwt')

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.get('/list', jwtVerify, function(req, res, next) {
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

router.get('/active', jwtVerify, function(req, res, next) {
    if (req.user==null) {
        res.sendStatus(401);
        return;
    }

    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    let taskList = LoadTasks(db, (tasks) => {
        res.json(tasks);
        db.close();
    },req.user.id)
});

router.get('/:task/bid', jwtVerify, function(req, res, next) {
    let taskID = req.params.task;

    if (!taskID || isNaN(taskID)) {
        res.json({
            error: "Invalid params"
        })
    }

    let db = new sqlite3.Database('./users.db', (err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });
    let assigneeID = (!req.user&&isNaN(req.user.id)) ?null:req.user.id;

    let taskList = UpdateTask(db, () => {
        let taskList = LoadTasks(db, (tasks) => {
            res.json(tasks);
            db.close();
        },assigneeID)
    }, taskID, assigneeID)
});

async function UpdateTask(db, callback, taskID, assigneeID=null) {
    if (!(taskID)) return;
    let query = `
UPDATE tasks
SET AssigneeID=?
WHERE TaskID=?;
    `;
    console.log(assigneeID)
    await db.run(query, [assigneeID?assigneeID:null, taskID], async function(err, rows) {
        if (err) {
            console.log(err)
        }
        callback(rows);
    })
}

async function LoadTasks(db, callback, assignee=null) {
    console.log("Assignee "+assignee);
    let query = `
SELECT 
*
FROM tasks;
    `;

    if (assignee!=null) {
        query = `
SELECT 
TaskID, AssigneeID, Title, Description, STATUS, OwnerID, Price
FROM users
INNER JOIN tasks
ON users.ID=tasks.AssigneeID 
WHERE users.ID=? OR users.username=?
        `
    }

    await db.all(query, assignee==null?[]:[assignee, assignee], async function(err, rows) {
        if (err) {
            console.log(err)
        }
        callback(rows);
    });
}



module.exports = router;
