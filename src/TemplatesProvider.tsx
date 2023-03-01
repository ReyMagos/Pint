import templateJson from "./templates.json"

export class TemplatesProvider {
  static templateJson: any = templateJson

  static init() {
    fetch("/templates.json", {
      method: "GET",
      headers: {"Accept": "application/json"}
    }).then(response => response.json())
      .then(json => this.templateJson = json)
  }

  static getTemplate(id: number)  {
    return this.templateJson[id]
  }

  static addTemplate() {

  }

  static editTemplate(id: number, newTemplate: any) {
    this.templateJson[id] = newTemplate

    fetch("/edit_template?" + new URLSearchParams({ index: id.toString(), data: JSON.stringify(newTemplate) }), {
      method: "POST",
      headers: {"Content-Type": "application/json"},
    }).then(response => console.log(response))
  }

  static deleteTemplate(id: number) {

  }
}


