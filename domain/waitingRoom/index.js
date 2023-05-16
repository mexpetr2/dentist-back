class WaitingRoomDomain {
    constructor(storage) {
        this.storage = storage;
    }

    list() {
        const results = this.storage.getAll();
        const waitingRooms = {
            A: [],
            B: [],
            C: [],
            D: [],
        };
        for(let reference in results) {
            waitingRooms[reference.charAt(1)].push({reference, ...results[reference]});
        }
        return waitingRooms;
    }

    get(id) {
        const results = this.storage.getAll();
        const waitingRoom = [];
        for (let reference in results) {
            if (id === reference.charAt(1)) {
                waitingRoom.push({reference, ...results[reference]});
            }
        }
        return waitingRoom;
    }

    post(idRdv,numSecu,name){
        
    }
}

module.exports.WaitingRoomDomain = WaitingRoomDomain;