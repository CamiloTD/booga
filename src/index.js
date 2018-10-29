class LocalStorage {
    
    constructor (name) {
        this.name = name;
    }

    save (values) {
        process.browser && localStorage.setItem(this.name, JSON.stringify(values));
    }

    load () {
        return (process.browser && JSON.parse(localStorage.getItem(this.name)) || {})
    }

    child (name) {
        return new LocalStorage(this.name + "-" + name);
    }
}

function Store (config = {}) {
    let { storage, initial } = config || {};

    let store = (() =>{});
    let values = storage && storage.load() || {};
    let hooks = [];

    let proxy = new Proxy(store, {

        set (tar, prop, val, rec) {
            switch(typeof val) {
                case "function":
                    store[prop] = val; break;
                case "object":
                    values[prop] = Store(val, { storage: storage.child(prop) }); break;
                default:
                    if((
                        typeof store[prop] === "function"?
                            ((val = values[prop] = store[prop](val)) !== null) :
                            ((values[prop] = val) !== null)
                    )) {
                        storage && storage.save(values);

                        hooks.forEach((hook) => hook(prop, val));
                    } break;
            }
            
            return true;
        },

        get (tar, prop, rec) {
            return values[prop];
        },

        apply (tar, _self, args) {
            let [self, props] = args;
            let keys = Object.keys(props);
            let vals = Object.values(props);

            hooks.push((prop, value) => {
                debugger;
                let index = vals.indexOf(prop);
                if(index + 1) {
                    let x = {};
                    x[keys[index]] = value;
                    
                    self.setState(x);
                }
            });

            let first_state = {};
            
            for(let i in props) {
                let n = props[i];
                if(values[n] !== undefined)
                    first_state[i] = values[n];
            }
            return first_state;
        }

    });
    if(initial)
        for(let i in initial)
            if(!values[i])
                proxy[i] = initial[i];

    return proxy;
}

Store.localStorage = (...args) => new LocalStorage(...args); 

export default Store;