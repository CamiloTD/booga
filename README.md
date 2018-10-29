# booga

Manage redux state with sugar js

WebApp that sums and subs numbers from an state
```js
import Store from 'booga';
import { Component } from 'react';

let store = Store({
    storage: Store.localStorage('TESTING_LOCALSTORAGE'),
    initial: {
        count: 10
    }
});

store.count = (c) => c < 0? 0 : c;

export default class Testing extends Component {

    constructor (props) {
        super(props);

        this.state = store(this, {
            count: 'count'
        });
    }

    render () {
        return (
            <div>
                <h1>{ this.state.count }</h1>
                <button onClick={ () => store.count++ }>+</button>
                <button onClick={ () => store.count-- }>-</button>
            </div>
        );
    }
    
}

```