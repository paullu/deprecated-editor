(function () {
    var Remote = require('remote');
    var Menu = Remote.require('menu');

    Polymer({
        publish: {
            focused: {
                value: false,
                reflect: true
            },
        },

        created: function () {
            this.focused = false;

            this.ipc = new Fire.IpcListener();

            this._lasthover = null;
        },

        ready: function () {
            this.tabIndex = EditorUI.getParentTabIndex(this) + 1;

            this.ipc.on('selection:entity:selected', this.select.bind(this, true));
            this.ipc.on('selection:entity:unselected', this.select.bind(this, false));
            this.ipc.on('selection:entity:hover', this.hover.bind(this) );
            this.ipc.on('selection:entity:hoverout', this.hoverout.bind(this) );
        },

        detached: function () {
            this.ipc.clear();

        },

        select: function (selected, entityIds) {
            for (var i = 0; i < entityIds.length; ++i) {
                var id = entityIds[i];
                var el = this.$.hierarchyTree.idToItem[id];
                if (el) {
                    el.selected = selected;
                }
            }
        },

        hover: function ( entityID ) {
            var el = this.$.hierarchyTree.idToItem[entityID];
            if (el) {
                el.hover = true;
            }

            if ( this._lasthover && this._lasthover !== el ) {
                this._lasthover.hover = false;
            }
            this._lasthover = el;
        },

        hoverout: function () {
            if ( this._lasthover ) {
                this._lasthover.hover = false;
                this._lasthover = null;
            }
        },

        createAction: function () {
            var type = 'main-menu'; // the same as main menu
            Fire.popupMenu(Fire.plugins.hierarchy.getCreateMenuTemplate(type));
        },
    });
})();
