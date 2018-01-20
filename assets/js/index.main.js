var  isNull  = require('util').isNull;
var electron = require('electron');
var remote = electron.remote;
var ipcRenderer = electron.ipcRenderer;
var canvas = document.getElementById('clock');
var ctx = canvas.getContext("2d");
var h = canvas.height, w = canvas.width
var rad = h/2 , sqrt2 = Math.sqrt(2)

ctx.translate(h/2, w/2);    
var intervalEvent;

function incrementBy1s(date) {
  var timeSt = date.getTime();
  return new Date(timeSt+1000);
}

ipcRenderer.send('getInitialTime');
ipcRenderer.on('initialTime', function(e, initialTime) {
  var initDate = new Date().getTime() - initialTime
  initDate = new Date(initDate);
  intervalEvent = setInterval(function(){
    drawTime(initDate.getDate(), initDate.getMonth(), initDate.getFullYear(), initDate.getHours(), initDate.getMinutes(), initDate.getSeconds());
    initDate = incrementBy1s(initDate);
  },1000)
})

function drawTime(date, month, year, hour, minute, second) {
    var pi = Math.PI
    var origHour = hour
    hour%=12    
    var secondAngle = (second * pi) /30;
    var minuteAngle = ((minute * pi)/30) + (second * pi/1800)
    var hourAngle = (hour * pi/6) + (minute * pi/ 360);
    ctx.clearRect(-rad,-rad,121,121);
    ctx.beginPath();
    ctx.arc(rad, rad, 2, 0, 2 * Math.PI, false )
    ctx.fillStyle = 'rgb(76,85,155)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, 2 * Math.PI, false )
    ctx.fillStyle = 'black';
    ctx.fill();
    var isAM = origHour<12  
    drawAMPM( isAM);
    drawDate(date, month, year);
    drawSecond(secondAngle);
    drawMinute(minuteAngle);
    drawHour(hourAngle);
    var everySecondDate = new Date(year, month, date, origHour, minute, second);
    ipcRenderer.send('updateTime', (new Date()).getTime() - everySecondDate.getTime());
}

function drawAMPM(isAM) {
    var text = isAM ? "AM" : "PM";
    ctx.font = '8.5pt Times New Roman';
    ctx.fillText(text, -7.5, 30 );
}

function drawDate(date, month, year) {
  ctx.moveTo(0,0);
  ctx.fillText( ((month+1) + "/" + date + "/" + year) , -22, -15 )
}

function drawSecond(secondAngle) {
    var newRad = rad - 8;
    var endX =  newRad * Math.sin(secondAngle), endY = -1 * newRad*Math.cos(secondAngle) 
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.moveTo(0, 0)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = 'red'        
    ctx.stroke()
    ctx.moveTo(0,0 )
}

function drawMinute(minuteAngle) {
    var newRad = rad - 11
    var endX = newRad * Math.sin(minuteAngle), endY = -1 * newRad*Math.cos(minuteAngle) 
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.moveTo(0, 0)
    ctx.lineTo(endX, endY)
    ctx.strokeStyle = 'black'                        
    ctx.stroke()
    ctx.moveTo(w/2,h/2)
}

function drawHour(hourAngle) {
    var newRad = rad - 27
    var endX = newRad * Math.sin(hourAngle), endY = -1 * newRad*Math.cos(hourAngle) 
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.moveTo(0,0 )  
    ctx.lineTo(endX, endY) 
    ctx.strokeStyle = 'black'                                       
    ctx.stroke()
    ctx.moveTo(0,0 )
}



ipcRenderer.on('newTime', function(e, newTime){
    clearInterval(intervalEvent)
    var date = newTime[0],
        month = newTime[1],
        year = newTime[2],
        hour = newTime[3],
        minute = newTime[4],
        second = newTime[5];
    

    var timeE = new Date();
    drawTime(
      isNull(date) ? timeE.getDate() : date, 
      isNull(month) ? timeE.getMonth() : month, 
      isNull(year) ? timeE.getFullYear() : year, 
      isNull(hour) ? timeE.getHours() : hour, 
      isNull(minute) ? timeE.getMinutes() : minute, 
      isNull(second) ? timeE.getSeconds() : second 
    );

    var newTime2 = new Date(
      isNull(year) ? timeE.getFullYear() : year, 
      isNull(month) ? timeE.getMonth() : month, 
      isNull(date) ? timeE.getDate() : date,       
      isNull(hour) ? timeE.getHours() : hour, 
      isNull(minute) ? timeE.getMinutes() : minute, 
      isNull(second) ? timeE.getSeconds() : second 
    );

    intervalEvent = setInterval(function(){
      newTime2 = incrementBy1s(newTime2)
      drawTime(
        newTime2.getDate(),
        newTime2.getMonth(),
        newTime2.getFullYear(),        
        newTime2.getHours(),
        newTime2.getMinutes(),
        newTime2.getSeconds()
      )
    },1000)

})

ipcRenderer.on('resetTime2', function(e){
  clearInterval(intervalEvent);
  intervalEvent = setInterval(function(){
    var d = new Date();
    drawTime(
      d.getDate(),
      d.getMonth(),
      d.getFullYear(),        
      d.getHours(),
      d.getMinutes(),
      d.getSeconds()
    );
  },1000)
})

