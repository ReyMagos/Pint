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

            if (data.length === 3) {
              this.chartData.push({
                time: parseInt(data[0]),
                step: data[1],
                temp: parseFloat(data[2])
              })
            }
          }
          this.updateChart()
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

    static COLORS = [
      "#4dc9f6", "#f67019", "#53bb90",
      "#296873", "#cfe84c", "#166a8f",
      "#00a950", "#f6be74", "#8549ba"
    ];

  static heatDataset(): Chart.ChartDataSets {
    return {
      label: "Heat",
      data: [],
      borderWidth: 2,
      borderColor: "#e15858",
      backgroundColor: "#e15858",
      borderDash: [6, 6],
      cubicInterpolationMode: "monotone",
      showLine: true,
      pointRadius: 0
    }
  }

  static plateauDataset(name: string, color: string): Chart.ChartDataSets {
    return {
      label: name,
      data: [],
      borderWidth: 2,
      borderColor: color,
      backgroundColor: color,
      cubicInterpolationMode: "monotone",
      showLine: true,
      pointRadius: 0
    }
  }

  static createChart(context: CanvasRenderingContext2D) {
    const datasets: any = []

    if (this.chartData.length > 0) {
      let currentStep = this.chartData[0].step

      datasets.push(currentStep === 'H' ? this.heatDataset() :
        this.plateauDataset(TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header,
        this.COLORS[datasets.length % 9])
      )

      for (const entry of this.chartData) {
        datasets[datasets.length - 1].data?.push({x: entry.time, y: entry.temp})

        if (entry.step !== currentStep) {
          console.log(datasets[datasets.length - 1])

          currentStep = entry.step

          datasets.push(currentStep === 'H' ? this.heatDataset() :
            this.plateauDataset(TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header,
            this.COLORS[datasets.length % 9])
          )

          datasets[datasets.length - 1].data?.push({x: entry.time, y: entry.temp})
        }
      }
    }

    // fixme: new chart every page creation
    this.chart = new Chart(context, {
      type: "scatter",
      data: {
        datasets: datasets
      },
      options: {
        scales: {
          x: {title: {display: true, text: "Time"}, offset: true},
          y: {title: {display: true, text: "Temp"}, offset: true}
        },
        showLine: true
      }
    });
  }

  static destroyChart() {
    this.chart?.destroy()
    this.chart = null
  }

  static updateChart() {
    if (this.chart !== null) {
      const datasets: any = []

      if (this.chartData.length > 0) {
        let currentStep = this.chartData[0].step

        datasets.push(currentStep === 'H' ? this.heatDataset() :
          this.plateauDataset(TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header,
          this.COLORS[datasets.length % 9])
        )

        for (const entry of this.chartData) {
          datasets[datasets.length - 1].data?.push({x: entry.time, y: entry.temp})

          if (entry.step !== currentStep) {
            currentStep = entry.step

            datasets.push(currentStep === 'H' ? this.heatDataset() :
              this.plateauDataset(TemplatesProvider.getTemplate(this.currentTemplate).steps[parseInt(currentStep)].header,
              this.COLORS[datasets.length % 9])
            )

            datasets[datasets.length - 1].data?.push({x: entry.time, y: entry.temp})
          }
        }
      }

      this.chart.data.datasets = datasets
      this.chart.update("none")
    }
  }

  static setTemplate(id: number) {
    fetch("/set_template?" + new URLSearchParams({ index: id.toString() }), { method: "POST" })
      .catch(error => console.log("Setting template error: ", error))

    this.currentTemplate = id
    this.setState(ProcessState.SET)
    this.chartData = []

    let totalTime = 0;
    for (const [i, step] of TemplatesProvider.getTemplate(id).steps.entries()) {
      this.chartData.push({ step: i.toString(), time: totalTime, temp: step.temp })
      totalTime += step.time
      this.chartData.push({ step: i.toString(), time: totalTime, temp: step.temp })
    }

    this.updateChart()
  }

  static runTemplate() {
    fetch("/start_work", {method: "POST"})
      .then(this.startUpdating)
      .catch(error => console.log("Run template error: ", error))

    this.setState(ProcessState.RUNNING)
    this.chartData = []
  }

  static startUpdating() {
    ProcessController.updateIntervalID = setInterval(() => {
      fetch("/get_temp", {method: "GET", headers: {"Accept": "text/plain"}})
        .then(response => response.text())
        .then(text => {
          const data = text.split(" ")

          if (data[1] == 'L') {
            ProcessController.setState(ProcessState.FINISHED)
            if (ProcessController.updateIntervalID !== null)
              clearInterval(ProcessController.updateIntervalID)
          }

          ProcessController.chartData.push({
            time: parseInt(data[0]),
            step: data[1],
            temp: parseFloat(data[2])
          })
          ProcessController.updateChart()
        })
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