import {StateUpdater, useState} from "preact/hooks"
import "./app.less"
import {Fragment} from "preact";
import {ProcessPage} from "./ProcessPage";
import {TemplatesPage} from "./TemplatesPage";

function Router(props: {onSelect: StateUpdater<any>}) {
  return (
    <div id="router">
      <h1>Project Name</h1>
      <a onClick={() => props.onSelect(<ProcessPage />)}>Process</a>
      <a onClick={() => props.onSelect(<TemplatesPage />)}>Templates</a>
    </div>
  )
}

export function App() {
  const [page, setPage] = useState(<ProcessPage />);

  return (
    <Fragment>
      <Router onSelect={setPage} />
      {page}
    </Fragment>
  )
}
