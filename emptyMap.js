"use strict";

class Map {
    constructor() {
        this.width = 10;
        this.height = 10;
        this.map = [];
    }

    init(){
        let emptyMap = [];
        for (let i = 0; i < this.width; i++) {
            let row = [];
            for (let j = 0; j < this.height; j++) {
                row[j] = 0;
            }
            emptyMap.push(row);
        }
        this.map = emptyMap;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.init();
    }

    getCell(x, y) {
        return this.map[x][y];
    }
    setCell(x, y, value) {
        this.map[x][y] = value;
    }
    getMap(){
        return this.map;
    }

}
module.exports = Map;