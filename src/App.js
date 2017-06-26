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
      // greenSound: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
      // redSound: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
      // yellowSound: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
      // blueSound: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
      greenFreq: 329.628,
      redFreq: 220,
      yellowFreq: 277.183,
      blueFreq: 164.814,
      audioContext: new AudioContext(),
      oscillator: null,
      padSequence: [],
      playerGuesses: []
    }
    this.buttonPress = this.buttonPress.bind(this);
  } // end constructor

  buttonPress(buttonColor, buttonSound) {

    const buttonStatus = this.state[buttonColor]
    // const buttonAudio = new Audio(this.state[buttonSound])

    // console.log(buttonAudio)

    return this.setState({
      [buttonColor]: buttonStatus === "inactive" ? "active" : "inactive"
    })
    // buttonAudio.play()
  }

  playSound(freq) {
    let audioContext = this.state.audioContext
    let oscillator = this.state.oscillator

    oscillator = audioContext.createOscillator()
    oscillator.type = 'square'
    oscillator.connect(audioContext.destination)
    oscillator.frequency.value = freq
    oscillator.start()

    return this.setState({
      oscillator: oscillator,
    })

    // return console.log(freq)
  }

  stopSound() {
    let audioContext = this.state.audioContext
    let oscillator = this.state.oscillator

    console.log(oscillator)

    oscillator.stop()
    oscillator.disconnect(audioContext.destination);

    return this.setState({
      oscillator: null,
    })

  }

  activateButtons() {

  }

  render() {
    return (
      <div className="pads">
        <div className={`pad green ${this.state.green}`} onMouseDown={() => {this.buttonPress("green"); this.playSound(this.state.greenFreq)}} onMouseUp={() => {this.buttonPress("green"); this.stopSound()}}></div>
        <div className={`pad red ${this.state.red}`} onMouseDown={() => {this.buttonPress("red"); this.playSound(this.state.redFreq)}} onMouseUp={() => {this.buttonPress("red"); this.stopSound()}}></div>
        <div className={`pad yellow ${this.state.yellow}`} onMouseDown={() => {this.buttonPress("yellow"); this.playSound(this.state.yellowFreq)}} onMouseUp={() => {this.buttonPress("yellow"); this.stopSound()}}></div>
        <div className={`pad blue ${this.state.blue}`} onMouseDown={() => {this.buttonPress("blue"); this.playSound(this.state.blueFreq)}} onMouseUp={() => {this.buttonPress("blue"); this.stopSound()}}></div>
      </div> // end pads
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
