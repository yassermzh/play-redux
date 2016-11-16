import { createStore, applyMiddleware } from 'redux'

// actions
const ADD_TODO = 'ADD_TODO'
const GET_TODO = 'GET_TODO'
const GET_TODO_SUCCESS = 'GET_TODO_SUCCESS'

// action creator
const addTodo = (content) => ({ type: ADD_TODO, content })
const getTodos = () => ({ type: GET_TODO })
const getTodosSuccess = (todos) => ({ type: GET_TODO_SUCCESS, todos })

// mock fetch
const fetch = () => { return Promise.resolve(['this', 'that']) }

const fetchTodos = (store) => {
  store.dispatch(getTodos())
  return fetch('/api/todos')
    .then(todos => {
      store.dispatch(getTodosSuccess(todos))
    })
}

const initialValue = { todos: [] }

// should be pure!
const reducer = (state = initialValue, action) => {
  if (action.type == ADD_TODO)
    return { todos: [...state.todos, action.content] }
  else if (action.type == GET_TODO)
    return { fetching: true }
  else if (action.type == GET_TODO_SUCCESS)
    return { todos: action.todos, fetching: false }
  else
    return state
}

const logger = store => next => action => { // eslint-disable-line no-unused-vars
  console.log('logger> action=', action)
  return next(action)
}

const store = createStore(reducer, applyMiddleware(logger))

store.subscribe(() => {
  console.log('store\'s state=', store.getState())
})

fetchTodos(store)
  .then(() => {
    store.dispatch(addTodo('do this'))
    store.dispatch(addTodo('do that'))
  })
