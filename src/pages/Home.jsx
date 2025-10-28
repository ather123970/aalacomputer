import React from 'react'
import Product from './Product'
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
    <Product/>
     <Deal/>
     <About/>
    </>
  )
}

export default Home;
