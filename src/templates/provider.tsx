// import templateJson from "src/templates.json"

export type TemplateStep = {
  header: string,
  temp: number,
  time: number
}

export type TemplateData = {
  name: string,
  steps: TemplateStep[]
}

export class TemplatesProvider {
  static templateJson: TemplateData[] | null = null

  static init() {
    fetch("/templates.json", {method: "GET", headers: {"Accept": "application/json"}})
      .then(response => response.json())
      .then(json => this.templateJson = json)
      .catch(error => console.log("Fetching templates error: ", error))
  }

  static templates() {
    if (this.templateJson === null)
      throw new Error("Template JSON isn't loaded or provider wasn't initialized")
    return this.templateJson
  }

  static getTemplate(id: number)  {
    return this.templates()[id]
  }

  static addTemplate(): number {
    fetch("/edit_template?" + new URLSearchParams({ index: this.templates().length.toString() }))
      .catch(error => console.log("Adding request error: ", error))

    this.templates().push({ name: "Template", steps: [{ header: "Step", temp: 0, time: 0 }] })
    return this.templates().length - 1
  }

  static editTemplate(id: number, newTemplate: any) {
    fetch("/edit_template?" + new URLSearchParams({index: id.toString(), data: JSON.stringify(newTemplate)}), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
    }).catch(error => console.log("Edit request error: ", error))

    this.templates()[id] = newTemplate
  }

  static deleteTemplate(id: number) {
    fetch("/delete_template?" + new URLSearchParams({index: id.toString()}))
        .catch(error => console.log("Delete request error: ", error))

    this.templates().splice(id, 1)
  }
}


