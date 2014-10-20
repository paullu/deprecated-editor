Fire.SvgGizmos = (function () {
    function _snapPixel (p) {
        return Math.floor(p) + 0.5; 
    }

    function _updateGizmo ( gizmo, camera ) {
        if ( gizmo.entity ) {
            var localToWorld = gizmo.entity.transform.getLocalToWorldMatrix();
            var worldPos = new Fire.Vec2(localToWorld.tx, localToWorld.ty);

            var screenPos = camera.worldToScreen(worldPos);
            screenPos.x = _snapPixel(screenPos.x);
            screenPos.y = _snapPixel(screenPos.y);

            var rotation = localToWorld.getRotation() * 180.0 / Math.PI;

            gizmo.translate( screenPos.x, screenPos.y ) 
                 .rotate( -rotation, screenPos.x, screenPos.y )
                 ;
        }
    }

    function _addMoveHandles ( gizmo, callbacks ) {
        var pressx, pressy;

        //
        var mousemoveHandle = function(event) {
            var dx = event.clientX - pressx;
            var dy = event.clientY - pressy;

            if ( callbacks.update ) {
                callbacks.update.call( gizmo, dx, dy );
            }

            event.stopPropagation();
        }.bind(gizmo);

        var mouseupHandle = function(event) {
            document.removeEventListener('mousemove', mousemoveHandle);
            document.removeEventListener('mouseup', mouseupHandle);
            EditorUI.removeDragGhost();

            if ( callbacks.end ) {
                callbacks.end.call( gizmo );
            }

            event.stopPropagation();
        }.bind(gizmo);

        gizmo.on( 'mousedown', function ( event ) {
            if ( event.which === 1 ) {
                pressx = event.clientX;
                pressy = event.clientY;

                EditorUI.addDragGhost("default");
                document.addEventListener ( 'mousemove', mousemoveHandle );
                document.addEventListener ( 'mouseup', mouseupHandle );

                if ( callbacks.start ) {
                    callbacks.start.call ( gizmo );
                }
            }
            event.stopPropagation();
        } );
    } 

    function SvgGizmos ( svgEL ) {
        this.svg = SVG(svgEL);
        this.hoverRect = this.svg.polygon();
        this.hoverRect.hide();
        this.gizmos = [];
    }

    SvgGizmos.prototype.setCamera = function ( camera ) {
        this.camera = camera;
    };

    SvgGizmos.prototype.resize = function ( width, height ) {
        this.svg.size( width, height );
    };

    SvgGizmos.prototype.update = function () {
        for ( var i = 0; i < this.gizmos.length; ++i ) {
            var gizmo = this.gizmos[i];
            _updateGizmo( gizmo, this.camera );
        }
    };

    SvgGizmos.prototype.updateSelection = function ( x, y, w, h ) {
        if ( !this.selectRect ) {
            this.selectRect = this.svg.rect();
        }

        this.selectRect.move( _snapPixel(x), _snapPixel(y) ) 
                       .size( w, h )
                       .fill( { color: "#09f", opacity: 0.4 } )
                       .stroke( { width: 1, color: "#09f", opacity: 1.0 } )
                       ;
    };

    SvgGizmos.prototype.fadeoutSelection = function () {
        if ( !this.selectRect ) {
            return;
        }

        this.selectRect.animate( 100, '-' ).opacity(0.0)
        .after( function () {
            this.remove();
        }.bind(this.selectRect) );
        this.selectRect = null;
    };

    SvgGizmos.prototype.hover = function ( entity ) {
        var renderer = entity.getComponent( Fire.Renderer );
        if ( renderer ) {
            var bounds = renderer.getWorldOrientedBounds();
            var v1  = this.camera.worldToScreen(bounds[0]);
            var v2  = this.camera.worldToScreen(bounds[1]);
            var v3  = this.camera.worldToScreen(bounds[2]);
            var v4  = this.camera.worldToScreen(bounds[3]);

            this.hoverRect.show();
            this.hoverRect.plot([
                [_snapPixel(v1.x), _snapPixel(v1.y)],
                [_snapPixel(v2.x), _snapPixel(v2.y)],
                [_snapPixel(v3.x), _snapPixel(v3.y)],
                [_snapPixel(v4.x), _snapPixel(v4.y)],
            ])
            .fill( "none" )
            .stroke( { color: "#999", width: 1 } )
            ;
        }
        else {
            this.hoverout();
        }
    };

    SvgGizmos.prototype.hoverout = function () {
        this.hoverRect.hide();
    };

    SvgGizmos.prototype.add = function ( gizmo, entity ) {
        gizmo.entity = entity;
        _updateGizmo( gizmo, this.camera );
        this.gizmos.push(gizmo);
    };

    SvgGizmos.prototype.remove = function ( gizmo ) {
        for ( var i = this.gizmos.length-1; i >= 0; --i ) {
            var g = this.gizmos[i];
            if ( g === gizmo ) {
                g.remove();
                this.gizmos.splice( i, 1 );
                break;
            }
        }
    };

    SvgGizmos.prototype.arrowTool = function ( size, color, callback ) {
        var group = this.svg.group();
        var line = group.line( 0, 0, size, 0 )
                        .stroke( { width: 1, color: color } )
                        ;
        var arrow = group.polygon ([ [size, 5], [size, -5], [size+15, 0] ])
                         .fill( { color: color } )
                         ;
        var dragging = false;

        group.style( 'pointer-events', 'bounding-box' );

        group.on( 'mouseover', function ( event ) {
            var lightColor = chroma(color).brighter().hex();
            line.stroke( { color: lightColor } );
            arrow.fill( { color: lightColor } );

            event.stopPropagation();
        } );

        group.on( 'mouseout', function ( event ) {
            if ( !dragging ) {
                line.stroke( { color: color } );
                arrow.fill( { color: color } );
            }

            event.stopPropagation();
        } );

        _addMoveHandles( group, {
            start: function () {
                dragging = true;
                line.stroke( { color: "#ff0" } );
                arrow.fill( { color: "#ff0" } );
            },

            update: function ( dx, dy ) {
                callback ( dx, dy );
            },

            end: function () {
                dragging = false;
                line.stroke( { color: color } );
                arrow.fill( { color: color } );
            }
        }  );

        return group;
    };
    
    SvgGizmos.prototype.positionTool = function ( callbacks ) {
        var group = this.svg.group();
        var xarrow, yarrow, moveRect;

        // x-arrow
        xarrow = this.arrowTool( 80, "#f00", function ( dx, dy ) {
            // TODO
        } );
        xarrow.translate( 20, 0 );
        group.add(xarrow);

        // y-arrow
        yarrow = this.arrowTool( 80, "#5c5", function ( dx, dy ) {
            // TODO
        } );
        yarrow.translate( 20, 0 );
        yarrow.rotate(-90, 0, 0 );
        group.add(yarrow);

        // move rect
        var color = "#05f";
        var dragging = false;
        moveRect = group.rect( 20, 20 )
                            .move( 0, -20 )
                            .fill( { color: color, opacity: 0.4 } )
                            .stroke( { width: 1, color: color } )
                            ;
        moveRect.on( 'mouseover', function ( event ) {
            var lightColor = chroma(color).brighter().hex();
            this.fill( { color: lightColor } )
                .stroke( { color: lightColor } )
                ;
            event.stopPropagation();
        } );
        moveRect.on( 'mouseout', function ( event ) {
            if ( !dragging ) {
                var lightColor = chroma(color).brighter().hex();
                this.fill( { color: color } )
                    .stroke( { color: color } )
                    ;
            }
            event.stopPropagation();
        } );
        _addMoveHandles( moveRect, {
            start: function () {
                dragging = true;
                this.fill( { color: "#cc5" } )
                    .stroke( { color: "#cc5" } )
                    ;

                if ( callbacks.start )
                    callbacks.start();
            },

            update: function ( dx, dy ) {
                if ( callbacks.update )
                    callbacks.update( dx, dy );
            },

            end: function () {
                dragging = false;
                this.fill( { color: color } )
                    .stroke( { color: color } )
                    ;

                if ( callbacks.end )
                    callbacks.end();
            }
        }  );

        return group;
    };

    return SvgGizmos;
})();