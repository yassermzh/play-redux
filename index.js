import { createStore, applyMiddleware } from 'redux'

// actions
const ADD_TODO = 'ADD_TODO'
const GET_TODO = 'GET_TODO'
const GET_TODO_SUCCESS = 'GET_TODO_SUCCESS'
const UNDO = 'UNDO'
const UNDO_SUCCESS = 'UNDO_SUCESS'
const API = 'API'
const API_REQUEST = 'API_REQUEST'
const API_SUCCESS = 'API_SUCCESS'
const REDIRECT = 'REDIRECT'


// action creator
const addTodo = (content, delay) => ({ type: ADD_TODO, content, meta: { delay } })
const getTodos = () => ({ type: GET_TODO })
const getTodosSuccess = (todos) => ({ type: GET_TODO_SUCCESS, todos })
const undo = () => ({ type: UNDO })
const undoSuccess = (state) => ({ type: UNDO_SUCCESS, state })
const api = (url, key) => ({ type: API, url, meta: { key } })
const apiRequest = () => ({ type: API_REQUEST })
const apiSuccess = (content, key) => ({ type: API_SUCCESS, content, meta: { key } })
const redirect = () => ({ type: REDIRECT })

// mock fetch
const fetch = () => { return Promise.resolve(['this', 'that']) }

const apiMiddleware = store => next => action => {
  if(action.type == API){
    next(apiRequest())
    fetch(action.url)
    .then(result => {
      next(apiSuccess(result, action.meta.key))
    })
  }
}

const authMiddleware = store => next => action => {
  if(action.type == API){
    if(getToken())
      return next(action)
    else
      return next(redirect())
  }
  else
    return next(action)
}

// mock localStorage
const localStorage = { getItem: () => ['this-cached', 'that-cached'] }

const getToken = () => null

// populate with stored data
const initialValue = { todos: localStorage.getItem('todos') }

// should be pure!
const reducer = (state = initialValue, action) => {
  if (action.type == ADD_TODO)
    return { todos: [...state.todos, action.content] }
  else if (action.type == API_REQUEST)
    return { fetching: true }
  else if (action.type == API_SUCCESS)
    return { [action.meta.key]: action.content, fetching: false }
  else if (action.type == UNDO_SUCCESS)
    return action.state
  
  else
    return state
}

const logger = store => next => action => { // eslint-disable-line no-unused-vars
  console.log('logger> action=', action)
  return next(action)
}

const undoList = []
const undoMiddleware = store => next => action => {
  if (action.type==UNDO) {
    const prevState = undoList.pop() // eslint-disable-line no-unused-vars
    console.log('back to ', prevState)
    return next(undoSuccess(prevState))
  }
  undoList.push(store.getState())
  const result = next(action)
  return result
}

const delayMiddleware = store => next => action => { // eslint-disable-line no-unused-vars
  if (action.meta && action.meta.delay) {
    setTimeout(() => {
      next(action)
    }, action.meta.delay)   
  }
  else {
    return next(action)
  }
}

const store = createStore(reducer, applyMiddleware(
  authMiddleware, 
  undoMiddleware, 
  delayMiddleware, 
  apiMiddleware, 
  logger
))

store.subscribe(() => {
  console.log('store\'s state=', store.getState())
})

//store.dispatch(addTodo('do this'))
//store.dispatch(undo())
//store.dispatch(addTodo('do that', 1000))
//store.dispatch(undo())
store.dispatch(api('/api/users', 'users'))

// action -> middleware -> ... -> store -> view
