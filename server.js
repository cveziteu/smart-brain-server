// ExpressJS
const express = require('express');

//!     Body Parser
const bodyParser = require('body-parser');

//!     CORS
const cors = require('cors');

//!     Knex
const knex = require('knex');
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'admin',
        password: 'test',
        database: 'smart-brain'
    }
});

//!     bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

//!     Main app
const app = express();
// adding bodyparser and CORS to our app
app.use(bodyParser.json());
app.use(cors());


//!                                                                                                 SERVER COMMUNICATION                    

//?                                                                                                 /
app.get('/', (request, response) => {
    db('users').then(data => {
        response.json(data);
    })
})

//?                                                                                                 /login
app.post('/login', (request, response) => {
    const { email, password } = request.body;
    db.select('email', 'hash').from('login')
        .where('email', '=', email)
        .then(data => bcrypt.compare(password, data[0].hash))
        .then(result => {
            if (result) {
                db('users')
                    .where('email', '=', email)
                    .then(user => response.json(user[0]))
                    .catch(err => {
                        response.json.status(400).json('unable to get user')
                    })
            }
            else {
                response.status(400).json("wrong credentials");
            }
        })
        .catch(err => response.status(400).json('bad request'));
})


//?                                                                                                 /register
app.post('/register', (request, response) => {
    const { email, username, password } = request.body;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        db.transaction(trx => {
            trx('login')
                .insert({
                    hash: hash,
                    email: email
                })
                .returning('email')
                .then(loginEmail => {
                    return trx('users')
                        .returning('*')
                        .insert({
                            email: loginEmail[0],
                            username: username,
                            joined: new Date()
                        })
                        .then(user => {
                            response.json(user[0]);
                        })
                })
                .then(trx.commit)
                .catch(trx.rollback)
        })
        .catch(err => {
            response.status(400).json('unable to register')
        })
    })
})


//?                                                                                                 /profile/:id
app.get('/profile/:id', (request, response) => {
    const {id} = request.params;

    db('users').where({id})
        .then(user => {
            if (user.length > 0) {
                response.json(user[0])
            }
            else {
                response.status(400).json('not found')
            }
        }) 
        .catch(err => response.status(400).json('error'))        

})


//?                                                                                                 /image
app.put('/image', (request, response) => {
    const {id, imageUrl} = request.body;
    db.transaction(trx => {
        trx('entries')
            .insert({
                userId: id,
                entry: imageUrl,
                posted: new Date()
            })
            .returning('userId')
            .then(userId => {
                return trx('users')
                    .where('id', '=', userId[0])
                    .increment('entries', 1)
                    .returning('entries')
                    .then(entries => {
                        response.json(entries[0]);
                    })
                    .catch(err => response.status(400).json('unable to fetch entries'));
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
    .catch(err => {
        response.status(400).json('Error - something went wrong.')
    })
    
})


//?                                                                                                 /imagenoface
app.post('/imagenoface', (request, response) => {
    const {id, imageUrl} = request.body;
    db('entries')
        .insert({
            userId: id,
            entry: imageUrl,
            posted: new Date()
        })
        .then(
            response.json('success')
        )
        .catch(
            response.status(400).json('failed')
        );
})



app.listen(3001, () => {
    console.log('Server is running on port 3001');
})

