let lastused = false;
let countries = [];
let local_currency = '';
/*
* gets the list of currencies from the api using a fetch() call,
* then calls @method{set_lists()} with the list of returned currencies
*/
function get_currencies() {
    fetch('https://free.currencyconverterapi.com/api/v6/currencies').then(response => {
        if(response.ok){
            return response.json();
        }
    }, 
        error => console.log('Failed to get currencies: ', error))
            .then(response => set_lists(response['results']));
}

/*
* Displays the passed currencies using the select drop downs.
* @param{Object}
*/
function set_lists(currencies = {}){
    //TODO: check for empty obj here
    //TODO: get last used here
    entries = Object.entries(currencies);
        for(entry of entries){
            currency = make_money({currency_name : entry[1].currencyName, currency_symbol: entry[1].currencySymbol, id: entry[1].id});
            
            const from_list = document.getElementById('from_currency');
            const to_list = document.getElementById('to_currency');

            const opt = document.createElement("option");
            const opt2 = document.createElement("option");
            opt.textContent = `${currency.id} - ${currency.currencyName} (${currency.currencySymbol})`;
            opt.setAttribute('value', currency.id);
            opt2.textContent = `${currency.id} - ${currency.currencyName} (${currency.currencySymbol})`;
            opt2.setAttribute('value', currency.id);

            if(lastused) {
                if(currency.id === lastused['from']) opt.setAttribute('selected', '');
                if(currency.id === lastused['to']) opt2.setAttribute('selected', '');
            } else {
                if(currency.id === 'USD') opt.setAttribute('selected', '');
                if(currency.id === local_currency) opt2.setAttribute('selected', '');
            }

            from_list.appendChild(opt);
            to_list.appendChild(opt2);
        }
}

function make_money({currency_name = 'fake money', currency_symbol = 'replace me', id = 'fakeness'} = {}){
    // If the default method is detected we return undefined
    if(currency_name === 'fake money') return undefined;
    if (currency_symbol === 'replace me') {
        currency_symbol = id;
    }
    return {currencyName: currency_name, currencySymbol: currency_symbol, id: id};
}

function iploc(){
    console.log('Retrieving location from ip address');
    fetch('http://ip-api.com/json').then(response => {
        if(response.ok) return response.json();
    }).then(response => get_country_currency(response.country));
}

function get_location(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            get_country(position.coords.latitude, position.coords.longitude);
        }, error => {
            console.log('Error retrieving location: ', error);
            iploc();
        });
    } else {
        console.log('Geolocation error: Location not enabled in browser');
        iploc();
    }
}

function get_country(latitude = 0.0, longitude = 0.0){
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}`;
    fetch(url).then(response => {
        if(response.ok) return response.json()
    }).then(response => {
        country = response["results"][0]["address_components"][6]["long_name"]
        get_country_currency(country)
    });
}

function get_country_currency(country = 'France'){
    //TODO: Logic here. set the localcurrency val here
    for (cn of countries){
        if(cn.name.toLowerCase().startsWith(country.toLowerCase())){
            local_currency = cn.currencyId
        }
    }
}

function get_countries(){
    fetch('https://free.currencyconverterapi.com/api/v6/countries').then(response => {
        if(response.ok) return response.json;
    }).then(response => {
        for(country of Object.entries(response['results'])){
            countries.push(country[1]);
        }
    })
}

function convert(from = 0){
    from_currency = document.getElementById('from_currency');
    to_currency = document.getElementById('to_currency');

    const query = `${from_currency}_${to_currency}`;

    fetch(query).then(response => {
        //TODO: Convert here
        // If the conversion is called normally we convert as normal
        let from_amt;
        let to_amt;
        if(from === 0){
            from_amt = document.getElementById('from_ammount');
            to_amt = document.getElementById('to_ammount');
        } 
        // If the convertion is called from bottom input we'll swap the two around
        else {
            from_amt = document.getElementById('to_ammount');
            to_amt = document.getElementById('from_ammount');
        }
        

        const source_ammount = parseFloat(from_amt.value, 10);
        const ammount = response * source_ammount;

        to_amt.value = ammount.toFixed(3);
    });
}