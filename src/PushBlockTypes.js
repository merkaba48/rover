class PushBlockTypes {

    // #todo #idea iceBlock doesn't stop moving until it hits a boundary.
    //             mirrorBlock reflects a laser
    //             player can push two lightBlocks in a row
    //             energyBlock can power something when in place

    constructor() {
        this.list = [
            {
                id: 0,
                name: 'default',
                tileID: 0
            },
            {
                id: 1,
                name: 'laser',
                tileID: 1
            },
            {
                id: 2,
                name: 'laserCapture',
                tileID: 2
            }
        ];
    }

    getByName(name) {
        for (let type of this.list) {
            if (type.name === name) {
                return type;
            }
        };
    }

}
