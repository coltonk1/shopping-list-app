import './App.css';
import React, {useEffect, Component} from 'react';
import lockImage from './images/shop2.svg';
import settingsImage from './images/settings.png';
import barsImage from './images/3bars.png';

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
  componentDidMount(){
    document.getElementById("lock").style.bottom = window.innerHeight/1.5 + "px";
  }

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
  componentDidMount(){
    document.getElementById("lock").style.bottom = window.innerHeight/1.5 + "px";
  }

  render(){
    return(
      <div id = "wrapper">
        <div>
          <img id = "lock" src={lockImage}></img>
        </div>
        <div id = "area" className = "bottom">
          <div id = "error">{this.props.error}</div>
          <div>
            <div className='smallTitle'>Username *</div>
            <input  placeholder='Enter username' id="username"/>
            <div className='smallTitle'>Password *</div>
            <input placeholder='Enter password' type='password' id="password"/>
            <div className='smallTitle'>Display Name *</div>
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

class SpecialItem extends Component {
  render(){
    return(
      <div onClick={this.props.handleClick} className = "item">
            <div className='specialItem'>+</div>
      </div>
    )
  }
}

class Item extends Component {
  constructor(props){
    super(props);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleRemove(){
    this.props.removeItem(this.props.name);
  }

  render(){
    return(
      <div className = "item">
        <div className = "remove" onClick={this.handleRemove}>x</div>
        <div className = "itemName smallTitle">{this.props.name}</div>
        <div className = "itemDescription">{this.props.description}</div>
        <div className = "itemAmount">{this.props.amount}</div>
        <div className = "itemCreator">{this.props.creator}</div>
      </div>
    )
  }
}

class SpecialList extends Component {
  render(){
    return (
      <div onClick={this.props.handleClick} className = "list">
        <div className = 'specialList largeTitle'>+</div>
      </div>
    )
  }
}

class List extends Component {
  constructor(props){
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(){
    this.props.clickedList(this.props.id)
  }
  render(){
    return(
      <div onClick = {this.handleClick} className='list largeTitle'>
        {this.props.display}
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

async function requestRemoveItem(username, password, item, list){
  var data = {
    username: username,
    password: password,
    listUsername: list,
    itemName: item,
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/removeItem", {
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

async function requestListInformation(username, password, listUsername){
  var data = {
    username: username,
    password: password,
    listUsername: listUsername,
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/listInfo", {
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

async function requestRemoveListFromAccount(username, password, listUsername){
  var data = {
    username: username,
    password: password,
    listUsername: listUsername,
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/removeListFromAccount", {
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

async function requestJoinList(username, password, listUsername, listPassword){
  var data = {
    username: username,
    password: password,
    listUsername: listUsername,
    listPassword: listPassword
  }
  var result = await fetch(process.env.REACT_APP_api_url + "/joinList", {
    method: 'POST',
    mode: "cors",
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  return await result.text().catch((error)=>{
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
      listInfo: {username: "", password: ""},
    }
    this.requestCreateList = this.requestCreateList.bind(this)
    this.createList = this.createList.bind(this)
    this.requestCreateItem = this.requestCreateItem.bind(this)
    this.createItem = this.createItem.bind(this)
    this.clickedList = this.clickedList.bind(this)
    this.removeItem = this.removeItem.bind(this);
    this.removeListFromAccount = this.removeListFromAccount.bind(this);
    this.displayListSettings = this.displayListSettings.bind(this);
    this.joinList = this.joinList.bind(this);
  }

  async requestCreateItem(username, password, listUsername, itemName, description, amount){
    var data = {
      username: username,
      password: password,
      listUsername: listUsername,
      itemName: itemName,
      description: description,
      amount: amount,
    }
    console.log(data)
    var result = await fetch(process.env.REACT_APP_api_url + "/addItem", {
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
    return returnValue;
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

  async clickedList(listClicked){
    this.setState({
      currentList: listClicked,
    })
    this.componentDidMount();
    this.showAllLists();
  }

  async createList(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    var result = await this.requestCreateList(username, password, document.getElementById("display").value, document.getElementById("listUsername").value, document.getElementById("listPassword").value).catch((error)=>{
      console.log(error);
    })
    document.getElementById("display").value = "";
    document.getElementById("listUsername").value = "";
    document.getElementById("listPassword").value = "";
    this.displayListForm();
    this.showAllLists();
    this.componentDidMount();
  }

  async joinList(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    var result = await this.requestJoinList(username, password, document.getElementById("joinListUsername").value, document.getElementById("joinListPassword").value).catch((error)=>{
      console.log(error);
    })
    document.getElementById("display").value = "";
    document.getElementById("listUsername").value = "";
    document.getElementById("listPassword").value = "";
    this.setState({currentList: result})
    this.displayListForm();
    this.showAllLists();
    this.componentDidMount();
  }

  async createItem(){
    var username = localStorage.getItem("shopUser");
    var password = localStorage.getItem("shopPass");
    var result = await this.requestCreateItem(username, password, this.state.currentList, document.getElementById("itemName").value, document.getElementById("description").value, document.getElementById("amount").value).catch((error)=>{
      console.log(error);
    })
    document.getElementById("itemName").value = "";
    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    this.componentDidMount();
    this.displayItemForm();
  }

  async removeItem(name){
    var user = localStorage.getItem("shopUser");
    var pass = localStorage.getItem("shopPass");
    await requestRemoveItem(user, pass, name, this.state.currentList);
    this.componentDidMount();
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
      listElements.push(<List clickedList={this.clickedList} id={key} display={lists[key]} key={i}/>)
      if(currentList === "") currentList = key;
    }

    var items = {};
    var itemElements = [];
    var currentListName = lists[currentList]===null?"no list":lists[currentList];
    if(currentList !== "") items = await requestItems(user, pass, currentList);
    if(items === undefined || items === {}) return;
    i=0;
    for(var key in items){
      i++;
      itemElements.push(<Item removeItem={this.removeItem} key={i} name={key} description={items[key].Description} amount={items[key].Amount} creator={items[key].CreatedBy}/>)
    }

    this.setState({
      AllItems: itemElements,
      AllLists: listElements,
      currentList: currentList,
      currentListName: currentListName,
    })
  }

  displayItemForm(){
    var itemForm = document.getElementById("itemForm");
    if(itemForm.style.display === "block")
      itemForm.style.display = "none";
    else
      itemForm.style.display = "block";
  }

  displayListForm(){
    var listForm = document.getElementById("listForm");
    if(listForm.style.display === "block")
      listForm.style.display = "none";
    else
      listForm.style.display = "block";
  }

  showAllLists(){
    var allLists = document.getElementById("allLists");
    if(allLists.style.display === "block")
      allLists.style.display = "none";
    else
      allLists.style.display = "block";
  }

  async displayListSettings(){
    var listSettings = document.getElementById("listSettings");
    if(listSettings.style.display === "block")
      listSettings.style.display = "none";
    else{
      var user = localStorage.getItem("shopUser");
      var pass = localStorage.getItem("shopPass");
      var listInfo = await requestListInformation(user, pass, this.state.currentList);
      this.setState({listInfo: listInfo})
      listSettings.style.display = "block";
    }
  }

  async removeListFromAccount(){
    var user = localStorage.getItem("shopUser");
    var pass = localStorage.getItem("shopPass");
    await requestRemoveListFromAccount(user, pass, this.state.currentList);

    this.componentDidMount();
    this.displayListSettings();
  }

  signOut(){
    localStorage.removeItem("shopUser");
    localStorage.removeItem("shopPass");
    window.location.reload(false);
  }

  render(){
    const {listInfo, AllItems, AllLists, currentListName} = this.state;
    return (
      <div>
        <div id="MainWrapper">
          <div id = "signout" onClick={this.signOut}>Sign out</div>

          <div id = "CurrentList" className='largeTitle'>
            <div id = "displayListSettings" onClick={this.displayListSettings}><img className="smallIcon" src={settingsImage}></img></div>
            <div id = "displayAllLists" onClick={this.showAllLists}><img className="smallIcon" src={barsImage}></img></div>
            {currentListName}
          </div>

          <div id = "listSettings">
            <div className='formBackground'></div>
            <div className='higher'>
              <div className='widthFull'>
                <br/>
                <div className = "smallTitle">List Username:</div>
                <div className='smallTitle'>{listInfo.username}</div>
                <br/>
                <div className = "smallTitle">List Password:</div>
                <div className='smallTitle'>{listInfo.password}</div>
                <br />
                <div id = "leaveListButton" className='largeButton' onClick={this.removeListFromAccount}>Leave this list</div>
              </div>
            </div>
          </div>

          <div id = "allLists">
            <div className='formBackground'></div>
            <div className='higher'>
              <div className="back" onClick={this.showAllLists}>{"<"}</div>
              <div id = "allListContainer">
                <SpecialList handleClick={this.displayListForm}/>
                {AllLists}
              </div>
            </div>
          </div>
          
          <br />
          <SpecialItem handleClick={this.displayItemForm}/>
          {AllItems}

          <div id = "listForm">
            <div className='higher'>
              <div className="back" onClick={this.displayListForm}>{"<"}</div>
              <div>
                <div className='smallTitle'>List Display Name *</div>
                <input placeholder='Enter Display Name' id = "display"/>
                <div className='smallTitle'>List Username *</div>
                <input placeholder='Enter Username' id = "listUsername"/>
                <div className='smallTitle'>List Password *</div>
                <input placeholder='Enter Password' id = "listPassword"/>
              </div>
              <br />
              <div className='largeButton' onClick={this.createList}>Create list</div>
              <br />
              <div>
                <div className='smallTitle'>List Username *</div>
                <input placeholder='Enter Username' id = "joinListUsername"/>
                <div className='smallTitle'>List Password *</div>
                <input placeholder='Enter Password' id = "joinListPassword"/>
              </div>
              <br />
              <div className='largeButton' onClick={this.joinList}>Join list</div>
            </div>
            <div className='formBackground'></div>
          </div>

          <div id = "itemForm">
            <div className = "higher">
              <div className="back" onClick={this.displayItemForm}>{"<"}</div>
              <div>
                <div className='smallTitle'>Item Name *</div>
                <input placeholder='Enter Display Name' id = "itemName"/>
                <div className='smallTitle'>Item Description</div>
                <input placeholder='Enter Username' id = "description"/>
                <div className='smallTitle'>Item Amount</div>
                <input placeholder='Enter Password' type='number' id = "amount"/>
              </div>
              <br />
              <div className='largeButton' onClick={this.createItem}>Add item</div>
            </div>
            <div className='formBackground'></div>
          </div>
        </div>
        <div id = "background">.</div>
      </div>
    );
  }
}

export default App;
