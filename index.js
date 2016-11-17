import { createStore, applyMiddleware } from 'redux'

// actions
const ADD_TODO = 'ADD_TODO'
const GET_TODO = 'GET_TODO'
const GET_TODO_SUCCESS = 'GET_TODO_SUCCESS'
const UNDO = 'UNDO'
const UNDO_SUCCESS = 'UNDO_SUCESS'

// action creator
const addTodo = (content, delay) => ({ type: ADD_TODO, content, meta: { delay } })
const getTodos = () => ({ type: GET_TODO })
const getTodosSuccess = (todos) => ({ type: GET_TODO_SUCCESS, todos })
const undo = () => ({ type: UNDO })
const undoSuccess = (state) => ({ type: UNDO_SUCCESS, state })

// mock fetch
const fetch = () => { return Promise.resolve(['this', 'that']) }

const fetchTodos = (store) => {
  if (store.getState().todos.length > 0) return Promise.resolve()
  store.dispatch(getTodos())
  return fetch('/api/todos')
    .then(todos => {
      store.dispatch(getTodosSuccess(todos))
    })
}

// mock localStorage
const localStorage = { getItem: () => ['this-cached', 'that-cached'] }

// populate with stored data
const initialValue = { todos: localStorage.getItem('todos') }

// should be pure!
const reducer = (state = initialValue, action) => {
  if (action.type == ADD_TODO)
    return { todos: [...state.todos, action.content] }
  else if (action.type == GET_TODO)
    return { fetching: true }
  else if (action.type == GET_TODO_SUCCESS)
    return { todos: action.todos, fetching: false }
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

const store = createStore(reducer, applyMiddleware(logger, undoMiddleware, delayMiddleware))

store.subscribe(() => {
  console.log('store\'s state=', store.getState())
})

fetchTodos(store)
  .then(() => {
    store.dispatch(addTodo('do this'))
    store.dispatch(undo())
    store.dispatch(addTodo('do that', 1000))
    store.dispatch(undo())
  })

// action -> middleware -> ... -> store -> view
