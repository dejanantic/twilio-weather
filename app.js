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

// Here I would have a function that retreives all of the alerts
const users = [
  {
    // verify number
    name: "Robin",
    phone: "+4790076246",
  },
  {
    // verify number
    name: "Ruben",
    phone: "+4797160269",
  },
  {
    name: "Dejan",
    phone: "+4790076246",
  },
];

function sendMessage(temp, phone) {
  return client.messages
    .create({
      body: `It's snowing in Lillestrøm and the temperature is ${temp}°C. Dress warmly!`,
      to: phone,
      from: process.env.FROM,
    })
}

async function getWeather() {
  try {
    const response = await axios.get(weatherUrl);

    if (response.status !== 200) {
      console.warn(response.statusText);
      return;
    } else {
      let { id: weatherId } = response.data.weather[0];
      let { temp } = response.data.main;
      temp = Math.round(temp);
      // GOD MODE ON: Thou shall have snow in Lillestrøm❄️
      weatherId = 601;

      if (weatherId >= 600 && weatherId <= 622) {
        const messageResponses = await Promise.all(
          users.map((user) => {
            return sendMessage(temp, user.phone);
          })
        );
        console.log(messageResponses);
        return;
      } else {
        return;
      }
    }
  } catch (error) {
    console.error(error.response);
  }
}