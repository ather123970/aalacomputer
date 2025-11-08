import React from 'react'
import FeaturedPrebuilds from './FeaturedPrebuilds'
import Nav from '../nav'
import App from '../App'
import Featurepr from './featurepr'
import Deal from './Deal'
import Trustcard from '../trustcard'
import Cart from '../cart'
import About from '../About'

const Home = () => {
  return (
    <>
      <Nav/>
      <App/>
      <Trustcard/>
      <Featurepr/>
      <FeaturedPrebuilds/>
      <Deal/>
      <About/>
    </>
  )
}

export default Home;
