import React from 'react'
import ReactDOM from 'react-dom'
import { get } from './api'
import { Accordion, AccordionItem } from 'react-sanfona'
import { Modal,ModalManager,Effect} from 'react-dynamic-modal'
import TokenInput from 'react-tokeninput'
import * as Combobox from 'react-tokeninput'
import MediaQuery from 'react-responsive'

function compare(a, b) {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

class Exercises extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      exercises: [],
      categories: [
        {id: 'c-1', title: 'Looptraining',               checked: false, type: 'Fysiek'},
        {id: 'c-2', title: 'Krachttraining',             checked: false, type: 'Fysiek'},
        {id: 'c-3', title: 'Motoriektraining',           checked: false, type: 'Fysiek'},
        {id: 'c-4', title: 'Samenspelen en druk zetten', checked: false, type: 'Techniek'},
        {id: 'c-5', title: 'Dribbelen en afpakken',      checked: false, type: 'Techniek'},
        {id: 'c-6', title: 'Scoren en tegenhouden',      checked: false, type: 'Techniek'},
        {id: 'c-7', title: 'Positiespel',                checked: false, type: 'Tactiek'},
        {id: 'c-8', title: 'Standaard-situaties',        checked: false, type: 'Tactiek'}
      ],
      selected: [],
      tokens: [],
      options: []
    }

    this.handleAccordionChange = this.handleAccordionChange.bind(this)
    this.handleTokenInput = this.handleTokenInput.bind(this)
    this.handleTokenSelect = this.handleTokenSelect.bind(this)
    this.handleTokenRemove = this.handleTokenRemove.bind(this)
  }

  componentDidMount() {
    get('exercises').then((data) => {
      let exercises = data.sort(compare)
      this.setState({
        exercises: exercises,
        selected: exercises,
        tags: Array.from(
          new Set( data.reduce((m, e) => m.concat(e.tags), []) ) ).sort()
      })
    })
  }

  renderYoutube(url) {
    return (
      <div>
        <MediaQuery query='(min-device-width: 1224px)'>
          <iframe style={{marginTop: '12px'}}
            width={420} height={235} src={url}
            frameborder={0} allowFullscreen={true}></iframe>
        </MediaQuery>
        <MediaQuery query='(max-device-width: 1224px)'>
          <iframe style={{marginTop: '12px'}}
            width={245} height={137} src={url}
            frameborder={0} allowFullscreen={true}></iframe>
        </MediaQuery>      
      </div>
    )
  }

  renderVideo(m) {
    if ( undefined === m.v ) {
      return <span>{m.name}</span>
    } else {
      let url = 'https://www.youtube.com/embed/' + m.v +
          '?start=' + ( undefined !== m.t ? m.t : 0 )
      let img = 'images/sources/' + m.s + '.png'
      return (
        <div>
          <div>{m.name}<img src={img}
            style={{float: 'right', width: '24px', height: '24px'}}></img>
          </div>
          { this.renderYoutube(url) }
        </div>
      )      
    }    
  }

  renderVariations(e) {
    if ( e.visited ) {
      let maps = e.variations
    
      if ( maps.length > 0 ) {
        let items = maps.map((m) => {
          return (
            <li className='list-group-item'>
              {this.renderVideo(m)}
            </li>
          )
        })
        
        return (
          <ul style={{marginTop: '20px', marginBottom: '0px'}}
            className='list-group'>
            {items}
          </ul>
        )
      }
    }

    return null
  }

  runModal(e) {
    e.preventDefault()

    let mq = window.matchMedia('@media all and (max-width: 375px)')
    
    ModalManager.open(
      <Modal
        onRequestClose={() => true}
        style={{content: {width: mq.matches ? '430px' : '375px',
                          background: 'rgba(191,191,191,0.95)',
                          margin: '10% auto'}}}
        effect={Effect.ScaleUp}>
        <div className='modal-body'>
        <img src={e.target.href}
          width={mq.matches ? '400px' : '345px'}
          height={mq.matches ? '300px' : '259px'}
          onClick={ModalManager.close}
        />
        </div>
      </Modal>
    )
  }

  renderExerciseText(m) {
    if ( m.image ) {
      <div>{m.text}</div>
      let imgSrc = 'images/exercises/' + m.uuid + '.png'
      return (
        <div>
          <div>Categorie: {m.category}</div>
          <br/>
          <div>{m.text}</div>
          <br/>
          <a href={imgSrc} onClick={this.runModal.bind(this)}>Schema</a>
        </div>
      )
    } else {
      return <div>{m.text}</div>
    }
  }

  renderExercises() {
    return (
      <Accordion style={{margin: '0px'}} onChange={this.handleAccordionChange}>
        { 
          this.state.selected.map((m, idx) => {
            return (
                <AccordionItem title={m.name} slug={idx} key={m.uuid}>
                { this.renderExerciseText(m) }
              { this.renderVariations(m) }
              </AccordionItem>  
            )
          })
        }
      </Accordion>
    )
  }

  filterExercises({categories, tokens}) {
    let selected = this.state.exercises
    
    // filter by checked categories, if any
    let checked = categories.filter((c) => c.checked)

    if ( checked.length ) {
      let titles = new Set( checked.map((c) => c.title) )
      selected = selected.filter((e) => titles.has(e.category))
    }
    
    // filter by tokens, if any
    if ( tokens.length ) {
      let tags = new Set( tokens.map((t) => t.name) )
      selected = selected.filter((e) => e.tags.find((t) => tags.has(t)) !== undefined )
    }

    this.setState({ selected: selected })
  }

  updateFilters(id) {
    let tokens = this.state.tokens
    let categories = this.state.categories.map((c) => {
      return Object.assign( c, { checked: ( c.id === id ? !c.checked : c.checked ) } )
    })

    this.setState({categories: categories})
    this.filterExercises({categories, tokens})
  }

  renderCategory(c) {
    return (
      <div key={c.id}>
        <input type='checkbox'
          data-id={c.id}
          checked={c.checked}
          onChange={this.updateFilters.bind(this, c.id)}
        />
        <span style={{marginLeft: '10px'}}>{c.title}</span>
      </div>
    )
  }

  handleTokenSelect( value ) {
    let tokens = [...this.state.tokens, {id: value, name: value}]
    this.setState({ tokens: tokens })
    this.filterExercises({categories: this.state.categories, tokens})
  }

  handleTokenRemove(value) {
    let tokens = this.state.tokens.filter((v) => v.id !== value.id)
    this.setState({tokens: tokens})
    this.filterExercises({categories: this.state.categories, tokens})
  }

  handleTokenInput(value) {
    if ( value === '' ) return this.setState({ options: [] })
    let filter = new RegExp('^' + value, 'i')
    let result = this.state.tags.filter((t) => filter.test(t))
    this.setState({ options: result })
  }

  renderOptions() {
    return this.state.options.map((o) =>
      <Combobox.Option key={o} value={o}>{o}</Combobox.Option> )
  }
  
  renderFilters() {
    let types = this.state.categories.reduce((m, c) => {
      m[c.type] = [...m[c.type], c]
      return m
    }, {
      'Fysiek': [],
      'Techniek': [],
      'Tactiek': []
    })

    return (
      <fieldset>
        <div style={{marginBottom: '20px'}}>
          <h4>Categorie</h4>
          {
            Object.keys(types).map((t) => {
              return (
                <div key={t} style={{marginBottom: '10px'}}>
                  <div><b>{t}</b></div>
                  { types[t].map((c) => this.renderCategory(c)) }
                </div>
              )
            })
          }
        </div>
        <div>
          <h4>Tags</h4>
          <TokenInput
            menuContent={this.renderOptions()}
            onSelect={this.handleTokenSelect}
            onRemove={this.handleTokenRemove}
            selected={this.state.tokens}
            onInput={this.handleTokenInput}
          />
        </div>
      </fieldset>
    )
  }

  handleAccordionChange(e) {
    let idx = e.activeItems[0]
    if ( idx ) {
      let { selected } = this.state
      let exercise = selected[idx]
      selected[idx] = Object.assign(exercise, {visited: true})
      this.setState({selected: selected})
    }
  }

  render() {
    return (
      <div className='row-fluid'>
        <MediaQuery query='(min-device-width: 768px)'>
          <div className='col-xs-3 col-md-3'>
            { this.renderFilters() }
          </div>
          <div className='col-xs-9 col-md-9'>
            { this.renderExercises() }
          </div>
        </MediaQuery>
        <MediaQuery query='(max-device-width: 667px)'>
          <div className='col-xs-12 col-md-12'>
            { this.renderFilters() }
          </div>
          <div className='col-xs-12 col-md-12'>
            { this.renderExercises() }
          </div>
        </MediaQuery>
      </div>
    )
  }
}

ReactDOM.render( <Exercises />, document.getElementById('app'))
