import React from 'react';
import './App.css';

class Simon extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      green: {
        status: "inactive",
        freq: 329.628,
      },
      red: {
        status: "inactive",
        freq: 220,
      },
      yellow: {
        status: "inactive",
        freq: 277.183,
      },
      blue: {
        status: "inactive",
        freq: 164.814,
      },
      audioContext: new AudioContext(),
      oscillator: null,
      padSequence: [],
      playerGuesses: [],
      difficulty: 1,
      lengthOfSequence: 8,
      gameOn: false,
      padDisplayLength: 420, // length of pad sound/light during playback in ms
      turns: 0, // how many turns played, starting from 0 index
    }
    this.padPress = this.padPress.bind(this)
    this.setSequences = this.setSequences.bind(this)
  } // end constructor

  padPress(padColor) {
    if (this.state.gameOn) {
      const padObj = this.state[padColor]
      const padStatus = padObj.status
      const padFreq = padObj.freq

      // return the whole object with all key value pairs -- necessary to prevent errors with the playSound function
      return this.setState({
        [padColor]: {
          status: padStatus  === "inactive" ? "active" : "inactive",
          freq: padFreq
        }
      })
    } else {
      return
    }
  } // end padPress

  playSound(freq) {
    if (this.state.gameOn) {
      let audioContext = this.state.audioContext
      let oscillator = this.state.oscillator

      oscillator = audioContext.createOscillator()
      oscillator.type = 'square'
      oscillator.connect(audioContext.destination)
      oscillator.frequency.value = freq
      oscillator.start()

      return this.setState({ // works with setState, but might cause errors
        oscillator: oscillator,
      })
      // this.state.oscillator = oscillator // not the preferred method, but works
    } else {
      return
    }
  } // end playSound

  stopSound() {
    if (this.state.gameOn) {
      let audioContext = this.state.audioContext
      let oscillator = this.state.oscillator

      oscillator.stop()
      oscillator.disconnect(audioContext.destination);

      return this.setState({
        oscillator: null,
      })
    } else {
      return
    }
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

    // console.log(this.state.padSequence) // to check that padSequence is populated

    return this.setState({
      gameOn: gameOnState === false ? true : false,
      padSequence: [],
      padDisplayLength: 420,
    })
  } // end toggleOnOff

  populatePadSequence() {
    const newGame = this.state.padSequence
    if (newGame.length === 0) {
      const lengthOfSequence = this.state.lengthOfSequence
      const pads = ["green", "red", "yellow", "blue"]
      let tempSequence = []
      let count = lengthOfSequence

      while (count > 0) {
        let randomIndex = Math.floor(Math.random() * (pads.length - 0)) + 0

        tempSequence.push(pads[randomIndex])
        count--
      }

      return this.setState({
        padSequence: tempSequence
      })
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  playPadSequence() {
    const playbackLength = this.state.padDisplayLength
    const padSequence = this.state.padSequence
    const playbackIndexes = padSequence.reduce((acc, color, index) => {
      if (index <= this.state.turns) {
        acc.push(index)
      }
      return acc
    }, [])

    const sing = async () => {
      for (let i = 0; i < playbackIndexes.length; i++) {
        const padFreq = this.state[padSequence[i]].freq
        console.log(padFreq)
        this.playSound(padFreq)
        this.padPress(padSequence[i])
        await this.sleep(playbackLength)
        this.padPress(padSequence[i])
        this.stopSound()
        await this.sleep(playbackLength)
      } // end for loop
    } // end sing

    sing()

  } // end playPadSequence

  // componentWillUpdate(nextProps, nextState) {
  //   const gameWillTurnOn = nextState.gameOn
  //   const newGame = nextState.padSequence // to only run populatePadSequence when the game is switched from off to on
  //
  //   if (gameWillTurnOn && newGame.length === 0) { // game on from off state
  //     // this.populatePadSequence()
  //   }
  //
  // } // end componentWillUpdate

  componentDidUpdate(prevProps, prevState) {
    const gameTurnedOn = this.state.gameOn
    const gameReady = this.state.padSequence // to only run populatePadSequence when the game is switched from off to on
    const lastPadSequence = prevState.padSequence // should be empty arr to use as check below
    const thisPadSequence = this.state.padSequence

    if (gameTurnedOn && gameReady.length > 0 && lastPadSequence !== thisPadSequence) { // game on from off state
      // console.log(this.state)
      this.playPadSequence()
    }
  } // end componentDidUpdate

  render() {
    return (
      <div className="content">
        <div className="pads">
          <div className={`pad green ${this.state.green.status}`} onMouseDown={() => {this.padPress("green"); this.playSound(this.state.green.freq)}} onMouseUp={() => {this.padPress("green"); this.stopSound()}}></div>
          <div className={`pad red ${this.state.red.status}`} onMouseDown={() => {this.padPress("red"); this.playSound(this.state.red.freq)}} onMouseUp={() => {this.padPress("red"); this.stopSound()}}></div>
          <div className={`pad yellow ${this.state.yellow.status}`} onMouseDown={() => {this.padPress("yellow"); this.playSound(this.state.yellow.freq)}} onMouseUp={() => {this.padPress("yellow"); this.stopSound()}}></div>
          <div className={`pad blue ${this.state.blue.status}`} onMouseDown={() => {this.padPress("blue"); this.playSound(this.state.blue.freq)}} onMouseUp={() => {this.padPress("blue"); this.stopSound()}}></div>
        </div>
        {/* end pads */}
        <div className="controls">
          <button type="button" value="start" className="start-button" onClick={() => {this.toggleOnOff(); this.populatePadSequence()}}>Start</button>
        </div>
        {/* end controls */}
      </div> // end content
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
