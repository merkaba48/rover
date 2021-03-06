class Canvas {
    constructor(game) {
        this.game = game;
        this.tileSize = 64;
        this.c=document.getElementById("canvas");
        this.ctx = this.c.getContext("2d");
        this.setDimensions();
    }

    getPlayableAreaDimensions() {
        var map = this.game.level.map.map,
            height = map.length * this.tileSize,
            width = map[0].length * this.tileSize

        return {
            width: width,
            height: height
        }
    }

    getLeftPadding() {
        return this.c.width / 2 - this.getPlayableAreaDimensions().width / 2;
    }

    getTopPadding() {
        return this.c.height / 2 - this.getPlayableAreaDimensions().height / 2;
    }

    setDimensions() {
        this.c.height = this.c.clientHeight;
        this.c.width = this.c.clientWidth;
        this.tileSize = 64;

        if (
            this.getPlayableAreaDimensions().width > this.c.width
            || this.getPlayableAreaDimensions().height > this.c.height
        ) {
            var map = this.game.level.map.map,
                heightTiles = map.length,
                widthTiles = map[0].length,
                newWidth = this.c.width / widthTiles,
                newHeight = this.c.height / heightTiles;

            if (newHeight < newWidth && newHeight < this.tileSize) {
                this.tileSize = Math.floor(newHeight);
            } else if (newWidth < this.tileSize) {
                this.tileSize = Math.floor(newWidth);
            }
        }
    }

    drawFrame() {
        this.drawLevel();
        this.drawPlayer();
        this.drawControls();
        this.drawEditor();
        this.drawMenu();
    }

    drawControls() {
        if (this.game.editor.enabled === true) {
            this.drawEditorControls();
            return
        }

        if (
            this.game.level.map.levelID > 1
            || Date.now() - this.game.level.startTime < 4000
            || this.game.controls.lastDirection !== null
        ) {
            return;
        }

        var fontSize = this.tileSize / 2;
        this.ctx.textAlign = 'center'; 
        this.ctx.font = fontSize + 'px Arial';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        var controls = 'Press W, A, S, D or UP, LEFT, DOWN, RIGHT to move',
            textWidth = this.ctx.measureText(controls).width;

        while (textWidth > this.c.width - this.tileSize) {
            fontSize -= 1;
            this.ctx.font = fontSize + 'px Arial';
            textWidth = this.ctx.measureText(controls).width;
        }

        this.ctx.fillText(controls, this.c.width / 2, this.c.height - fontSize * 2);
    }

    drawEditorControls() {
        if (this.game.editor.hideControls === true) {
            return;
        }
        var fontSize = this.tileSize / 2;
        this.ctx.textAlign = 'center'; 
        this.ctx.font = fontSize + 'px Arial';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        var controls = '[F]loor, [W]all, [P]layer, [E]xit, [B]lock, [L]aser, [R]otate, [H]ome, [S]how/hide controls, [CLICK] resize',
            textWidth = this.ctx.measureText(controls).width;

        while (textWidth > this.c.width - this.tileSize) {
            fontSize -= 1;
            this.ctx.font = fontSize + 'px Arial';
            textWidth = this.ctx.measureText(controls).width;
        }

        this.ctx.fillText(controls, this.c.width / 2, this.c.height - fontSize * 2);
    }

    drawEditor() {
        if (this.game.editor.enabled === false) {
            return;
        }

        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        this.ctx.lineWidth = 1;
        for (var row = 0; row < this.game.level.map.map.length; row++) {
            for (var column = 0; column < this.game.level.map.map[row].length; column++) {
                this.ctx.strokeRect(
                    this.getLeftPadding() + this.tileSize * column,
                    this.getTopPadding() + this.tileSize * row,
                    this.tileSize, 
                    this.tileSize
                );
            }
        }
        
        var focussedTile = this.game.editor.getFocussedTile();

        this.ctx.lineWidth = this.tileSize / 16;
        this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';

        if (focussedTile) {
            this.ctx.strokeRect(
                this.getLeftPadding() + (this.tileSize * focussedTile.x) + (this.ctx.lineWidth / 2),
                this.getTopPadding() + (this.tileSize * focussedTile.y) + (this.ctx.lineWidth / 2),
                this.tileSize - this.ctx.lineWidth, 
                this.tileSize - this.ctx.lineWidth
            );
        }
    }

    drawMenu() {
        if (this.game.menu.open === false) {
            return;
        }

        this.ctx.fillStyle = this.game.tiles.playerTiles[0].colour;
        this.ctx.fillRect(
            0,
            0,
            this.c.clientWidth, 
            this.c.clientHeight
        );

        this.ctx.textAlign = 'left'; 
        var fontSize = this.tileSize;
        this.ctx.font = fontSize + 'px Arial';

        switch (this.game.menu.menu.title) {
            case 'pause':
            case 'editor':

                for (var item = 0; item < this.game.menu.menu.items.length; item++) {
                    var alpha = 0.5;
                    if (this.game.menu.selectedItem === item) {
                        alpha = 1;
                    }
                    this.ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
                    this.ctx.fillText(this.game.menu.menu.items[item].title, fontSize, fontSize * (item + 1.5));
                }
                break;
            case 'levelSelect':

                var alpha = 0.5;

                if (this.game.menu.selectedItem === 0) {
                    alpha = 1;
                }
                this.ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
                this.ctx.fillText(this.game.menu.menu.items[0].title, fontSize, fontSize * 1.5);

                var levels = [];
                for (let item of this.game.menu.menu.items) {
                    if (!isNaN(item.action)) {
                        levels.push(item);
                    }
                }

                for (var item = 1; item < this.game.menu.menu.items.length; item++) {
                    var selected = false;
                    if (this.game.menu.selectedItem === item) {
                        selected = true;
                    }
                    
                    var padding = this.tileSize;
                    var iconSize = (this.c.width - (padding * 2)) / levels.length;

                    if (selected) {
                        this.ctx.fillStyle = 'rgba(255, 255,255 0.3)';
                        this.ctx.fillRect(
                            padding + (iconSize * (item - 1)) + this.tileSize / 8,
                            (fontSize * 2),
                            iconSize - this.tileSize / 8, 
                            iconSize - this.tileSize / 8
                        );
                    }

                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(
                        padding + (iconSize * (item - 1)) + (this.tileSize / 8),
                        fontSize * 2,
                        iconSize - (this.tileSize / 8), 
                        iconSize - (this.tileSize / 8)
                    );
                }

                this.ctx.fillStyle = '#ffffff';

                var selectedItem = this.game.menu.selectedItem,
                    item = this.game.menu.menu.items[selectedItem];
                if (this.game.menu.selectedItem !== 0) {
                    this.ctx.fillText(item.title, fontSize, fontSize * 5);
                }

                if (this.game.stats.levels[item.action] !== undefined) {
                    var stats = this.game.stats.levels[item.action],
                    milliseconds = parseInt((stats.time%1000)/100),
                    seconds = parseInt((stats.time/1000)%60),
                    minutes = parseInt((stats.time/(1000*60))%60);

                    minutes = (minutes < 10) ? "0" + minutes : minutes;
                    seconds = (seconds < 10) ? "0" + seconds : seconds;

                    this.ctx.font = fontSize / 2 + 'px Arial';
                    this.ctx.fillText('Fewest moves: ' + stats.moves , fontSize, fontSize * 6);
                    this.ctx.fillText('Fastest time: ' + minutes + ':' + seconds + '.' + milliseconds , fontSize, fontSize * 7);
                }

                break;
        }
        
    }

    drawLevel() {
        this.drawBackground();
        this.drawMap();
        this.drawExits();
        this.drawPushBlockHomes();
        this.drawLasers();
        this.drawPushBlocks();
    }

    drawBackground() {
        this.ctx.fillStyle = this.game.tiles.getByID('map', 1).colour;
        this.ctx.fillRect(
            0,
            0,
            this.c.clientWidth, 
            this.c.clientHeight
        );
    }

    drawPlayer() {
        var playerTile = this.game.tiles.getPlayerTile(),
            top = this.game.player.position.row * this.tileSize,
            left = this.game.player.position.cell * this.tileSize;

        this.drawTile(playerTile.colour, top, left);
    }

    drawMap() {
        var map = this.game.level.map;
        for (var rowCount = 0; rowCount < map.map.length; rowCount++) {
            var row = map.map[rowCount];
            for (var cellCount = 0; cellCount < row.length; cellCount++) {
                var mapTileID = row[cellCount];
                this.drawMapTile(mapTileID, rowCount, cellCount);
            }
        }
    }

    drawLevelComplete() {
        var timer = this.game.timer.count('levelComplete', 1000);

        if (timer.completed === true) {
            return true;
        }

        this.ctx.fillStyle = 'rgba(255, 255, 255, ' + timer.elapsedPercent / 100 + ')';
        this.ctx.fillRect(
            0,
            0,
            this.c.clientWidth, 
            this.c.clientHeight
        );
    }

    drawLevelBegin() {
        var timer = this.game.timer.count('levelBegin', 1000);

        if (timer.completed === true) {
            return true;
        }

        this.ctx.fillStyle = 'rgba(255, 255, 255, ' + timer.remainingPercent / 100 + ')';
        this.ctx.fillRect(
            0,
            0,
            this.c.clientWidth, 
            this.c.clientHeight
        );
    }

    drawPushBlocks() {
        for (let pushBlock of this.game.pushBlocks.list) {
            var top = pushBlock.row * this.tileSize,
                left = pushBlock.cell * this.tileSize;

            if (
                pushBlock.tile.name === 'laser'
                || pushBlock.tile.name === 'mirror'
            ) {
                var direction = 'down';
                switch (pushBlock.orientation) {
                    case 0:
                        direction = 'down';
                        break;
                    case 90:
                        direction = 'left';
                        break;
                    case 180:
                        direction = 'up';
                        break;
                    case 270:
                        direction = 'right';
                        break;
                }
            }

            switch (pushBlock.tile.name) {
                case 'laser':
                    this.drawLaserEmitter(pushBlock.tile.colour, top, left, direction);
                    break;
                case 'laserCapture':
                    this.drawLaserCapture(pushBlock.tile.colour, top, left, pushBlock.active);
                    break;
                case 'mirror':
                    this.drawMirror(pushBlock.tile.colour, pushBlock.tile.detailColour, top, left, direction, pushBlock.active);
                    break;
                case 'slide':
                    this.drawSlideBlock(pushBlock.tile.colour, pushBlock.tile.detailColour, top, left, direction, pushBlock.active);
                    break;
                default:
                    this.drawTile(pushBlock.tile.colour, top, left);
                    break;
            }
        }
    }

    drawPushBlockHomes() {
        if (
            this.game.level.map.interactables === undefined
            || this.game.level.map.interactables.pushBlockHomes === undefined
        ) {
            return false;
        }
        for (let pushBlockHome of this.game.level.map.interactables.pushBlockHomes) {
            var top = pushBlockHome.position.row * this.tileSize,
                left = pushBlockHome.position.cell * this.tileSize,
                colour = this.game.tiles.pushBlockHomeTiles[0].colour;
            this.drawTileOutline(colour, top, left);
        }
    }

    drawExits() {
        for (let exit of this.game.level.map.interactables.exits) {
            var top = exit.position.row * this.tileSize,
                left = exit.position.cell * this.tileSize,
                colour = this.game.exit.tile.colour;
            this.drawTileOutline(colour, top, left);
        }
    }

    drawLasers() {
        this.drawLaserEmitters();
        this.drawLaserLines();
    }

    drawLaserLines() {
        for (let laser of this.game.laser.lasers) {
            this.drawTileLine(laser.direction, this.tileSize / 11, this.getLaserColour(), laser.row * this.tileSize, laser.cell * this.tileSize);
        }
    }

    drawLaserEmitters() {
        if (
            this.game.level.map.interactables === undefined
            || this.game.level.map.interactables.laserEmitters === undefined
        ) {
            return false;
        }
        for (let laserEmitter of this.game.level.map.interactables.laserEmitters) {
            var top = laserEmitter.position.row * this.tileSize,
                left = laserEmitter.position.cell * this.tileSize,
                tile = this.game.tiles.laserTiles[0];

            this.drawLaserEmitter(tile.colour, top, left, laserEmitter.direction);
        }
    }

    tileSizePercent(percentage) {
        return  percentage / 100 * this.tileSize;
    }

    drawLaserCapture(colour, top, left, active) {
        top += this.getTopPadding();
        left += this.getLeftPadding();
        this.ctx.fillStyle = this.getLaserColour();

        if (active === true) {
            this.ctx.beginPath();
            this.ctx.moveTo(left + this.tileSizePercent(50), top + this.tileSizePercent(35));
            this.ctx.lineTo(left + this.tileSizePercent(65), top + this.tileSizePercent(50));
            this.ctx.lineTo(left + this.tileSizePercent(50), top + this.tileSizePercent(65));
            this.ctx.lineTo(left + this.tileSizePercent(35), top + this.tileSizePercent(50));
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = colour;

        this.ctx.beginPath();
        this.ctx.moveTo(left, top);
        this.ctx.lineTo(left + this.tileSizePercent(80), top);
        this.ctx.lineTo(left, top + this.tileSizePercent(80));
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(left + this.tileSize, top);
        this.ctx.lineTo(left + this.tileSizePercent(20), top);
        this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(80));
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(left, top + this.tileSize);
        this.ctx.lineTo(left + this.tileSizePercent(80), top + this.tileSize);
        this.ctx.lineTo(left, top + this.tileSizePercent(20));
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(left + this.tileSize, top + this.tileSize);
        this.ctx.lineTo(left + this.tileSizePercent(20), top + this.tileSize);
        this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(20));
        this.ctx.fill();
    }

    getLaserColour() {
        var timer = this.game.timer.count('laserColour', 1000, true),
            opacity = timer.elapsedPercent / 100;

        opacity = 0.5 + opacity / 6;

        return 'rgba(204, 0, 0, ' + opacity + ')';
    }

    drawLaserEmitter(colour, top, left, direction) {
        top += this.getTopPadding();
        left += this.getLeftPadding();

        switch(direction) {
            case 'up':
                this.ctx.fillStyle = this.getLaserColour();
                this.ctx.beginPath();
                this.ctx.moveTo(left + this.tileSizePercent(36), top);
                this.ctx.lineTo(left + this.tileSizePercent(50), top + this.tileSizePercent(16));
                this.ctx.lineTo(left + this.tileSizePercent(63), top);
                this.ctx.fill();

                this.ctx.fillStyle = colour;
                this.ctx.beginPath();

                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top);
                this.ctx.lineTo(left + this.tileSizePercent(66), top);
                this.ctx.lineTo(left + this.tileSizePercent(50), top + this.tileSizePercent(20));
                this.ctx.lineTo(left + this.tileSizePercent(33), top);
                break;
            case 'down':
                this.ctx.fillStyle = this.getLaserColour();
                this.ctx.beginPath();
                this.ctx.moveTo(left + this.tileSizePercent(36), top + this.tileSize);
                this.ctx.lineTo(left + this.tileSizePercent(50), top + this.tileSizePercent(84));
                this.ctx.lineTo(left + this.tileSizePercent(63), top + this.tileSize);
                this.ctx.fill();

                this.ctx.fillStyle = colour;
                this.ctx.beginPath();
                
                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSizePercent(33), top + this.tileSize);
                this.ctx.lineTo(left + this.tileSizePercent(50), top + this.tileSizePercent(80));
                this.ctx.lineTo(left + this.tileSizePercent(66), top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top);
                break;
            case 'left':
                this.ctx.fillStyle = this.getLaserColour();
                this.ctx.beginPath();
                this.ctx.moveTo(left, top + this.tileSizePercent(36));
                this.ctx.lineTo(left + this.tileSizePercent(16), top + this.tileSizePercent(50));
                this.ctx.lineTo(left, top + this.tileSizePercent(63));
                this.ctx.fill();

                this.ctx.fillStyle = colour;
                this.ctx.beginPath();

                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSizePercent(33));
                this.ctx.lineTo(left + this.tileSizePercent(20), top + this.tileSizePercent(50));
                this.ctx.lineTo(left, top + this.tileSizePercent(66));
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top);
                break;
            case 'right':
                this.ctx.fillStyle = this.getLaserColour();
                this.ctx.beginPath();
                this.ctx.moveTo(left + this.tileSize, top + this.tileSizePercent(36));
                this.ctx.lineTo(left + this.tileSizePercent(84), top + this.tileSizePercent(50));
                this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(63));
                this.ctx.fill();

                this.ctx.fillStyle = colour;
                this.ctx.beginPath();

                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(66));
                this.ctx.lineTo(left + this.tileSizePercent(80), top + this.tileSizePercent(50));
                this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(33));
                this.ctx.lineTo(left + this.tileSize, top);
                break;
        }
        this.ctx.fill();
        
    }

    drawSlideBlock(colour, detailColour, top, left, direction, active) {
        this.drawTile(detailColour, top, left);

        this.ctx.fillStyle = colour;
        top += this.getTopPadding();
        left += this.getLeftPadding();

        var thickness = this.tileSizePercent(5);

        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(
            left + (thickness / 2),
            top + (thickness / 2),
            this.tileSize - (thickness), 
            this.tileSize - (thickness)
        );

        this.ctx.beginPath();
        this.ctx.moveTo(left + this.tileSizePercent(30), top);
        this.ctx.lineTo(left, top + this.tileSizePercent(30));
        this.ctx.lineTo(left, top + this.tileSizePercent(60));
        this.ctx.lineTo(left + this.tileSizePercent(60), top);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(left + this.tileSizePercent(85), top);
        this.ctx.lineTo(left, top + this.tileSizePercent(85));
        this.ctx.lineTo(left, top + this.tileSize);
        this.ctx.lineTo(left + this.tileSizePercent(15), top + this.tileSize);
        this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(15));
        this.ctx.lineTo(left + this.tileSize, top);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(left + this.tileSize, top + this.tileSizePercent(40));
        this.ctx.lineTo(left + this.tileSizePercent(40), top + this.tileSize);
        this.ctx.lineTo(left + this.tileSizePercent(70), top + this.tileSize);
        this.ctx.lineTo(left + this.tileSize, top + this.tileSizePercent(70));
        this.ctx.fill();
    }

    drawMirror(colour, detailColour, top, left, direction, active) {
        this.drawTile(detailColour, top, left);

        if (active === true) {
            this.drawTileLine('up', this.tileSize / 11, this.getLaserColour(), top, left);
            this.drawTileLine('left', this.tileSize / 11, this.getLaserColour(), top, left);
        }

        top += this.getTopPadding();
        left += this.getLeftPadding();

        var thickness = this.tileSizePercent(5);

        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(
            left + (thickness / 2),
            top + (thickness / 2),
            this.tileSize - (thickness), 
            this.tileSize - (thickness)
        );

        this.ctx.fillStyle = colour;

        switch(direction) {
            case 'up':
                this.ctx.beginPath();
                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                break;
            case 'down':
                this.ctx.beginPath();
                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left + this.tileSize, top);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                break;
            case 'left':
                this.ctx.beginPath();
                this.ctx.moveTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top);
                this.ctx.lineTo(left + this.tileSize, top + this.tileSize);
                break;
            case 'right':
                this.ctx.beginPath();
                this.ctx.moveTo(left, top);
                this.ctx.lineTo(left, top + this.tileSize);
                this.ctx.lineTo(left + this.tileSize, top);
                break;
        }
        this.ctx.fill();
        
    }

    drawMapTile(mapTileID, row, cell) {
        if (mapTileID === undefined) {
            return false;
        }
        var tile = this.game.tiles.getByID('map', mapTileID);

        var top = row * this.tileSize;
        var left = cell * this.tileSize;

        this.drawTile(tile.colour, top, left);
    }

    drawTile(colour, top, left) {
        this.ctx.fillStyle = colour;
        this.ctx.fillRect(
            left + this.getLeftPadding(),
            top + this.getTopPadding(),
            this.tileSize, 
            this.tileSize
        );
    }

    drawTileLine(direction, thickness, colour, top, left) {

        top += this.getTopPadding();
        left += this.getLeftPadding();
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = thickness;
        this.ctx.beginPath();
        if (direction === 'up' || direction === 'down') {
            this.ctx.moveTo(left + (this.tileSize / 2), top);
            this.ctx.lineTo(left + (this.tileSize / 2), top + this.tileSize);
        } else {
            this.ctx.moveTo(left, top + (this.tileSize / 2));
            this.ctx.lineTo(left + this.tileSize, top + (this.tileSize / 2));
        }
        this.ctx.stroke();
    }

    drawTileOutline(colour, top, left, thickness=this.tileSize / 11) {
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = thickness;
        this.ctx.strokeRect(
            this.getLeftPadding() + left + (thickness),
            this.getTopPadding() + top + (thickness),
            this.tileSize - (thickness * 2), 
            this.tileSize - (thickness * 2)
        );
    }
}