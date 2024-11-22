const { app, BrowserWindow, session, Menu, ipcMain } = require('electron')
const path = require('node:path')
const { title } = require('node:process')


var DefaultConfig = {
    Proxy: "http=127.0.0.1:7890;https=127.0.0.1:7890"
}

var PageSetProxy = {
    win: null,
    show: false,
    menuBarVisible: false,
    width: 280,
    height: 180,
    loadPage: function (loadPath) {
        if (loadPath.toString().startsWith("http")) {
            PageSetProxy.win.loadURL(loadPath)
        } else {
            PageSetProxy.win.loadFile(loadPath)
        }
    },
    createWindow: function () {
        if (PageSetProxy.show === true) {
            console.log(">setProxy\n\t", "window already exists");
            return
        }
        PageSetProxy.win = new BrowserWindow({
            width: PageSetProxy.width,
            height: PageSetProxy.height,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js')
            }
        })
        PageSetProxy.win.menuBarVisible = PageSetProxy.menuBarVisible
        Menu.setApplicationMenu(PageMain.menubar);
        // PageSetProxy.win.webContents.openDevTools();
        PageSetProxy.loadPage('pages/setProxy.html')
        PageSetProxy.show = true
    }

}

var PageMain = {
    win: null,
    title: "ChatGPT-DESKTOP by vegetax",
    menuBarVisible: true,
    width: 800,
    height: 600,
    menubar: Menu.buildFromTemplate([
        {
            label: '代理设置',
            click: () => {
                PageSetProxy.createWindow();
            }
        },
        {
            label: '开发者工具',
            click: () => {
                PageMain.win.webContents.openDevTools();
            }
        },
        { type: 'separator' },
        {
            label: 'Exit',
            click: () => {
                app.quit();
            }
        }
    ]),
    loadPage: function (loadPath) {
        if (loadPath.toString().startsWith("http")) {
            PageMain.win.loadURL(loadPath)
        } else {
            PageMain.win.loadFile(loadPath)
        }
    },
    setProxy: function (proxy) {
        if (proxy.includes(":") == false) {
            proxy = DefaultConfig.Proxy
            console.log(">setProxy\n\t", "proxy:", proxy, "|use default proxy: ", DefaultConfig.Proxy);

        }
        PageMain.win.webContents.session.setProxy({
            proxyRules: proxy,
            pacScript: '', // 也可以使用 PAC 脚本
        }).then(() => {
            console.log(">setProxy\n\t", '>Proxy set successfully', proxy)
        }).catch((error) => {
            console.log(">setProxy\n\t", '>Failed to set proxy', error)
        });
    },
    createWindow: function () {
        PageMain.win = new BrowserWindow({
            width: PageMain.width,
            height: PageMain.height,
            title: PageMain.title,
        })
        PageMain.win.menuBarVisible = PageMain.menuBarVisible
        Menu.setApplicationMenu(PageMain.menubar);
        PageMain.setProxy(DefaultConfig.Proxy)
        PageMain.loadPage('https://chatgpt.com/')
    }
}




ipcMain.on('set-proxy', (event, proxyUrl) => {
    PageMain.setProxy(proxyUrl)
    PageMain.loadPage('https://chatgpt.com/')
    PageSetProxy.win.close()
    PageSetProxy.show = false
});



app.whenReady().then(() => {
    PageMain.createWindow()
});