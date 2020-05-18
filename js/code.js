// Grid Map
// Creation of the grid map in order to place the obstacles
let grid = Array.from(new Array(10), e => new Array(10));
for (let i= 0; i<grid.length;i++){
  for(let j=0; j<grid[i].length;j++){
    grid[i][j] = '';
  }
}

const obstacle = {
  name: '',
  x: 0,
  y: 0
}


// function to create instances of the object obstacle
function createMapElement(type, name, x, y){
  let element = Object.create(type);
  element.y=y;
  element.x=x;
  element.name=name;
  grid[element.x][element.y] = element.name;
}

// I create two objects that will be placed in the grid map
createMapElement(obstacle,'rock',3,0);
createMapElement(obstacle,'rock',6,3);
createMapElement(obstacle,'rock',4,2);
createMapElement(obstacle,'rock',6,9);

// recreate map
function createGrid(array, element){
    const wrapper = document.getElementById(element);
    const tableGrid = document.createElement('table');

    const tableGrid_width = document.createAttribute("width");
    tableGrid_width.value= 'auto';
    tableGrid.setAttributeNode(tableGrid_width);

    const tableGrid_border = document.createAttribute("border");
    tableGrid_border.value= '0';
    tableGrid.setAttributeNode(tableGrid_border);

    const tableGrid_cellpadding = document.createAttribute("cellpadding");
    tableGrid_cellpadding.value= '0';
    tableGrid.setAttributeNode(tableGrid_cellpadding);

    const tableGrid_cellspacing = document.createAttribute("cellspacing");
    tableGrid_cellspacing.value= '0';
    tableGrid.setAttributeNode(tableGrid_cellspacing);

    for(let i=0; i<array.length;i++){
        let tr = document.createElement('tr');
        for(let j=0; j < array[i].length;j++){
            let td = document.createElement('td');

            let gridArea = document.createElement('div');
            let gridArea_class = document.createAttribute("id");
            gridArea_class.value = `${j}_${i}`;
            gridArea.setAttributeNode(gridArea_class);
            td.appendChild(gridArea);

            let gridArea_spanTop = document.createElement('span');
            gridArea.appendChild(gridArea_spanTop);
            if(grid[j][i] !== ''){
              let gridArea_spanObject = document.createElement('span');
              const gridArea_spanObject_className = document.createAttribute("class");
              gridArea_spanObject_className.value = `obstacle ${grid[j][i]}`;
              gridArea_spanObject.setAttributeNode(gridArea_spanObject_className);
              gridArea.appendChild(gridArea_spanObject);
            }
            let gridArea_spanBottom = document.createElement('span');
            gridArea.appendChild(gridArea_spanBottom);
            tr.appendChild(td);
        }
        tableGrid.appendChild(tr);
    }

    wrapper.appendChild(tableGrid);
}

// Create map
createGrid(grid, 'mars-grid');

// Rover object goes here:
let rover = {
  id: document.getElementById('rover'),
  direction: "N",
  rotation: -90,
  x: 0,
  y: 0,
  path: [
    {x: 0,y: 0},
  ],
  battery: 100,
  shield: 100,
}

//Init GridMap Variables
let unit_x_increment, unit_y_increment, stopVehicle=false;

// ======================

function initRover(player,playerId, gridId){
    let grid =  document.getElementById(gridId);
    let battery = document.getElementById('battery_value');
    let shield = document.getElementById('shield_value');

    let screenXPosition = document.getElementById('xCordinate');
    let screenYPosition = document.getElementById('yCordinate');

    const gridCellWidth = grid.querySelector("div+table>tr>td").offsetWidth;
    const gridCellHeight = grid.querySelector("div+table>tr>td").offsetHeight;
    
    const withDiff = (gridCellWidth - playerId.offsetWidth);
    const heightDiff = (gridCellHeight - playerId.offsetHeight);
    const left = withDiff - (withDiff/2);
    const top = heightDiff - (heightDiff/2);
    unit_x_increment = gridCellWidth;
    unit_y_increment = gridCellHeight;

    playerId.style.transform = `rotate(${player.rotation}deg)`;

    //console.log(`x: ${left}, y: ${top}`);
    playerId.style.left = `${left}px`;
    playerId.style.top = `${top}px`;

    screenXPosition.innerHTML = player.x;
    screenYPosition.innerHTML = player.y;
    battery.innerHTML = `${player.battery}%`;
    shield.innerHTML = `${player.shield}%`;

}


