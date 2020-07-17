let fr = 10;
let timeElapse = 0; //seconds
let tick = 0;
let numPieces = 60;
let explosionAfter = 5; //seconds
let pi = 3.14;

let preExplosionShell = {
  name: 'orig',
  startPos: {
    x: 0,
    y: 750,
    vx: 30,
    vy: -70,
    ax: 0,
    ay: 9.8
  },
  dia: 60,
  startTime: 0,
  currPos: {},
  trajectory: []
}
let postExplosionShells = [];

function getMassFromDia(dia) {
  return pi * dia * dia / 4;
}

function getDiaFromMass(mass) {
  return Math.sqrt(4 * mass / pi);
}

function getPostExplosionShells(originalMassInfo, numPieces, explosionPos, explosionTime) {
  
  originalMassInfo.mass = getMassFromDia(originalMassInfo.dia);
  let pieces = [];
  for (let i = 0; i < numPieces; i++) {
    let aPos = {...explosionPos};
    pieces.push({
      name: 'piece-' + i,
      startPos: aPos,
      startTime: explosionTime,
      dia: 0, //TBD
      mass: 0, //TBD
      trajectory: [aPos]
    });
  }

  // Obey law of conservation of mass, while generating child masses
  let numerators = Array.from({
    length: numPieces
  }, () => 1 + Math.floor(Math.random() * 10));
  let denominator = numerators.reduce((acc, x) => acc + x, 0);
  for (let i = 0; i < numPieces; i++) {
    pieces[i].mass = originalMassInfo.mass * numerators[i] / denominator;
    pieces[i].dia = getDiaFromMass(pieces[i].mass);
  }

  // Obey law of conservation of momentum, while generating velocities for children
  while (true) {
    numerators = Array.from({
      length: numPieces
    }, () => Math.random() - 0.5);
    denominoator = numerators.reduce((acc, x) => acc + x, 0);
    if (denominoator)
      break;
  }
  numerators = numerators.map(x =>  x / denominoator);
  let sum = numerators.reduce((acc, x) => acc + x, 0);
  let originalMomentum =  {
    mx: originalMassInfo.mass *  explosionPos.vx,
    my: originalMassInfo.mass *  explosionPos.vy
  }
  for (let i = 0; i < numPieces; i++) {
    pieces[i].startPos.vx = (originalMomentum.mx * numerators[i] / pieces[i].mass);
    numerators.sort(() => .5 - Math.random());
    pieces[i].startPos.vy = (originalMomentum.my * numerators[i] / pieces[i].mass);
  }

  return pieces;
}

function validatePieces(preExplosionShell, postExplosionShells, explosionPos) {
  let postMass = postExplosionShells.reduce((acc, x) => acc + x.mass, 0);
  console.log('preMass: ' + preExplosionShell.mass + ' postMass: ' + postMass);

  let preMx = preExplosionShell.mass * explosionPos.vx;
  let preMy = preExplosionShell.mass * explosionPos.vy;  
  let postMx = postExplosionShells.reduce((acc, x) => acc + x.mass * x.startPos.vx, 0);
  let postMy = postExplosionShells.reduce((acc, x) => acc + x.mass * x.startPos.vy, 0);
  console.log('preMx: ' + preMx + ' postMx: ' + postMx);
  console.log('preMy: ' + preMy + ' postMy: ' + postMy);
}



function getPosition(startPos, t) {
  let currPos = {};

  currPos.x = startPos.x + startPos.vx * t + 1 / 2 * startPos.ax * t * t;
  currPos.y = startPos.y + startPos.vy * t + 1 / 2 * startPos.ay * t * t;
  currPos.vx = startPos.vx + startPos.ax * t;
  currPos.vy = startPos.vy + startPos.ay * t;
  currPos.ax = startPos.ax;
  currPos.ay = startPos.ay;

  return currPos;
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  frameRate(fr);
}

function drawAShellPiece(pieceInfo) {
  pieceInfo.trajectory.push(pieceInfo.currPos);
  let trajectory = pieceInfo.trajectory;
  circle(pieceInfo.currPos.x, pieceInfo.currPos.y, pieceInfo.dia);
  for (let i = 0; i < trajectory.length - 1; i++) {
    line(trajectory[i].x, trajectory[i].y, trajectory[i + 1].x, trajectory[i + 1].y);
  }
}

function drawPreExplosion(timeElapsed) {
  preExplosionShell.currPos = getPosition(preExplosionShell.startPos, timeElapsed);
  drawAShellPiece(preExplosionShell);
}

function drawPostExplosion(timeElapsed) {
  for (let i = 0; i < postExplosionShells.length; i++) {
    postExplosionShells[i].currPos = getPosition(postExplosionShells[i].startPos, timeElapsed - postExplosionShells[i].startTime);
    drawAShellPiece(postExplosionShells[i]);
  }
}

function performExplosion(timeElapsed) {
  let currPos = getPosition(preExplosionShell.startPos, timeElapsed);
  postExplosionShells = getPostExplosionShells(preExplosionShell, numPieces, currPos, timeElapsed); 
  validatePieces(preExplosionShell, postExplosionShells, currPos);
}

function draw() {
  background(255);
  fill(0);
  tick++;
  timeElapsed = tick * 1 / fr;
  if (tick < explosionAfter * fr) {
    // Pre explision
    drawPreExplosion(timeElapsed);
  } else if (tick === explosionAfter * fr) {
    // Explosion
    performExplosion(timeElapsed);
  } else {
    // Post explosion
    drawPostExplosion(timeElapsed);
  }
  if (tick === 150) {
    noLoop();
  }
}
