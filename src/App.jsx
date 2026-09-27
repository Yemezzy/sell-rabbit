import { useState } from 'react'
import './App.css'
import { Startpage } from './pages/Startpage'
import  {Rewrite} from './pages/Rewrite'
import { Rebuild } from './pages/RabbitEthereumWalletConnect'

function App() {


  return (
    <>
      {/* <Startpage/> */}
      <Rebuild/>
      {/* <Rewrite/> */}
    </>
  )
}

export default App
