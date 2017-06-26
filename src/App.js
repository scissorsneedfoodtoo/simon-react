import React from 'react';
import './App.css';

class Simon extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      green: {
        id: "green",
        status: "inactive",
        freq: 329.628,
      },
      red: {
        id: "red",
        status: "inactive",
        freq: 220,
      },
      yellow: {
        id: "yellow",
        status: "inactive",
        freq: 277.183,
      },
      blue: {
        id: "blue",
        status: "inactive",
        freq: 164.814,
      },
      audioContext: new AudioContext(),
      oscillator: null,
      padSequence: [],
      playerGuesses: [],
      difficulty: 1,
      numOfSequences: 8,
      gameOn: false,
    }
    this.padPress = this.padPress.bind(this)
    this.setSequences = this.setSequences.bind(this)
  } // end constructor

  padPress(padObj) {
    const padKey = padObj.id // makes returning the object in setState much easier
    const padStatus = padObj.status
    const padFreq = padObj.freq

    // return the whole object with all key value pairs -- necessary to prevent errors with the playSound function
    return this.setState({
      [padKey]: {
        status: padStatus  === "inactive" ? "active" : "inactive",
        id: padObj.id,
        freq: padFreq
      }
    })
  } // end padPress

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
  } // end playSound

  stopSound() {
    let audioContext = this.state.audioContext
    let oscillator = this.state.oscillator

    oscillator.stop()
    oscillator.disconnect(audioContext.destination);

    return this.setState({
      oscillator: null,
    })
  } // end stopSound

  setSequences(difficulty) {
    if (difficulty === 1) {
      return 8
    } else if (difficulty === 2) {
      return 14
    } else if (difficulty === 3) {
      return 20
    } else if (difficulty === 4) {
      return 31
    }
  } // end setSequences

  toggleOnOff() {
    const gameOnState = this.state.gameOn

    return this.setState({
      gameOn: gameOnState === false ? true : false,
    })
  } // end toggleOnOff

  // populatePadSequence() {
  //   const numOfSequences = this.state.numOfSequences
  //   const pads = this.state.pads
  //
  //
  // }

  componentWillUpdate(nextProps, nextState) {
    const gameWillTurnOn = nextState.gameOn

    if (gameWillTurnOn) {
      this.populatePadSequence()
    }
  } // end componentWillUpdate

  render() {
    return (
      <div className="content">
        <div className="pads">
          <div className={`pad green ${this.state.green.status}`} onMouseDown={() => {this.padPress(this.state.green); this.playSound(this.state.green.freq)}} onMouseUp={() => {this.padPress(this.state.green); this.stopSound()}}></div>
          <div className={`pad red ${this.state.red.status}`} onMouseDown={() => {this.padPress(this.state.red); this.playSound(this.state.red.freq)}} onMouseUp={() => {this.padPress(this.state.red); this.stopSound()}}></div>
          <div className={`pad yellow ${this.state.yellow.status}`} onMouseDown={() => {this.padPress(this.state.yellow); this.playSound(this.state.yellow.freq)}} onMouseUp={() => {this.padPress(this.state.yellow); this.stopSound()}}></div>
          <div className={`pad blue ${this.state.blue.status}`} onMouseDown={() => {this.padPress(this.state.blue); this.playSound(this.state.blue.freq)}} onMouseUp={() => {this.padPress(this.state.blue); this.stopSound()}}></div>
        </div>
        {/* end pads */}
        <div className="controls">
          <button type="button" value="start" className="start-button" onClick={() => this.toggleOnOff()}>Start</button>
        </div>
        {/* end controls */}
      </div> // end content
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
