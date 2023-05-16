const fs = require('fs');
const readline = require('readline');

const DATABASE = new Map();

const AppointmentStorage = {
    getAll : () => {
        const results = {};
        DATABASE.forEach((value, key) => {
            results[key] = {...value};
        });
        return results;
    },
    get : (id) => {
        return DATABASE.get(id);
    },
    update : (id) => {
        return DATABASE.get(id);
    },
    reinit : () => {
        initStorage(DATABASE);
    }
}

const initStorage = (storage) => {
    const stream = fs.createReadStream('./data.csv');
    const rl = readline.createInterface({ input: stream });
    const today = new Date();
    rl.on('line', (row) => {
        const data = row.split(',');
        storage.set(data[0], {
            date: today.toLocaleDateString('fr'),
            noSS: data[1],
            name: data[2],
        });
    });
    rl.on('close', () => {
        console.log(`Initialization successfull with ${storage.size} appointments.`);
    });
};

initStorage(DATABASE);

module.exports = AppointmentStorage;