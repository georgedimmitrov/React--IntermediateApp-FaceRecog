import React, { Component } from 'react';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';

import Navigation from './components/navigation/Navigation';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import './App.css';
// import { CLARIFAI_APIKEY } from './config/keys';

// const app = new Clarifai.App({
//   apiKey: CLARIFAI_APIKEY
//  });

const particlesOptions = {
  particles: {
    number: {
      value: 20,
      density: {
        enable: true,
        value_area: 1200
      }
    }
  }
};

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  state = initialState;

  loadUser = ({ id, name, email, entries, joined }) => {
    this.setState({
      user: {
        id,
        name,
        email,
        entries,
        joined
      }
    });
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      rightCol: width - (clarifaiFace.right_col * width),
      topRow: clarifaiFace.top_row * height,
      bottomRow: height - (clarifaiFace.bottom_row * height),
    };
  };

  displayFaceBox = (box) => {
    this.setState({ box });
  };

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState);
    } else if (route === 'home') {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route });
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then((response) => response.json())
    .then((response) => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, { entries: count}));
        })
        .catch(console.log);

      }
      this.displayFaceBox(this.calculateFaceLocation(response));
    })
    .catch((err) => console.log(err));
  };

  render() {
    const { isSignedIn, imageUrl, box } = this.state;

    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {
          this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank name={this.state.user.name} entries={this.state.user.entries} />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                <FaceRecognition box={box} imageUrl={imageUrl} />
              </div>
            : (
                this.state.route === 'signin' || this.state.route === 'signout'
                ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
              )
        }
      </div>
    );
  }
}

export default App;
