// this tells the computer i want to use useState hook from react
import {useState} from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Hello Parsa!</h1>
    </div>
  )
}