import {Chart} from "chart.js";
import {TemplatesProvider} from "src/templates/provider";
import {Config} from "src/config";

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
  step: string
  temp: number
}

export class ProcessController {
  static currentTemplate: number = -1
  static currentState: ProcessState = ProcessState.EMPTY
  static onStateChanged: any = null

  static chart: Chart | null = null
  static chartData: ChartEntry[] = []
  static updateIntervalID: ReturnType<typeof setInterval> | null = null

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
            this.chartData.push({
              time: parseInt(data[0]),
              step: data[1],
              temp: parseFloat(data[2])
            })
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
          this.startUpdating()
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
    const datasets: any = []

    if (this.chartData.length > 0) {
      let currentStep = this.chartData[0].step

      datasets.push({
        label: (currentStep === "H" ? "Heat" :
          TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header),
        data: [],
        borderWidth: 2,
        borderColor: (currentStep === 'H' ? "#166a8f" : "#e15858"),
        backgroundColor: (currentStep === 'H' ? "#166a8f" : "#e15858"),
        cubicInterpolationMode: "monotone",
        pointRadius: 0
      })

      for (const entry of this.chartData) {
        datasets[-1].data?.push(entry.temp)

        if (entry.step !== currentStep) {
          currentStep = entry.step

          const ds: Chart.ChartDataSets = {
            label: (currentStep === "H" ? "Heat" :
              TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header),
            data: [entry.temp],
            borderWidth: 2,
            borderColor: (currentStep === 'H' ? "#166a8f" : "#e15858"),
            backgroundColor: (currentStep === 'H' ? "#166a8f" : "#e15858"),
            cubicInterpolationMode: "monotone",
            pointRadius: 0
          }
          datasets.push(ds)
        }
      }
    }

    // fixme: new chart every page creation
    this.chart = new Chart(context, {
      type: "line",
      data: {
        labels: this.chartData.map(entry => entry.time / 60),
        datasets: datasets
      },
      options: {
        scales: {
          x: {title: {display: true, text: "Time"}},
          y: {title: {display: true, text: "Temp"}}
        }
      }
    });
  }

  static destroyChart() {
    this.chart?.destroy()
    this.chart = null
  }

  static updateChart() {
    if (this.chart !== null) {
      this.chart.data.labels = this.chartData.map(entry => entry.time)
      this.chart.data.datasets[0].data = this.chartData.map(entry => entry.temp)
      this.chart.update("none")
    }
  }

  static setTemplate(id: number) {
    fetch("/set_template?" + new URLSearchParams({ index: id.toString() }), { method: "POST" })
      .catch(error => console.log("Setting template error: ", error))

    this.currentTemplate = id
    this.setState(ProcessState.SET)
  }

  static runTemplate() {
    fetch("/start_work", {method: "POST"})
      .then(this.startUpdating)
      .catch(error => console.log("Run template error: ", error))

    console.log(this)
    this.setState(ProcessState.RUNNING)
    this.chartData = []
  }

  static startUpdating() {
    ProcessController.updateIntervalID = setInterval(() => {
      let status
      fetch("/work_status", {method: "GET", headers: {"Accept": "text/plain"}})
        .then(response => response.text())
        .then(work_status => {
          status = (work_status === "true")
          console.log(work_status, status)
        })

      if (status) {
        fetch("/get_temp", {method: "GET", headers: {"Accept": "text/plain"}})
          .then(response => response.text())
          .then(text => {
            const data = text.split(" ")
            ProcessController.chartData.push({
              time: parseInt(data[0]),
              step: data[1],
              temp: parseFloat(data[2])
            })
            ProcessController.updateChart()
          })
      } else {
        ProcessController.setState(ProcessState.FINISHED)
        if (this.updateIntervalID !== null)
          clearInterval(this.updateIntervalID)
      }
    }, Config.timeStep * 1000)
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