function turnLeft(player) {
  const roverDOM = document.getElementById('rover');
  const compasDOM = document.getElementById('compas');
  switch(player.direction){
    case 'N':
      player.direction = 'O';
      break;
    case 'W':
      player.direction = 'N';
      break;
    case 'S':
      player.direction = 'W';
      break;
    case 'O':
      player.direction = 'S';
      break;
  }
  console.log(`Turn Left, Direction: ${player.direction}`);
  compasDOM.style.transform = `rotate(${rotationDeg(player, "L")}deg)`;
  roverDOM.style.transform = `rotate(${rotationDeg(player, "L")}deg)`;
}

function turnRight(player) {
  const roverDOM = document.getElementById('rover');
  const compasDOM = document.getElementById('compas');

  switch(player.direction){
    case 'N':
      player.direction = 'W';
      break;
    case 'W':
      player.direction = 'S';
      break;
    case 'S':
      player.direction = 'O';
      break;
    case 'O':
      player.direction = 'N';
      break;
  }

  console.log(`Turn Right, Directon: ${player.direction}`);
  compasDOM.style.transform = `rotate(${rotationDeg(player, "R")}deg)`;
  roverDOM.style.transform = `rotate(${rotationDeg(player, "R")}deg)`;
}

// Functionthat checks if the route that we are ordening to the rover is inside the grid parameters, if not, I show a message and the rover is stopped, before keep moving
function checkNewPosition(x,y){
    console.log(`x: ${x}, y: ${y}`)
    let error = 'Attention Rover is going out of the limits, change your direction!';
    if(y < 0 && y < 1  || y > grid.length){
        console.log(error);
        stopVehicle = true;
        return false;
    }
    if(x < 0 || x > grid[0].length){
        console.log(error);
        stopVehicle = true;
        return false;
    }
   return true;
}

//function that detects if the new coordinates of the rover could be occupied for an object in the grid map:
// returns true, is there is a colision, or false if thisarea is empty
function checkColision(grid,newPosition){
  const gridMap = grid;
  if(gridMap[newPosition.x][newPosition.y] !== '' ) {
    console.log(`It is impossible to move forward, there is a ${gridMap[newPosition.y][newPosition.x]}`);
    return true;
  }else{
    return false;
  }
}

function moveMapRover(player, playerId, movement){
    let operator;
    switch(player.direction){
        case "O":
        case "N":
            operator= -1;
            break;
        default:
            operator= 1;
        break;
    }
    console.log(`operator: ${operator}`)
    switch(player.direction){
        case "W":
        case "O":
            playerId.style.left = `${parseInt(playerId.style.left) + ((operator*movement)*unit_x_increment)}px`;  
            break;
        case "N":
        case "S":
            playerId.style.top = `${parseInt(playerId.style.top) + ((operator*movement)*unit_y_increment)}px`; 
            break;
    }

    let battery = document.getElementById('battery_value');
    let battery_bar = document.getElementById('battery_value_bar');
    player.battery -= 5;
    battery.innerHTML = `${player.battery}%`;
    battery_bar.style.width= `${player.battery}%`;

    
    //console.log(`x: ${player.x}, y: ${player.y}`);
    //console.log(`unit_x_increment: ${unit_x_increment}`)
    //console.log(`${playerId.style.left},${playerId.style.top}`);
}

