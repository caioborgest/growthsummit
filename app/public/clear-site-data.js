
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        if (registrations.length) {
            console.log('Unregistering service workers for dev...');
            for (let registration of registrations) {
                registration.unregister();
            }
            window.location.reload();
        }
    });
}
