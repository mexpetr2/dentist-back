const express = require('express');
const storage = require('../storage');

const appointmentDomain = new (require('../domain/appointment').AppointmentDomain)(storage);
const waitingRoomDomain = new (require('../domain/waitingRoom').WaitingRoomDomain)(storage);
const router = express.Router();
const fs = require('fs');

const computeResponse = (resp, data) => {
    if (data === undefined) {
        return resp.status(404).send(undefined)
    }
    if (data === null) {
        return resp.status(204).send('{}');
    }
    return resp.status(200).send(data);
}

router.get('/waiting-rooms/', (req, resp) => {
    const list = waitingRoomDomain.list();
    return computeResponse(resp, list);
});

router.get('/waiting-rooms/:id', (req, resp) => {
    const id = req.params.id;
    const waitingRoom = waitingRoomDomain.get(id);
    return computeResponse(resp, waitingRoom);
});

router.get('/appointments/:id', (req, resp) => {
    const id = req.params.id;
    const appointment = appointmentDomain.get(id);
    return computeResponse(resp, appointment);
});

router.patch('/appointments/:id', (req, resp) => {
    const id = req.params.id;
    const appointment = appointmentDomain.update(id);
    return computeResponse(resp, appointment.id === id ? null : undefined);
});


// Créer un rdv et renvoyer l'ID

router.post('/appointments/newrdv', (req, resp) => {
    const raisonRdv = req.body.rdv;
    const nomPatient = req.body.lastName;
    const prenomPatient = req.body.firstName;
    const emailPatient = req.body.email;
    const numSecu = req.body.numSecu;

    function formatNumSecu(numbers) {
        let pattern = 'x xx xx xx xxx xxx';
        for (let i = 0; i < numbers.length; i++) {
            pattern = pattern.replace('x', numbers[i]);
        }
        return pattern;
    }

    const list = waitingRoomDomain.list();
    const roomList = ['A', 'B', 'C', 'D'];
    const nbRdvParSalle = {};
    const nbDeRdv = [];

    roomList.map((room) => {
        let tempsRdv = 0;
        list[room].map((selRoom) => {
            const rdvType = selRoom.reference[2];
            let rdvTime = 0;
            switch (rdvType) {
                case "1":
                    rdvTime = 30;
                    break;
                case "2":
                    rdvTime = 20;
                    break;
                case "3":
                    rdvTime = 60;
                    break;
                case "4":
                    rdvTime = 90;
                    break;
                default:
                    rdvTime = 0;
                    break;
            }
            tempsRdv += rdvTime;
        });
        nbRdvParSalle[room] = tempsRdv;
        nbDeRdv.push(tempsRdv);
    });

    const minRdv = Math.min(...nbDeRdv);
    const selectedRoom = [];
    roomList.map((room) => {
        if (nbRdvParSalle[room] === minRdv && minRdv < 600 && list[room].length < 15) {
            selectedRoom.push(room);
        }
    });
    if (selectedRoom.length === 0) {
        resp.status(401).json({ message: "Pas de rdv disponible" });
    }
    if (selectedRoom.length > 1) {
        if (raisonRdv === "1" && selectedRoom.includes("A")) {
            selectedRoom.splice(0, selectedRoom.length);
            selectedRoom.push("A");
        } else if (raisonRdv === "2" && selectedRoom.includes("B")) {
            selectedRoom.splice(0, selectedRoom.length);
            selectedRoom.push("B");
        } else {
            selectedRoom.splice(0, 1);
        }
    }
    const idRdv = list[selectedRoom[0]].length < 9 ? "#" + selectedRoom[0] + raisonRdv + "0" + (list[selectedRoom[0]].length + 1) : "#" + selectedRoom[0] + raisonRdv + (list[selectedRoom[0]].length + 1);
    const data = `${idRdv},${formatNumSecu(numSecu)},${prenomPatient} ${nomPatient} ${emailPatient}\n`;
    fs.appendFile('data.csv', data, (err) => {
        if (err) throw err;
        console.log('Data appended to file');
        waitingRoomDomain.reinit();
        resp.status(201).json({ idRdv });
    });
});

const routers = (app) => {
    app.use('/api/v1', router);
};

module.exports = routers;

