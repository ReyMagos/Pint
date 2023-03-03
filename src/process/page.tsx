import {useEffect, useState, useRef} from "preact/hooks";
import {TemplatesPage} from "src/templates/page";
import {RouterContext} from "src/app";
import {ProcessController, ProcessState} from "./controller";
import {TemplatesProvider} from "src/templates/provider";
import {JSX} from "preact";

function useForceUpdate() {
  const [i, set] = useState(0)
  return () => set(i => i + 1)
}

export const ProcessPage = () => {
  const updatePage = useForceUpdate()

  let control: JSX.Element[]
  switch (ProcessController.currentState) {
    case ProcessState.EMPTY:
      control = [
        <p>No processes launched</p>,
        <RouterContext.Consumer>
          {selectPage => <button onClick={() => selectPage(<TemplatesPage />)}>Go to templates</button>}
        </RouterContext.Consumer>
      ]
      break
    case ProcessState.SET:
      control = [
        <p>Template set</p>,
        <button onClick={() => ProcessController.runTemplate()}>Run</button>
      ]
      break
    case ProcessState.RUNNING:
      control = [
        <p>Process running...</p>,
        <button className="red-button" onClick={() => ProcessController.stopTemplate()}>Stop</button>
      ]
      break
    case ProcessState.STOPPING:
      control = [
        <p>Stopping process...</p>,
        <button disabled>Stop</button>
      ]
      break
    case ProcessState.STOPPED:
      control = [
        <p>Process stopped</p>,
        <button onClick={() => ProcessController.runTemplate()}>Rerun</button>,
        <button onClick={() => ProcessController.clearTemplate()}>Clear</button>
      ]
      break
    case ProcessState.FINISHED:
      control = [
        <p>Process finished</p>,
        <button onClick={() => ProcessController.runTemplate()}>Rerun</button>,
        <button onClick={() => ProcessController.clearTemplate()}>Clear</button>
      ]
  }

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    ProcessController.onStateChanged = updatePage

    if (canvasRef.current !== null) {
      const context = canvasRef.current.getContext("2d");
      if (context !== null)
        ProcessController.createChart(context)
    }

    return () => {
      ProcessController.onStateChanged = null
      ProcessController.destroyChart()
    }
  }, [])

  const currentTemplate = ProcessController.currentTemplate

  return (
    <div id="process-page">
      <h2>Template: {currentTemplate == -1 ? "Not set" : TemplatesProvider.getTemplate(currentTemplate).name}</h2>
      <div class="control">
        {control}
      </div>
      <canvas ref={canvasRef} id="chart"></canvas>
    </div>
  )
}
