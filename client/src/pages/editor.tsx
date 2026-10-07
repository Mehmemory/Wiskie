import { Link } from "react-router-dom";

function Editor() {
  return (
    <div>
      <h1>Editor</h1>
      <p>This is the editor page.</p>

      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </div>
  )
}

export default Editor