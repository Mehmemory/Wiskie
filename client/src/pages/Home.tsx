import { Link } from "react-router-dom";







type HomeProps = {
  hope: string[]
}

function Home({ hope }: HomeProps) {
  return (
    <div>
      <h1>HOME PAGE</h1>
      <p>If you can see this, routing works!</p>
      {
        hope.map((item, index) => (
          <p key={index}>{item}</p>
        ))
      }

      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </div>
  )

}

export default Home