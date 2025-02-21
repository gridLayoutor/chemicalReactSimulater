const elemFormula = document.getElementById('formula');
const elemFormulaRows = elemFormula.children;
const elemAddFormula = document.getElementById('addFormula');
const elemFirstConc = document.getElementById('firstConc');
const elemFCRows = elemFirstConc.children;

function addFormula() {
 const formula = document.createElement('tr');
 formula.innerHTML = `
  <td><input type='text' class='formulaBefore'></td>
  <td class='formulaArrow'>→</td>
  <td><input type='text' class='formulaAfter'></td>
  <td><input type='number' value='1' min='0' class='formulaSpeed'></td>
  <td><button class='formulaDelete'>削除</button></td>
 `;
 formula.getElementsByClassName("formulaBefore")[0].addEventListener("input", refreshFCMolecules);
 formula.getElementsByClassName("formulaAfter")[0].addEventListener("input", refreshFCMolecules);
 formula.getElementsByClassName("formulaDelete")[0].addEventListener("click", deleteFormula);
 elemFormula.appendChild(formula);
}

addFormula();
elemAddFormula.addEventListener("click", addFormula);

function deleteFormula() {
 if(elemFormula.children.length > 1) {
  this.closest("tr").remove();
  refreshFCMolecules();
 }
}

function extractMolecules(strg) {
 if(strg == "") {
  return [];
 }
 const protoMolecules = strg.split(/ \+ /).map(elem => elem.replace(/ /g, "")).filter(elem => (elem != ""));
 const molecules = protoMolecules.map(function(elem) {
  const molecule = {};
  const number = /^[0-9]*/.exec(elem)[0];
  if(number == "") {
   molecule.number = 1;
  } else {
   molecule.number = Number(number);
  }
  molecule.name = elem.replace(/^[0-9]*/, "");
  return molecule;
 });
 return molecules;
}

function extractFormulas() {
 const molecules = [];
 
 const formulas = [...elemFormulaRows].map(function(elem) {
  const formula = {};
  
  function encodeMolecules(strg) {
   const moleculesEncoded = extractMolecules(strg).map(function(elem) {
    if(molecules.includes(elem.name)) {
     elem.id = molecules.indexOf(elem.name);
    } else {
     molecules.push(elem.name);
     elem.id = molecules.length - 1;
    }
    return elem;
   });
   return moleculesEncoded;
  }
  
  formula.before = encodeMolecules(elem.getElementsByClassName("formulaBefore")[0].value);
  formula.after = encodeMolecules(elem.getElementsByClassName("formulaAfter")[0].value);
  formula.speed = elem.getElementsByClassName("formulaSpeed")[0].valueAsNumber;
  return formula;
 });
 
 return {formulas: formulas, molecules: molecules};
}

function extractFCMolecules() {
 const FCMolecules = [...elemFCRows].map(function(elem) {
  const FCMolecule = {};
  FCMolecule.name = elem.getElementsByClassName("FCMoleculeName")[0].innerText;
  FCMolecule.concentration = elem.getElementsByClassName("FCMoleculeConc")[0].valueAsNumber;
  FCMolecule.draw = elem.getElementsByClassName("FCMoleculeDraw")[0].checked;
  return FCMolecule;
 });
 return FCMolecules;
}

function refreshFCMolecules() {
 const currentMolecules = extractFormulas().molecules;
 const currentFCMolecules = extractFCMolecules();
 elemFirstConc.innerHTML = "";
 
 currentMolecules.map(function(elem) {
  var firstConc = 0;
  const correspondedFCMolecules = currentFCMolecules.find(elem2 => elem2.name == elem)
  if(correspondedFCMolecules) {
   firstConc = correspondedFCMolecules.concentration;
  }
  
  const firstConcRow = document.createElement("tr");
  
  const firstConcRowName = document.createElement("td");
  firstConcRowName.innerText = elem;
  firstConcRowName.className = "FCMoleculeName";
  firstConcRow.appendChild(firstConcRowName);
  
  const firstConcRowConc = document.createElement("td");
  firstConcRowConc.innerHTML = "<input type='number' class='FCMoleculeConc' value='" + firstConc.toString() + "'>";
  firstConcRow.appendChild(firstConcRowConc);
  
  const firstConcRowDraw = document.createElement("td");
  firstConcRowDraw.innerHTML = "<input type='checkbox' class='FCMoleculeDraw' checked>";
  firstConcRow.appendChild(firstConcRowDraw);
  
  elemFirstConc.appendChild(firstConcRow);
 });
}