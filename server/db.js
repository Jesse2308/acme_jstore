const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_jstore_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT = process.env.JWT || 'jwt-secret';
if (JWT === 'jwt-secret'){
    console.log('If deployed, set process.env.JWT to a better jwt secret');
}

const createTables = async() => {
    const SQL = `
    DROP TABLE IF EXISTS users;
    CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        token UUID
    );
    `; 
    await client.query(SQL);
};

const createUser = async({username, password}) => {
    const SQL = 'INSERT INTO users(username, password) values($1, $2) returning *';
    const hash = await bcrypt.hash(password, 10);
    return (await client.query(SQL, [username, hash])).rows[0];
};

const authenticate = async({username, password}) => {
    const SQL = `SELECT id, username, password FROM users WHERE username = $1;`;
    const  response = await client.query(SQL, [username]);
    if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password)) === false){
        const error = Error('bad credentials');
        error.status = 401;
        throw error;
    }
    const token = await jwt.sign({id: response.rows[0].id}, JWT);
    return {token};
};

const findUserWithToken = async(token) => {
    let id;
    try{
        const payload = await jwt.verify(token, JWT);
        id = payload.id;
    }
    catch(ex){
        const error = Error('bad token');
        error.status = 401;
        throw error;
    }
    return response.rows[0];
};

const fetchUser = async() => {
    const SQL = `SELECT id, username FROM users;`;
    const response = await client.query(SQL);
    return response.rows;
};

module.exports = { client, createTables, createUser, authenticate, findUserWithToken, fetchUser };