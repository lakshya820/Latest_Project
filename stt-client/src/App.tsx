import React, { useState } from 'react';
import AudioToText from "./Components/AudioToText";
import Container from "react-bootstrap/Container";
import Video from "./Components/Video";
import Login from './Components/Login';
import Dashboard from "./Components/Dashboard";
import Text from './Components/Text';
import MainLayout from './Components/MainLayout';
import Dashboard2 from './Components/Dashboard2';

function App() {

  const [showLogin, setShowLogin] = useState(true);
  const [currentComponent, setCurrentComponent] = useState(1);
  //const [showAudioToText, setShowAudioToText] = useState(false);
  //const [nextClicked, setNextClicked] = useState(false);

  /*const nextPage = () => {
    setShowLogin(!showLogin);
    //setShowAudioToText(true);
    //setNextClicked(true);
  }*/

  const renderNextComponent = () => {
    setCurrentComponent(currentComponent + 1);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 1:
        return <Login onNext={renderNextComponent} />;
      case 2:
       return <Dashboard2/>;
      case 3:
        return <AudioToText onNext={renderNextComponent} />;
      case 4:
        return <Text onNext={renderNextComponent}/>;
      case 5:
        return <Dashboard  />;
      default:
        return null;
    }
  };

  return (
    <Container className="py-5 text-center">
       {renderComponent()}
    </Container>
  );
}

export default App;
