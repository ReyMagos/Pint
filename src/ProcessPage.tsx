import {useEffect, useState} from "preact/hooks";
import {TemplatesPage} from "./TemplatesPage";
import {RouterContext} from "./app";
import {ProcessController, ProcessState} from "./ProcessController";
import {TemplatesProvider} from "./TemplatesProvider";
import {useRef} from "preact/compat";

function useForceUpdate() {
  const [i, set] = useState(0)
  return () => set(i => i + 1)
}

export const ProcessPage = () => {
  const updatePage = useForceUpdate()

  useEffect(() => {
    ProcessController.onStateChanged = updatePage

    return () => {
      ProcessController.onStateChanged = null
    }
  }, [])

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
          <button onClick={() => ProcessController.runTemplate()}>Run</button>
        </div>
      )
      break
    case ProcessState.RUNNING:
      control = (
        <div class="control">
          <p>Process running...</p>
          <button class="red-button" onClick={() => ProcessController.stopTemplate({ onComplete: updatePage })}>Stop</button>
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
          <button onClick={() => ProcessController.runTemplate()}>Rerun</button>
          <button onClick={() => ProcessController.clearTemplate()}>Clear</button>
        </div>
      )
      break
    case ProcessState.FINISHED:
      control = (
        <div className="control">
          <p>Process finished</p>
          <button onClick={() => ProcessController.runTemplate()}>Rerun</button>
          <button onClick={() => ProcessController.clearTemplate()}>Clear</button>
        </div>
      )
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvasRef.current !== null) {
      const context = canvasRef.current.getContext("2d");
      if (context !== null)
        ProcessController.createChart(context)
    }

    return () => {
      ProcessController.destroyChart()
    }
  }, [])

  const currentTemplate = ProcessController.currentTemplate

  return (
    <div id="process-page">
      <h2>Template: {currentTemplate == -1 ? "Not set" : TemplatesProvider.getTemplate(currentTemplate).name}</h2>
      {control}
      <canvas ref={canvasRef} id="chart"></canvas>
    </div>
  )
}
