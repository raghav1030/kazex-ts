import Market from "./Market"
import Navbar from "./Navbar"
export default function Container() {
  return (
    <main className= "font-Poppins w-full h-full min-h-[100vh] bg-[#0e0f14] overflow-x-hidden" >
    <Navbar />
    < Market />
    </main>
  )
} 
