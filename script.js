let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let message = document.getElementById("message");
const boxSize = 38;
const width = boxSize * 10;
const height = boxSize * 20;
canvas.width = width;
canvas.height = height;
const colorMap = new Map();
let drop;
//stores the current pieces on the board in code
let gamestate = []; 
let curPiece;

function getPosition(shape){
    switch (shape){
        case "I":
            return [[2,-1],[1,-1],[3,-1],[0,-1]]; break;
        case "J":
            return [[1,-1],[0,-2],[0,-1],[2,-1]]; break;
        case "L":
            return [[1,-1],[0,-1],[2,-1],[2,-2]]; break;
        case "O":
            return [[1,-2],[0,-2],[0,-1],[1,-1]]; break;
        case "S": 
            return [[1,-1],[1,-2],[0,-1],[2,-2]]; break;
        case "T":
            return [[1,-1],[0,-1],[1,-2],[2,-1]]; break;
        case "Z":
            return [[1,-1],[1,-2],[0,-2],[2,-1]]; break;
    }
}
//Initialize pieces
colorMap.set("I","3CE9F7");
colorMap.set("J", "063FB9");
colorMap.set("L", "F88F18");
colorMap.set("O", "FAFD1B");
colorMap.set("S", "24D51C");
colorMap.set("T", "B507D4");
colorMap.set("Z", "DB381E");

//pieces class
class piece {
    constructor(type, center){
        this.position = getPosition(type);
        this.color = colorMap.get(type);
    }
    low(){
        let arr = [];
        this.position.map(row => arr.push(row[1]));
        return Math.max(...arr);
    }
    right(){
        let arr = [];
        for(let row of this.position){
            arr.push(row[0]);
        }
        return Math.max(...arr);
    }
    left(){
        let arr = [];
        for(let row of this.position){
            arr.push(row[0]);
        }
        return Math.min(...arr);
    }
    moveX(x)
    {
        for(let row of this.position){
            row[0] += x;
        }
    }
    moveY(y)
    {
        for(let row of this.position){
            row[1] += y;
        }
    }
    move(x, y)
    {
        for(let row of this.position){
            row[0] += x;
            row[1] += y;
        }
    }
    clear() {
        for(let row of this.position){
            ctx.clearRect((row[0]*boxSize), (row[1]*boxSize),
                boxSize,boxSize);
        }
    }
    draw() {
        for(let row of this.position){
            ctx.fillStyle= "#" + this.color;
            ctx.fillRect((row[0]*boxSize), (row[1]*boxSize),
                boxSize,boxSize);
        }
    }
    //detects if moving further would cause a collision
    collision(){
        //take care of vertical collision
        for(let block of this.position){
            let code = ((block[1] * 10) + block[0]) +10;
            for(let block of gamestate){
                if(block.code == code){
                    return true;
                }
            }
        }
        return false;
    }
    //horizontal collision
    canMove(dir){
        let code;
        for(let block of this.position){
            if(dir == "left" && block[0] > 0){
                code = ((block[1] *10) + (block[0] - 1));
            }
            else if (dir == "right" && block[0] < 9){
                code = ((block[1] * 10 ) + (block[0]+1));
            }
            else{
                return false;
            }
            for(let block of gamestate){
                if(block.code == code){
                    return false;
                }
            }
        }
        return true;
    }
    //rotate :)
    rotate(){
        let mid = this.position[0];
        let a = mid[0];
        let b = mid[1];
        //rotate everything except the middle point;
        for(let i = 1; i<4; i++){
            let newx = (-1 * this.position[i][1]) + a + b;
            let newy = (this.position[i][0] - a + b);
            console.log("one block");
            this.clear();
            this.position[i][0] = newx;
            this.position[i][1] = newy;
        } 
    }
}; 

class BlockPiece{
    constructor(code, color){
        this.code = code;
        this.color = color;
    }
    add(c){
        this.code += c;
    }
    clear(){
        ctx.clearRect(((this.code%10)*boxSize),((Math.floor(this.code/10))*boxSize),
            boxSize, boxSize);
    }
}

//draw the grid
function drawGrid()
    {
    for (let i = 0; i <= width; i += boxSize){
        ctx.moveTo(i,0);
        ctx.lineTo(i,height);
        ctx.stroke();
    }
    for (let i = 0; i <= height; i += boxSize){
        ctx.moveTo(0,i);
        ctx.lineTo(width,i);
        ctx.stroke();
    }
}

