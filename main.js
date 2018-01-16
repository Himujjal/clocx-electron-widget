const electron = require('electron');
const url = require('url');
const path = require('path');
const robot = require('robotjs');
// robot.setMouseDelay(2);

const {app, BrowserWindow, Menu, ipcMain, MenuItem} = electron;

// Set ENV
// process.env.NODE_ENV = 'production';

// Windows
let mainWindow, addWindow;

// Platform
let onMAC = process.platform === 'darwin';
let inProd = process.env.NODE_ENV === 'production';

// Listen for the app to be ready
app.on('ready', ()=>{
    // Create a new window
    mainWindow = new BrowserWindow({
        frame: false,
        transparent: true,
        kiosk: true,
        width:130,
        height: 130
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
    const ctxMenu = new Menu();
    ctxMenu.append(new MenuItem({
                label: 'Change Date and Time',
                click(){createAddWindow();}
            }));
    ctxMenu.append(new MenuItem({
        label: 'Exit',
        click(){app.quit();}
    }));


    mainWindow.webContents.on('context-menu', (e, params) => {
        ctxMenu.popup(mainWindow, params.x, params.y);
    })

    
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


// Handle Create Add Window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 600,
        height: 600,
        title: 'Change Date and Time'
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

    // if(!inProd) addWindow.openDevTools({detach: true})

}



