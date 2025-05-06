/* creditcard.js */
Module.register("creditcard", {
  defaults: {
    bars: [{ amount: 0, max: 100, label: "" }],
    endpoint: "", // e.g. "https://…/creditcardmodule.json"
    updateInterval: 60 * 1000, // 1 minute
  },

  getStyles() {
    return ["creditcard.css"];
  },

  start() {
    if (this.config.endpoint) {
      this._fetchCredit();
      setInterval(() => this._fetchCredit(), this.config.updateInterval);
    }
  },

  _fetchCredit() {
    this.sendSocketNotification("GET_CREDIT", {
      url: this.config.endpoint,
    });
  },

  socketNotificationReceived(notification, payload) {
    if (notification !== "CREDIT_RESULT") return;

    // If payload is an array, map it; otherwise wrap it into an array
    if (Array.isArray(payload)) {
      this.config.bars = payload.map((item) => ({
        amount: Number(item.amount) || 0,
        max: Number(item.max) || 1,
        label: item.label || "",
      }));
    } else {
      const { amount, max, label } = payload;
      this.config.bars = [
        {
          amount: Number(amount) || 0,
          max: Number(max) || 1,
          label: label || this.config.bars[0].label,
        },
      ];
    }

    this.updateDom();
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "credit-card";

    (this.config.bars || []).forEach(({ amount, max, label }) => {
      const pct =
        max > 0 ? Math.min(100, Math.max(0, (amount / max) * 100)) : 0;

      // Row container
      const row = document.createElement("div");
      row.className = "cc-row";

      // 1) AMOUNT on top
      const amt = document.createElement("div");
      amt.className = "cc-amount";
      amt.innerText = `${amount}/${max}`;
      row.appendChild(amt);

      // 2) DETAILS: label | bar | percent
      const details = document.createElement("div");
      details.className = "cc-details";

      if (label) {
        const lbl = document.createElement("div");
        lbl.className = "cc-label";
        lbl.innerText = label;
        details.appendChild(lbl);
      }

      // bar track
      const track = document.createElement("div");
      track.className = "cc-bar";

      // fill + max‐inside
      const fill = document.createElement("div");
      fill.className = "cc-fill";
      fill.style.width = `${pct}%`;
      const maxLabel = document.createElement("div");
      maxLabel.className = "cc-max";
      maxLabel.innerText = max;
      fill.appendChild(maxLabel);

      track.appendChild(fill);
      details.appendChild(track);

      // percent
      const pctText = document.createElement("div");
      pctText.className = "cc-percent";
      pctText.innerText = `${Math.round(pct)}%`;
      details.appendChild(pctText);

      row.appendChild(details);
      wrapper.appendChild(row);
    });

    return wrapper;
  },
});
