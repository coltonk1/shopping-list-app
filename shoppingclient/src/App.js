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
    var result = await loginRequest(username, password).catch((error)=>{
      this.setState({
        currentScreen: <ErrorScreen />,
      })
      return;
    })
    if(result === undefined){
      this.setState({
        currentScreen: <ErrorScreen />,
      })
      return;
    }
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
        currentScreen: <MainScreen sendToLogin={this.goToLogin}/>,
      })
    }
  }

  // Can return 401 (Unauthorized), 406 (Not Acceptable), 409 (Conflict), result
  async signup(username, password, display, email){
    var result = await signupRequest(username, password, display, email);
    if(result === undefined){
      this.setState({
        currentScreen: <ErrorScreen />,
      })
      return;
    }

    if(result === "Unauthorized" || result === "Not Acceptable"){
      this.setState({
        currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup(
          document.getElementById("username").value, 
          document.getElementById("password").value,
          document.getElementById("displayName").value,
          document.getElementById("email").value
          )} error="One of the fields are incorrect."/>,
      })
    }
    else if(result === "Conflict"){
        this.setState({
          currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup(
            document.getElementById("username").value, 
            document.getElementById("password").value,
            document.getElementById("displayName").value,
            document.getElementById("email").value
            )} error="Username already in use"/>,
        })
    }
    else if(result === "Email"){
      this.setState({
        currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup(
          document.getElementById("username").value, 
          document.getElementById("password").value,
          document.getElementById("displayName").value,
          document.getElementById("email").value
          )} error="Email already in use"/>,
      })
    }
    else{
      localStorage.setItem("shopUser", document.getElementById("username").value);
      localStorage.setItem("shopPass", document.getElementById("password").value);
      this.setState({
        currentScreen: <MainScreen sendToLogin={this.goToLogin}/>,
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
      currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup(
        document.getElementById("username").value, 
        document.getElementById("password").value,
        document.getElementById("displayName").value,
        document.getElementById("email").value
        )} error=""/>,
    })
  }

  async makeAPIcall(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    if(username === null || password === null){
      this.setState({
        currentScreen: <SignupScreen goToLogin={this.goToLogin} signup={()=>this.signup(
          document.getElementById("username").value, 
          document.getElementById("password").value,
          document.getElementById("displayName").value,
          document.getElementById("email").value
          )} error=""/>,
      })
      return;
    }
    var state = <MainScreen sendToLogin={this.goToLogin}/>;
    var info = await loginRequest(username, password).catch((error)=>{
      this.setState({
        currentScreen: <ErrorScreen />,
      })
      return;
    })

    if(info === undefined){
      this.setState({
        currentScreen: <ErrorScreen />,
      })
      return;
    }
    if(info === "Internal Server Error"){
        state = <ErrorScreen />;
    }
    else if(info === "Not Found" || info === "Unauthorized"){
      state = <LoginScreen goToSignup={this.goToSignup} login={()=>this.login(document.getElementById("username").value, document.getElementById("password").value)} error="Username or password incorrect."/>;
    }
    this.setState({
      currentScreen: state,
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
      <div id = "errorScreen">
        Uh oh! Something went wrong.
        Maybe you have no internet?
        Come back later.
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
            <input  placeholder='Enter display name' id = "displayName"/>
            <div className='smallTitle'>email</div>
            <input placeholder='Enter email' type='email' id="email"/>
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

class Item extends Component {
  render(){
    return(
      <div className = "item">
        <div className = "itemName">{this.props.name}</div>
        <div className = "itemDescription">{this.props.description}</div>
        <div className = "itemAmount">{this.props.amount}</div>
      </div>
    )
  }
}

class List extends Component {
  render(){
    return(
      <div className='list'>
        {this.props.name}
      </div>
    )
  }
}

async function requestLists(username, password){
  var data = {
    username: username,
    password: password
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/getLists", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  return await result.json().catch((error)=>{
    console.log(error);
  });
}

async function requestItems(username, password, listUsername){
  var data = {
    username: username,
    password: password,
    listUsername: listUsername,
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/getItems", {
    method: 'POST',
    mode: "cors",
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return await result.json().catch((error)=>{
    console.log(error);
  })
}

class MainScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
      AllItems: [],
      AllLists: [],
      currentList: "",
      currentListName: "",
    }
    this.requestCreateList = this.requestCreateList.bind(this)
    this.createList = this.createList.bind(this)
  }

  async requestCreateList(username, password, listDisplay, listUsername, listPassword){
    var data = {
      username: username,
      password: password,
      display: listDisplay,
      listusername: listUsername,
      listpassword: listPassword,
    }
    var result = await fetch(process.env.REACT_APP_api_url + "/createList", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    var returnValue = await result.text().catch((error)=>{
      console.log(error);
    })
    this.setState({
      currentListName: listDisplay,
      currentList: returnValue,
    })
    return returnValue;
  }

  async createList(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    var result = await this.requestCreateList(username, password, document.getElementById("display").value, document.getElementById("listUsername").value, document.getElementById("listPassword").value).catch((error)=>{
      console.log(error);
    })
  }

  async componentDidMount(){
    var user = localStorage.getItem("shopUser")
    var pass = localStorage.getItem("shopPass");
    if(!user || !pass){
      this.props.sendToLogin();
    }
    var lists = await requestLists(user, pass);
    var currentList = this.state.currentList;
    if(lists === null || lists === {}) return;
    var listElements = [];
    var i = 0;
    for(var key in lists){
      i++;
      listElements.push(<List id={key} display={lists[key].DisplayName} key={i}/>)
      if(currentList = "") currentList = key;
    }

    var items = {};
    var itemElements = [];
    var currentListName = this.state.currentListName===""?"no name":this.state.currentListName;
    if(currentList !== "") items = await requestItems(user, pass, currentList);
    for(var key in items){
      itemElements.push(<Item name={key} description={items[key].Description} amount={items[key].Amount}/>)
      if(currentList = "") currentList = key;
      if(key === currentList){
        currentListName = items[key].DisplayName;
      }
    }
    console.log(listElements);

    this.setState({
      AllItems: itemElements,
      AllLists: listElements,
      currentList: currentList,
      currentListName: currentListName,
    })
  }

  render(){
    const {AllItems, AllLists, currentListName} = this.state;
    return (
      <div id="MainWrapper">
        {currentListName}
        <br></br>
        {AllLists}
        <br></br>
        {AllItems}
        <div>
          <div className='smallTitle'>List Display Name</div>
          <input placeholder='Enter Display Name' id = "display"/>
          <div className='smallTitle'>List Username</div>
          <input placeholder='Enter Username' id = "listUsername"/>
          <div className='smallTitle'>List Password</div>
          <input placeholder='Enter Password' id = "listPassword"/>
        </div>
        <br />
        <div className='largeButton' onClick={this.createList}>Create new list</div>
      </div>
    );
  }
}

export default App;
