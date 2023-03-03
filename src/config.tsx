export class Config {
  static timeStep: number
  static delta: number

  static init() {
    fetch("/get_time_step", {method: "GET", headers: {"Accept": "text/plain"}})
      .then(response => response.text())
      .then(timeStep => this.timeStep = parseInt(timeStep))

    fetch("/get_delta", {method: "GET", headers: {"Accept": "text/plain"}})
      .then(response => response.text())
      .then(delta => this.delta = parseFloat(delta))
  }

  static setTimeStep(value: number) {
    fetch("/set_time_step?" + new URLSearchParams({ value: value.toString() }))
      .catch(error => console.log("Setting time step error: ", error))

    this.timeStep = value
  }

  static setDelta(value: number) {
    fetch("/set_delta?" + new URLSearchParams({ value: value.toString() }))
      .catch(error => console.log("Setting delta error: ", error))

    this.delta = value
  }
}

export const ConfigPage = () => {
  return (
    <div id="config-page">
      <h2>Config</h2>
      <div class="option">
        <h2>Time step</h2>
        <input onInput={event => {
          const value: string = (event.target as HTMLInputElement).value
          if (!value)
            Config.setTimeStep(0)
          else if (!".,".includes(value[0]) && !".,".includes(value[-1]))
            Config.setTimeStep(parseInt(value))
        }} onKeyPress={event => {
          if (!"0123456789.,".includes(event.key))
            event.preventDefault()
        }} value={Config.timeStep} />
      </div>
      <div class="option">
        <h2>Delta</h2>
        <input onInput={event => {
          const value: string = (event.target as HTMLInputElement).value
          if (!value)
            Config.setDelta(0)
          else if (!".,".includes(value[0]) && !".,".includes(value[-1]))
            Config.setDelta(parseFloat(value))
        }} onKeyPress={event => {
          if (!"0123456789.,".includes(event.key))
            event.preventDefault()
        }} value={Config.delta} />
      </div>
    </div>
  )
}