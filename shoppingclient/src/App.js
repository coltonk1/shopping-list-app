import './App.css';
import React, {useEffect, Component} from 'react';
import { useAsync } from "react-async"

async function loginRequest(username, password){
  var data = {
      username: username,
      password: password
  }
  var result = await fetch("", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  return await result.text();
}
async function signupRequest(username, password, displayName){
  var data = {
    username: username,
    password: password,
    display: displayName
  }
  var result = await fetch("", {
      method: 'POST',
      mode: "cors",
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
  })
  return await result.text();
}

function refreshAll(){
  document.getElementById("refresh").click();
}

function App(){
  const makeAPIcall = async () => {
    var info = await loginRequest();
    console.log(info)
  }
  useEffect(()=>{
    document.title = "Shopping List";
    makeAPIcall();
  }, []);

  return <MainComponent />
}

async function handleSubmit(e){

}

class LoadingScreen extends Component {
  render(){
    return (
      <div id = "loading">

      </div>
    )
  }
}

class MainComponent extends Component {
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
