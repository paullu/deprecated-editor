(function () {
    Polymer({
        publish: {
            focused: {
                value: false,
                reflect: true
            },
        },

        created: function () {
            this.focused = false;
        },

        ready: function () {
            this.tabIndex = EditorUI.getParentTabIndex(this)+1;
        },

        domReady: function () {
            this.load("assets://");
        },

        load: function ( url ) {
            this.$.assetsTree.load(url);
        },

    });
})();
