import { createStore, applyMiddleware } from 'redux'

// actions
const ADD_TODO = 'ADD_TODO'

// action creator
const addTodo = (content) => ({ type: ADD_TODO, content })

const initialValue = { todos: [] }

// should be pure!
const reducer = (state = initialValue, action) => {
  if (action.type == ADD_TODO)
    return { todos: [...state.todos, action.content] }
}

const store = createStore(reducer)

store.subscribe(() => {
  console.log('store\'s state=', store.getState())
})

store.dispatch(addTodo('do this'))
store.dispatch(addTodo('do that'))
