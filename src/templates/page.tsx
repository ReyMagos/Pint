import {useState} from "preact/hooks";
import {TemplateData, TemplatesProvider} from "./provider";
import {RouterContext} from "../app";
import {ProcessPage} from "src/process/page";
import {ProcessController, ProcessState} from "src/process/controller";
import {JSX} from "preact";

export const TemplatesPage = () => {
  const isProcessLaunched = ProcessController.currentState == ProcessState.RUNNING
  const [updateState, setUpdate] = useState({ i: 0, template: -1 })

  let page;
  if (TemplatesProvider.templateJson === null)
    page = <h2>Templates loading failed</h2>
  else if (TemplatesProvider.templateJson.length === 0)
    page = [
      <h2>No templates exist</h2>,
      <div className="control">
        <button disabled={isProcessLaunched}
                onClick={() => setUpdate({ i: updateState.i + 1, template: TemplatesProvider.addTemplate() })}>New
        </button>
      </div>,
  ]
  else {
    const templates: JSX.Element[] = []
    for (let id = TemplatesProvider.templateJson.length - 1; id >= 0; --id) {
      templates.push(<Template onDelete={() => setUpdate({ i: updateState.i + 1, template: -1 })}
                               forceEdit={updateState.template === id} id={id} />)
    }

    page = [
      <div className="control">
        <button disabled={isProcessLaunched} onClick={() =>
            setUpdate({ i: updateState.i + 1, template: TemplatesProvider.addTemplate() })
        }>New</button>
      </div>,
      ...templates
    ]
  }

  return (
    <div id="templates-page">
      {isProcessLaunched ? <h2>Templates disabled while process is running</h2> : null}
      {page}
    </div>
  )
}

function readInput(input: Element | null) {
  if (input !== null && input instanceof HTMLInputElement)
    return input.value
  return ""
}

const Template = (props: {id: number, onDelete: () => void, forceEdit: boolean}) => {
  const [isEditing, setEdit] = useState(props.forceEdit)

  let controls
  if (isEditing) {
    controls = (
      <div class="right control">
        <button class="green-button" onClick={() => {
          let newTemplate: TemplateData = {
            name: readInput(document.querySelector(`#name${props.id}`)!),
            steps: []
          }

          const editTable = document.querySelector(`#edit${props.id} table tbody`)
          if (editTable !== null) {
            const steps = editTable.children
            for (let i = 1; i < steps.length; ++i) {

              const header = readInput(steps[i].children[1].children[0]),
                    temp = readInput(steps[i].children[2].children[0]),
                    time = readInput(steps[i].children[3].children[0])

              newTemplate.steps.push({
                header: header,
                temp: parseFloat(temp),
                time: parseFloat(time)
              })
            }

            TemplatesProvider.editTemplate(props.id, newTemplate)
          }

          setEdit(false)
        }}>Save</button>
        <button class="red-button" onClick={() => setEdit(false)}>Cancel</button>
      </div>
    )
  } else {
    const isProcessLaunched = ProcessController.currentState == ProcessState.RUNNING

    controls = (
      <div class="right control">
        <RouterContext.Consumer>
          {selectPage => <button disabled={isProcessLaunched} onClick={() => {
            ProcessController.setTemplate(props.id)
            selectPage(<ProcessPage />)
          }}>Set</button>}
        </RouterContext.Consumer>
        <button disabled={isProcessLaunched} onClick={() => setEdit(true)}>Edit</button>
        <button disabled={isProcessLaunched} onClick={() => {
          TemplatesProvider.deleteTemplate(props.id)
          props.onDelete()
        }} class="red-button">Delete</button>
      </div>
    )
  }

  const name: string = TemplatesProvider.getTemplate(props.id).name

  return (
    <div className="template">
      <div className="head">
        <div className="left">
          {isEditing ? <input class="name" id={"name" + props.id} value={name} /> : <h2>{name}</h2>}
        </div>
        {controls}
      </div>

      {isEditing ? <TemplateEdit id={props.id} /> : null}
    </div>
  )
}


const TemplateEdit = (props: { id: number }) => {
  const [steps, setSteps] = useState(TemplatesProvider.getTemplate(props.id).steps)

  const addStep = () => {
    setSteps([...steps, {header: "Step", temp: 0, time: 0}])
  }

  const editStep = (id: number, key: string, value: string) => {
    const stepsCopy = [...steps]
    stepsCopy[id][key] = value
    setSteps(stepsCopy)
  }

  const removeStep = (id: number) => {
    const stepsCopy = [...steps]
    stepsCopy.splice(id, 1)
    setSteps(stepsCopy)
  }

  let tableRows = steps.map((step: any, i: number) => (
    <tr>
      <td>{i + 1}</td>
      <td><input onInput={event => editStep(i, "header", (event.target as HTMLInputElement).value)} value={step.header} /></td>
      <td><input onInput={event => editStep(i, "temp", (event.target as HTMLInputElement).value)} value={step.temp} /></td>
      <td><input onInput={event => editStep(i, "time", (event.target as HTMLInputElement).value)} value={step.time} /></td>
      <td><button disabled={steps.length === 1} onClick={() => removeStep(i)} class="red-button">−</button></td>
    </tr>
  ))

  return (
    <div class="edit" id={"edit" + props.id}>
      <table>
        <tbody>
          <tr>
            <th>Point</th>
            <th>Name</th>
            <th>Temperature</th>
            <th>Duration</th>
          </tr>
          {tableRows}
        </tbody>
      </table>
      <button onClick={addStep} id="add">+</button>
    </div>
  )
}