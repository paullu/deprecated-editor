Polymer({
    publish: {
        asset: null,
        meta: null,
    },

    info: "Unkown",
    rawTexture: null,

    resize: function () {
        if ( !this.asset)
            return;

        var contentRect = this.$.content.getBoundingClientRect();

        if ( this.asset.width > contentRect.width &&
             this.asset.height > contentRect.height )
        {
            var width = contentRect.width;
            var height = this.asset.height * contentRect.width/this.asset.width;

            if ( height > contentRect.height ) {
                height = contentRect.height;
                width = this.asset.width * contentRect.height/this.asset.height;
            }

            this.$.canvas.width = width;
            this.$.canvas.height = height;
        }
        else if ( this.asset.width > contentRect.width ) {
            this.$.canvas.width = contentRect.width;
            this.$.canvas.height = this.asset.height * contentRect.width/this.asset.width;
        }
        else if ( this.asset.height > contentRect.height ) {
            this.$.canvas.width = this.asset.width * contentRect.height/this.asset.height;
            this.$.canvas.height = contentRect.height;
        }
        else {
            this.$.canvas.width = this.asset.width;
            this.$.canvas.height = this.asset.height;
        }

        //
        this.repaint();
    },

    repaint: function () {
        var ctx = this.$.canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        if ( this.asset instanceof Fire.Texture ) {
            ctx.drawImage( this.asset.image, 0, 0, this.$.canvas.width, this.$.canvas.height );

            var xRatio = this.$.canvas.width / this.asset.width;
            var yRatio = this.$.canvas.height / this.asset.height;

            if ( this.meta.subRawData ) {
                if ( this.meta.type === Fire.TextureType.Sprite ) {
                    //for ( var subInfo of this.meta.subRawData ) {
                    this.meta.subRawData.forEach(function(subInfo) {
                        if ( subInfo.asset instanceof Fire.Sprite ) {
                            ctx.beginPath();
                            ctx.rect( subInfo.asset.trimX * xRatio,
                                      subInfo.asset.trimY * yRatio,
                                      subInfo.asset.width * xRatio,
                                      subInfo.asset.height * yRatio );
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = '#ff00ff';
                            ctx.stroke();
                        }
                    });
                }
            }
        }
        else if ( this.asset instanceof Fire.Sprite ) {
            if ( this.rawTexture ) {
                ctx.drawImage( this.rawTexture.image,
                              this.asset.trimX, this.asset.trimY, this.asset.width, this.asset.height,
                              0, 0, this.$.canvas.width, this.$.canvas.height
                             );
            }
        }
    },

    assetChanged: function () {
        this.info = this.asset.width + " x " + this.asset.height;
        this.rawTexture = null;
        this.resize();

        if ( this.asset instanceof Fire.Sprite ) {
            Fire.AssetLibrary.loadAsset( this.meta.rawTextureUuid, function ( err, rawTexture ) {
                this.rawTexture = rawTexture;
                this.repaint();
            }.bind(this) );

            return;
        }
    },
});
