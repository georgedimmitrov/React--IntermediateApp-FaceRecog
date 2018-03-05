import React, { Component } from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

import Navigation from './components/navigation/Navigation';
import Signin from './components/signin/Signin';
import Register from './components/register/Register';
import FaceRecognition from './components/facerecognition/FaceRecognition';
import ImageLinkForm from './components/imagelinkform/ImageLinkForm';
import Logo from './components/logo/Logo';
import Rank from './components/rank/Rank';
import './App.css';
import { CLARIFAI_APIKEY } from './config/keys';

const app = new Clarifai.App({
  apiKey: CLARIFAI_APIKEY
 });

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

class App extends Component {
  state = {
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

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
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
      this.setState({ isSignedIn: false });
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

    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input
      )
      .then((response) => {
        this.displayFaceBox(this.calculateFaceLocation(response));
        // if (response) {
        //   fetch('http://localhost:3000/image', {
        //     method: 'put',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify({
        //       id: this.state.user.id
        //     })
        //   })
        //   .then(response => response.json())
        //   .then(count => {
        //     this.setState(Object.assign(this.state.user, { entries: count}))
        //   })
        //   .catch(e => console.log(e));

        // }
        // this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
        {
          this.state.route === 'home'
            ? <div>
                <Logo />
                <Rank />
                <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
                <FaceRecognition box={box} imageUrl={imageUrl} />
              </div>
            : (
                this.state.route === 'signin'
                ? <Signin onRouteChange={this.onRouteChange} />
                : <Register onRouteChange={this.onRouteChange} />
              )
        }
      </div>
    );

    // return (
    //   <div className="App">
    //      <Particles className='particles'
    //       params={particlesOptions}
    //     />
    //     <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
    //     { route === 'home'
    //       ? <div>
    //           <Logo />
    //           <Rank
    //             name={this.state.user.name}
    //             entries={this.state.user.entries}
    //           />
    //           <ImageLinkForm
    //             onInputChange={this.onInputChange}
    //             onButtonSubmit={this.onButtonSubmit}
    //           />
    //           <FaceRecognition box={box} imageUrl={imageUrl} />
    //         </div>
    //       : (
    //          route === 'signin'
    //          ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
    //          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
    //         )
    //     }
    //   </div>
    // );
  }
}

export default App;