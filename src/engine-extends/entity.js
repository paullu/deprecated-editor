﻿// editor utils

(function () {
    
    var Entity = Fire.Entity;

    Entity.createWithFlags = function (name, flags) {
        Entity._defaultFlags = flags;
        var ent = new Entity(name);
        Entity._defaultFlags = 0;
        return ent;
    };

    // register id
    Object.defineProperty ( Entity.prototype, 'hashKey', {
        get: function () {
            var retval = this._hashKey;
            if (retval) {
                return retval;
            }
            //retval = Object.getOwnPropertyDescriptor(HashObject.prototype, 'hashKey').get.call(this);
            retval = (this._hashKey = '' + this.hashId);
            Fire._idToObject[retval] = this;
            return retval;
        }
    });

    // unregister id
    var doOnPreDestroy = Entity.prototype._onPreDestroy;
    Entity.prototype._onPreDestroy = function () {
        doOnPreDestroy.call(this);
        delete Fire._idToObject[this._hashKey];
    };

})();
