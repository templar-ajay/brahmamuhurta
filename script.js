const timeDisplayEl = document.querySelector("#muhurat-display");
const displayTime = (time) => (timeDisplayEl.innerHTML = time);
const error = document.querySelector("#error");
if (navigator.geolocation) {
  // device can return its location
  navigator.geolocation.getCurrentPosition(
    (position) => {
      error.style.display = "none";
      const positionString =
        position.coords.latitude + "," + position.coords.longitude;
      const cache = checkCache(positionString);
      if (cache) {
        displayTime(cache.split("=")[1]);
      } else {
        const url = `https://api.sunrise-sunset.org/json?lat=${position.coords.latitude}&lng=${position.coords.longitude}&formatted=0`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => data.results.sunrise)
          .then((sunriseInUTC) => {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return new Date(sunriseInUTC).toLocaleString("en-US", {
              timeZone: timeZone,
            });
          })
          .then((sunriseInLocalTimeZone) => {
            const date = new Date(sunriseInLocalTimeZone);
            return date < new Date() ? date.setDate(date.getDate() + 1) : date;
          })
          .then((nextSunRise) => {
            return {
              begins: function () {
                const date = new Date(nextSunRise);
                date.setMinutes(date.getMinutes() - 96);
                return date;
              },
              ends: function () {
                const date = new Date(nextSunRise);
                date.setMinutes(date.getMinutes() - 48);
                return date;
              },
              readable: function (time) {
                return time.toDateString();
              },
            };
          })
          .then((BrahmaMuhurtha) => {
            function readableFormat(time) {
              return time ? time.split(":").splice(0, 2).join(":") : false;
            }
            const result = `${readableFormat(
              BrahmaMuhurtha.begins().toLocaleTimeString()
            )} AM to ${readableFormat(
              BrahmaMuhurtha.ends().toLocaleTimeString()
            )} AM`;

            console.log("end time", BrahmaMuhurtha.ends());
            displayTime(result);
            setCache(
              positionString,
              result,
              new Date(BrahmaMuhurtha.ends()).toUTCString()
            );
          });
      }
    },
    () => {
      alert(
        "BrahmaMuhurtha depends on sunrise time and location, provide location access to get timings relevant for you"
      );
      timeDisplayEl.innerHTML = ` <small>BrahmaMuhurtha begins 1 hour and 36 minutes before sunrise, and ends 48 minutes before sunrise.</small>`;
      error.style.display = "block";
    }
  );
}

function setCache(locationInput, timingOutput, endsAt) {
  document.cookie = `${locationInput}=${timingOutput};expires=${endsAt}`;
}
function checkCache(key) {
  const x = document.cookie.split(";").filter((item) => {
    return item.includes(key + "=");
  });
  if (x.length > 0) {
    return x[0];
  } else return false;
}
