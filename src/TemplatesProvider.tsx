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

  static setTemplate(id: number, newTemplate: any) {
    this.templateJson[id] = newTemplate

    // fetch("/set_template", {
    //   method: "POST",
    //   headers: {"Content-Type": "application/json"},
    //   body: JSON.stringify(newTemplate)
    // }).then(response => console.log(response))
  }
}


