import './App.css';
import React, {useEffect, Component} from 'react';
import arrow from './arrow.png';
import settings from './settings.png';
import addPerson from './add.png';
import addItem from './addItem.png';
import refreshIcon from './refresh.png';
import xIcon from './x.png';
import checkmarkIcon from './checkmark.png';

function refreshAll(){
  document.getElementById("refresh").click();
}

function App(){
  useEffect(()=>{
    document.title = "Shopping List";
  }, []);

  return <MainComponent />
}

async function handleSubmit(e){

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
        <img id = "refresh" onClick={this.refresh} alt='refresh icon' src={refreshIcon}/>
      </div>
    );
  }
}

export default App;
