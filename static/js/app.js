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
    from_currency = document.getElementById('from_currency').value;
    to_currency = document.getElementById('to_currency').value;

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