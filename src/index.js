import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux'
const deepFreeze = require('deep-freeze');

// List of Reducers
const todo = (state, action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return {
                id: action.id,
                text: action.text,
                completed: false
            };
        case 'TOGGLE_TODO':
            if (state.id === action.id) {
                return {
                    ...state,
                    completed: !state.completed
                };
            } else {
                return state;
            }
        default:
            return state;
    }
};

const todos = (state = [], action) => {
    switch (action.type) {
        case 'ADD_TODO':
            return [...state, todo(null, action)];
        case 'TOGGLE_TODO':
            return state.map(singletodo => todo(singletodo, action));
        default:
            return state;
    }
};

const visibilityFilter = (state = 'SHOW_ALL', action) => {
    switch (action.type) {
        case 'SET_VISIBILITY_FILTER':
            return action.filter;
        default:
            return state;
    }
};

// List of test functions
const testAddTodo = () => {
    const stateBefore = [];
    const action = {
        type: 'ADD_TODO',
        id: 0,
        text: 'Learn Redux'
    }
    const stateAfter = [
        {
            id: 0,
            text: 'Learn Redux',
            completed: false
        },
    ];

    deepFreeze(stateBefore);
    deepFreeze(action);

    expect(todos(stateBefore, action)).toEqual(stateAfter);
}

const testToggleTodo = () => {
    const stateBefore = [{
        id: 0,
        text: 'Learn Redux',
        completed: false
    }, {
        id: 1,
        text: 'Go shopping',
        completed: false
    }];

    const action = {
        type: 'TOGGLE_TODO',
        id: 1
    }

    const stateAfter = [{
        id: 0,
        text: 'Learn Redux',
        completed: false
    }, {
        id: 1,
        text: 'Go shopping',
        completed: true
    }];

    deepFreeze(stateBefore);
    deepFreeze(action);

    expect(todos(stateBefore, action)).toEqual(stateAfter);

}

// testAddTodo();
// testToggleTodo();

// console.log("Passed all test.");

const mainReducers = combineReducers({
    todos: todos,
    visibilityFilter: visibilityFilter
});

// List of Actioners
let todoId = 1;
const addTodo = (text) => {
    return {
        type: 'ADD_TODO',
        id: todoId++,
        text: text
    };
};

const setVisibilityFilter = (filter) => {
    return {
        type: 'SET_VISIBILITY_FILTER',
        filter: filter
    };
};

const toggleTodo = (id) => {
    return {
        type: 'TOGGLE_TODO',
        id: id
    };
};

// List of Presentational Components
// In this case, children refers to the child of FilterLink.
const Link = ({
    active, children, onClick
}) => {
    if (active) {
        return <span>{children}</span>
    }
    return (
        <a href="#"
            onClick={e => {
                e.preventDefault();
                onClick();
            }}>{children}</a>
    );
};

const Todo = ({ onClick, completed, text }) => {
    return (
        <li
            onClick={onClick}
            style={{ textDecoration: completed ? 'line-through' : 'none' }}
        >
            {text}
        </li>
    );
};

const TodoList = ({ todos, onTodoClick }) => {
    return (
        <ul>
            {
                todos.map((todo) =>
                    <Todo
                        key={todo.id}
                        {...todo}
                        onClick={() => onTodoClick(todo.id)}>
                    </Todo>
                )}
        </ul>
    );
};

const Footer = () => {
    return (
        <p>
            Show :
            {' '}
            <FilterLink
                filter='SHOW_ALL'
            >All</FilterLink>
            {' '}
            <FilterLink
                filter='SHOW_ACTIVE'
            >Active</FilterLink>
            {' '}
            <FilterLink
                filter='SHOW_COMPLETED'
            >Completed</FilterLink>
        </p>
    );
};

// Container Component - FilterLink
// props refers to the Container Component props
const mapStateToPropsLink = (state, props) => {
    return {
        active : state.visibilityFilter === props.filter,
    };
};
const mapDispatchToPropsLink = (dispatch, props) => {
    return {
        onClick : () => dispatch(setVisibilityFilter(props.filter))
    };
};
const FilterLink = connect(mapStateToPropsLink, mapDispatchToPropsLink)(Link);

// Container Component - VisibleTodoList
const mapStateToPropsTodoList = (state) => {
    return {
        todos : getVisibleTodos(state.todos, state.visibilityFilter)
    }
}
const mapDispatchToPropsTodoList = (dispatch) => {
    return {
        onTodoClick : (id) => dispatch(toggleTodo(id))
    }
}
const VisibleTodoList = connect(mapStateToPropsTodoList, mapDispatchToPropsTodoList)(TodoList);

// Container Component - AddTodo
const mapStateToPropsAddTodo = (state) => {
    return {};
};
const mapDispatchToPropsAddTodo = (dispatch) => {
    return {
        dispatch : dispatch
    };
};
let AddTodo = ({ dispatch }) => {
    let input;
    return (
        <div>
            <input ref={node => {
                input = node;
            }} />
            <button onClick={
                () => {
                    dispatch(addTodo(input.value));
                    input.value = '';
                }
            }>Add Todo</button>
        </div>
    );
};
AddTodo = connect(mapStateToPropsAddTodo, mapDispatchToPropsAddTodo)(AddTodo);

// Common functions
const getVisibleTodos = (todos, filter) => {
    switch (filter) {
        case 'SHOW_ALL':
            return todos;
        case 'SHOW_COMPLETED':
            return todos.filter(i => i.completed);
        case 'SHOW_ACTIVE':
            return todos.filter(i => !i.completed);
    }
}

const TodoApp = () => {
    return (
        <div>
            <AddTodo />
            <VisibleTodoList />
            <Footer />
        </div>
    );
}

ReactDOM.render(
    <Provider store={createStore(mainReducers)}>
        <TodoApp />
    </Provider>,
    document.getElementById('root')
);