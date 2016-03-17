//the idea is to compare the spaniard population before and after the euro crisis.
//on the left part of the chart, I'm displaying the individual count of spaniards
//on the right part of the chart, I'm displaying the percentage of spaniard pop. relative to the total count.
//for both charts I'm highlighting in pink the largest variations for both categories.
//please note that the state call can be changed to any state and the graph will adapt to any state.

var apiKey = "04960fb68ea545ec6d6d6cc25cde41d35f6ec527";

var request = {
  "level": "state",
  "state": "CA",
  "sublevel": "true",
  "variables": [
      'race_spaniard_2000',
      'population_2000'],
  'api': 'sf1',
  'year': '2000'
}

var request2 = {
  "level": "state",
  "state": "CA",
  "sublevel": "true",
  "variables": [
      'race_spaniard_2010',
      'population_2010'],
  'api': 'sf1',
  'year': '2010'
}

var spaniardOld = {};
var spaniardNew = {};
var spaniardDiff = {};
var spaniardInc = {};
var spaniardNewRel = {};
var combinedData = {};


function callback(response) {
  var countyData = response.data;
  
  //spaniard old total count 2000 pop.
  for (var countyIdx in countyData) {
    var raceSpaniard = Number(countyData[countyIdx].race_spaniard_2000);
    var raceTotal = Number(countyData[countyIdx].population_2000);
    var spaniardRatio = raceSpaniard / raceTotal * 100;
    var countyName = countyData[countyIdx].name;
    countyName = countyName.replace("County","");
    countyName = countyName.slice(0,-1);
    spaniardOld[countyName] = [raceSpaniard, Math.round(spaniardRatio*100)/100];
  }
  census.APIRequest(request2, callback2);
}

function callback2(response) {
  var countyData = response.data;
  
  //spaniard new total count 2010 pop.
  for (var countyIdx in countyData) {
    var raceSpaniard = Number(countyData[countyIdx].race_spaniard_2010);
    var raceTotal = Number(countyData[countyIdx].population_2010);
    var spaniardRatio = raceSpaniard / raceTotal * 100;
    var countyName = countyData[countyIdx].name;
    countyName = countyName.replace("County","");
    countyName = countyName.slice(0,-1);
    spaniardNew[countyName] = raceSpaniard;
  }
  
  //spaniard new realative ratio in percent 2010 pop.
  for (var countyIdx in countyData) {
    var raceSpaniard = Number(countyData[countyIdx].race_spaniard_2010);
    var raceTotal = Number(countyData[countyIdx].population_2010);
    var spaniardRatio = raceSpaniard / raceTotal * 100;
    var countyName = countyData[countyIdx].name;
    countyName = countyName.replace("County","");
    countyName = countyName.slice(0,-1);
    spaniardNewRel[countyName] = Math.round(spaniardRatio*100) / 100;
  }
  
  //spaniard population percent increase
  for (var key in spaniardOld) {
  if (spaniardNew.hasOwnProperty(key)) {
    spaniardDiff[key] = Math.round(((spaniardNew[key] - spaniardOld[key][0]) / spaniardOld[key][0] )*100);
  }
  }
  
  //spaniard population value increase
  for (var key in spaniardOld) {
  if (spaniardNew.hasOwnProperty(key)) {
    spaniardInc[key] = (spaniardNew[key] - spaniardOld[key][0]);
  }
  }
  
  //console.log(spaniardNew);
  //console.log(spaniardOld);
  //console.log(spaniardDiff)
  //console.log(spaniardNew);
  //console.log(spaniardNewRel);
  //console.log(spaniardInc);
  
  //populate the combinedData object merging all processed info
  //index0:spaniardpop2000
  //index1:spaniardpercentage2000
  //index2:spaniardpop2010
  //index3:spaniardpercentage2010
  //index4:spaniardpopincrease
  for (var key in spaniardOld){
    
    if(spaniardNew.hasOwnProperty(key)) {
      combinedData[key] = spaniardOld[key]
      combinedData[key].push(spaniardNew[key])
      combinedData[key].push(spaniardNewRel[key])
      combinedData[key].push(spaniardDiff[key])
      combinedData[key].push(spaniardInc[key])
    }
  }

  //MAIN PARSED DATA REPORT
 console.log(combinedData)
}

function setup() {
  var sdk = new CitySDK();
  census = sdk.modules.census;
  census.enable(apiKey);
  census.APIRequest(request, callback);

  createCanvas(1200, 900);
}

//color chart
var lightgray = 222
var medgray = 125
var black = 0
var white = 255
var darkpink = (237,32,140)
var lightpink = (239, 145, 189)

function findMax(Idx){
    //finds maximum values for given array index position
    var maxval = 0;
    for (var key in combinedData) {
      if (combinedData[key][Idx] > maxval){
        maxval = combinedData[key][Idx]
      } 
    }
    return maxval;
}

