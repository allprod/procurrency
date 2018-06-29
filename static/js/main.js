const currency_store_name = 'currencies';
const conversion_store_name = 'conversions';
const currency_query = 'https://free.currencyconverterapi.com/api/v5/currencies'
let convertion_query = 'https://free.currencyconverterapi.com/api/v5/convert?q=USD_PHP&compact=ultra'

function openDatabase(){
    if(!navigator.serviceWorker) return Promise.resolve();

    return idb.open('procurrency', 1, upgradeDb => {
        const curency_store = upgradeDb.createObjectStore(currency_store_name, {
            // TODO: Make a primary key here
            keypath: 'id'
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

const db_promise = openDatabase();
register_serviceWorker();

function fetch_currencies(){
    fetch(currency_query).then(response => {
        console.log(response.body);
        const currency_objs = JSON.parse(Response.body);
        
        const currencies = currency_objs['results'];
    })
    db_promise.then(db => {
        if(!db) return;

        const trans = db.transaction(currency_store_name, 'readwrite');
        const store = trans.objectStore(currency_store_name);
        
        currencies.forEach(element => store.put(element));
    });
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
                opt.textContent = `${currency.currencyName} (${currencySymbol})`;
                from_list.appendChild(opt);
                to_list.appendChild(opt);
            }
        })
    });
    //currency_objs = 
}
fetch_currencies();
get_currencies();