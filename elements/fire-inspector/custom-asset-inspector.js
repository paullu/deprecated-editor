Polymer({
    created: function () {
        this.asset = null;
        this.meta = null;
        this.saving = false;

        this._timeout = null;
    },

    save: function () {
        this.saving = true;

        if ( this._timeout ) {
            clearTimeout( this._timeout );
            this._timeout = null;
        }

        this._timeout = setTimeout ( function () {
            Fire.sendToCore('asset-db:save-by-uuid', this.meta.uuid, Fire.serialize(this.asset));
        }.bind(this), 500);
    },

    metaChanged: function () {
        this.saving = false;
        if ( this._timeout ) {
            clearTimeout( this._timeout );
            this._timeout = null;
        }

        Fire.AssetLibrary.loadAsset( this.meta.uuid, function ( asset ) {
            if ( asset && this.meta.uuid === asset._uuid ) {
                this.asset = asset;

                this.$.fields.target = this.asset;
                this.$.fields.refresh();
            }
        }.bind(this) );
    },

    fieldsChangedAction: function ( event ) {
        event.stopPropagation();

        if ( this.asset ) {
            this.asset.dirty = true;
            this.save();
        }
    },

    // applyAction: function ( event ) {
    //     event.stopPropagation();
    //     Fire.sendToCore('asset-db:apply',
    //                     Fire.serialize(this.asset),
    //                     Fire.serialize(this.meta),
    //                     Fire.serialize(this.inspector)
    //                    );
    // },

    // revertAction: function ( event ) {
    //     event.stopPropagation();
    //     this.fire('reload');
    // },
});