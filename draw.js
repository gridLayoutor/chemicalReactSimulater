const elemCanvas = document.getElementById("canvas");
const elemMaxTime = document.getElementById("maxTime");
const elemDeltaTime = document.getElementById("deltaTime");
const elemDraw = document.getElementById("draw");

const context = elemCanvas.getContext("2d")
const canvasWidth = elemCanvas.width = Math.min(600, document.body.clientWidth);
const canvasHeight = elemCanvas.height = elemCanvas.width * 2 / 3;

context.font = "16px selif"
context.fillStyle = "rgb(20, 20, 20)"
context.fillText("ここにグラフが表示されます", 10, canvasHeight / 2 + 8);

function simulate() {
 const maxTime = elemMaxTime.valueAsNumber;
 const deltaTime = elemDeltaTime.valueAsNumber;
 
 if(maxTime <= 0) {
  alert("「時間」に有効な値を入力してください");
  return;
 }
 if(deltaTime <= 0) {
  alert("「微小時間変化」に有効な値を入力してください");
  return;
 }
 
 const formulaAndMolecules = extractFormulas()
 const formulas = formulaAndMolecules.formulas;
 const molecules = formulaAndMolecules.molecules;
 const formulaNum = formulas.length;
 
 const firstConc = extractFCMolecules();
 const concentrations = [firstConc.map(elem => elem.concentration)];
 const speeds = [];
 const isDraws = firstConc.map(elem => elem.draw);
 const moleculeNum = concentrations[0].length;
 
 function extractCoeff(key) {
  return formulas.map(function(formula) {
   const coeff = [...new Array(moleculeNum)].map(elem => 0);
   formula[key].map(function(molecule) {
    coeff[molecule.id] += molecule.number;
   });
   return coeff;
  });
 }
 
 const before = extractCoeff("before");
 const after = extractCoeff("after");
 
 const times = [];
 var concMax = 0;
 
 for(let time = 0; time <= maxTime; time += deltaTime) {
  let speed = before.map(function(beforeCoeff, formulaId) {
   var currentSpeed = formulas[formulaId].speed;
   beforeCoeff.map(function(coeff, key) {
    currentSpeed *= concentrations[concentrations.length - 1][key] ** coeff;
   });
   return currentSpeed;
  });
  speeds.push(speed);
  
  speedForMolecules = [...new Array(moleculeNum)].map(elem => 0);
  speed.map(function(speedSgl, formulaId) {
   before[formulaId].map(function(coeffSgl, moleculeId){
    speedForMolecules[moleculeId] -= speedSgl * coeffSgl;
   });
   
   after[formulaId].map(function(coeffSgl, moleculeId){
    speedForMolecules[moleculeId] += speedSgl * coeffSgl;
   });
   
  });
  
  let currentConc = Array.from(concentrations[concentrations.length - 1]);
  speedForMolecules.map(function(speedForMolecule, key) {
   currentConc[key] += speedForMolecule * deltaTime;
   if(currentConc[key] > concMax && isDraws[key]) {
    concMax = currentConc[key];
   }
  });
  concentrations.push(currentConc);
　
  times.push(time);
 }
 
 concentrations.pop();
 
 return {conc: concentrations, concMax: concMax, speed: speeds, time: times, molecule: molecules, draw: isDraws};
}

function draw() {
 const result = simulate();
 const concentrations = result.conc;
 const concMax = result.concMax;
 const speeds = result.speed;
 const times = result.time;
 const molecules = result.molecule;
 const isDraws = result.draw;
 
 context.fillStyle = "rgb(255, 255, 255)";
 context.fillRect(0, 0, canvasWidth, canvasHeight);
 
 const line = [0.2, 0.4, 0.6, 0.8, 1.0];
 const lineY = line.map(elem => (canvasHeight - 45) - elem * (canvasHeight - 55));
 
 context.strokeStyle = "rgb(200, 200, 200)";
 context.lineWidth = 2;
 context.strokeRect(60, 10, canvasWidth - 120, canvasHeight - 55);
 lineY.map(function(y) {
  context.beginPath();
  context.moveTo(60, y);
  context.lineTo(canvasWidth - 60, y);
  context.stroke();
 });
 
 const concGMaxOrder = Math.floor(Math.log10(concMax / 5));
 const concGMaxValue = (Math.floor(concMax / (10 ** concGMaxOrder * 5) * 10) + 1) / 10 * 5;
 const concGMax = concGMaxValue * 10 ** concGMaxOrder;
 const concToY = (conc => (canvasHeight - 45) - conc / concGMax * (canvasHeight - 55));
 
 context.font = "14px selif";
 context.fillStyle = "rgb(30, 30, 30)";
 lineY.map(function(elem, key){
  let concGMaxValueStringWP = Math.round(concGMaxValue * line[key] * 10).toString();
  let concGMaxValueString = concGMaxValueStringWP.slice(0, -1) + "." + concGMaxValueStringWP.slice(-1);
  context.fillText(concGMaxValueString + "E" + concGMaxOrder.toString(), 0, elem + 7, 60);
 });
 
 const timeToX = (time => (60) + time / times[times.length - 1] * (canvasWidth - 120));
 
 function graphColor(hue, value) {
  const phi = 2 * Math.PI
  const alpha = phi * hue;
  const red = Math.max(0, 2 / 3 * Math.cos(alpha) + 1 / 3) * 255 * value;
  const green = Math.max(0, 2 / 3 * Math.cos(alpha - phi / 3) + 1 / 3) * 255 * value;
  const blue = Math.max(0, 2 / 3 * Math.cos(alpha + phi / 3) + 1 / 3) * 255 * value;
  return `rgb(${red}, ${green}, ${blue})`;
 }
 
 context.lineWidth = 2;
 context.font = "14px selif";
 context.fillStyle = "rgb(30, 30, 30)";
 const moleculeNum = concentrations[0].length;
 var legendX = 5;
 const legendXDelta = Math.min(canvasWidth / moleculeNum, 100);
 const legendLineLength = (legendXDelta - 10) * 0.3;
 for(let moleculeId = 0; moleculeId < moleculeNum; moleculeId++) {
  if(!isDraws[moleculeId]) {
   continue;
  }
  
  context.strokeStyle = graphColor(moleculeId / moleculeNum, 1);
  
  context.beginPath();
  context.moveTo(timeToX(times[0]), concToY(concentrations[0][moleculeId]));
  concentrations.map(function(concentration, key) {
   context.lineTo(timeToX(times[key]), concToY(concentration[moleculeId]));
  });
  context.stroke();
  
  context.beginPath();
  context.moveTo(legendX, canvasHeight - 22.5);
  context.lineTo(legendX + legendLineLength, canvasHeight - 22.5);
  context.stroke();
  context.fillText(molecules[moleculeId], legendX + legendLineLength + 5, canvasHeight - 15, legendXDelta - legendLineLength - 10);
  legendX += legendXDelta;
 }
}

elemDraw.addEventListener("click", draw);