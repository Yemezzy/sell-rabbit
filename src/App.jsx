import { useState } from 'react'
import './App.css'
import { Startpage } from './pages/Startpage'
import  {Rewrite} from './pages/Rewrite'
import { Rebuild } from './pages/RabbitEthereumWalletConnect'
import Ended from './pages/Ended'

function App() {


  return (
    <>
      {/* <Startpage/> */}
      <Rebuild/>
      {/* <Ended/> */}
      {/* <Rewrite/> */}
    </>
  )
}

export default App
