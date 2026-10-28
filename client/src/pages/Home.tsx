import { Link } from "react-router-dom";
import axios from "axios";



  



type HomeProps = {
  hope: string[]
}

async function handleClick(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const number = Number(data.get("number"));

  console.log("Sending number to server:", number);
   const response = await axios.post<{ number: number}>(
  "http://localhost:8080/api/incriment", { number })
  
  console.log("Received response from server:", response.data.number);
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

      <form onSubmit={handleClick}>
        <label> number: <input type="number" name="number" /> </label>
        <button type="submit">Click me</button>
      </form>

      <Link to="/">Go to Home</Link>
      <Link to="/base">Go to Base</Link>
      <Link to="/schedules">Go to Schedules</Link>
      <Link to="/editor">Go to Editor</Link>
    </div>
  )

}

export default Home