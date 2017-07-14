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
      longestSequence: [],
      lastPadSequence: [],
      checkIndex: 0,
      skillLevel: "1", // slider target.value returns string
      lengthOfSequence: 8, // 8
      gameOn: false,
      padDisplayLength: 420, // length of pad sound/light during playback in ms, originally 420
      round: 0, // how many rounds played, starting from 0 index
      disabled: false,
      error: false,
      gameOver: false,
      lastPadPressUTC: 0,
      timer: 0,
      timeUp: false,
      win: false,
      strict: false,
    }
    this.togglePad = this.togglePad.bind(this)
    // this.setSequences = this.setSequences.bind(this)
    this.handlePlayerGuesses = this.handlePlayerGuesses.bind(this)
    this.setLengthOfSequence = this.setLengthOfSequence.bind(this)
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

  playSound(freq) {
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

  setLengthOfSequence(event) { // CHANGE THIS SO IT IS DISABLED DURING THE ENTIRE GAME!
    const sliderValue = event.target.value

    if (sliderValue === "1") {
      return this.setState({
        lengthOfSequence: 8,
        skillLevel: sliderValue,
      })
    } else if (sliderValue === "2") {
      return this.setState({
        lengthOfSequence: 14,
        skillLevel: sliderValue,
      })
    } else if (sliderValue === "3") {
      return this.setState({
        lengthOfSequence: 20,
        skillLevel: sliderValue,
      })
    } else if (sliderValue === "4") {
      return this.setState({
        lengthOfSequence: 31,
        skillLevel: sliderValue,
      })
    }
  } // end setSequences

  toggleOnOffStrict(event) {
    const switchPosition = event.target.value
    let gameOnState
    let strictState

    if (switchPosition === "0") {
      gameOnState = false
      strictState = false
    } else if (switchPosition === "1") {
      gameOnState = true
      strictState = false
    } else if (switchPosition === "2") {
      gameOnState = true
      strictState = true
    }

    this.stopRazzTimer() // stop timer if currently active
    this.stopSound() // stop sound if currently on
    // console.log(this.state)

    // effectively restarts game if going from on to strict mode
    return this.setState({
      green: { // return pad objects so they are all back to their disabled state
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
      // gameOn: gameOnState === false ? true : false, // original
      gameOn: gameOnState,
      padSequence: [],
      playerGuesses: [],
      longestSequence: [], // reset when turned off
      lastPadSequence: [],
      padDisplayLength: 420,
      checkIndex: 0,
      round: 0,
      error: false,
      gameOver: false,
      lastPadPressUTC: 0,
      timer: 0,
      timeUp: false,
      win: false,
      strict: strictState,
    })
  } // end toggleOnOffStrict

  startNewGame(padSequence) { // rename / rework so this is more of a start/restart game -- need to reset some elements
    const gameOn = this.state.gameOn
    const lengthOfSequence = this.state.lengthOfSequence
    const lastSequence = this.state.padSequence // empty arr if starting from off state, otherwise caches the current pad sequence before another is generated
    const pads = ["green", "red", "yellow", "blue"]
    let newSequence = []
    let count = lengthOfSequence

    if (gameOn) {

      while (count > 0) {
        let randomIndex = Math.floor(Math.random() * 4)
        console.log(randomIndex)
        newSequence.push(pads[randomIndex])
        count--
      }

      console.log(lastSequence, newSequence)

      // this.stopSound() // in case game currently active
      this.stopRazzTimer()

      return this.setState({
        playerGuesses: [],
        padSequence: newSequence,
        lastPadSequence: lastSequence,
        checkIndex: 0,
        padDisplayLength: 420, // length of pad sound/light during playback in ms, originally 420
        round: 0, // how many rounds played, starting from 0 index
        disabled: false,
        error: false,
        gameOver: false,
        lastPadPressUTC: 0,
        timer: 0,
        timeUp: false,
        win: false,
      })
    } else {
      return
    }
  } // end startNewGame

  startLastSequence(lastPadSequence) {
    const gameOn = this.state.gameOn
    const gameOver = this.state.gameOver

    console.log('working lastSequence', lastPadSequence)

    if (gameOn && gameOver) {
      return this.setState({
        playerGuesses: [],
        padSequence: lastPadSequence,
        checkIndex: 0,
        padDisplayLength: 420, // length of pad sound/light during playback in ms, originally 420
        round: 0, // how many rounds played, starting from 0 index
        disabled: false,
        error: false,
        gameOver: false,
        lastPadPressUTC: 0,
        timer: 0,
        timeUp: false,
      })
    }

  }

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

  playPadSequence(padSequence, padDisplayLength) { // refactor so pad sequence is passed as an argument so I can implement a (play) longest (sequence) button in the future
    // const padDisplayLength = this.state.padDisplayLength
    // const padSequence = this.state.padSequence
    const playbackIndexes = padSequence.reduce((acc, color, index) => {
      if (index <= this.state.round) { // if game is still active
        acc.push(index)
      } else if (this.state.gameOver) {
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

      // start timer for razz sound
      this.startRazzTimer()

      return this.setState({
        lastPadPressUTC: Date.now(),
      })
    } // end sing

    return sing() // original
  } // end playPadSequence

  handlePlayerGuesses(guessedColor) {
    const colorObj = this.state[guessedColor]
    const correctSequence = this.state.padSequence
    // let playerGuesses = this.state.playerGuesses // needed to lift the state up in this case to prevent the array from being written over each time this function is called
    let playerGuesses = this.state.playerGuesses
    let checkIndex = this.state.checkIndex
    let currentRound = this.state.round
    const error = this.state.error
    const gameOn = this.state.gameOn
    const gameStarted = this.state.padSequence.length > 0
    const gameOver = this.state.gameOver

    this.stopRazzTimer() // stop timer when player presses a pad, right or wrong

    if (gameOn && !gameOver && gameStarted) {
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
        const gameOverRazz = async () => {
          await this.playRazzSound(guessedColor)
          return this.gameOverState()
        }

        return gameOverRazz()
      }
    } else {
      return
    } // end if else gameOn gameOver check
  } // end handlePlayerGuesses

  passOrFail(guessedColor) {
    const correctSequence = this.state.padSequence
    let playerGuesses = this.state.playerGuesses // needed to lift the state up in this case to prevent the array from being written over each time this function is called
    let checkIndex = this.state.checkIndex
    let currentRound = this.state.round
    const gameOn = this.state.gameOn
    const gameStarted = this.state.padSequence.length > 0
    const gameOver = this.state.gameOver
    const longestSequence = this.state.longestSequence

    if (gameOn && !gameOver && gameStarted) {
      console.log(guessedColor)
      // if guess matches the sequence played and is the end of the sequence / round -- needs to be first so we can handle state appropriately
      if (playerGuesses[checkIndex] === correctSequence[checkIndex] && checkIndex === currentRound) {
        // console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
        if (playerGuesses.length > longestSequence.length) { // check for longest sequence for last pad pressed here
          this.setState({
            checkIndex: 0,
            round: currentRound += 1,
            playerGuesses: [],
            lastPadPressUTC: Date.now(),
            longestSequence: playerGuesses,
          })
        } else {
          this.setState({
            checkIndex: 0,
            round: currentRound += 1,
            playerGuesses: [],
            lastPadPressUTC: Date.now(),
          })
        }
      } else if (playerGuesses[checkIndex] === correctSequence[checkIndex]) { // if guess matches the sequence played, but not the end of the sequence played
        // console.log(correctSequence, correctSequence[checkIndex], playerGuesses, playerGuesses[checkIndex], checkIndex, currentRound)
        if (playerGuesses.length > longestSequence.length) { // check for longest sequence for last button here
          this.startRazzTimer()
          return this.setState({
            checkIndex: checkIndex += 1,
            lastPadPressUTC: Date.now(),
            longestSequence: playerGuesses,
          })
        } else {
          this.startRazzTimer()
          return this.setState({
            checkIndex: checkIndex += 1,
            lastPadPressUTC: Date.now(),
          })
        }
      }
    } else { // end gameOn && !gameOver if/else
      return
    }
  } // end passOrFail

  playLongestSequence(longestSequence) {
    const gameOn = this.state.gameOn
    const gameOver = this.state.gameOver
    const padDisplayLength = this.state.padDisplayLength

    // if game turned on but not started
    if (gameOn && gameOver && longestSequence.length > 0) {
      return this.playPadSequence(longestSequence, padDisplayLength)
    } else {
      return
    }
  } // end playLongestSequence

  errorSetState() {
    return this.setState({
      checkIndex: 0,
      playerGuesses: [],
      timer: 0,
      error: true,
      timeUp: false,
    })
  } // end errorSetState

  gameOverState(msg) {
    const padSequence = this.state.padSequence

    if (msg === "win") {
      return this.setState({
        gameOver: true,
        timer: 0,
        lastPadSequence: padSequence,
        win: true,
      })
    } else {
      return this.setState({
        gameOver: true,
        timer: 0,
        lastPadSequence: padSequence, // if player wins first game from since switching on device, sets the lastPadSequence as the one just played/won in the event that the player wins and then presses the last button to play the first generated sequence again
      })
    }

  } // end gameOverState

  playRazzSound(colorForToggle) {
    const razzFreq = this.state.razzFreq
    const razzLength = 1500

    const razzSound = async () => {
      this.disableButtonsToggle()
      this.playSound(razzFreq)
      await this.pause(razzLength)
      this.stopSound()
      this.disableButtonsToggle()
      if (colorForToggle) {
        this.togglePad(colorForToggle)
      } else {
        return
      }
    } // end razzSound

    return razzSound()
  } // end playRazzSound

  razzTimer() {
    this.setState({
      timer: Date.now(),
    });
  } // end razzTimer

  startRazzTimer() {
    this.timerID = setInterval(
      () => this.razzTimer(),
      100
    )
  } // end startRazzTimer

  checkRazzTimer() {
    const deadline = this.state.lastPadPressUTC + 3000
    const currentTime = this.state.timer
    if (currentTime >= deadline) {
      return this.stopRazzTimer()
    } else {
      return false
    }
  } // end checkRazzTimer

  // broke this out into its own function so that stopping the timer is easy if the player wins
  stopRazzTimer() {
    clearInterval(this.timerID)
    return true
  } // end stopRazzTimer

  victoryTune() {
    const pads = ["red", "yellow", "blue", "green", "red", "yellow", "blue", "green", "red", "yellow", "blue", "green"] // x3
    const padDisplayLength = 100

    return this.playPadSequence(pads, padDisplayLength)
  }

  componentDidUpdate(prevProps, prevState) {
    const gameTurnedOn = this.state.gameOn
    const gameStarted = this.state.padSequence // to only run populatePadSequence when the game is switched from off to on
    const prevPadSequence = prevState.padSequence // should be empty arr to use as check below
    const thisPadSequence = this.state.padSequence
    const padDisplayLength = this.state.padDisplayLength
    const lastRound = prevState.round
    const newSequencePause = 800
    const nextRound = this.state.round + 1 // for calculating padDisplayLength
    const thisRound = this.state.round // would actually be 1 greater than the actual round length due to base 0 counting, but still works when compared to lengthOfSequence
    const error = this.state.error
    const gameOver = this.state.gameOver

    const timeUpRazz = async (msg) => {
      await this.playRazzSound()
      this.disableButtonsToggle()
      if (msg === "error") {
        return this.errorSetState()
      } else {
        this.disableButtonsToggle()
        return this.gameOverState()
      }
    }

    let timer = this.checkRazzTimer()

    // console.log(this.state.lastPadPressUTC, this.state.timer)
    // console.log(this.state, prevState)

    if (thisRound > 0 && thisRound === this.state.padSequence.length && !gameOver) { // player wins the game
      this.stopRazzTimer() // stop the timer so there is no razz sound after winning
      console.log('player win')

      return this.gameOverState("win")
      // return
    } else if (!prevState.gameOver && gameOver && !prevState.win && this.state.win) { // plays victory tune
      const playVictoryTune = async () => {
        await this.pause(newSequencePause)
        this.disableButtonsToggle()
        return this.victoryTune()
      }

      return playVictoryTune()
    } else if (!prevState.error && error && !gameOver) { // not strict mode and pad press error

      const repeatSequence = async () => {
        await this.pause(newSequencePause)
        this.disableButtonsToggle() // toggle buttons again so they are back to default before being toggled on / off in the following playPadSequence function
        return this.playPadSequence(thisPadSequence, padDisplayLength)
      }

      return repeatSequence()
    } else if (!prevState.gameOver && gameOver) { // not strict mode, and made two pad press errors, ending the game
      console.log('game over')
      // return this.toggleOnOff() // original, before on/off toggle switch
      return
    } else if (gameTurnedOn && gameStarted.length > 0 && prevPadSequence.length === 0) { // game on from off state so this only runs once
      return this.playPadSequence(thisPadSequence, padDisplayLength)
    } else if (gameTurnedOn && gameStarted.length > 0 && this.state.lastPadPressUTC === 0 && prevState.lastPadPressUTC > 0) { // testing start button pressed, restarting game
      // console.log('working restart')
      return this.playPadSequence(thisPadSequence, padDisplayLength)
    } else if (gameTurnedOn && gameStarted.length > 0 && prevPadSequence.length > 0 && this.state.round > lastRound) { // there was no error last round
      // console.log('this state: ', this.state, 'prevState: ', prevState)

      this.speedUp(nextRound)

      const playNewSequence = async () => {
        await this.pause(newSequencePause)
        return this.playPadSequence(thisPadSequence, padDisplayLength)
      } // end playNewSequence

      return playNewSequence()
    } else if (timer && !prevState.timeUp && this.state.timeUp && this.state.round === lastRound && !prevState.error && !this.state.error) { // first timeUp error
      console.log('timeup error')
      this.stopSound() // in case player presses a pad just at the deadline
      return timeUpRazz("error")

    } else if (timer && !prevState.timeUp && this.state.timeUp && this.state.round === lastRound && this.state.error) { // second timeUp error -- game over
      this.stopSound() // in case player presses a pad just at the deadline
      return timeUpRazz("gameOver")
    } else if (timer && !this.state.timeUp && !gameOver) {
      return this.setState({
        timeUp: true,
      })
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
          <button type="button" value="last" className="last-button" onClick={() => this.startLastSequence(this.state.lastPadSequence)} disabled={this.state.disabled}>Last</button>
          <button type="button" value="start" className="start-button" onClick={() => this.startNewGame(this.state.padSequence)} disabled={this.state.disabled}>Start</button>
          <button type="button" value="Longest" className="longest-button" onClick={() => this.playLongestSequence(this.state.longestSequence)} disabled={this.state.disabled}>Longest</button>
          <input type="range" list="tickmarks" min="0" max="2" step="1" defaultValue="0" onChange={(event) => this.toggleOnOffStrict(event)} disabled={this.state.disabled}></input>
          <input type="range" list="tickmarks" min="1" max="4" step="1" defaultValue="1" onChange={(event) => this.setLengthOfSequence(event)} disabled={this.state.disabled}></input>
          <datalist id="tickmarks">
            <option value="1" label="1"></option>
            <option value="2" label="2"></option>
            <option value="3" label="3"></option>
            <option value="4" label="4"></option>
          </datalist>
        </div>
        {/* end controls */}
      </div> // end content
    ); // end return
  } // end render
} // end Simon Component

export default Simon;
