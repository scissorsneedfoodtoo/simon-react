import React, { Component } from 'react';
import './App.css';

class Simon extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      green: "inactive",
      red: "inactive",
      yellow: "inactive",
      blue: "inactive",
      padSequence: [],
      playerGuesses: []
    }
    this.buttonPress = this.buttonPress.bind(this);
  } // end constructor

  buttonPress(buttonColor) {

    const buttonStatus = this.state[buttonColor]
    console.log(buttonStatus, buttonColor, this.state)

    this.setState({
      [buttonColor]: buttonStatus === "inactive" ? "active" : "inactive"
    })
  }

  activateButtons() {

  }

  render() {
    return (
      <div className="pads">
        <div className={`pad green ${this.state.green}`} onMouseDown={() => this.buttonPress("green")} onMouseUp={() => this.buttonPress("green")}></div>
        <div className={`pad red ${this.state.red}`} onMouseDown={() => this.buttonPress("red")} onMouseUp={() => this.buttonPress("red")}></div>
        <div className={`pad yellow ${this.state.yellow}`} onMouseDown={() => this.buttonPress("yellow")} onMouseUp={() => this.buttonPress("yellow")}></div>
        <div className={`pad blue ${this.state.blue}`} onMouseDown={() => this.buttonPress("blue")} onMouseUp={() => this.buttonPress("blue")}></div>
      </div> // end pads
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
