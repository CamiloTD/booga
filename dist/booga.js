(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports", "react"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("react"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.react);
        global.Booga = mod.exports;
    }
})(this, function (exports, _react) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });


    const Stores = {};

    class LocalStorage {

        constructor(name) {
            this.name = name;
        }

        save(values) {
            process.browser && localStorage.setItem(this.name, JSON.stringify(values));
        }

        load() {
            return process.browser && JSON.parse(localStorage.getItem(this.name)) || {};
        }

        child(name) {
            return new LocalStorage(this.name + "-" + name);
        }
    }

    class SessionStorage {

        constructor(name) {
            this.name = name;
        }

        save(values) {
            process.browser && sessionStorage.setItem(this.name, JSON.stringify(values));
        }

        load() {
            return process.browser && JSON.parse(sessionStorage.getItem(this.name)) || {};
        }

        child(name) {
            return new sessionStorage(this.name + "-" + name);
        }
    }

    function Store(config = {}) {
        if (typeof config === "string" || config.name !== undefined) {
            let name = typeof config === "string" ? config : config.name;

            if (Stores[name]) return Stores[name];

            if (typeof config === "string") config = { name: name };
        }

        let { storage, initial, name } = config || {};

        let store = () => {};
        let values = storage && storage.load() || {};
        let hooks = [];

        let proxy = new Proxy(store, {

            set(tar, prop, val, rec) {
                switch (typeof val) {
                    case "function":
                        store[prop] = val;break;
                    case "object":
                        values[prop] = Store(val, { storage: storage.child(prop) });break;
                    default:
                        if (typeof store[prop] === "function" ? (val = values[prop] = store[prop](val)) !== null : (values[prop] = val) !== null) {
                            storage && storage.save(values);

                            hooks.forEach(hook => hook(prop, val));
                        }break;
                }

                return true;
            },

            get(tar, prop, rec) {
                return values[prop];
            },

            apply(tar, _self, args) {
                let [self, props] = args;

                if (typeof self === "function") {
                    return class extends _react.Component {

                        constructor(_props) {
                            super(_props);
                            this.state = proxy(this, props, this);
                        }

                        async render() {
                            return await self.apply(this, this.props, this);
                        }
                    };
                }

                let keys = Object.keys(props);
                let vals = Object.values(props);

                hooks.push((prop, value) => {
                    let index = vals.indexOf(prop);
                    if (index + 1) {
                        let x = {};
                        x[keys[index]] = value;

                        self.setState(x);
                    }
                });

                let first_state = {};

                for (let i in props) {
                    let n = props[i];
                    if (values[n] !== undefined) first_state[i] = values[n];
                }
                return first_state;
            }

        });
        if (initial) for (let i in initial) if (!values[i]) proxy[i] = initial[i];

        if (name) Stores[name] = proxy;

        return proxy;
    }

    Store.localStorage = (...args) => new LocalStorage(...args);
    Store.sessionStorage = (...args) => new sessionStorage(...args);

    exports.default = Store;
});
