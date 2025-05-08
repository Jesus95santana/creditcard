/* creditcard.js */
Module.register("creditcard", {
  defaults: {
    bars: [{ amount: 0, max: 100, label: "", fee: 0 }],
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

    // Normalize payload into bars, including the fee field
    this.config.bars = (payload || []).map((item) => ({
      amount: Number(item.amount) || 0,
      max: Number(item.max) || 1,
      label: item.label || "",
      fee: Number(item.fee) || 0,
    }));

    // Re‑render
    this.updateDom();
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "credit-card";

    (this.config.bars || []).forEach(({ amount, max, label, fee }) => {
      const pct =
        max > 0 ? Math.min(100, Math.max(0, (amount / max) * 100)) : 0;

      const row = document.createElement("div");
      row.className = "cc-row";

      // Amount / max
      const amt = document.createElement("div");
      amt.className = "cc-amount";
      amt.innerText = `${amount.toFixed(2)}/${max}`;
      row.appendChild(amt);

      // Details container
      const details = document.createElement("div");
      details.className = "cc-details";

      // Label
      if (label) {
        const lbl = document.createElement("div");
        lbl.className = "cc-label";
        lbl.innerText = label;
        details.appendChild(lbl);
      }

      // Fee (only if > 0)
      if (fee > 0) {
        const feeEl = document.createElement("div");
        feeEl.className = "cc-fee";
        feeEl.innerText = `(Fee: ${fee.toFixed(2)})`;
        details.appendChild(feeEl);
      }

      // Bar track
      const track = document.createElement("div");
      track.className = "cc-bar";
      const fill = document.createElement("div");
      fill.className = "cc-fill";
      fill.style.width = `${pct}%`;

      const maxLabel = document.createElement("div");
      maxLabel.className = "cc-max";
      maxLabel.innerText = max;
      fill.appendChild(maxLabel);

      track.appendChild(fill);
      details.appendChild(track);

      // Percentage text
      const pctText = document.createElement("div");
      pctText.className = "cc-percent";
      pctText.innerText = `${pct.toFixed(2)}%`;
      details.appendChild(pctText);

      row.appendChild(details);
      wrapper.appendChild(row);
    });

    return wrapper;
  },
});
