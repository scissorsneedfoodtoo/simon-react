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
      round: 0, // how many rounds played, starting from 0 index
      disabled: false,
      error: false,
      gameOver: false,
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
      round: 0,
      error: false,
      gameOver: false,
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

      console.log(tempSequence)

      return this.setState({
        padSequence: tempSequence
      })
    }
  } // end populatePadSequence

  speedUp(nextTurn) {
    if (nextTurn === 5) {
      return this.setState({
        padDisplayLength: 320,
      })
    } else if (nextTurn === 13) {
      return this.setState({
        padDisplayLength: 220,
      })
    }
  }

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
    // let playerGuesses = this.state.playerGuesses // needed to lift the state up in this case to prevent the array from being written over each time this function is called
    let playerGuesses = this.state.playerGuesses
    let checkIndex = this.state.checkIndex
    let currentRound = this.state.round
    const error = this.state.error

    playerGuesses.push(guessedColor)

    // if guess matches the sequence played and is the end of the sequence / round -- needs to be first so we can handle state appropriately
    if (playerGuesses[checkIndex] === correctSequence[checkIndex] && checkIndex === currentRound) {
      //console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      return this.playSound(colorObj.freq)
    } else if (playerGuesses[checkIndex] === correctSequence[checkIndex]) { // if guess matches the sequence played, but not the end of the sequence played
      //console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      return this.playSound(colorObj.freq)
    } else if (playerGuesses[checkIndex] !== correctSequence[checkIndex] && !error) { // only return state if player presses the wrong pad AND NOT STRICT MODE!!!!
      //console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      const errorReplay = async () => {
        await this.playRazzSound(guessedColor)
        this.disableButtonsToggle() // disable buttons before setting error state
        return this.errorSetState()
      }

      return errorReplay()
    } else if (playerGuesses[checkIndex] !== correctSequence[checkIndex] && error) {
      const gameOver = async () => {
        await this.playRazzSound(guessedColor)
        return this.gameOverState()
      }

      return gameOver()
    }
  } // end handlePlayerGuesses

  passOrFail(guessedColor) {
    const correctSequence = this.state.padSequence
    let playerGuesses = this.state.playerGuesses // needed to lift the state up in this case to prevent the array from being written over each time this function is called
    let checkIndex = this.state.checkIndex
    let currentRound = this.state.round

    console.log(guessedColor)

    // NEED TO FIGURE OUT END GAME CONDITIONS USING lengthOfSequence
    // if guess matches the sequence played and is the end of the sequence / round -- needs to be first so we can handle state appropriately
    if (playerGuesses[checkIndex] === correctSequence[checkIndex] && checkIndex === currentRound) {
      // console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      this.setState({
        checkIndex: 0,
        round: currentRound += 1,
        playerGuesses: [],
      })
    } else if (playerGuesses[checkIndex] === correctSequence[checkIndex]) { // if guess matches the sequence played, but not the end of the sequence played
      // console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
      this.setState({
        checkIndex: checkIndex += 1,
      })
    }
  }

  errorSetState() {
    return this.setState({
      checkIndex: 0,
      playerGuesses: [],
      error: true,
    })
  }

  gameOverState() {
    return this.setState({
      gameOver: true,
    })
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

  componentDidUpdate(prevProps, prevState) {
    const gameTurnedOn = this.state.gameOn
    const gameStarted = this.state.padSequence // to only run populatePadSequence when the game is switched from off to on
    const lastPadSequence = prevState.padSequence // should be empty arr to use as check below
    const lastRound = prevState.round
    const newSequencePause = 800
    const nextRound = this.state.round + 1 // for calculating padDisplayLength
    const gameEndCond = this.state.round // would actually be 1 greater than the actual round length due to base 0 counting, but still works when compared to lengthOfSequence
    const error = this.state.error
    const gameOver = this.state.gameOver

    if (gameEndCond === this.state.lengthOfSequence) { // player gets to the end of the generated sequence
      return console.log('working game end')
    } else if (!prevState.error && error) { // not strict mode and error

      const repeatSequence = async () => {
        await this.pause(newSequencePause)
        this.disableButtonsToggle() // toggle buttons again so they are back to default before being toggled on / off in the following playPadSequence function
        return this.playPadSequence()
      }

      return repeatSequence()
    } else if (!prevState.gameOver && gameOver) {
      console.log('working')
    } else if (gameTurnedOn && gameStarted.length > 0 && lastPadSequence.length === 0) { // game on from off state so this only runs once
      return this.playPadSequence()
    } else if (gameTurnedOn && gameStarted.length > 0 && lastPadSequence.length > 0 && this.state.round > lastRound) { // there was no error last round
      // console.log('this state: ', this.state, 'prevState: ', prevState)

      this.speedUp(nextRound)

      const playNewSequence = async () => {
        await this.pause(newSequencePause)
        return this.playPadSequence()
      } // end playNewSequence

      return playNewSequence()
    }
  } // end componentDidUpdate

  render() {
    return (
      <div className="content">
        <div className="pads">
          <div className={`pad green ${this.state.green.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.togglePad("green"); this.handlePlayerGuesses("green")}} onMouseUp={() => {this.togglePad("green"); this.stopSound(); this.passOrFail("green")}}></div>
          <div className={`pad red ${this.state.red.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.togglePad("red"); this.handlePlayerGuesses("red")}} onMouseUp={() => {this.togglePad("red"); this.stopSound(); this.passOrFail("red")}}></div>
          <div className={`pad yellow ${this.state.yellow.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.togglePad("yellow"); this.handlePlayerGuesses("yellow")}} onMouseUp={() => {this.togglePad("yellow"); this.stopSound(); this.passOrFail("yellow")}}></div>
          <div className={`pad blue ${this.state.blue.status} ${this.disablePadsToggle(this.state.disabled)}`} onMouseDown={() => {this.togglePad("blue"); this.handlePlayerGuesses("blue")}} onMouseUp={() => {this.togglePad("blue"); this.stopSound(); this.passOrFail("blue")}}></div>
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
