import React from 'react'
import Nav from '../nav'
import App from '../App'
import Deal from './Deal'
import Trustcard from '../trustcard'
import About from '../About'
import VideoShowcase from '../components/VideoShowcase'

const Home = () => {
  return (
    <>
      <Nav/>
      <App/>
      <Trustcard/>
      <VideoShowcase/>
      <Deal/>
      <About/>
    </>
  )
}

export default Home;
