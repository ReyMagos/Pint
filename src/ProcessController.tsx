export enum ProcessState {
    EMPTY,
    SET,
    RUNNING,
    STOPPING,
    STOPPED
}

export class ProcessController {
    static currentTemplate: number = -1
    static currentState: ProcessState = ProcessState.EMPTY

    static setTemplate(id: number) {
        this.currentTemplate = id;
        this.currentState = ProcessState.SET

        fetch("/set_template?" + new URLSearchParams({ index: id.toString() }), { method: "POST" }).then()
    }

    static runTemplate() {
        this.currentState = ProcessState.RUNNING

        fetch("/start_work", { method: "POST" }).then()
    }

    static stopTemplate(callback: { onComplete: any }) {
        this.currentState = ProcessState.STOPPING

        fetch("/stop_work", { method: "POST" })
            .then(response => (this.currentState = ProcessState.STOPPED))
          .finally(() => {
              this.currentState = ProcessState.STOPPED
              callback.onComplete()
          })
    }
}