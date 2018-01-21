
const electron = require('electron');
const url = require('url');
const path = require('path');
const robot = require('robotjs');
const storage = require('electron-json-storage');
const defaultDataPath = storage.getDefaultDataPath()
const dataPath = storage.getDataPath();
// robot.setMouseDelay(2);

const {app, BrowserWindow, Menu, ipcMain, MenuItem, Tray} = electron;

// Set ENV
process.env.NODE_ENV = 'production';

// Windows
let mainWindow, addWindow;

// Platform
let onMAC = process.platform === 'darwin';
let inProd = process.env.NODE_ENV === 'production';


// Listen for the app to be ready
let tray = null;
app.commandLine.appendSwitch('enable-transparent-visuals');
app.disableHardwareAcceleration();
app.on('ready', ()=>{
    // Create a new window
    mainWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        width:180,
        height: 180,
        alwaysOnTop: true,
        // show: false,
        skipTaskbar: true
    });
    

    // Load HTML into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // mainWindow.setAlwaysOnTop(true, "floating");
    // mainWindow.setVisibleOnAllWorkspaces(true);
    // mainWindow.setFullScreenable(false);

    // Quit app when closed
    mainWindow.on('closed', ()=>app.quit());

    // Context Menu
    const ctxMenu1 = new Menu();
    const ctxMenu2 = new Menu();

    ctxMenu1.append(new MenuItem({
        label: 'Change Date and Time',
        click(){createAddWindow();}
    }));
    ctxMenu2.append(new MenuItem({
        label: 'Change Date and Time',
        click(){createAddWindow();}
    }));

    ctxMenu2.append(new MenuItem({
        label: "Disable Always on Top",
        click() {mainWindow.setAlwaysOnTop(false)}
    }))

    ctxMenu1.append(new MenuItem({
        label: 'Enable Always on top',
        click(){mainWindow.setAlwaysOnTop(true)}
    }))

    ctxMenu1.append(new MenuItem({
        label: 'Exit',
        click(){app.quit();}
    }));
    ctxMenu2.append(new MenuItem({
        label: 'Exit',
        click(){app.quit();}
    }));

    mainWindow.webContents.on('context-menu', (e, params) => {
        if(!mainWindow.isAlwaysOnTop())   ctxMenu1.popup(mainWindow, params.x, params.y);
        else ctxMenu2.popup(mainWindow, params.x, params.y);
    })
    
    // Set the tray menu
    tray = new Tray(path.join(__dirname,'assets/tray-icon.ico'));
    const trayContextMenu1 = Menu.buildFromTemplate([
        {label: 'Change Date And Time', click(){createAddWindow();}},
        {label: 'Exit', click(){app.quit()}}
    ]);
    tray.setToolTip(String(new Date()));
    tray.setContextMenu(trayContextMenu1);

    if(!inProd) mainWindow.openDevTools({detach: true})
    
});



const a = (onDragging, stayStill) => {
    ipcMain.on(onDragging, (e)=>{
            var mouse = robot.getMousePos();
            mainWindow.setPosition(mouse.x - 60, mouse.y - 60);
    })

    ipcMain.on(stayStill, (e)=>{
        var pos = mainWindow.getPosition();
        mainWindow.setPosition(pos[0], pos[1]);
    })
}
a('dragon', 'stayStill')


ipcMain.on('changeTime', (e, newTime) => {
    mainWindow.webContents.send('newTime', newTime);
});
ipcMain.on('resetTime', (e) => {
    mainWindow.webContents.send('resetTime2');
});



// Making the time change in the clock permananent
function incrementBy1s(date) {
    var timeSt = date.getTime();
    return new Date(timeSt+1000);
}

let increasingTime;
// Check if time is actually stored or else set a new time
ipcMain.on('getInitialTime', (e) => {
    storage.has('date', (error, hasKey)=>{
        if(error) throw error;
        
        //  This is the time that the clock should be showing in its clock
        if(hasKey) {
            // Set currentTime to the time stored in electron-json-storage
            storage.get('date', (error, data) => {
                let date = data.date;
                e.sender.send('initialTime', date)
            })        
        } else {
            e.sender.send('initialTime', 0)            
        }
    })
})


ipcMain.on('updateTime', (error, newTime) => {
    increasingTime = newTime
})

setInterval(function(){
    storage.set('date', {date: increasingTime}, (error) => {
        if(error) throw error;
    })
},1000)


// Handle Create Add Window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 600,
        height: 650,
        resizable: false,
        title: 'Change Date and Time - clocX',
        icon: path.join(__dirname,'build/icon.png')
    })

    // Load HTML into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    addWindow.setMenu(null);

    //  garbage Collection handle
    addWindow.on('closed', ()=> addWindow = null); 

    if(!inProd) addWindow.openDevTools({detach: true})

}



