import './App.css';
import React, {useEffect, Component} from 'react';
import lockImage from './images/shop2.svg';

async function loginRequest(username, password){
  var data = {
      username: username,
      password: password
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/login", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  return await result.text();
}
async function signupRequest(username, password, displayName, email){
  var data = {
    username: username,
    password: password,
    display: displayName,
    email: email
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/signup", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  return await result.text();
}

function App(){
  useEffect(()=>{
    document.title = "Shopping List";
    
  }, []);

  return <MainApp />
}

class LoadingScreen extends Component {
  render(){
    return (
      <div id = "loading">

      </div>
    )
  }
}

class MainApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentScreen: <LoadingScreen />,
      information: null,
    };
    this.goToLogin = this.goToLogin.bind(this);
    this.goToSignup = this.goToSignup.bind(this);
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
  }

  async componentDidMount(){
    this.makeAPIcall();
  }

  // Can return 500 (Server Error), 404 (Not Found), 401 (Unauthorized), data
  async login(username, password){
    var result = await loginRequest(username, password);
    if(result === "Unauthorized" || result === "Not Found"){
      this.setState({
        currentScreen: <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Username or password incorrect."/>
      })
    }
    else if(result === "Internal Server Error"){
        this.setState({
          currentScreen: <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Server error."/>
        })
    }
    else{
      localStorage.setItem("shopUser", document.getElementById("username").value);
      localStorage.setItem("shopPass", document.getElementById("password").value);
      this.setState({
        currentScreen: <MainScreen />,
      })
    }
  }

  // Can return 401 (Unauthorized), 406 (Not Acceptable), 409 (Conflict), result
  async signup(username, password, display, email){
    var result = await signupRequest(username, password, display, email);
    console.log(result)
    if(result === "Unauthorized" || result === "Not Found"){
      this.setState({
        currentScreen: <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Username or password incorrect."/>
      })
    }
    else if(result === "Internal Server Error"){
        this.setState({
          currentScreen: <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Server error."/>
        })
    }
    else{
      localStorage.setItem("shopUser", document.getElementById("username").value);
      localStorage.setItem("shopPass", document.getElementById("password").value);
      this.setState({
        currentScreen: <MainScreen />,
      })
    }
  }

  goToLogin(){
    this.setState({
      currentScreen: <LoginScreen  goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error=""/>,
    })
  }
  goToSignup(){
    this.setState({
      currentScreen: <SignupScreen  goToLogin={this.goToLogin} signup={()=>this.signup()} error=""/>,
    })
  }

  async makeAPIcall(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    if(username === null || password === null){
      this.setState({
        currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup()} error=""/>,
      })
      return;
    }
    var state = <MainScreen />;
    var info = await loginRequest(username, password);
    if(info === "Internal Server Error"){
        state = <ErrorScreen />;
    }
    else if(info === "Not Found" || info === "Unauthorized"){
      state = <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Username or password incorrect."/>;
    }
    this.setState({
      currentScreen: state,
      information: info,
    })
  }



  render(){
    const {currentScreen} = this.state;
    return(
      <div>
        {currentScreen}
      </div>
    )
  }
}

// LoginScreen
// SignupScreen
// ErrorScreen
// Settings
// Main Screen || Done

class ErrorScreen extends Component {
  render(){
    return(
      <div>
        Uh oh! Something went wrong.
        Maybe you have no internet?
      </div>
    )
  }
}

class LoginScreen extends Component {
  render(){
    return(
      <div id = "wrapper">
        <div>
          <img id = "lock" src={lockImage}></img>
        </div>
        <div id = "area" className = "bottom">
          <div id = "error">{this.props.error}</div>
          <div>
            <div className='smallTitle'>Username</div>
            <input placeholder='Enter username' id="username"/>
            <div className='smallTitle'>Password</div>
            <input placeholder='Enter password' type='password' id="password"/>
          </div>
          <br />
          <div className = "largeButton" onClick={this.props.login}>Log in</div>
          <div id = "forgot">
            <div className = "link smallText smallTopMargin inline">FORGOT USERNAME</div>
            <div className = "link smallText inline smallLeftMargin">FORGOT PASSWORD</div>
          </div>
          <br />
          <div className = "smallText">
            DON'T HAVE AN ACCOUNT YET?
            <div className = "link inline" onClick={this.props.goToSignup}> SIGN UP</div>
          </div>
        </div>
      </div>
    )
  }
}

class SignupScreen extends Component {
  render(){
    return(
      <div id = "wrapper">
        <div>
          <img id = "lock" src={lockImage}></img>
        </div>
        <div id = "area" className = "bottom">
          <div id = "error">{this.props.error}</div>
          <div>
            <div className='smallTitle'>Username</div>
            <input  placeholder='Enter username' id="username"/>
            <div className='smallTitle'>Password</div>
            <input placeholder='Enter password' type='password' id="password"/>
            <div className='smallTitle'>Display Name</div>
            <input  placeholder='Enter display name'/>
            <div className='smallTitle'>email</div>
            <input placeholder='Enter email' type='email'/>
          </div>
          <br />
          <div className = "largeButton" onClick={this.props.signup}>Sign up</div>
          <br />
          <div className = "smallText">
            ALREADY HAVE AN ACCOUNT?
            <div className = "link inline" onClick={this.props.goToLogin}> LOG IN</div>
          </div>
        </div>
      </div>
    )
  }
}

class MainScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      titleText: "Select List",
      allItems: <div />,
      joinedLists: <div />
    }
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount(){

  }

  refresh(){
    this.componentDidMount();
  }

  render(){
    const {titleText, allItems, joinedLists} = this.state;
    return (
      <div id="wrapper">
        {/* <img id = "refresh" onClick={this.refresh} alt='refresh icon' src={}/> */}
      </div>
    );
  }
}

export default App;
