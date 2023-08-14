import './App.css';
import React, {useEffect, Component} from 'react';
import db from './initFirebase';
import { ref, set, get, child, remove } from "firebase/database";
import arrow from './arrow.png';
import settings from './settings.png';
import addPerson from './add.png';
import addItem from './addItem.png';
import refreshIcon from './refresh.png';
import xIcon from './x.png';
import checkmarkIcon from './checkmark.png';

async function writeUserData(listName, name, description, amount) {
  if(!await isListReal(listName) || await getCurrentPassword(listName) === null) return;
  return set(ref(db, listName + '/List/' + name), {
    name: name,
    description: description,
    amount: amount
  }).then(()=>{
    return true;
  }).catch(()=>{
    return false
  })
}

async function writeNewList(listName, password) {
  return set(ref(db, listName + '/Info/'), {
    data_name: listName,
    data_password: password,
  }).then(()=>{
    return true;
  }).catch(()=>{
    return false
  })
}

async function getSepcificListData(ListName){
  if(!await isListReal(localStorage.getItem("currentList")) || await getCurrentPassword(localStorage.getItem("currentList")) === null) return;
  return get(child(ref(db), ListName + '/List/')).then((info)=>{
    if(info.exists()){
      return info.val();
    }
    else{
      console.log("No data available");
      return null;
    }
  }).catch((e)=>{
    console.log(e);
    return null;
  })
}
function isListReal(ListName){
  return get(child(ref(db), ListName + '/Info/')).then((info)=>{
    if(info.exists()){
      return true;
    }
    else{
      console.log("No data available");
      return false;
    }
  }).catch((e)=>{
    console.log(e);
    return false;
  })
}

async function getCurrentPassword(ListName){
  return get(child(ref(db), ListName + '/Info/data_password')).then((info)=>{
    if(info.exists()){
      let items = JSON.parse(localStorage.getItem("joinedLists") || "[]");
      for(let i = 0; i < items.length; i++){
        if(items[i].name === ListName && items[i].password === info.val()){
          return info.val();
        }
      }
      return null;
    }
    else{
      console.log("No data available");
      return null;
    }
  }).catch((e)=>{
    console.log(e);
    return null;
  })
}

function refreshAll(){
  document.getElementById("refresh").click();
}

async function removeItem(id){
  if(!await isListReal(localStorage.getItem("currentList")) || await getCurrentPassword(localStorage.getItem("currentList")) === null) return;
  await remove(ref(db, localStorage.getItem("currentList") + '/List/' + id));
  document.getElementById("refresh").click();
}

async function getTotal(){
  if(!await isListReal(localStorage.getItem("currentList")) || await getCurrentPassword(localStorage.getItem("currentList")) === null) return 0;
  var items = await getSepcificListData(localStorage.getItem("currentList"));
  let amt = 0;
  for(var p in items){
    if(p !== "data_name" && p !== "data_password")
      amt++;
  }
  return amt;
}

var itemTotal = await getTotal();
if(itemTotal === undefined) itemTotal = 0;

// writeUserData(itemTotal, "Pickles", "Pls", 1);

function App(){
  useEffect(()=>{
    document.title = "Shopping List";
  }, []);

  return <MainComponent />
}

class ListItem extends Component {
  render(){
    return (
      <div className = "itemContainer">
        <img alt="x" src={xIcon} className = 'itemX' onClick={()=>{removeItem(this.props.name)}} />
        <p className='itemName'>{this.props.name}</p>
        <p className='itemDesc'>{this.props.description}</p>
        <p className='itemAmt'>x{this.props.amount}</p>
      </div>
    )
  }
}

class JoinedList extends Component {
  render(){
    return (
      <div className = "JoinedList" onClick={()=>{localStorage.setItem("currentList", this.props.name); displayListContainer(); refreshAll()}}>
        <p className='joinedListName'>{this.props.name}</p>
      </div>
    )
  }
}

async function RenderAllListItems(){
  if(!await isListReal(localStorage.getItem("currentList") || "") || await getCurrentPassword(localStorage.getItem("currentList")) === null) return;
  const info = await getSepcificListData(localStorage.getItem("currentList") || "");
  if(info == null) return(<div />);

  let AllElements = [];
  var key=0;
  Object.entries(info).forEach((property)=>{
    AllElements.push(<ListItem name={property[1].name} description={property[1].description} amount={property[1].amount} key={key++}/>);
  })

  return <div>{AllElements}</div>;
}

async function RetrieveAllJoinedLists(){
  let items = JSON.parse(localStorage.getItem("joinedLists") || "[]");
  if(items.length === 0) return;
  let AllElements = [];
  for(let i = 0; i < items.length; i++){
    if(await isListReal(items[i].name) && await getCurrentPassword(items[i].name) !== null){
      AllElements.push(<JoinedList key={i} name={items[i].name}/>);     
    }
  }
  return <div>{AllElements}</div>
}

