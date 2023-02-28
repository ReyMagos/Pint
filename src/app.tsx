import {StateUpdater, useState} from "preact/hooks"
import "./app.less"
import {createContext, Fragment} from "preact";
import {ProcessPage} from "./ProcessPage";
import {TemplatesPage} from "./TemplatesPage";
import {ProcessController} from "./ProcessController";


export const RouterContext = createContext((value: any) => {})

function Router(props: {onSelect: StateUpdater<any>}) {
  return (
    <div id="router">
      <h1>Project Name</h1>
      <a onClick={() => props.onSelect(<ProcessPage />)}>Process</a>
      <a onClick={() => props.onSelect(<TemplatesPage />)}>Templates</a>
      <a>Config</a>
    </div>
  )
}

export function App() {
  const [page, setPage] = useState(<ProcessPage />);

  return (
    <RouterContext.Provider value={setPage}>
      <Fragment>
        <Router onSelect={setPage} />
        {page}
      </Fragment>
    </RouterContext.Provider>
  )
}
