function register_serviceWorker(){
    if(!navigator.serviceWorker) return;
    
    navigator.serviceWorker.register('./sw.js').then(reg => {
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
    //TODO: alert user
    //FIXME: wrap this in an if for response
    worker.postMessage({action: 'skipwaiting'});
}


register_serviceWorker();