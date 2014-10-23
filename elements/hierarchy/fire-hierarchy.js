(function () {
    var Ipc = require('ipc');
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
            this._ipc_selected = this.select.bind(this, true);
            this._ipc_unselected = this.select.bind(this, false);
            //this._ipc_activated = this.activate.bind(this, true);
            //this._ipc_deactivated = this.activate.bind(this, false);
        },

        ready: function () {
            this.tabIndex = EditorUI.getParentTabIndex(this) + 1;

            Ipc.on('selection:selected:entity', this._ipc_selected);
            Ipc.on('selection:unselected:entity', this._ipc_unselected);
            //Ipc.on('selection:activated:entity', this._ipc_activated);
            //Ipc.on('selection:deactivated:entity', this._ipc_deactivated);
        },

        detached: function () {
            Ipc.removeListener('selection:selected:entity', this._ipc_selected);
            Ipc.removeListener('selection:unselected:entity', this._ipc_unselected);
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

        getCreateMenuTemplate: function (isContextMenu) {
            return [
                {
                    label: 'Create Empty',
                    click: function () {
                        if (isContextMenu) {
                            var parentEL = this.contextmenuAt && this.contextmenuAt.parentElement;
                            if (parentEL instanceof HierarchyItem) {
                                Fire.broadcast('engine:createEntity', parentEL.id);
                                return;
                            }
                        }
                        Fire.broadcast('engine:createEntity');
                    }.bind(this.$.hierarchyTree),
                },
                {
                    label: 'Create Empty Child',
                    click: function () {
                        if (isContextMenu && this.contextmenuAt) {
                            Fire.broadcast('engine:createEntity', this.contextmenuAt.id);
                        }
                        else {
                            var activeId = Fire.Selection.activeEntityId;
                            if (activeId) {
                                Fire.broadcast('engine:createEntity', activeId);
                            }
                        }
                    }.bind(this.$.hierarchyTree)
                },
            ];
        },

        createAction: function () {
            var template = this.getCreateMenuTemplate(false);
            var menu = Menu.buildFromTemplate(template);
            menu.popup(Remote.getCurrentWindow());
        },
    });

})();
