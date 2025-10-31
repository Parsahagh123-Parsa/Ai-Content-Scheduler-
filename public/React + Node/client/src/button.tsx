// this function creates a reusable Button component
// it takes two instructions: 'text' (what to show) and 'onClick' (what to do when clicked)
function Button({text, onClick}: {text: string, onClick: () => void}) {
  return (
    // this creates an HTML button that does something when clicked
    <button onClick={onClick}>
      {/* this shows whatever text was passed in */}
      {text}
    </button>
  )
}

// this makes the Button component available for other files to use
export default Button