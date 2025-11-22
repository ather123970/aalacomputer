import React from 'react'
import Nav from '../nav'
import App from '../App'
import Featurepr from './featurepr'
import Deal from './Deal'
import Trustcard from '../trustcard'
import Cart from '../cart'
import About from '../About'
import VideoShowcase from '../components/VideoShowcase'

const Home = () => {
  return (
    <>
      <Nav/>
      <App/>
      <Trustcard/>
      <Featurepr/>
      <VideoShowcase/>
      <Deal/>
      <About/>
    </>
  )
}

export default Home;
