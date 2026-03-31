class Shelly4PMCard extends HTMLElement {

  setConfig(config) {

    this.config = config;
    this.sensors = [];
    this.switches = [];

    const root = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .card-container {
        width: 100%;
        height: auto;
        padding-top: 81.06%;
        background-image: url("/local/shelly4pm-card/shelly4pm_350x291.png");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        position: relative;
        overflow: hidden;
      }

      .text {
        position: absolute;
        color: white;
        font-weight: bold;
        text-shadow: 2px 2px 4px black;
        transform: translate(-50%, -50%);
        white-space: nowrap;
      }

      .sensor {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: bold;
        text-shadow: 2px 2px 4px black;
        transform: translate(-50%, -50%);
        color: white;
      }

      .switch {
        position: absolute;
        transform: translate(-50%, -50%);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .led {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #444;
        box-shadow: 0 0 6px rgba(0,0,0,0.6);
      }

      .bottom-bar {
        position: absolute;
        left: 0;
        right: 0;
        top: 82%;
        transform: translateY(-50%);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        font-size: 18px;
        font-weight: bold;
        color: white;
        text-shadow: 2px 2px 4px black;
      }

      .power-bar-container {
        position: absolute;
        left: 10%;
        width: 80%;
        top: 88%;
        height: 8px;
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
        overflow: hidden;
      }

      .power-bar {
        height: 100%;
        width: 0%;
        background: #4caf50;
        transition: width 0.3s ease, background 0.3s ease;
      }

      .line {
        position: absolute;
        left: 5%;
        width: 90%;
        height: 2px;
        background: white;
        opacity: 0.9;
      }

      /* Shelly Schriftzug */
      .shelly-text {
        font-style: italic;
        font-weight: 700;
        color: #00bcd4;
        letter-spacing: 0.5px;
      }

      .shelly-logo {
        position: absolute;
        left: 6%;
        top: 6%;
        transform: translate(0, -50%);
        display: flex;
        align-items: center;
        gap: 6px;
        filter: drop-shadow(0 0 6px rgba(0,188,212,0.6));
      }
    `;
    root.appendChild(style);

    this.card = document.createElement('div');
    this.card.className = 'card-container';

    // ---------- SHELLY TEXT LOGO ----------
    const shellyLogo = document.createElement('div');
    shellyLogo.className = 'shelly-logo';

    const shellyText = document.createElement('span');
    shellyText.className = 'shelly-text';
    shellyText.textContent = "Shelly";

    const modelText = document.createElement('span');
    modelText.textContent = "4PM";
    modelText.style.color = "white";
    modelText.style.fontWeight = "bold";
    modelText.style.fontSize = "18px";

    shellyLogo.appendChild(shellyText);
    shellyLogo.appendChild(modelText);
    this.card.appendChild(shellyLogo);

    // ---------- TITLE ----------
    if (config.title) {
      const title = document.createElement('div');
      title.className = 'text';
      title.textContent = config.title;
      title.style.left = "50%";
      title.style.top = "6%";
      title.style.fontSize = "18px";
      this.card.appendChild(title);
    }

    const createLabel = (text, x, y) => {
      if (!text) return;
      const el = document.createElement('div');
      el.className = 'text';
      el.textContent = text;
      el.style.left = x;
      el.style.top = y;
      el.style.fontSize = "16px";
      this.card.appendChild(el);
    };

    const channelPositions = ["22%", "37%", "52%", "67%"];

    createLabel(config.switch1, "18%", channelPositions[0]);
    createLabel(config.switch2, "18%", channelPositions[1]);
    createLabel(config.switch3, "18%", channelPositions[2]);
    createLabel(config.switch4, "18%", channelPositions[3]);

    const createAutoLines = (positions) => {
      for (let i = 0; i < positions.length - 1; i++) {
        const y1 = parseFloat(positions[i]);
        const y2 = parseFloat(positions[i + 1]);
        const middle = (y1 + y2) / 2;
        const line = document.createElement('div');
        line.className = 'line';
        line.style.top = middle + "%";
        this.card.appendChild(line);
      }
    };

    createAutoLines(channelPositions);

    const createSensor = (conf, x, y) => {
      if (!conf || !conf.entity) return;

      const container = document.createElement('div');
      container.className = 'sensor';
      container.style.left = x;
      container.style.top = y;

      const icon = document.createElement('ha-icon');
      icon.setAttribute("icon", conf.icon || "mdi:flash");

      const value = document.createElement('span');

      container.appendChild(icon);
      container.appendChild(value);
      this.card.appendChild(container);

      this.sensors.push({
        entity: conf.entity,
        valueEl: value
      });
    };

    createSensor(config.sensor1, "52%", channelPositions[0]);
    createSensor(config.sensor2, "52%", channelPositions[1]);
    createSensor(config.sensor3, "52%", channelPositions[2]);
    createSensor(config.sensor4, "52%", channelPositions[3]);

    const createSwitch = (conf, x, y) => {
      if (!conf || !conf.entity) return;

      const container = document.createElement('div');
      container.className = 'switch';
      container.style.left = x;
      container.style.top = y;

      const led = document.createElement('div');
      led.className = 'led';

      const icon = document.createElement('ha-icon');
      icon.setAttribute("icon", "mdi:toggle-switch");
      icon.style.width = "48px";
      icon.style.height = "48px";
      icon.style.setProperty('--mdc-icon-size', '48px');

      container.appendChild(led);
      container.appendChild(icon);

      container.addEventListener("click", () => {
        this._hass.callService("switch", "toggle", {
          entity_id: conf.entity
        });
      });

      this.card.appendChild(container);

      this.switches.push({
        entity: conf.entity,
        iconEl: icon,
        ledEl: led
      });
    };

    createSwitch(config.switch_entity1, "83%", channelPositions[0]);
    createSwitch(config.switch_entity2, "83%", channelPositions[1]);
    createSwitch(config.switch_entity3, "83%", channelPositions[2]);
    createSwitch(config.switch_entity4, "83%", channelPositions[3]);

    this.bottomBar = document.createElement("div");
    this.bottomBar.className = "bottom-bar";

    this.vacEl = document.createElement("div");
    this.totalPower = document.createElement("div");

    this.bottomBar.appendChild(this.vacEl);
    this.bottomBar.appendChild(this.totalPower);
    this.card.appendChild(this.bottomBar);

    this.barContainer = document.createElement("div");
    this.barContainer.className = "power-bar-container";

    this.powerBar = document.createElement("div");
    this.powerBar.className = "power-bar";

    this.barContainer.appendChild(this.powerBar);
    this.card.appendChild(this.barContainer);

    if (config.sensor_vac && config.sensor_vac.entity) {
      this.vacEntity = config.sensor_vac.entity;
    }

    root.appendChild(this.card);
  }

  set hass(hass) {
    this._hass = hass;
    let total = 0;

    this.sensors.forEach(sensor => {
      const state = hass.states[sensor.entity];
      let value = 0;
      let unit = "W";

      if (state && state.state !== "unknown" && state.state !== "unavailable") {
        const parsed = parseFloat(state.state);
        if (!isNaN(parsed)) value = parsed;
        unit = state.attributes.unit_of_measurement || "W";
      }

      total += value;
      sensor.valueEl.textContent = value + " " + unit;

      if (value < 250) sensor.valueEl.style.color = "#4caf50";
      else if (value < 2000) sensor.valueEl.style.color = "#ffc107";
      else sensor.valueEl.style.color = "#f44336";
    });

    this.totalPower.textContent = "Total: " + total.toFixed(0) + " W";

    if (this.vacEntity) {
      const state = hass.states[this.vacEntity];
      let value = state ? parseFloat(state.state) || 0 : 0;
      let unit = state?.attributes.unit_of_measurement || "V";
      this.vacEl.textContent = "VAC: " + value + " " + unit;
    }

    let percent = Math.min((total / 9600) * 100, 100);
    this.powerBar.style.width = percent + "%";

    if (percent < 30) this.powerBar.style.background = "#4caf50";
    else if (percent < 70) this.powerBar.style.background = "#ffc107";
    else this.powerBar.style.background = "#f44336";

    this.switches.forEach(sw => {
      const state = hass.states[sw.entity];
      if (!state) return;

      if (state.state === "on") {
        sw.iconEl.style.color = "#4caf50";
        sw.ledEl.style.background = "#4caf50";
        sw.ledEl.style.boxShadow = "0 0 8px #4caf50";
      } else {
        sw.iconEl.style.color = "#888";
        sw.ledEl.style.background = "#444";
        sw.ledEl.style.boxShadow = "none";
      }
    });
  }

  getCardSize() {
    return 6;
  }
}

customElements.define('shelly4pm-card', Shelly4PMCard);