async function handleSubmit(e){
  var name = e.target.parentNode.parentNode.children[0].children[0].value;
  var desc = e.target.parentNode.parentNode.children[1].children[0].value + "\nBy " + (localStorage.getItem("username") || "Anonymous");
  var amt = e.target.parentNode.parentNode.children[2].children[0].value;
  if(name.length === 0 || amt.length === 0) return;
  if((localStorage.getItem("currentList") || "") === "") return;
  await writeUserData(localStorage.getItem("currentList"), name, desc, amt);
  e.target.parentNode.parentNode.children[0].children[0].value = "";
  e.target.parentNode.parentNode.children[1].children[0].value = "";
  e.target.parentNode.parentNode.children[2].children[0].value = "";
  document.getElementById("refresh").click();
}

function displayListContainer(){
  if(document.getElementById("listsContainer").style.top === "0em"){
    document.getElementById("listsContainer").style.top = document.getElementById("listsContainer").clientHeight*-1 + "px";
    document.getElementById("dropArrow").style.transform = "rotate(0deg)";
  }
  else{
    document.getElementById("listsContainer").style.top = "0em";
    document.getElementById("dropArrow").style.transform = "rotate(180deg)";
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
    this.changeTitle = this.changeTitle.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  async componentDidMount(){
    let items = JSON.parse(localStorage.getItem("joinedLists") || "[]");
    let c = false;
    for(let i = 0; i < items.length; i++){
      if(items[i].name === localStorage.getItem("currentList") && items[i].password === await getCurrentPassword(localStorage.getItem("currentList"))){
        c = true;
        break;
      }
    }
    let a = await isListReal(localStorage.getItem("currentList")) && c;
    let b;
    if(a) b = localStorage.getItem("currentList");
    else b = "Select List";

    let value = await RenderAllListItems();
    let jLists = await RetrieveAllJoinedLists();
    this.setState({
      allItems: value,
      joinedLists: jLists,
      titleText: b,
    })
    document.getElementById("listsContainer").style.top = document.getElementById("listsContainer").clientHeight*-1 + "px";
  }

  refresh(){
    this.componentDidMount();
  }

  changeTitle(event){
    this.setState({
      titleText: event.currentTarget.getAttribute("data-display-name"),
    });
  }

  addItem(){
    if(document.getElementById("buttonWrapper").style.opacity !== "0"){
      document.getElementById("buttonWrapper").style.opacity = "0";
      setTimeout(()=>{
        if(document.getElementById("buttonWrapper").style.opacity === "0"){
          document.getElementById("buttonWrapper").style.zIndex = "-1";
        }
      }, 500)
    }
    else{
      document.getElementById("buttonWrapper").style.opacity = "100%";
      document.getElementById("buttonWrapper").style.zIndex = "2";
    }
  }

  openSettings(){
    document.getElementById("settings").style.display = "block";
    document.getElementById("username").value = localStorage.getItem("username") || "";
  }
  closeSettings(){
    document.getElementById("settings").style.display = "none";
  }
  saveInfo(){
    if(document.getElementById("username").value.trim().length > 1)
    localStorage.setItem("username", document.getElementById("username").value.trim());
  }

  async getPass(){
    document.getElementById("showInfoContainer").style.opacity = "100%";
    document.getElementById("showInfoContainer").style.zIndex = "4";
    let password = await getCurrentPassword(localStorage.getItem("currentList"));
    if(password !== null){
      document.getElementById("infoPassword").textContent = password;
      document.getElementById("infoName").textContent = localStorage.getItem("currentList");
    }
    else
      console.log("Error: Password");
  }

  closeInfo(){
    document.getElementById("showInfoContainer").style.opacity = "0";
    setTimeout(()=>{
      if(document.getElementById("showInfoContainer").style.opacity === "0"){
        document.getElementById("showInfoContainer").style.zIndex = "-1";
      }
    }, 500)
  }

  async createList(name){
    if(await isListReal(name)) return;
    let pass = Math.round(Math.random()*10000);
    await writeNewList(name, pass);
    localStorage.setItem("currentList", name);
    let a = JSON.parse(localStorage.getItem("joinedLists") || "[]");
    a.push({name:name, password:pass});
    localStorage.setItem("joinedLists", JSON.stringify(a)); 
    this.refresh();
  }
  async joinList(name, password){
    if(!await isListReal(name) || await getCurrentPassword(name) === password) return;
    localStorage.setItem("currentList", name);
    let a = JSON.parse(localStorage.getItem("joinedLists") || "[]");
    for(let i = a.length-1; i >= 0; i--){
      if(a[i].name === name){
        a.splice(i, 1);
      }
    }
    a.push({name:name, password:parseInt(password)});
    localStorage.setItem("joinedLists", JSON.stringify(a));
    console.log(a)
    this.refresh();
  }


  openCreateList(){
    document.getElementById("createListContainer").style.opacity = "100%";
    document.getElementById("createListContainer").style.zIndex = "4";
  }
  closeCreateList(){
    document.getElementById("createListContainer").style.opacity = "0";
    setTimeout(()=>{
      if(document.getElementById("createListContainer").style.opacity === "0"){
        document.getElementById("createListContainer").style.zIndex = "-1";
      }
    }, 500)
  }

  openJoinList(){
    document.getElementById("joinListContainer").style.opacity = "100%";
    document.getElementById("joinListContainer").style.zIndex = "4";
  }
  closeJoinList(){
    document.getElementById("joinListContainer").style.opacity = "0";
    setTimeout(()=>{
      if(document.getElementById("joinListContainer").style.opacity === "0"){
        document.getElementById("joinListContainer").style.zIndex = "-1";
      }
    }, 500)
  }

  render(){
    const {titleText, allItems, joinedLists} = this.state;
    return (
      <div id="wrapper">
        <div id = "selectorContainer" onClick={displayListContainer}>
          <div id = "selectorCurrent">{titleText}</div>
          <img id = "dropArrow" src={arrow} alt="arrow icon" />
        </div>
        <img id = "settingsIcon" src={settings} onClick={this.openSettings} alt="settings icon" />
        <img id = "addPersonIcon" src={addPerson} onClick={this.getPass} alt="invite icon" />

        <div id = "listsContainer">
          <div id = "listDivider" />
          <div id = "allKnownLists">
            {joinedLists}
          </div>
          <div id = "listButtonContainer">
            <div id = "createList" onClick={this.openCreateList}>Create List</div>
            <div id = "joinList" onClick={this.openJoinList}>Join List</div>
          </div>
        </div>

        <div id = "createListContainer">
          <div className = "mainFormShadow" />
          <div id = "mainLC">
            <div className="formArea">
              <textarea type="text" name="name" id="listname" className = "formInput" placeholder={"List Name"} required/>
            </div>
            <div className="formSubmit">
              <img alt="sub" src = {checkmarkIcon} type="submit" onClick={()=>{this.closeCreateList(); this.createList(document.getElementById("listname").value); this.refresh()}} className = "submitInput" />
            </div>
            <img className = "mainX" onClick={()=>{this.closeCreateList(); this.refresh()}} src = {xIcon} alt = "form x"></img>
          </div>
        </div>


        <div id = "showInfoContainer">
          <div className = "mainFormShadow" />
          <div id = "mainInfo">
            <div id="infoName"></div>
            <div id="infoPassword"></div>
            <img className = "mainX" onClick={()=>{this.closeInfo()}} src = {xIcon} alt = "form x"></img>
          </div>
          
        </div>


        <div id = "joinListContainer">
          <div className = "mainFormShadow" />
          <div id = "mainLC">
            <div className="formArea">
              <textarea type="text" name="name" id="joinlistname" className = "formInput" placeholder={"List Name"} required/>
            </div>
            <div className="formArea">
              <input type="number" name="password" id="joinlistpassword" placeholder={"Enter password"} className = "formInput" required/>
            </div>
            <div className="formSubmit">
              <img alt="sub" src = {checkmarkIcon} type="submit" onClick={()=>{this.closeJoinList(); this.joinList(document.getElementById("joinlistname").value, document.getElementById("joinlistpassword").value); this.refresh()}} className = "submitInput" />
            </div>
            <img className = "mainX" onClick={()=>{this.closeJoinList(); this.refresh()}} src = {xIcon} alt = "form x"></img>
          </div>
          
        </div>

        <div id = "settings">
          <input id = "username" placeholder='Username'/>
          <div id = "save" onClick={this.saveInfo}>Save</div>
          <img alt="sub" src = {xIcon} onClick={this.closeSettings} className = "mainX" />
        </div>

        <div id = "buttonWrapper">
          <div className = "mainFormShadow" />
          <div id = "mainForm">
            <div className="formArea">
              <textarea type="text" name="name" id="name" className = "formInput" placeholder={"Please enter an item name"}required/>
            </div>
            <div className="formArea">
              <textarea type="text" name="notes" id="notes" placeholder={"Add notes here"} className = "formInput" required/>
            </div>
            <div className="formArea">
              <input type="number" name="amount" id="amount" placeholder={"Enter amount"} className = "formInput" required/>
            </div>
            <div className="formSubmit">
              <img alt="sub" src = {checkmarkIcon} type="submit" onClick={(e)=>{handleSubmit(e); this.addItem()}} className = "submitInput" />
            </div>
            <img className = "mainX" onClick={this.addItem} src = {xIcon} alt = "form x"></img>
          </div>
        </div>

        <div id = "divider" />

        {/* <div data-display-name="Current List" className="Subject" onClick={(e)=>{this.changeTitle(e)}}>Current List</div> */}

        <img id = "refresh" onClick={this.refresh} alt='refresh icon' src={refreshIcon}/>
        <img id = "addItemIcon" alt='add item icon' src={addItem} onClick={this.addItem}/>

        <div id = "itemWrapper">{allItems}</div>
      </div>
    );
  }
}

export default App;
