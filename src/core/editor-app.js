var EditorApp;
(function (EditorApp) {
    var nwGUI = null;
    var Fs = null;
    var nativeMainWin = null;
    var eventListeners = {}; 

    if ( FIRE.isNw ) {
        nwGUI = require('nw.gui');
        Fs = require('fs');
        nativeMainWin = nwGUI.Window.get();
    }

    EditorApp.start = function () {
        if ( FIRE.isNw ) {
            // DEBUG
            nativeMainWin.showDevTools();

            // init and show main window
            EditorApp.init();
            nativeMainWin.show();
            nativeMainWin.focus();
        }
    };

    //
    EditorApp.init = function () {
        console.log('editor-app initializing...');

        // init node.js events
        // handle the error safely
        process.on('uncaughtException', function(err) {
            console.log(err);
        });


        // init document events
        document.addEventListener( "drop", function (event) {
            event.preventDefault(); 
        } );
        document.addEventListener( "dragover", function (event) {
            event.preventDefault(); 
        } );
        document.addEventListener( "contextmenu", function (event) {
            event.preventDefault();
            event.stopPropagation();
        } );

        // init native functions
        if ( FIRE.isNw ) {
            _appPath = process.cwd();

            // TODO: login
            // TODO: choose project

            // load user-profile
            if ( !Fs.existsSync(_appPath+"/user-profile.json") ) {
                // TODO: create default user profile.
            }

            // TEMP
            var defaultProjectPath = _appPath + "/bin/projects/default";
            if ( !Fs.existsSync(defaultProjectPath) ) {
                EditorApp.newProject(defaultProjectPath);
            }
            EditorApp.openProject(defaultProjectPath);
            // TEMP

            // init hot-keys
            document.addEventListener ( 'keydown', function ( event ) {
                switch ( event.keyCode ) {
                    // F12
                    case 123:
                        nativeMainWin.showDevTools();
                        event.stopPropagation();
                    break;

                    // F5
                    case 116:
                        nativeMainWin.reload();
                    break;

                    // TEST
                    // F2
                    case 113:
                        // AssetDB.moveAsset( 'assets://Characters/Ashe/Ashe.fbx',
                        //                    'assets://Characters/Ashe1/Foobar.fbx' );
                        AssetDB.makedirs( 'assets://foo/bar/foobar' );
                    break;
                }
            } );

            // init menu
            if ( FIRE.isDarwin ) {
                var nativeMenuBar = new nwGUI.Menu({ type: "menubar" });
                nativeMenuBar.createMacBuiltin("Fireball-X");
                nativeMainWin.menu = nativeMenuBar;
            }
        }
    };

    var _mainWin = null;
    EditorApp.__defineGetter__('mainWin', function () { return _mainWin; } );

    var _cwd = null; // the path of current opened project
    EditorApp.__defineGetter__('cwd', function () { return _cwd; } );

    var _appPath = null; // the path of fireball-x editor 
    EditorApp.__defineGetter__('appPath', function () { return _appPath; } );

    //
    EditorApp.setMainWindow = function ( mainWin ) {
        _mainWin = mainWin;
    };

    //
    EditorApp.on = function ( name, fn ) {
        var list = eventListeners[name];
        if ( !list ) {
            list = [];
            eventListeners[name] = list;
        }
        if ( list.indexOf(fn) === -1 ) {
            list.push(fn);
        }
    };

    //
    EditorApp.off = function ( name, fn ) {
        var list = eventListeners[name];
        if ( !list ) {
            return;
        }

        if ( !fn ) {
            eventListeners[name] = [];
            return;
        }

        var idx = list.indexOf(fn);
        if ( idx === -1 ) {
            return;
        }
        list.splice(idx,1);
    };

    //
    EditorApp.fire = function ( name, params ) {
        var list = eventListeners[name];
        if ( !list ) {
            return;
        }
        for ( var i = 0; i < list.length; ++i ) {
            var fn = list[i];
            if ( fn ) {
                fn ( { type: name, detail: params } );
            }
        }
    };

    //
    EditorApp.newProject = function ( path ) {
        EditorUtils.mkdirpSync(path);

        var assetsPath = path+'/assets';
        Fs.mkdirSync(assetsPath);

        var settingsPath = path+'/settings';
        Fs.mkdirSync(settingsPath);

        var projectFile = path+'/.fireball';
        Fs.writeFileSync(projectFile, '');
    };

    //
    EditorApp.openProject = function ( path ) {
        _cwd = path;

        // TODO: load settings
        // TODO: load window layouts

        // mounting assets
        AssetDB.mount(path+'/assets', 'assets');
        // AssetDB.mount(appPath+'/shares', 'shares');

        AssetDB.refresh();
    };

})(EditorApp || (EditorApp = {}));