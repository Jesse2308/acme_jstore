const {
    client, createTables, createUser,fetchUser,authenticate,findUserWithToken,} = require('./db');

    const express = require('express');
    const app = express();
    app.use(express.json());

    const path = require('path');
    app.get('/', () => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    app.use('/assets', express.static(path.join(__dirname, 'assets')));

    const isLoggedIn = async() => {
        try {
            req.user = await findUserWithToken(req.headers.authorization);
            next();
        }
        catch (ex){
            next(ex);
        }
    };

    app.post('/api/auth/login', async(req,res,next) => {
        try{
            res.send(await authenticate(req.body));
        }
        catch(ex){
            next(ex);
        }});

    app.get('/api/auth/me', isLoggedIn, async(req,res,next) => {
        try{
            res.send(req.user);
        }
        catch(ex){
            next(ex);
        }
    });

    app.get('/api/users', async(req,res,next) => {
        try{
            res.send(await fetchUser());
        }
        catch(ex){
            next(ex);
        }});

        app.use((err,req,res,next) => {
            console.error(err);
            res.status(err.status || 500).send({error: err.message ? err.message : err});
        });

        const init = async() => {
            const port = process.env.PORT || 3000;
            await client.connect();
            console.log('Connected to database');

            await createTables();
            console.log('Created tables');

            const [Jesse, Sana, Dosi, Rexx] = await Promise.all([
                createUser({username:'Jesse', password:'1234'}),
                createUser({username:'Sana', password:'1234'}),
                createUser({username:'Dosi', password:'1234'}),
                createUser({username:'Rexx', password:'1234'}),
            ]);

            console.log(await fetchUser());

            app.listen(port, () => {
                console.log(`Listening on port ${port}`);
            }
            );
        }

        init();