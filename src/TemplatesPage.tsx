import templatesJson from "./templates.json"
import {useState} from "preact/hooks";
import {TemplatesProvider} from "./TemplatesProvider";

export const TemplatesPage = () => {
  return (
    <div id="templates-page">
      <div class="control">
        <button>New</button>
      </div>
      {templatesJson.map((template, i) => <Template id={i} />)}
    </div>
  )
}

const Template = (props: {id: number}) => {
  const [isEditing, toggleEdit] = useState(false)

  let controls;
  if (isEditing) {
    controls = (
      <div class="right controls">
        <button class="green-button" onClick={() => {

          // TODO: type
          let newTemplate: any = {name: "just name", steps: []}

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

            TemplatesProvider.setTemplate(props.id, newTemplate)
          }

          toggleEdit(false)
        }}>Save</button>
        <button class="red-button" onClick={() => toggleEdit(false)}>Cancel</button>
      </div>
    )
  } else {
    controls = (
      <div class="right control">
        <button>Run</button>
        <button onClick={() => toggleEdit(true)}>Edit</button>
        <button onClick={() => {
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
          {isEditing ? <input value={name} /> : <h2>{name}</h2>}
          <p>Description</p>
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
    let newSteps = [];
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