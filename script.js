
if (navigator.geolocation) { // device can return its location
    navigator.geolocation.getCurrentPosition(function (position) {
        const url = `https://api.sunrise-sunset.org/json?lat=${position.coords.latitude}&lng=${position.coords.longitude}&formatted=0`

        fetch(url).then(res => res.json()).then(data => data.results.sunrise).then(sunriseInUTC => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const sunrise = new Date(sunriseInUTC).toLocaleString("en-US", { timeZone: timeZone })
            return sunrise;
        }
        ).then(sunriseInLocalTimeZone => {
            const date = new Date(sunriseInLocalTimeZone)
            if (date < new Date()) {
                date.setDate(date.getDate() + 1)
            }
            return date;
        }
        ).then(nextSunRise => {
            const BrahmaMuhurtha = {
                begins: function () {
                    const date = new Date(nextSunRise)
                    date.setMinutes(date.getMinutes() - 96)
                    return date;
                },
                ends: function () {
                    const date = new Date(nextSunRise)
                    date.setMinutes(date.getHours() - 48)
                    return date
                },
                readable: function (time) {
                    return time.toDateString()
                }
            }
            return BrahmaMuhurtha;
        }).then((BrahmaMuhurtha => {

            function readableFormat(time) {
                return (time) ?
                    time.split(':').splice(0, 2).join(':') : false;
            }
            console.log(`BrahmaMuhurtha`), console.log(BrahmaMuhurtha.begins().toLocaleTimeString(), BrahmaMuhurtha.ends());
            timeDisplayEl.innerHTML = `${readableFormat(BrahmaMuhurtha.begins().toLocaleTimeString())} AM to ${readableFormat(BrahmaMuhurtha.ends().toLocaleTimeString())} AM`
        }))

        const timeDisplayEl = document.querySelector('#muhurat-display')

    });
}