// function to move the rover, I consider the rover objet (player) and a direction (back or forward), in order to know if we have to rest or add coordinates
function movePlayer(player, direction){
  let operation;
  let symbolOperator;
  
  //I use and operator that define the operatorthat modify the direction - or +, 
  //to rest or add
  switch(direction){
    case 'f':
      symbolOperator = +1;
      break;
    case 'b':
      symbolOperator = -1;
      break;
  }
  
  
  // This switch is used to move the rover according to the direction, I check first if the rover is in the limits 
  // of the area, and then I move it, as long as there aren't any object that are ocupping this area (checkColision). 
  // If the rover is moving to the forward I add one un to the next coordinates, otherwise I rest one unit
  switch(player.direction){
    case 'N':
    console.log('Moving to the North ');
    //the operation defines the new coordinate,
    //depending of the direction only will affect to the x or to the y
    operation = player.y-(symbolOperator*1);
    if(checkNewPosition(player.x, operation)){
      let nextPosition = {
        x: player.x,
        y: operation
      }
      if(!checkColision(grid, nextPosition)){
        player.y = operation;
        player.path.push(nextPosition);
        moveMapRover(player, rover.id, symbolOperator)
      }
    }
    break;
      
    case 'S':
      console.log('Moving to the South ');
      operation = player.y+(symbolOperator*1);
      if(checkNewPosition(player.x, operation)){
        let nextPosition = {
          x: player.x,
          y: operation
        }
        if(!checkColision(grid, nextPosition)){
          player.y = operation;
          player.path.push(nextPosition);
          moveMapRover(player, rover.id, symbolOperator)
        }
      }
      break;
      
    case 'O':
      console.log('Moving to the Oest <-');
      operation = player.x-(symbolOperator*1);
      if(checkNewPosition(operation, player.y)){
        let nextPosition = {
          x: operation,
          y: player.y
        }
        if(!checkColision(grid, nextPosition)){
          player.x = operation;
          player.path.push(nextPosition);
          moveMapRover(player, rover.id, symbolOperator)
        }
      }
      break;
      
    case 'W':
      console.log('Moving to the West ->');
      operation = player.x+(symbolOperator*1);
      if(checkNewPosition(operation, player.y)){
        let nextPosition = {
          x: operation,
          y: player.y
        }
        
        if(!checkColision(grid, nextPosition)){
          player.x = operation;
          player.path.push(nextPosition);
          moveMapRover(player, rover.id, symbolOperator)
        }
      }
      break;
  }

  let screenXPosition = document.getElementById('xCordinate');
  let screenYPosition = document.getElementById('yCordinate');

  screenXPosition.innerHTML = player.x;
  screenYPosition.innerHTML = player.y;
}

// function that moves the rover forward
function moveForward(player) {
  let direction = 'f';
  if(player.battery > 0){
    movePlayer(player, direction);
    document.querySelector('.lever_guide_switch').classList.add('is-forward');
    setTimeout(function(){
      document.querySelector('.lever_guide_switch').classList.remove('is-forward');
    },1000)
  } else {
    console.log('¡No tienes energía!');
  }
}

// function that moves back the rover 
function moveBack(player) {
  let direction = 'b';
  if(player.battery > 0){
    movePlayer(player, direction);
    document.querySelector('.lever_guide_switch').classList.add('is-backward');
    setTimeout(function(){
      document.querySelector('.lever_guide_switch').classList.remove('is-backward');
    },1000)
  } else {
    console.log('¡No tienes energía!');
  }
  //console.log(`currentPosition(${player.x},${player.y})`);
}

