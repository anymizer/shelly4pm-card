class Shelly4PMCardEditor extends HTMLElement {

  setConfig(config) {
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._preview) this._preview.hass = hass;
  }

  get hass() {
    return this._hass;
  }

  render() {

    this.innerHTML = `
      <style>
        .wrapper {
          padding: 16px;
        }
        .section {
          margin-top: 16px;
          border-top: 1px solid var(--divider-color);
          padding-top: 12px;
        }
        details {
          margin-bottom: 10px;
        }
        summary {
          font-weight: bold;
          cursor: pointer;
          margin-bottom: 8px;
        }
      </style>

      <div class="wrapper">

        <h2>Shelly 4PM</h2>

        <ha-textfield
          label="Titel"
          .value="${this.config.title || ''}"
          id="title">
        </ha-textfield>

        ${this._renderChannel(1)}
        ${this._renderChannel(2)}
        ${this._renderChannel(3)}
        ${this._renderChannel(4)}

        <div class="section">
          <h3>Allgemein</h3>

          <ha-entity-picker
            label="Spannung (VAC)"
            .hass="${this.hass}"
            .value="${this.config.sensor_vac?.entity || ''}"
            id="sensor_vac"
            .includeDomains=${["sensor"]}>
          </ha-entity-picker>
        </div>

        <div class="section">
          <h3>Live Vorschau</h3>
          <div id="preview"></div>
        </div>

      </div>
    `;

    // Events
    this.querySelectorAll("ha-textfield, ha-entity-picker").forEach(el => {
      el.addEventListener("value-changed", () => this._valueChanged());
    });

    // Live Preview
    this._preview = document.createElement("shelly4pm-card");
    this._preview.setConfig(this.config);

    if (this._hass) this._preview.hass = this._hass;

    this.querySelector("#preview").appendChild(this._preview);
  }

  _renderChannel(n) {
    return `
      <details>
        <summary>Kanal ${n}</summary>

        <ha-textfield
          label="Name"
          .value="${this.config["switch" + n] || ''}"
          id="switch${n}">
        </ha-textfield>

        <ha-entity-picker
          label="Switch"
          .hass="${this.hass}"
          .value="${this.config["switch_entity" + n]?.entity || ''}"
          id="switch_entity${n}"
          .includeDomains=${["switch"]}>
        </ha-entity-picker>

        <ha-entity-picker
          label="Power Sensor"
          .hass="${this.hass}"
          .value="${this.config["sensor" + n]?.entity || ''}"
          id="sensor${n}"
          .includeDomains=${["sensor"]}>
        </ha-entity-picker>

      </details>
    `;
  }

  _valueChanged() {

    const get = id => this.querySelector("#" + id)?.value;

    const newConfig = {
      ...this.config,
      title: get("title"),
      sensor_vac: { entity: get("sensor_vac") }
    };

    for (let i = 1; i <= 4; i++) {
      newConfig["switch" + i] = get("switch" + i);
      newConfig["switch_entity" + i] = { entity: get("switch_entity" + i) };
      newConfig["sensor" + i] = { entity: get("sensor" + i) };
    }

    // Live Preview updaten
    if (this._preview) {
      this._preview.setConfig(newConfig);
      this._preview.hass = this._hass;
    }

    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: newConfig }
    }));
  }
}

customElements.define("shelly4pm-card-editor", Shelly4PMCardEditor);
