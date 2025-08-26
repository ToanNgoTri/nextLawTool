"use client"


export default function Btbcheck() {
    return (
<button style={{width:100}} onClick={()=>{
    
    fetch('/api/url').then(res=>res.json()
    .then(res=>console.log(res.data)
    ))
    
}


}>Check</button>    

)
  }
  
