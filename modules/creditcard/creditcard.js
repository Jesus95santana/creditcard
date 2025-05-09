/* creditcard.js */
Module.register("creditcard", {
  defaults: {
    bars: [
      {
        amount: 0,
        max: 100,
        spend: 0,
        spent: 0,
        label: "",
        label2: "",
        fee: 0,
      },
    ],
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
      spend: Number(item.spend) || 0,
      spent: Number(item.spent) || 0,
      label: item.label || "",
      label2: item.label2 || "",
      fee: Number(item.fee) || 0,
    }));

    // Re‑render
    this.updateDom();
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = "credit-card";

    (this.config.bars || []).forEach(
      ({ amount, max, spend, spent, label, label2, fee }, index) => {
        const pct =
          max > 0 ? Math.min(100, Math.max(0, (amount / max) * 100)) : 0;
        const spendNum =
          spend > 0 ? Math.min(100, Math.max(0, (spent / spend) * 100)) : 0;
        const row = document.createElement("div");
        row.className = "cc-row";

        // Details container
        const details = document.createElement("div");
        details.className = "cc-details";

        // Label (moved up)
        if (label) {
          const lbl = document.createElement("div");
          lbl.className = "cc-label";
          lbl.innerText = label;
          details.appendChild(lbl);
        }

        if (label2) {
          const lbl2 = document.createElement("div");
          lbl2.className = "cc-label2";
          lbl2.innerText = label2;
          details.appendChild(lbl2);
        }

        // Bar track
        const track1 = document.createElement("div");
        track1.className = "cc-bar1";
        const fill1 = document.createElement("div");
        fill1.className = "cc-fill1";
        if (index === 1) {
          fill1.classList.add("cc-fill1-2");
        }
        fill1.style.width = `${spendNum}%`;

        const maxLabel1 = document.createElement("div");
        maxLabel1.className = "cc-max1";
        // maxLabel.innerText = amount;
        maxLabel1.innerText = `$${spent.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        fill1.appendChild(maxLabel1);

        track1.appendChild(fill1);
        details.appendChild(track1);

        // Fee (only if > 0)
        if (fee > 0) {
          const feeEl = document.createElement("div");
          feeEl.className = "cc-fee";
          feeEl.innerText = `(Fee: ${fee.toFixed(2)})`;
          details.appendChild(feeEl);
        }

        // Amount (moved below label and bar)
        // const amt = document.createElement("div");
        // amt.className = "cc-amount";
        // amt.innerText = `${amount.toFixed(2)}/${max}`;
        // details.appendChild(amt);

        // Percentage text
        const pctText = document.createElement("div");
        pctText.className = "cc-percent";
        pctText.innerText = `${pct.toFixed(2)}%`;
        details.appendChild(pctText);

        // Bar track
        const track = document.createElement("div");
        track.className = "cc-bar";
        const fill = document.createElement("div");
        fill.className = "cc-fill";
        if (index === 1) {
          fill.classList.add("cc-fill-2");
        }

        fill.style.width = `${pct}%`;

        const maxLabel = document.createElement("div");
        maxLabel.className = "cc-max";
        // maxLabel.innerText = amount;
        maxLabel.innerText = `$${amount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        fill.appendChild(maxLabel);

        track.appendChild(fill);
        details.appendChild(track);

        row.appendChild(details);
        wrapper.appendChild(row);
      }
    );

    return wrapper;
  },
});
