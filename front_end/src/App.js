import React, { useState, useEffect } from 'react'; // Importing React and hooks

function App() {
  // useState hook to store backend data
  const [data, setData] = useState([{}])
  
  // useEffect hook to fetch backend data when the component mounts
  useEffect(() => {
    fetch("/members") // Fetch data from the backend endpoint '/members'
      .then( 
        res => res.json() // Parse the response as JSON
      ).then(
        data => {
          setData(data) // Update the state with the fetched data
          console.log(data) // Log the fetched data to the console
        }
      )
    }, []) // Empty dependency array means this effect runs once when the component mounts

  return (
    <div>
    </div>
  )
}

export default App; // Export the App component as the default export
