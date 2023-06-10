const fs = require('fs');
const user_data = fs.readFileSync('user_data.sql', 'utf8');
const car_data = fs.readFileSync('car_data.sql', 'utf8');

const sqlite3 = require('sqlite3').verbose();
const dbPath = 'database.db'; // Update with the correct path to your database file

// SQL statements for creating tables
const createTableUser = `
  CREATE TABLE IF NOT EXISTS USER_DATA (
    id INTEGER PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    gender TEXT,
    ip_address TEXT
  );
`;

const createTableCar = `
  CREATE TABLE IF NOT EXISTS CAR_DATA (
    id INTEGER PRIMARY KEY,
    car_make TEXT,
    car_model TEXT,
    car_model_year INTEGER,
    car_vin TEXT
  );
`;

function runSQLQuery(db, sqlQuery) {
    return new Promise((resolve, reject) => {
        db.exec(sqlQuery, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function connectAndRunQueries() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }

        console.log('Connected to the database.');

        runSQLQuery(db, createTableUser)
            .then(() => runSQLQuery(db, createTableCar))
            .then(() => runSQLQuery(db, user_data))
            .then(() => runSQLQuery(db, car_data))
            .then(() => {
                console.log('All SQL queries executed successfully.');
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Database connection closed.');
                });
            })
            .catch((error) => {
                console.error('Error executing SQL queries:', error);
                db.close((err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log('Database connection closed.');
                });
            });
    });
}

connectAndRunQueries();
