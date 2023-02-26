import {useEffect, useState} from "preact/hooks";
import {Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip} from "chart.js";


enum ProcessState {
  EMPTY,
  RUNNING,
  STOPPING,
  STOPPED
}

export const ProcessPage = () => {
  const [processState, setProcessState] = useState(ProcessState.EMPTY)

  useEffect(() => {
    const ctx = document.querySelector("#process-page .graph") as HTMLCanvasElement

    new Chart(ctx, {
      type: "line",
      data: {
        labels: [1, 2, 3, 4, 5, 6],
        datasets: [
          {
            label: "Real",
            data: [13, 18, 3, 6, 1],
            borderWidth: 2,
            borderColor: "#e15858",
            backgroundColor: "#e15858",
            cubicInterpolationMode: "monotone"
          },
          {
            label: "Template",
            data: [12, 19, 3, 5, 2, 3],
            borderWidth: 1,
            borderColor: "#4ecc00",
            backgroundColor: "#4ecc00",
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
  })

  let control;
  switch (processState) {
    case ProcessState.EMPTY:
      control = (
        <div className="control">
          <p>No processes launched</p>
          <button>Go to templates</button>
        </div>
      )
      break
    case ProcessState.RUNNING:
      control = (
        <div className="control">
          <p>Process running...</p>
          <button class="red-button" onClick={() => {
            // Stop request
            setProcessState(ProcessState.STOPPING)
          }}>Stop</button>
        </div>
      )
      break
    case ProcessState.STOPPED:
      control = (
        <div className="control">
          <p>Process stopped</p>
          <button>Rerun</button>
        </div>
      )
  }

  return (
    <div id="process-page">
      {control}
      <canvas class="graph"></canvas>
    </div>
  )
}
