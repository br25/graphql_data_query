const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const sqlite3 = require('sqlite3').verbose();
const dbPath = 'database.db';

const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

const app = express();
const port = 3001;

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        first_name: { type: GraphQLString },
        last_name: { type: GraphQLString },
        email: { type: GraphQLString },
        gender: { type: GraphQLString },
        ip_address: { type: GraphQLString }
    }
});

const CarType = new GraphQLObjectType({
    name: 'Car',
    fields: () => ({
        car_make: { type: GraphQLString },
        car_model: { type: GraphQLString },
        car_model_year: { type: GraphQLInt },
        car_vin: { type: GraphQLString },
        car_owner: {
            type: UserType,
            resolve: (parent, args) => {
                const ownerId = parent.id;
                if (ownerId) {
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT * FROM USER_DATA WHERE id = ?';
                        db.get(query, [ownerId], (error, row) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                } else {
                    return null;
                }
            }
        }
    })
});



const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            getUser: {
                type: UserType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLInt) }
                },
                resolve: (parent, args) => {
                    const id = args.id;
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT * FROM USER_DATA WHERE id = ?';
                        db.get(query, [id], (error, row) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                }
            },
            getAllUsers: {
                type: new GraphQLList(UserType),
                resolve: () => {
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT * FROM USER_DATA';
                        db.all(query, (error, rows) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(rows);
                            }
                        });
                    });
                }
            },
            getCar: {
                type: CarType,
                args: {
                    id: { type: new GraphQLNonNull(GraphQLInt) }
                },
                resolve: (parent, args) => {
                    const id = args.id;
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT * FROM CAR_DATA WHERE id = ?';
                        db.get(query, [id], (error, row) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(row);
                            }
                        });
                    });
                }
            },
            getAllCars: {
                type: new GraphQLList(CarType),
                resolve: () => {
                    return new Promise((resolve, reject) => {
                        const query = 'SELECT * FROM CAR_DATA';
                        db.all(query, (error, rows) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(rows);
                            }
                        });
                    });
                }
            },
        }
    })
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/graphql`);
});
