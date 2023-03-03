import {Chart} from "chart.js";

export enum ProcessState {
  EMPTY,
  SET,
  RUNNING,
  STOPPING,
  STOPPED,
  FINISHED
}

type ChartEntry = {
  time: number
  temp: number
}

export class ProcessController {
  static currentTemplate: number = -1
  static currentState: ProcessState = ProcessState.EMPTY
  static onStateChanged: any = null

  static chart: Chart | null = null
  static chartData: ChartEntry[] = []
  static updateIntervalID: NodeJS.Timer | null = null

  static setState(state: ProcessState) {
    this.currentState = state
    if (this.onStateChanged !== null)
      this.onStateChanged()
  }

  static init() {
    const loadHistory = () => {
      fetch("/temp_history.txt", {method: "GET", headers: {"Accept": "text/plain"}})
        .then(response => response.text())
        .then(history => {
          for (let line of history.split("\n")) {
            const data = line.split(" ")
            this.chartData.push({time: parseInt(data[0]), temp: parseFloat(data[2])})
            this.updateChart()
          }
        })
    }

    const loadCurrentWork = () => {
      fetch("/get_template_index", {method: "GET", headers: {"Accept": "text/plain"}})
        .then(response => response.text())
        .then(template => {
          this.currentTemplate = parseInt(template)
          this.setState(ProcessState.RUNNING)

          loadHistory()
          this.runUpdating()
        })
    }

    fetch("/work_status", {method: "GET", headers: {"Accept": "text/plain"}})
      .then(response => response.text())
      .then(status => {
        if (status === "true")
          loadCurrentWork()
      })
  }

  static createChart(context: CanvasRenderingContext2D) {
    this.chart = new Chart(context, {
      type: "line",
      data: {
        labels: this.chartData.map(entry => entry.time),
        datasets: [
          {
            label: "Real",
            data: this.chartData.map(entry => entry.temp),
            borderWidth: 2,
            borderColor: "#e15858",
            backgroundColor: "#e15858",
            cubicInterpolationMode: "monotone",
            pointStyle: false
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Time"
            }
          },
          y: {
            title: {
              display: true,
              text: "Temp"
            }
          }
        }
      }
    });
  }

  static destroyChart() {
    this.chart?.destroy()
    this.chart = null
  }

  static setTemplate(id: number) {
    this.currentTemplate = id
    this.setState(ProcessState.SET)

    fetch("/set_template?" + new URLSearchParams({index: id.toString()}), {method: "POST"}).then()
  }

  static runTemplate() {
    this.setState(ProcessState.RUNNING)

    fetch("/start_work", {method: "POST"})
      .then(this.runUpdating)
  }

  static runUpdating() {
    ProcessController.updateIntervalID = setInterval(() => {
      let status;
      fetch("/work_status", {method: "GET", headers: {"Accept": "text/plain"}})
        .then(response => response.text())
        .then(work_status => status = work_status == "true")

      if (status) {
        fetch("/get_temp", {method: "GET", headers: {"Accept": "text/plain"}})
          .then(response => response.text())
          .then(text => {
            const data = text.split(" ")
            ProcessController.chartData.push({time: parseInt(data[0]), temp: parseFloat(data[2])})
            ProcessController.updateChart()
          })
      } else {
        ProcessController.setState(ProcessState.FINISHED)
        if (this.updateIntervalID !== null)
          clearInterval(this.updateIntervalID)
      }
    }, 30000)
  }

  static updateChart() {
    if (this.chart !== null) {
      this.chart.data.labels = this.chartData.map(entry => entry.time)
      this.chart.data.datasets[0].data = this.chartData.map(entry => entry.temp)
      this.chart.update("none")
    }
  }

  static stopTemplate() {
    this.setState(ProcessState.STOPPING)
    if (this.updateIntervalID !== null)
      clearInterval(this.updateIntervalID)

    fetch("/stop_work", {method: "POST"})
      .then(() => (this.currentState = ProcessState.STOPPED))
      .finally(() => this.setState(ProcessState.STOPPED))
  }

  static clearTemplate() {
    this.currentTemplate = -1
    this.setState(ProcessState.EMPTY)
    this.chartData = []
  }
}