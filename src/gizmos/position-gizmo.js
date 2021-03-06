var PositionGizmo = Fire.extend("Fire.PositionGizmo",
                                Editor.Gizmo,
                                function () {
    var svg = arguments[0];
    var target = arguments[1];

    this.allowMultiTarget = true;

    var worldposList = [];
    var entities = target;
    var self = this;

    this._root = svg.positionTool ( {
        start: function () {
            worldposList.length = 0;
            for ( var i = 0; i < entities.length; ++i ) {
                worldposList.push(entities[i].transform.worldPosition);
            }
        },

        update: function ( dx, dy ) {
            var cameraScale = svg.view.height / svg.camera.size;
            var delta = new Fire.Vec2( dx/cameraScale, -dy/cameraScale );

            for ( var i = 0; i < worldposList.length; ++i ) {
                entities[i].transform.worldPosition = worldposList[i].add(delta);
            }

            self.dirty();
        },
    } );
});

//
PositionGizmo.prototype.update = function () {
    var activeTarget = this.entity;
    var worldpos,screenpos,rotation;

    if ( this.pivot === "center" ) {
        worldpos = Editor.GizmosUtils.getCenter(this.target);
        screenpos = this._svg.camera.worldToScreen(worldpos);

        screenpos.x = Editor.GizmosUtils.snapPixel(screenpos.x);
        screenpos.y = Editor.GizmosUtils.snapPixel(screenpos.y);

        this._root.position = screenpos;
        this._root.rotation = 0.0;
    }
    else {
        var localToWorld = activeTarget.transform.getLocalToWorldMatrix();
        worldpos = new Fire.Vec2(localToWorld.tx, localToWorld.ty);
        screenpos = this._svg.camera.worldToScreen(worldpos);
        rotation = -activeTarget.transform.worldRotation;

        screenpos.x = Editor.GizmosUtils.snapPixel(screenpos.x);
        screenpos.y = Editor.GizmosUtils.snapPixel(screenpos.y);

        this._root.position = screenpos;
        this._root.rotation = 0.0;

        if ( this.coordinate !== "global" ) {
            this._root.rotation = rotation;
        }
    }

    this._root.translate( this._root.position.x, this._root.position.y )
              .rotate( this._root.rotation, this._root.position.x, this._root.position.y )
              ;
};

Editor.PositionGizmo = PositionGizmo;