function draw() {
  
  background(lightgray);
  
  //general layout and text
  push();
  fill(black);
  textAlign(CENTER);
  textSize(35);
  textFont("Helvetica");
  textStyle(BOLD);
  text("Spaniards in California", width/2, 60);
  textStyle(NORMAL);
  textSize(16);
  text("Pre Euro Crisis (2000) vs Post Euro Crisis (2010)", width/2, 85);
  pop();
  
  var textSpacing = 0;
  
  //wait until all the data is loaded before starting to draw
  if (!($.isEmptyObject(combinedData))) {
    
    
    for (var key in combinedData) {
      
      //text center labels
      push();
      fill(black);
      textSize(10);
      textAlign(CENTER);
      text(key, width/2, 140 + textSpacing);
      pop();
      
      //rectMode(CORNERS) interprets the first two parameters of rect() as the location 
      //of one corner, and the third and fourth parameters as the location of the opposite corner.
      
      //left bars: absolute
      push();
      noStroke();
      fill(medgray);
      rectMode(CORNERS);
      pop();
      var barLength = 300;// to replace from arrayvalues
      var displacementFromText = 50;
      var mapPopOld = Math.round(map(combinedData[key][0], 0, findMax(2), 1, barLength));
      var mapRelOld = map(combinedData[key][1], 0, findMax(3), 1, barLength);
      var mapPopNew = Math.round(map(combinedData[key][2], 0, findMax(2), 1, barLength));
      var mapRelNew = map(combinedData[key][3], 0, findMax(3), 1, barLength);
      
      //find max mapped value
      var mapPopNewMax = Math.round(map(findMax(2), 0, findMax(2), 1, barLength));
      var mapRelNewMax = Math.round(map(findMax(3), 0, findMax(3), 1, barLength));
      var PopNewMax = findMax(2);
      var relNewMax = findMax(3);
      
      var mapPopOldMax = Math.round(map(findMax(0), 0, findMax(2), 1, barLength));
      var mapRelOldMax = Math.round(map(findMax(1), 0, findMax(3), 1, barLength));
      var PopOldMax = findMax(0);
      var relOldMax = findMax(1);
      
      //find greatest variations
      var RelDiff = findMax(4);
      var PopDiff = findMax(5);
      
      //console.log(RelDiff);

      //left rectangles: Absoulute values
      push();
      noStroke();
      if(combinedData[key][5] == PopDiff){
        fill(239, 145, 189)
        
      }else{
        fill(medgray);
      }  
      rectMode(CORNERS);
      rect(width/2 - displacementFromText, 134 + textSpacing, width / 2 - mapPopNew - displacementFromText, 139 + textSpacing);
      pop();
      
      push();
      noStroke();
      rectMode(CORNERS);
      if(combinedData[key][5] == PopDiff){
        fill(237,32,140);
        textAlign(RIGHT);
        textSize(8);
        textStyle(BOLD);
        text("Δ " + String(PopDiff), width / 2 - mapPopNew - displacementFromText-5, 139 + textSpacing)
      }else{
        fill(black);
      }
      
      rect(width/2 - displacementFromText, 134 + textSpacing, width / 2 - mapPopOld - displacementFromText, 139 + textSpacing);
      pop();
      
      //right rectangles: Relative values
      push();
      noStroke();
      if(combinedData[key][4] == RelDiff){
        fill(239, 145, 189)
      }else{
        fill(medgray);
      };
      rectMode(CORNERS);
      rect(width/2 + displacementFromText, 134 + textSpacing, width / 2 + mapRelNew + displacementFromText, 139 + textSpacing);
      pop();
      
      push();
      noStroke();
      rectMode(CORNERS);
      if(combinedData[key][4] == RelDiff){
        fill(237,32,140);
        textAlign(LEFT);
        textSize(8);
        textStyle(BOLD);
        text("Δ " + String(RelDiff) +"%", width / 2 + mapRelNew + displacementFromText+5, 139 + textSpacing)
      }else{
        fill(black);
      }
      rect(width/2 + displacementFromText, 134 + textSpacing, width / 2 + mapRelOld + displacementFromText, 139 + textSpacing);
      pop();
      
      //increment displacement between bars
      textSpacing += 12;
      
    }
    //text(combinedData['Alameda'][0], width/2, height/2);
    
    var textLegend = 18;
    //draw a sublte legend
    push();
    noStroke();
    fill(black);
    rectMode(CENTER);
    
    //bottom marks left legend
    rect(width/2-displacementFromText, height-50, 1, 10);
    rect(width/2-displacementFromText-mapPopNewMax, height-50, 1, 10);
    
    //marks for old populaton
    rect(width/2-displacementFromText-mapPopOldMax, height-50, 1, 10);
    rect(width/2-displacementFromText-mapPopOldMax,120, 1, 10);
   
    //top marks left legend
    rect(width/2-displacementFromText, 120, 1, 10);
    rect(width/2-displacementFromText-mapPopNewMax,120, 1, 10);
    
    //bottom marks right legend
    rect(width/2+displacementFromText, height-50, 1, 10);
    rect(width/2+displacementFromText+mapRelNewMax, height-50, 1, 10);
    
    //marks for old relative population
    rect(width/2+displacementFromText+mapRelOldMax, height-50, 1, 10);
    rect(width/2+displacementFromText+mapPopOldMax,120, 1, 10);
    
    //top marks right legend
    rect(width/2+displacementFromText, 120, 1, 10);
    rect(width/2+displacementFromText+mapRelNewMax,120, 1, 10);
    
    //leged text
    textAlign(CENTER);
    textSize(8);
    text("0",width/2-displacementFromText, height-50+textLegend);
    text(PopNewMax + " spaniards",width/2-displacementFromText-mapPopNewMax, height-50+textLegend);
    text(PopOldMax + " spaniards",width/2-displacementFromText-mapPopOldMax, height-50+textLegend);
    text("0 %",width/2+displacementFromText, height-50+textLegend);
    text(relNewMax + " % of spaniards",width/2+displacementFromText+mapPopNewMax, height-50+textLegend);
    text(relOldMax + " % of spaniards",width/2+displacementFromText+mapPopOldMax, height-50+textLegend);
    pop();
    
    
    } else {
      //display loading message
      push();
      fill(black);
      textAlign(CENTER);
      text("loading data from census API...", width/2, height/2);
      pop();
    }
    
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}



