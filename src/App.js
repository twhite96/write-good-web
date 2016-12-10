import React, { Component } from 'react';
import {Editor, EditorState, CompositeDecorator} from 'draft-js';
import {Map} from 'immutable'
import writeGood from 'write-good'
import { Popover } from 'antd';

import './antd.css'
import './Draft.css'

let suggestions = []

class SuggestionSpan extends Component {
  remove(){
  }
  render(){
    let {props} = this
    let indexMatch = props.children[0].props.start //need to declare custom decoratorType to pass extra data
    let suggestion = suggestions.get(props.children[0].props.blockKey).find(suggestion => suggestion.index === indexMatch)
    if(!suggestion){//sometimes we get out of sync for one cycle if we change length of word associated with suggestion
      return <span data-offset-key={props.offsetKey}>{props.children}</span>
    }
    return (
      <Popover content = {suggestion.reason}>
        <span onClick ={this.remove} data-offset-key={props.offsetKey} style={styles.suggestionSpan}>{props.children}</span>
      </Popover>
    )
  }
};

const suggestionStrategy = function(contentBlock, callback){
  let blockKey = contentBlock.get('key')
  let block = suggestions.get(blockKey) || []

  block.forEach((suggestion)=>{
    callback(suggestion.index, suggestion.index + suggestion.offset, suggestion)
  })
}

const compositeDecorator = new CompositeDecorator([
  {
    strategy: suggestionStrategy,
    component: SuggestionSpan,
  },
]);

class App extends Component {
  onChange = (editorState) =>{
    this.setState({editorState: editorState},()=>{
      suggestions = this.computesuggestions(this.state.editorState)
    })
  }
  constructor(props) {
    super(props);
    this.state = {
      suggestions:[],
      editorState: EditorState.createEmpty(compositeDecorator)
    };
  }
  computesuggestions(editorState){
    return editorState.getCurrentContent().blockMap.reduce((suggestionsBlockMap, block) =>{
      let key = block.get('key')
      let suggestions = writeGood(block.get('text')) || []
      return suggestionsBlockMap.set(key, suggestions: suggestions)
    },Map())
  }
  render() {
    const {editorState} = this.state;
    return (
      <div style = {{marginLeft:20}}>
        <h1>Write Good Web</h1>
        <div style = {styles.root}>
          <Editor
            style = {styles.editor}
            spellCheck={true}
            editorState={editorState}
            onChange={this.onChange} />
        </div>
        <p>A simple web interface to <a href ="https://github.com/btford/write-good"> Write Good </a></p>
      </div>
    )
  }
}

const styles = {
  editor:{
    borderTop: '1px solid #ddd',
    cursor: 'text',
    fontSize: 16,
    marginTop: 10
  },
  root:{
    background: '#fff',
    border: '1px solid #ddd',
    fontFamily: "'Georgia', serif",
    fontSize: 14,
    width: 500,
    height:300,
    padding: 15
  },
  suggestionSpan:{
    backgroundColor:'#ffeee6',
    border: '1px solid #ffddcc',
    color: 666
  }
}

export default App;
