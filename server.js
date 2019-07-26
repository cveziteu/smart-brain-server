const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const db = {
    users: [
        {
            id: '1',
            username: 'Constantin',
            email: 'c.veziteu@gmail.com',
            password: '123',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            username: 'Laura',
            email: 'laura.veziteu@gmail.com',
            password: '1234',
            entries: 0,
            joined: new Date()
        },
    ]
}


app.get('/', (request, response) => {
    response.json(db.users);
})

app.post('/login', (request, response) => {
    if (request.body.email === db.users[0].email &&
        request.body.password === db.users[0].password) {
            // response.json('success');
            response.json(db.users[0]);
    }
    else {
        response.status(400).json('error');
    }
})

app.post('/register', (request, response) => {
    const { email, username, password} = request.body;

    db.users.push({
        id: '3',
        username: username,
        email: email,
        password: password,
        entries: 0,
        joined: new Date()
    })
    response.json(db.users[db.users.length-1])
})

app.get('/profile/:id', (request, response) => {
    const {id} = request.params;
    let found = false;

    db.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return response.json(user);
        }
    })
    if (!found) {
        response.status(404).json('user not found');
    }
})

app.put('/image', (request, response) => {
    const {id} = request.body;
    let found = false;

    db.users.forEach(user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return response.json(user);
        }
    })
    if (!found) {
        response.status(404).json('not found');
    }
})

app.listen(3001, () => {
    console.log('Server is running on port 3001');
})

