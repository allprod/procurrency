let lastused = false;
let countries = [];
let local_currency = 'BTC';
let rate = 0;

/*
* gets the list of currencies from the api using a fetch() call,
* then calls @method{set_lists()} with the list of returned currencies
*/
function get_currencies() {
    console.log('getting currencies');
    fetch('https://free.currencyconverterapi.com/api/v6/currencies')
    .then(response => {if (response.ok) return response.json()},
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
    console.log('local currency is: ', local_currency)
    entries = Object.entries(currencies);
        for(currency of entries){
            currency = currency[1];
            
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
                if(currency.id === 'USD' & local_currency !== 'USD') {
                    opt.setAttribute('selected', '');                    
                } else if(currency.id === 'EUR' & local_currency === 'USD') {
                    opt.setAttribute('selected', '');
                }
                if(currency.id === local_currency) {
                    opt2.setAttribute('selected', '');
                }
            }

            from_list.appendChild(opt);
            to_list.appendChild(opt2);
        }
        fetch_conversions();
}

function fetch_conversions(reason = 0){
    rate = 0;
    const from_currency = document.getElementById('from_currency').value;
    const to_currency = document.getElementById('to_currency').value;

    const query = `${from_currency}_${to_currency}`;
    const query2 = `${to_currency}_${from_currency}`;
    let res = 0;
    const query_url = `https://free.currencyconverterapi.com/api/v6/convert?q=${query},${query2}&compact=ultra`;

    fetch(query_url).then(response => {if(response.ok) return response.json()})
        .then(response => {
            rate = response[query];
            if (reason == 1) {
                convert()
            }
        });
}

function iploc(){
    console.log('Retrieving location from ip address');
    fetch('http://ip-api.com/json').then(response => {
        if(response.ok) return response.json();
    }).then(response => get_country_currency(response.country));
}

 function get_location(){
    console.log('getting loc');
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
    console.log('getting country');
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`)
    url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}`;
    fetch(url).then(response => {
        if(response.ok) return response.json()
    }).then(response => {
        res = response["results"]
        country = res[res.length - 1]['formatted_address']
        get_country_currency(country)
    });
}

function get_country_currency(country = 'France'){
    //TODO: Logic here. set the localcurrency val here
    console.log('Country is ', country)
    for (cn of countries){
        if(cn.name.toLowerCase().startsWith(country.toLowerCase())){
            local_currency = cn.currencyId
        }        
    }
    console.log('local currency is ', local_currency)
}

function get_countries(){
    console.log('getting countries');
    fetch('https://free.currencyconverterapi.com/api/v6/countries')
        .then(response => {
            if (response.ok) return response.json()})
                .then(data => {
                    
                    for (country of Object.entries(data['results'])){
                        countries.push(country[1]);
                    }
                    set_countries()
                });
}

function set_countries(){
    const from = document.getElementById('from_country');
    const to = document.getElementById('to_country');

    for (country of countries){
        const opt = document.createElement("option");
        const opt2 = document.createElement("option");
        //TODO: Check if this is correct:
        opt.textContent = `${country.name}`;
        opt.setAttribute('value', country.currency);
        opt2.textContent = `${country.name}`;
        opt2.setAttribute('value', country.currency);

        from_list.appendChild(opt);
        to_list.appendChild(opt2);
    }
}

function convert(){

    
    const from_amt = document.getElementById('from_ammount');
    const to_amt = document.getElementById('to_ammount');
     
    
    const source_ammount = parseFloat(from_amt.value, 10);
    const ammount = rate * source_ammount;

    to_amt.value = ammount.toFixed(3);
}

function swap_currencies(){
    const from_currency_elem = document.getElementById('from_currency');
    const to_currency_elem = document.getElementById('to_currency');
    
    const temp = from_currency_elem.value;
    from_currency_elem.value = to_currency.value;
    to_currency_elem.value = temp;

    fetch_conversions(reason=1);
    convert()
}

function start(){
    get_currencies();
    get_countries();
    get_location();
}

start();