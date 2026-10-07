
type SchedulesProps = {
  hope: string[]
}


function Schedules({ hope }: SchedulesProps) {
  return (
    <div>
      <h1>Schedules</h1>
      <p>This is the schedules page.</p>
      <ul>
        {hope.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>


)


}

export default Schedules