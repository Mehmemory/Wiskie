


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

    </div>
  )

}

export default Home