import React from 'react'
import Nav from '../nav'
import App from '../App'
import Deal from './Deal'
import Trustcard from '../trustcard'
import About from '../About'
import VideoShowcase from '../components/VideoShowcase'
import Footer from './footer'

const Home = () => {
  return (
    <>
      <Nav/>
      <App/>
      <Trustcard/>
      <VideoShowcase/>
      <Deal/>
      <About/>
      <Footer/>
    </>
  )
}

export default Home;