//determines when a block cannot move futher
function endOfGrid(){
    if(curPiece.collision()){
        return true;
    }
    if(curPiece.low() == 19){
        return true;
    }
    return false;
}

function gameOver(){
    if (endOfGrid() && curPiece.low() < 1){
        return true;
    }
    return false;
}

//draw the game state
function drawBoard()
{
    curPiece.draw();
    drawGrid();
}

//move the current piece 1 block down
//turns out this is the main function kek
function moveCurrent(){
    //handle event 
    if(endOfGrid()){ 
        handleEnd();
        return;
    }
    curPiece.clear();
    curPiece.moveY(1);
    drawBoard();
    /*
    if(endOfGrid()){
        if(curPiece.low() < 1){
            clearInterval(drop);
        }
        else{
            for(let pos of curPiece.position){
                //makes it easier to check for collisions and whether or not there is 
                //a block in a certain place
                let code = (pos[0] * 100) + (pos[1]);
                gamestate.push(code);
            }
            curPiece = new piece(randomPiece());
            //there is no space for the next piece that was created
            if(curPiece.collision()){
                curPiece = null;
                clearInterval(drop);
            }
            else{
                //checks to see if line can be broken
                drawBoard();
            }
        }
    }*/
}

function handleEnd(){
    //full game over
    let test = new piece(randomPiece());
    if(test.collision()){
        clearInterval(drop);
        message.innerText = "your dumbass actually lost?";
        test = null;
        return;
    }
    //add block to gamestate
    curPiece.position.map(pos => gamestate.push(new BlockPiece((pos[1] * 10) + pos[0],curPiece.color)));
    //determine if there is a complete row
    curPiece.clear();
    handleScore();
    drawState();
    drawGrid();
    curPiece = new piece(randomPiece());
}

function drawState(){
    for(let block of gamestate){
        ctx.fillStyle = "#" + block.color;
        ctx.fillRect((block.code % 10) * boxSize, (Math.floor(block.code/10))*boxSize,
            boxSize, boxSize);
    }
}

function handleScore(){
    let deleteRows = [];
    //check if there is a full row in gamestate
    for(let i = 0; i < 20; i++){
        if(contains(i)){ deleteRows.push(i); }
    }
    //deletes the rows and moves the other blocks down
    for(let row of deleteRows){
        for(let block of gamestate){
            if(Math.floor(block.code / 10) === row){
                block.clear();
            }
        }
        gamestate=gamestate.filter(block =>
        Math.floor(block.code/10) !== row);
        for(let block of gamestate){
            if(block.code >= row*10){
                continue;
            }
            else{
                block.clear();
                block.add(10);
            }
        }
    }
}

//checks if all there is a full row for the specified row in gamestate
function contains(row){
    let thing = gamestate.filter(block => 
        (block.code >= row *10) && (block.code < (row+1) *10));
    if(thing.length == 10){
        return true;
    }
    return false;
}

//handle keyevents
function shift(e){
    let code = e.keyCode;
    console.log(code);
    switch (code) {
        //left
        case 37: 
            if((curPiece.left() > 0) && curPiece.canMove("left")){
                curPiece.clear(); curPiece.moveX(-1); drawBoard(); 
            }
            break;
        //right
        case 39: 
            if((curPiece.right() < 9) && curPiece.canMove("right")){
                curPiece.clear(); curPiece.moveX(1); drawBoard(); 
            }
            break;
        case 40:
            if(curPiece.low() < 19){
                moveCurrent();
            }
            break;
        //f rotate right
        case 70:
            curPiece.rotate();
            break;
        //d
        //case 68:
        }
}


function randomPiece(){
    let arr = ["I", "J", "L", "O", "S", "T", "Z"];
    let rand = Math.floor(Math.random() * 7);
    return arr[rand];
}

function main(){
    //initialize board
    drawState();
    drawGrid();
    curPiece = new piece(randomPiece());
    addEventListener("keydown", shift, false);
    drop = setInterval(moveCurrent, 1000);
}

main();

/* test
piece1 = new piece("L");
piece1.move(5,5);
piece2 = new piece("L");
piece3 = new piece("Z");
piece3.move(7, 18);
gamestate.push(piece3);
*/
