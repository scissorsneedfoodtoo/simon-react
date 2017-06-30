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
      razzFreq: 42,
      audioContext: new AudioContext(),
      oscillator: null,
      padSequence: [],
      playerGuesses: [],
      checkIndex: 0,
      difficulty: 1,
      lengthOfSequence: 8,
      gameOn: false,
      padDisplayLength: 420, // length of pad sound/light during playback in ms, originally 420
      round: 1, // how many rounds played, starting from 0 index
      disabled: false,
    }
    this.togglePad = this.togglePad.bind(this)
    this.setSequences = this.setSequences.bind(this)
    this.handlePlayerGuesses = this.handlePlayerGuesses.bind(this)
  } // end constructor

  togglePad(padColor) {
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
  } // end togglePad

  playSound(freq, mistake) {
    if (this.state.gameOn) {
      let audioContext = this.state.audioContext
      let oscillator = this.state.oscillator
      let volume = audioContext.createGain()
      volume.connect(audioContext.destination)
      volume.gain.value = .06

      oscillator = audioContext.createOscillator()
      oscillator.type = 'square'
      // oscillator.connect(audioContext.destination)
      oscillator.connect(volume)

      oscillator.frequency.value = freq
      oscillator.start()

      return this.setState({
        oscillator: oscillator,
      })
    } else if(mistake === "error") {
      return
    }
  } // end playSound

  stopSound() {
    if (this.state.gameOn) {
      let oscillator = this.state.oscillator
      let audioContext = this.state.audioContext

      if (!oscillator) { // if oscillator is null -- this is to prevent possible errors if pads are pressed too quickly
        oscillator = audioContext.createOscillator()
        oscillator.start()
      }

      oscillator.stop()
      oscillator.disconnect();

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

    return this.setState({
      gameOn: gameOnState === false ? true : false,
      padSequence: [],
      playerGuesses: [],
      padDisplayLength: 420,
      checkIndex: 0,
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
  } // end populatePadSequence

  // speedUp(nextTurn) {
  //   console.log(nextTurn)
  // }

  pause(ms) { // original -- now messing with a cancelablePause
    return new Promise(resolve => setTimeout(resolve, ms));
  } // end pause

  // to prevent player from pressing start button while playPadSequence is running, causing errors
  disableButtonsToggle() {
    return this.setState({
      disabled: this.state.disabled === false ? true : false
    })
  } // end disableButtonsToggle

  // to prevent player from pressing pads while playPadSequence is running, causing errors
  disablePadsToggle(status) {
    if (status) { // if this.state.disabled is true
      return "disabled"
    } else {
      return "enabled"
    }
  } // end disablePadsToggle

  playPadSequence() {
    const padDisplayLength = this.state.padDisplayLength
    const padSequence = this.state.padSequence
    const playbackIndexes = padSequence.reduce((acc, color, index) => {
      if (index <= this.state.round) {
        acc.push(index)
      }
      return acc
    }, [])

    const sing = async () => {
      this.disableButtonsToggle()
      for (let i = 0; i < playbackIndexes.length; i++) {
        const padFreq = this.state[padSequence[i]].freq
        // console.log(padFreq)
        this.playSound(padFreq)
        this.togglePad(padSequence[i])
        await this.pause(padDisplayLength)
        this.togglePad(padSequence[i])
        this.stopSound()
        await this.pause(padDisplayLength)
      } // end for loop
      this.disableButtonsToggle()
    } // end sing

    // prevent start button from being pressed during sequence

    return sing()
    // this.disableButtonsToggle()
  } // end playPadSequence

  handlePlayerGuesses(guessedColor) {
    const colorObj = this.state[guessedColor]
    const correctSequence = this.state.padSequence
    let playerGuesses = this.state.playerGuesses // needed to lift the state up in this case to prevent the array from being written over each time this function is called
    let checkIndex = this.state.checkIndex
    let currentRound = this.state.round

    playerGuesses.push(guessedColor)

    //NEED TO FIGURE OUT END GAME CONDITIONS USING lengthOfSequence
    // if guess matches the sequence played and is the end of the sequence / round -- needs to be first so we can handle state appropriately
    if (playerGuesses[checkIndex] === correctSequence[checkIndex] && checkIndex === currentRound) {
      console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      this.playSound(colorObj.freq)
      return this.setState({
        checkIndex: 0,
        round: currentRound += 1,
        playerGuesses: [],
      })
    } else if (playerGuesses[checkIndex] === correctSequence[checkIndex]) { // if guess matches the sequence played, but not the end of the sequence played
      console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      this.playSound(colorObj.freq)
      return this.setState({
        checkIndex: checkIndex += 1,
      })
    } else if (playerGuesses[checkIndex] !== correctSequence[checkIndex]) {
      console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      this.playRazzSound(guessedColor)
      // this.playPadSequence()
      return this.setState({
        checkIndex: 0,
        playerGuesses: [],
      })
    }
  }

  playRazzSound(colorForToggle) {
    const razzFreq = this.state.razzFreq
    const razzLength = 1500

    const razzSound = async () => {
      this.disableButtonsToggle()
      this.playSound(razzFreq)
      await this.pause(razzLength)
      this.stopSound()
      this.disableButtonsToggle()
      this.togglePad(colorForToggle)
    } // end razzSound

    // prevent start button from being pressed during sequence
    return razzSound()
  }

  componentWillUpdate(nextProps, nextState) {
    // const nextTurn = nextState.turn

    // if () { // game on from off state
    //   // this.populatePadSequence()
    // }

  } // end componentWillUpdate

  componentDidUpdate(prevProps, prevState) {
    const gameTurnedOn = this.state.gameOn
    const gameReady = this.state.padSequence // to only run populatePadSequence when the game is switched from off to on
    const lastPadSequence = prevState.padSequence // should be empty arr to use as check below
    // const thisPadSequence = this.state.padSequence
    // console.log(lastPadSequence, thisPadSequence)

    if (gameTurnedOn && gameReady.length > 0 && lastPadSequence.length === 0) { // game on from off state
      // console.log(this.state)
      this.playPadSequence()
    }
  } // end componentDidUpdate

  render() {
    return (
      <div className="content">
        <div className="pads">
          <div className={`pad green ${this.state.green.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.handlePlayerGuesses("green"); this.togglePad("green")}} onMouseUp={() => {this.togglePad("green"); this.stopSound()}}></div>
          <div className={`pad red ${this.state.red.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.handlePlayerGuesses("red"); this.togglePad("red")}} onMouseUp={() => {this.togglePad("red"); this.stopSound()}}></div>
          <div className={`pad yellow ${this.state.yellow.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.handlePlayerGuesses("yellow"); this.togglePad("yellow")}} onMouseUp={() => {this.togglePad("yellow"); this.stopSound()}}></div>
          <div className={`pad blue ${this.state.blue.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.handlePlayerGuesses("blue"); this.togglePad("blue")}} onMouseUp={() => {this.togglePad("blue"); this.stopSound()}}></div>
        </div>
        {/* end pads */}
        <div className="controls">
          <button type="button" value="start" className="start-button" onClick={() => {this.toggleOnOff(); this.populatePadSequence()}} disabled={this.state.disabled}>Start</button>
        </div>
        {/* end controls */}
      </div> // end content
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
