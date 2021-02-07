/* SEND WEATHER ALERT NODE APP
 *
 * The program fetches the current weather data getWeather() first and checks if
 * the weather id is between 600 and 622 (snow ids). If the weather id falls into
 * that range,the current temperature is passed into sendMessage() and the message
 * is sent to the user.
 *
 * I would upgrade this function to pull all user created weather alerts
 * from a database (e.g. Firestore) and cycle through them to see whether they
 * meet the criteria to send an SMS alert.
 *
 * I would host the function on e.g. Firebase and schedule a cron job to run at
 * a certain interval (e.g. every 3 to 6 hours).
 */

require("dotenv").config();

const accountSid = process.env.ACC_SID;
const authToken = process.env.AUTH_TOKEN;
const weatherKey = process.env.WEATHER_KEY;
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=lillestrom&appid=${weatherKey}&units=metric`;

const axios = require("axios").default;
const cron = require("node-cron")

const twilio = require("twilio");
const client = new twilio(accountSid, authToken);

// * * * * * runs the callback function every minute
cron.schedule("* * * * *", () => {
  getWeather();
})

function sendMessage(temp) {
  client.messages
    .create({
      body: `It's snowing in Lillestrøm and the temperature is ${temp}°C. Dress warmly!`,
      to: process.env.TO,
      from: process.env.FROM,
    })
    .then((message) => console.log(message.body));
}

async function getWeather() {
  try {
    const response = await axios.get(weatherUrl);
    console.log('weather data fetched');

    if (response.status !== 200) {
      console.warn(response.statusText);
      return;
    } else {
      let { id: weatherId } = response.data.weather[0];
      const { temp } = response.data.main;
      console.log(weatherId);

      if (weatherId >= 600 && weatherId <= 622) {
        sendMessage(temp);
        return;
      } else {
        return;
      }
    }
  } catch (error) {
    console.error(error.response);
  }
}