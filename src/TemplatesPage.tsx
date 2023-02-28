import {useState} from "preact/hooks";
import {TemplatesProvider} from "./TemplatesProvider";
import {RouterContext} from "./app";
import {ProcessPage} from "./ProcessPage";
import {ProcessController, ProcessState} from "./ProcessController";

export const TemplatesPage = () => {
  const isProcessLaunched = ProcessController.currentState == ProcessState.RUNNING

  let templates;
  if (TemplatesProvider.templateJson === null)
    templates = <h2>Templates loading failed</h2>
  else
    templates = [
      <div className="control">
        <button disabled={isProcessLaunched}>New</button>
      </div>,
      ...[...Array(TemplatesProvider.templateJson.length).keys()].map(i => <Template id={i} />)
    ]

  return (
    <div id="templates-page">
      {isProcessLaunched ? <h2>Templates disabled while process is running</h2> : null}
      {templates}
    </div>
  )
}

const Template = (props: {id: number}) => {
  const [isEditing, toggleEdit] = useState(false)

  let controls;
  if (isEditing) {
    controls = (
      <div class="right control">
        <button class="green-button" onClick={() => {

          // TODO: type
          let newTemplate: any = {name: (document.querySelector(`#name${props.id}`) as HTMLInputElement).value,
            steps: []}

          const editTable = document.querySelector(`#edit${props.id} table tbody`)
          if (editTable !== null) {
            const steps = editTable.children
            for (let i = 1; i < steps.length; ++i) {

              // TODO: clean this shit
              const header = (steps[i].children[1].children[0] as HTMLInputElement).value,
                    temp = (steps[i].children[2].children[0] as HTMLInputElement).value,
                    time = (steps[i].children[3].children[0] as HTMLInputElement).value

              newTemplate.steps.push({temp: temp, time: time, header: header})
            }

            TemplatesProvider.editTemplate(props.id, newTemplate)
          }

          toggleEdit(false)
        }}>Save</button>
        <button class="red-button" onClick={() => toggleEdit(false)}>Cancel</button>
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
        <button disabled={isProcessLaunched} onClick={() => toggleEdit(true)}>Edit</button>
        <button disabled={isProcessLaunched} onClick={() => {
          // Delete template
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
    setSteps([...steps, {temp: 0, time: 0, header: ""}])
  }

  const removeStep = (id: number) => {
    let newSteps: any[] = [];
    for (const [i, step] of steps.entries()) {
      if (i != id)
        newSteps.push(step)
    }
    setSteps(newSteps)
  }

  let tableRows = steps.map((step: any, i: number) => (
    <tr>
      <td>{i + 1}</td>
      <td><input value={step.header} /></td>
      <td><input value={step.temp} /></td>
      <td><input value={step.time} /></td>
      <td><button onClick={() => removeStep(i)} class="red-button">−</button></td>
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