// modules/creditcard/node_helper.js
const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
  start() {
    console.log("creditcard helper started");
  },

  socketNotificationReceived(notification, payload) {
    if (notification === "GET_CREDIT") {
      fetch(payload.url)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          // data should be an array:
          // [ {amount: A1, max: M1, label:"Foo"}, {...} ]
          this.sendSocketNotification("CREDIT_RESULT", data);
        })
        .catch((err) => {
          console.error("creditcard fetch failed:", err);
        });
    }
  },
});