// function that define the a defalt route that has a specific orders, 
// l:turn left, 
// r:turn right
// f:move forward
// b: move back
// Also print all the route registred done by the rover
function command(player, orders){
    let validOrders= ['l','r','f','b'];
    let interval = 300;
    for (let i=0; i<orders.length;i++){
        if(!stopVehicle){
            setTimeout( 
                function timer(){
                    console.log(orders);
                    if(validOrders.includes(orders[i])){
                        switch(orders[i]){
                            case 'l':
                            turnLeft(player);
                            break;
                            case 'r':
                            turnRight(player);
                            console.log('toRight')
                            break;
                            case 'f':
                            moveForward(player);
                            break;
                            case 'b':
                            moveBack(player);
                            break;
                        }
                    }
                }
                , i*interval
            );
        }else{
            console.log('hola');
        }
    }
    setTimeout(function(){
        showPath(player)
    }, orders.length*interval)
}

function showPath(player){
    for (let i = 0;i<player.path.length;i++){
        console.log(`Path ${i} ==> x=${player.path[i].x}, y=${player.path[i].y}`);
    }
}

function rotationDeg(player, turn){
  const unitRotation = 90;
  let oldRotation, newrotation, regex;
  const rover = document.getElementById('rover');
  regex = /-?\d+/g;
  oldRotation = parseInt(rover.style.transform.match(regex)[0]);

  

  switch(turn){
    case "L":
      newrotation = oldRotation-unitRotation;
      break;
    case "R":
      newrotation = oldRotation+unitRotation;
      break;
  }

  return newrotation;

}

function initControls(player){
  const roverDOM = document.getElementById('rover');
  const compasDOM = document.getElementById('compas');
  
  const movement_f = document.getElementById('f');
  const movement_b = document.getElementById('b');
  const turn_left = document.getElementById('L');
  const turn_right = document.getElementById('R');

  const commandButton = document.getElementById('routeForm');

  const tabStatus = document.getElementById('tab-status');
  const tabStatusContent = document.getElementById('tab-status-content');

  const tabRoute = document.getElementById('tab-route');
  const tabRouteContent = document.getElementById('tab-route-content');

  compasDOM.style.transform = `rotate(${player.rotation}deg)`;

  movement_f.addEventListener('click', function(){
    moveForward(player);
  });
  movement_b.addEventListener('click', function(){
    moveBack(player)
  });
  turn_left.addEventListener('click', function(){
    turnLeft(player);
  });
  turn_right.addEventListener('click', function(){
    turnRight(player);
  });

  commandButton.addEventListener('click', function(e) {
    const inputCommandsId = `${e.target.id}Input`;
    let input = document.getElementById(inputCommandsId);
    let commands = input.value;
    input.value = '';
    if(commands !== ''){
      command(rover,commands);
    }
  })

  initTabsContent('tab-status');
}

function initTabsContent(tabIni){
  const tabs = document.querySelectorAll('.pannel-screen_content');
  tabs.forEach( item => item.style.display = 'none');

  const tabActiveContent = document.getElementById(`${tabIni}-content`);
  const tabActive = document.getElementById(tabIni);

  const tabStatus = document.getElementById('tab-status');
  const tabRoute = document.getElementById('tab-route');

  tabStatus.addEventListener('click', function(e){
    showTab(e);
  });
  tabRoute.addEventListener('click', function(e){
    showTab(e);
  });

  tabActiveContent.style.display = 'flex';
  tabActive.classList.add('is-active');
}

function showTab(e){
  const tabs = document.querySelectorAll('.pannel-screen_tabs button');
  const tabsContent = document.querySelectorAll('.pannel-screen_content');
  tabsContent.forEach( item => item.style.display = 'none');
  tabs.forEach( item => item.classList.remove('is-active'));

  const activeTab = document.getElementById(e.target.id);
  const activeTabContent = document.getElementById(`${e.target.id}-content`);
  activeTab.classList.add('is-active');
  activeTabContent.style.display = 'flex';
}

initControls(rover);
initRover(rover, rover.id, 'mars-grid');

// executes the orders to move the rover
//command(rover,'rrrr');
//command(rover,'rffrffrf');

// simulation of a route that has a collision with a rock
//command(rover,'rfff');

// simulation of a route that has a collision with a wall
//command(rover,'rffrfflffrffffflfffffrff');