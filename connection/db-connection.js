const db_connection = require('mongoose');

class DbInteraction {
    constructor() {
        this.options = {
            useNewUrlParser: true, 
            useCreateIndex: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        }
    }

    connectToDb = () => {
        debugger;


        db_connection.connect(process.env.DATABASE, this.options).then(() => {
            console.log('%c%s', 'color: #00a3cc', 'Connected successfully to database');
        }).catch((err) => {
            console.log('%c%s', 'color: #e6000c', err);
        });
    };   
}

module.exports = DbInteraction;


