import {Chart} from "chart.js";

export enum ProcessState {
    EMPTY,
    SET,
    RUNNING,
    STOPPING,
    STOPPED
}

type ChartEntry = {
    time: number
    temp: number
}

export class ProcessController {
    static currentTemplate: number = -1
    static currentState: ProcessState = ProcessState.EMPTY

    static chart: Chart | null = null
    static chartData: ChartEntry[] = []
    static updateIntervalID: number | null = null

    static init() {
        const loadHistory = () => {
            fetch("/temp_history.txt", {
                method: "GET",
                headers: {"Accept": "text/plain"}
            })
              .then(response => response.text())
              .then(history => {
                  for (let line of history.split("\n")) {
                      const [time, step, temp] = line.split(" ").map(value => parseFloat(value))
                      this.chartData.push({ time: time, temp: temp })
                      this.updateChart()
                  }
              })
        }

        const loadCurrentWork = () => {
            fetch("/get_template_index", {
                method: "GET",
                headers: {"Accept": "text/plain"}
            })
              .then(response => response.text())
              .then(template => {
                  this.currentTemplate = parseInt(template)
                  this.currentState = ProcessState.RUNNING

                  loadHistory()
                  this.runUpdating()
              })
        }

        fetch("/work_status", {
            method: "GET",
            headers: {"Accept": "text/plain"}
        })
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
        this.currentTemplate = id;
        this.currentState = ProcessState.SET

        fetch("/set_template?" + new URLSearchParams({ index: id.toString() }), { method: "POST" }).then()
    }

    static runTemplate() {
        this.currentState = ProcessState.RUNNING

        fetch("/start_work", { method: "POST" })
          .then(this.runUpdating)
    }

    static runUpdating() {
        ProcessController.updateIntervalID = setInterval(() => {
            fetch("/get_temp", { method: "GET" })
              .then(response => response.text())
              .then(data => {
                  const [time, temp] = data.split(" ").map(value => parseFloat(value))
                  ProcessController.chartData.push({ time: time, temp: temp })
                  ProcessController.updateChart()
              })
        }, 30000)
    }

    static updateChart() {
        if (this.chart !== null) {
            this.chart.data.labels = this.chartData.map(entry => entry.time)
            this.chart.data.datasets[0].data = this.chartData.map(entry => entry.temp)
            this.chart.update("none")
        }
    }

    static stopTemplate(callback: { onComplete: any }) {
        this.currentState = ProcessState.STOPPING
        if (this.updateIntervalID !== null)
            clearInterval(this.updateIntervalID)

        fetch("/stop_work", { method: "POST" })
            .then(response => (this.currentState = ProcessState.STOPPED))
          .finally(() => {
              this.currentState = ProcessState.STOPPED
              callback.onComplete()
          })
    }

    static clearTemplate() {
        this.currentTemplate = -1
        this.currentState = ProcessState.EMPTY
        this.chartData = []
    }
}