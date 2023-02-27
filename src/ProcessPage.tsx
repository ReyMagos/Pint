import {useEffect, useState} from "preact/hooks";
import {Chart} from "chart.js";
import {TemplatesPage} from "./TemplatesPage";
import {RouterContext} from "./app";
import {ProcessController, ProcessState} from "./ProcessController";

function useForceUpdate() {
  const [i, set] = useState(0)
  return () => set(i => i + 1)
}

export const ProcessPage = () => {
  const updatePage = useForceUpdate()

  // useEffect(() => {
  //   const ctx = document.querySelector("#process-page .graph") as HTMLCanvasElement
  //
  //   new Chart(ctx, {
  //     type: "line",
  //     data: {
  //       labels: [1, 2, 3, 4, 5, 6],
  //       datasets: [
  //         {
  //           label: "Real",
  //           data: [13, 18, 3, 6, 1],
  //           borderWidth: 2,
  //           borderColor: "#e15858",
  //           backgroundColor: "#e15858",
  //           cubicInterpolationMode: "monotone"
  //         },
  //         {
  //           label: "Template",
  //           data: [12, 19, 3, 5, 2, 3],
  //           borderWidth: 1,
  //           borderColor: "#4ecc00",
  //           backgroundColor: "#4ecc00",
  //         }
  //       ]
  //     },
  //     options: {
  //       scales: {
  //         x: {
  //           title: {
  //             display: true,
  //             text: "Time"
  //           }
  //         },
  //         y: {
  //           title: {
  //             display: true,
  //             text: "Temp"
  //           }
  //         }
  //       }
  //     }
  //   });
  // })

  let control;
  switch (ProcessController.currentState) {
    case ProcessState.EMPTY:
      control = (
        <div class="control">
          <p>No processes launched</p>
          <RouterContext.Consumer>
            {selectPage => <button onClick={() => selectPage(<TemplatesPage />)}>Go to templates</button>}
          </RouterContext.Consumer>
        </div>
      )
      break
    case ProcessState.SET:
      control = (
        <div class="control">
          <p>Template set</p>
          <button onClick={() => {
            ProcessController.runTemplate()
            updatePage()
          }}>Run</button>
        </div>
      )
      break
    case ProcessState.RUNNING:
      control = (
        <div class="control">
          <p>Process running...</p>
          <button class="red-button" onClick={() => {
            ProcessController.stopTemplate({ onComplete: updatePage })
            updatePage()
          }}>Stop</button>
        </div>
      )
      break
    case ProcessState.STOPPING:
      control = (
        <div class="control">
          <p>Stopping process...</p>
          <button disabled>Stop</button>
        </div>
      )
      break
    case ProcessState.STOPPED:
      control = (
        <div class="control">
          <p>Process stopped</p>
          <button onClick={() => {
            ProcessController.runTemplate()
            updatePage()
          }}>Rerun</button>
        </div>
      )
  }

  return (
    <div id="process-page">
      <h2>Template: {ProcessController.currentTemplate == -1 ? "Not set" :
        ProcessController.currentTemplate}</h2>
      {control}
      {/*<canvas class="graph"></canvas>*/}
    </div>
  )
}
