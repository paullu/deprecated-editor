Polymer({
    created: function () {
        this.icon = new Image();
        this.icon.src = "fire://static/img/plugin-game.png";

        this.ipc = new Fire.IpcListener();

        this.renderContext = null;
    },

    attached: function () {
        this.ipc.on('scene:dirty', this.delayRepaintScene.bind(this) );
    },

    detached: function () {
        this.ipc.clear();
    },

    setRenderContext: function ( renderContext ) {
        if ( this.renderContext !== null ) {
            this.$.view.removeChild(this.renderContext.domNode);
        }

        this.renderContext = renderContext;

        if ( this.renderContext !== null ) {
            this.$.view.appendChild(this.renderContext.domNode);
            // this.renderContext.setDesignResolutionSize( this.$.view.clientWidth,
            //                                             this.$.view.clientHeight,
            //                                             cc.ResolutionPolicy.SHOW_ALL );
            this.resize();
        }
    },

    resize: function () {
        if ( this.renderContext !== null ) {
            var old = this.style.display;
            this.style.display = "";
            this.renderContext.setDesignResolutionSize( this.$.view.clientWidth,
                                                        this.$.view.clientHeight,
                                                        cc.ResolutionPolicy.SHOW_ALL );
            this.style.display = old;
            this.repaintScene();
        }
    },

    repaintScene: function () {
        Fire.Engine.step();
    },

    delayRepaintScene: function () {
        if ( this._repainting )
            return;

        this._repainting = true;
        setTimeout( function () {
            this.repaintScene();
            this._repainting = false;
        }.bind(this), 100 );
    },

    showAction: function ( event ) {
        this.repaintScene();

        this._repaintID = setInterval ( this.repaintScene.bind(this), 500 );
    },

    hideAction: function ( event ) {
        clearInterval (this._repaintID);
    },

    resizeAction: function ( event ) {
        this.resize();
    },
});
