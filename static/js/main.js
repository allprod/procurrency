const currency_store_name = 'currencies';
const conversion_store_name = 'conversions';
const currency_query = 'https://free.currencyconverterapi.com/api/v5/currencies';

//let deffered_prompt;

function make_money({currency_name = 'fake money', currency_symbol = 'replace me', id = 'fakeness'} = {}){
    // money error. exit
    if(currency_name === 'fake money') return undefined;
    if (currency_symbol === 'replace me') {
        currency_symbol = id;
    }
    return {currencyName: currency_name, currencySymbol: currency_symbol, id: id};
}

function convert(){
    from_amt = document.getElementById('from_ammount');
    to_amt = document.getElementById('to_ammount');
    from_currency = document.getElementById('from_currency').value;
    to_currency = document.getElementById('to_currency').value;

    const query = `${from_currency}_${to_currency}`;
    const convertion_query = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;
    fetch(convertion_query).then(response => {if(response.ok)  response.json()}).then(conversion => {
        const rate = conversion[query].value;
        const source_ammount = parseInt(from_amt.value, 10);
        const ammount = rate * source_ammount;
        conversion.log(rate);
        
        to_amt.value = ammount.toFixed(2);
    }).catch( error => console.log('There has been a problem with the convertion rate fetch operation: ', error.message));
}

function open_database(){
    if(!navigator.serviceWorker) return Promise.resolve();

    return idb.open('procurrency', 1, upgradeDb => {
        const curency_store = upgradeDb.createObjectStore(currency_store_name, {
            keyPath: 'id'
          });
        const conversion_store = upgradeDb.createObjectStore(conversion_store_name, {
        })
        //TODO: Create indexes here
        curency_store.createIndex('name', 'currencyName');
    });
}

function register_serviceWorker(){
    if(!navigator.serviceWorker) return;
    
    navigator.serviceWorker.register('./static/js/sw.js').then(reg => {
        // site not called from service worker. exit early
        if(!navigator.serviceWorker.controller) return;

        if(reg.waiting){
            update_ready(reg.waiting);
            return;
        }

        if(reg.installing){
            track_installing(reg.waiting);
            return;
        }

        reg.addEventListener('updatefound', () => track_installing(reg.installing));

        // On update reload bug fix var..
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // fix bug (infini reload)
            if(refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    });
}

function track_installing(sworker){
    sworker.addEventListener('statechange', () => {
        if(sworker.state == 'installed') update_ready(sworker);
    });
}

function update_ready(worker){
    //TODO: Do something in here
}

const db_promise = open_database();
register_serviceWorker();

window.addEventListener('beforeinstallprompt', e => {
    //Chrome <= 67 hack
    e.preventDefault();
    //TODO: use the def prompt when you have a prettified prompt to show(modal bottomsheet?)
    // Stash event for future trigger (on btn click)
    //deffered_prompt = e;
    //feedback = window.confirm('Click to install a shortcut to the website on your homescreen');
});

function fetch_currencies(){
    fetch(currency_query).then(response => {
        if (response.ok) {
            return response.json()
        }
    }).then(currency_objs => {
        //console.log(currency_objs);
        
        let currencies  = currency_objs['results'];

        db_promise.then(db => {
            if(!db) return;
    
            const trans = db.transaction(currency_store_name, 'readwrite');
            const store = trans.objectStore(currency_store_name);
            
            entries = Object.entries(currencies);
            for(entry of entries){
                money = make_money({currency_name : entry[1].currencyName, currency_symbol: entry[1].currencySymbol, id: entry[1].id});
                //console.log(money);
                //store.put(entry[1]);
                store.put(money);
            }
        });
    }).catch( error => console.log('There has been a problem with your currency fetch operation: ', error.message));
}

function get_currencies(){
    db_promise.then(db => {
        if(!db){
            return;
        }
        const index = db.transaction(currency_store_name).objectStore(currency_store_name).index('name');
        //FIXME: Populate the select list here
        index.getAll().then(currencies => {
            const from_list = document.getElementById('from_currency');
            const to_list = document.getElementById('to_currency');

            for (const currency of currencies) {
                const opt = document.createElement("option");
                const opt2 = document.createElement("option");
                opt.textContent = `${currency.currencyName} (${currency.currencySymbol})`;
                opt.setAttribute('value', currency.id);
                opt2.textContent = `${currency.currencyName} (${currency.currencySymbol})`;
                opt2.setAttribute('value', currency.id);

                if(currency.id === 'USD') opt.setAttribute('selected', '');

                from_list.appendChild(opt);
                to_list.appendChild(opt2);
            }
        })
    });
}


fetch_currencies();
get_currencies();
