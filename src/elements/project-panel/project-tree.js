(function () {
    var Path = require('path');

    Polymer('project-tree', {
        publish: {
            focused: {
                value: false,
                reflect: true
            },
        },

        created: function () {
            this.focused = false;
            this.folderElements = {};
            this.selection = [];
            this.lastActive = null;
            this.startDragging = false;
            this.curDragoverEL = null; 
        },

        ready: function () {
            this.tabIndex = EditorUI.getParentTabIndex(this)+1;

            this.addEventListener('mousedown', function ( event ) {
                this.focus();
            }, true );

            this.addEventListener('mousemove', function ( event ) {
                if ( this.startDragging ) {
                    // TODO: go to dragging state by distance
                }
                else {
                    event.stopPropagation();
                }
            }, true );

            this.addEventListener('mouseup', function ( event ) {
                if ( this.startDragging ) {
                    if ( this.curDragoverEL ) {
                        this.dropTo( this.curDragoverEL,
                                     this.getMostIncludeElements(this.selection) );
                    }

                    this.stopDragging();
                    event.stopPropagation();
                }
            }, true );
        },

        load: function ( path ) {
            AssetDB.walk( path, function ( root, name, stat ) {
                itemEL = new ProjectItem();
                if ( stat.isDirectory() ) {
                    itemEL.foldable = true;
                    itemEL.setIcon('fa-folder');

                    itemEL.isFolder = true;
                    itemEL.extname = '';
                    itemEL.basename = name;
                    itemEL.$.name.innerHTML = itemEL.basename;

                    this.folderElements[root+"/"+name] = itemEL;
                }
                else {
                    itemEL.setIcon('fa-file-image-o');

                    itemEL.extname = Path.extname(name);
                    itemEL.basename = Path.basename(name, itemEL.extname);
                    itemEL.$.name.innerHTML = itemEL.basename;
                }

                var parentEL = this.folderElements[root];
                if ( parentEL ) {
                    parentEL.appendChild(itemEL);
                }
                else {
                    itemEL.style.marginLeft="0px";
                    this.appendChild(itemEL);
                }
            }.bind(this) );
        },

        focusinAction: function (event) {
            this.focused = true;
        },

        focusoutAction: function (event) {
            if ( this.focused === false )
                return;

            if ( EditorUI.find( this.shadowRoot, event.relatedTarget ) )
                return;

            this.focused = false;
        },

        selectingAction: function (event) {
            if ( event.target instanceof ProjectItem ) {
                if ( event.detail.shift ) {
                    if ( !this.lastActive ) {
                        this.lastActive = event.target;
                        this.select( [event.target] );
                    }
                    else {
                        // TODO:
                    }
                }
                else if ( event.detail.toggle ) {
                    this.toggle( [event.target] );
                }
                else {
                    this.startDragging = true;
                    if ( this.selection.indexOf(event.target) === -1 ) {
                        this.clearSelect();
                        this.select( [event.target] );
                    }
                } 
                this.lastActive = event.target;
            }
            event.stopPropagation();
        },

        selectAction: function (event) {
            if ( event.target instanceof ProjectItem ) {
                if ( event.detail.shift ) {
                    // TODO:
                }
                else if ( event.detail.toggle ) {
                    // TODO:
                }
                else {
                    if ( this.selection.indexOf(event.target) !== -1 ) {
                        this.clearSelect();
                        this.select( [event.target] );
                    }
                } 
            }

            // TODO: confirm selection
            event.stopPropagation();
        },

        draghoverAction: function (event) {
            if ( event.target ) {
                var target = event.target;
                if ( event.target.foldable === false )
                    target = event.target.parentElement;
                if ( target ) {
                    this.$.highlightMask.style.display = "block";
                    this.$.highlightMask.style.left = target.offsetLeft + "px";
                    this.$.highlightMask.style.top = target.offsetTop + "px";
                    this.$.highlightMask.style.width = target.offsetWidth + "px";
                    this.$.highlightMask.style.height = target.offsetHeight + "px";
                }
                if ( this.curDragoverEL ) {
                    this.curDragoverEL.highlighted = false;
                }
                target.highlighted = true;
                this.curDragoverEL = target;
            }
            event.stopPropagation();
        },

        dragcancelAction: function (event) {
            this.stopDragging();
        },

        keydownAction: function (event) {
            if ( this.startDragging ) {
                switch ( event.which ) {
                    // esc
                    case 27:
                        this.stopDragging();
                        event.stopPropagation();
                    break;
                }
            }
            else {
                switch ( event.which ) {
                    // key-up
                    case 38:
                        if ( this.lastActive ) {
                            this.clearSelect();
                            var prev = this.prevItem(this.lastActive);
                            if ( prev === null ) {
                                prev = this.lastActive;
                            }
                            this.lastActive = prev;
                            this.select([this.lastActive]);
                        }
                        event.stopPropagation();
                    break;

                    // key-down
                    case 40:
                        if ( this.lastActive ) {
                            this.clearSelect();
                            var next = this.nextItem(this.lastActive,true);
                            if ( next === null ) {
                                next = this.lastActive;
                            }
                            this.lastActive = next;
                            this.select([this.lastActive]);
                        }
                        event.stopPropagation();
                    break;
                }
            }
        },

        toggle: function ( items ) {
            for ( var i = 0; i < items.length; ++i ) {
                var item = items[i];
                if ( item.selected === false ) {
                    item.selected = true;
                    this.selection.push(item);
                }
                else {
                    item.selected = false;

                    var idx = this.selection.indexOf(item); 
                    this.selection.splice(idx,1);
                }
            }
        },

        select: function ( items ) {
            for ( var i = 0; i < items.length; ++i ) {
                var item = items[i];
                if ( item.selected === false ) {
                    item.selected = true;
                    this.selection.push(item);
                }
            }
        },

        unselect: function ( items ) {
            for ( var i = 0; i < items.length; ++i ) {
                var item = items[i];
                if ( item.selected ) {
                    item.selected = false;

                    var idx = this.selection.indexOf(item); 
                    this.selection.splice(idx,1);
                }
            }
        },

        clearSelect: function () {
            for ( var i = 0; i < this.selection.length; ++i ) {
                this.selection[i].selected = false;
            }
            this.selection = [];
        },

        getPath: function ( element ) {
            var path = element.basename + element.extname;
            var parentEL = element.parentElement;
            while ( parentEL instanceof ProjectItem ) {
                path = parentEL.basename + "/" + path;
                parentEL = parentEL.parentElement;
            }
            return path;
        },

        getMostIncludeElements: function ( elements ) {
            var i,j;
            var resultELs = [];
            var paths = [];

            for ( i = 0; i < elements.length; ++i ) {
                var el = elements[i];
                var path = this.getPath(el);
                var addEL = true;
                var resultEL = null;
                var resultPath = null;
                var cmp = null;

                if ( el.isFolder ) {
                    for ( j = 0; j < resultELs.length; ++j ) {
                        resultEL = resultELs[j];
                        resultPath = this.getPath(resultEL);
                        cmp = EditorUtils.comparePath( path, resultPath );

                        if ( cmp !== null ) {
                            // path is childOf resultPath
                            if ( cmp == -1 ) {
                                addEL = false;
                                break;
                            }

                            // path is parentOf resultPath
                            if ( cmp >= 0 ) {
                                resultELs.splice(j,1);
                                --j;
                            }
                        }

                        // path is not relative with resultPath
                    }

                    if ( addEL ) {
                        resultELs.push(el);
                    }
                }
                else {
                    for ( j = 0; j < resultELs.length; ++j ) {
                        resultEL = resultELs[j];
                        resultPath = this.getPath(resultEL);
                        cmp = EditorUtils.comparePath( path, resultPath );

                        if ( cmp !== null ) {
                            // path is childOf resultPath
                            if ( cmp == -1 ) {
                                addEL = false;
                                break;
                            }
                        }

                        // path is not relative with resultPath
                    }

                    if ( addEL ) {
                        resultELs.push(el);
                    }
                }
            }

            return resultELs;
        },

        stopDragging: function () {
            if ( this.curDragoverEL ) {
                this.curDragoverEL.highlighted = false;
                this.curDragoverEL = false;
                this.$.highlightMask.style.display = "none";
            }
            this.startDragging = false;
        },

        dropTo: function ( targetEL, elements ) {
            for ( var i = 0; i < elements.length; ++i ) {
                var el = elements[i];
                targetEL.appendChild(el);
            }
        },

        nextItem: function ( curItem, checkFolded ) {
            if ( checkFolded &&
                 curItem.foldable && 
                 curItem.folded === false && 
                 curItem.children.length > 0 ) 
            {
                return curItem.firstElementChild;
            }

            if ( curItem.nextElementSibling )
                return curItem.nextElementSibling;

            var parentEL = curItem.parentElement;
            if ( parentEL instanceof ProjectItem === false ) {
                return null;
            }

            return this.nextItem(parentEL,false);
        },

        prevItem: function ( curItem ) {
            if ( curItem.previousElementSibling ) {
                if ( curItem.previousElementSibling.foldable && 
                     curItem.previousElementSibling.folded === false && 
                     curItem.previousElementSibling.children.length > 0 ) 
                {
                    return this.getLastElementRecursively(curItem.previousElementSibling);
                }

                return curItem.previousElementSibling;
            }

            var parentEL = curItem.parentElement;
            if ( parentEL instanceof ProjectItem === false ) {
                return null;
            }

            return parentEL;
        },

        getLastElementRecursively: function ( curItem ) {
            if ( curItem.foldable && 
                 curItem.folded === false && 
                 curItem.children.length > 0 ) 
            {
                return this.getLastElementRecursively (curItem.lastElementChild);
            }

            return curItem;
        },
    });
})();
