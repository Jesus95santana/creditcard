/* creditcard.js */
Module.register("creditcard", {
  defaults: {
    bars: [{ amount: 0, max: 100, spend: 0, spent: 0, paid: 0, label: "", label2: "", fee: 0, finalFee: 0 }],
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
      paid: Number(item.paid) || 0,
      label: item.label || "",
      label2: item.label2 || "",
      fee: item.fee || 0,
      finalFee: Number(item.finalFee) || 0,
    }));

    // Re‑render
    this.updateDom();
  },

getDom() {
  const wrapper = document.createElement("div");
  wrapper.className = "credit-card";



(this.config.bars || []).forEach(({ amount, max, spend, spent, paid, label, label2, fee, finalFee }, index) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, (amount / max) * 100)) : 0;
    let spendNum = spend > 0 ? Math.min(100, Math.max(0, (spent / spend) * 100)) : 0;
    const row = document.createElement("div");
    row.className = "cc-row";

    // Details container
    const details = document.createElement("div");
    details.className = "cc-details";


    // Fee-details container
    const feeDetails = document.createElement("div");
    feeDetails.className = "fee-details";
    
    // Label (moved up)
    if (label) {
      const lbl = document.createElement("div");
      lbl.className = "cc-label";
      lbl.innerText = label;
      feeDetails.appendChild(lbl);
    }

    // Fee (only if > 0)
    if (fee) {
      const feeEl = document.createElement("div");
      feeEl.className = "cc-fee";
      feeEl.innerText = `$${fee}`;
      feeDetails.appendChild(feeEl);
    }
    
  // **Attach fee-details into details** **
  details.appendChild(feeDetails);
  console.log(spent);

    if ((spent - finalFee) <= spend) {
      spent = spent - finalFee
      spendNum = spend > 0 ? Math.min(100, Math.max(0, (spent / spend) * 100)) : 0;
      console.log(`spent: ${spent}, finalFee: ${finalFee}, fee: ${fee}, spend: ${spend}, spendNum: ${spendNum}`)
      console.log(spent);
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
      maxLabel1.innerText = `$${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      fill1.appendChild(maxLabel1);
      track1.appendChild(fill1);
      details.appendChild(track1);

    } else {
      // Goal is met
      // 0) define your unit scale
      const MIN_UNIT = -200;
      const MAX_UNIT =  200;
      const RANGE    = MAX_UNIT - MIN_UNIT;

      // 1) build the container
      const divTrack = document.createElement("div");
      divTrack.className = "cc-divergent-track";

      // 2) add ticks every 50 units
      for (let u = MIN_UNIT + 50; u < MAX_UNIT; u += 50) {
        const pct = ((u - MIN_UNIT) / RANGE) * 100;    // position in % of width

        // tick line
        const tick = document.createElement("div");
        tick.className = "cc-divergent-tick";
        tick.style.left = `${pct}%`;
        divTrack.appendChild(tick);

        // tick label
        // const label = document.createElement("div");
        // label.className = "cc-divergent-label";
        // label.style.left = `${pct}%`;
        // label.innerText = Math.abs(u).toString();       // shows "50", "100", etc.
        // divTrack.appendChild(label);
      }

      // 3) zero‐center axis
      const zero = document.createElement("div");
      zero.className = "cc-divergent-zero";
      zero.style.left = `${((-MIN_UNIT) / RANGE) * 100}%`; // 50%
      divTrack.appendChild(zero);

      // 4) your fill bar (diff from zero)
      const diff = spent - paid;
      console.log(`Spent: ${spent}, Paid: ${paid}`);
      const clamped = Math.max(Math.min(diff, MAX_UNIT), MIN_UNIT);
      const widthPct = (Math.abs(clamped) / RANGE) * 100;
      const fill = document.createElement("div");
      fill.className = `cc-divergent-fill ${diff >= 0 ? "positive" : "negative"}`;

      if (diff >= 0) {
        fill.style.left  = zero.style.left;
        fill.style.width = `${widthPct}%`;
      } else {
        // move left from center
        fill.style.left  = `calc(${zero.style.left} - ${widthPct}%)`;
        fill.style.width = `${widthPct}%`;
      }
      if (diff <= 0) {
        const lbl2 = document.createElement("div");
        lbl2.className = "cc-label2";
        lbl2.innerText = `🙂 Great! You paid off $${Math.abs(diff).toFixed(2)}!`;
        details.appendChild(lbl2);
      } else {
        const lbl2 = document.createElement("div");
        lbl2.className = "cc-label2";
        lbl2.innerText = `🙁 Oh no, you forgot to pay $${diff.toFixed(2)}`;
        details.appendChild(lbl2);
      }

      divTrack.appendChild(fill);

      // 5) insert into your existing details node
      details.appendChild(divTrack);


    }

    // if (label2) {
    //   const lbl2 = document.createElement("div");
    //   lbl2.className = "cc-label2";
    //   lbl2.innerText = label2;
    //   details.appendChild(lbl2);
    // }

    // // Bar track
    // const track1 = document.createElement("div");
    // track1.className = "cc-bar1";
    // const fill1 = document.createElement("div");
    // fill1.className = "cc-fill1";
    // if (index === 1) {
    //   fill1.classList.add("cc-fill1-2");
    // }
    // fill1.style.width = `${spendNum}%`;

    // const maxLabel1 = document.createElement("div");
    // maxLabel1.className = "cc-max1";
    // // maxLabel.innerText = amount;
    // maxLabel1.innerText = `$${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    // fill1.appendChild(maxLabel1);

    // track1.appendChild(fill1);
    // details.appendChild(track1);




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
    maxLabel.innerText = `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    fill.appendChild(maxLabel);

    track.appendChild(fill);
    details.appendChild(track);

    row.appendChild(details);
    wrapper.appendChild(row);

  });

  return wrapper;
}

});
