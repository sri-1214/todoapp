import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import axios from 'axios';

export function TODO() {
    const [newTodo, setNewTodo] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        fetchTodo();
    }, []);

    const fetchTodo = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/todo');
            setTodoData(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching todos:', error);
            setLoading(false);
        }
    };

    const addTodo = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/todo', {
                title: newTodo,
                description: '', 
                done: false, 
            });
            setTodoData(prevData => [...prevData, response.data.newTodo]);
            setNewTodo('');
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/todo/${id}`);
            setTodoData(prevData => prevData.filter(todo => todo._id !== id));
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const updateTodo = async (id) => {
        try {
            const todoToUpdate = todoData.find(todo => todo._id === id);
            if (!todoToUpdate) {
                console.error('Todo not found:', id);
                return;
            }

            const updatedTodo = await axios.patch(`http://localhost:8000/api/todo/${id}`, {
                done: !todoToUpdate.done,
            });
            setTodoData(todoData.map(todo => (todo._id === id ? updatedTodo.data : todo)));
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    };

    const editTodo = (id) => {
        setEditId(id);
        const todoToEdit = todoData.find(todo => todo._id === id);
        setEditTitle(todoToEdit.title);
        setEditDescription(todoToEdit.description);
    };

    const saveTodo = async (id) => {
        try {
            const updatedTodo = await axios.put(`http://localhost:8000/api/todo/${id}`, {
                title: editTitle,
                description: editDescription,
            });
            setTodoData(todoData.map(todo => (todo._id === id ? updatedTodo.data : todo)));
            setEditId(null);
            setEditTitle('');
            setEditDescription('');
        } catch (error) {
            console.error('Error saving todo:', error);
        }
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        value={newTodo}
                        onChange={event => setNewTodo(event.target.value)}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={addTodo}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : todoData.length > 0 ? (
                    todoData.map(todo => (
                        <div key={todo._id} className={Styles.todo}>
                            {editId === todo._id ? (
                                <span className={Styles.infoContainer}>
                                    <input
                                        type='text'
                                        value={editTitle}
                                        onChange={event => setEditTitle(event.target.value)}
                                    />
                                    <textarea
                                        className={Styles.descriptionInput}
                                        value={editDescription}
                                        onChange={event => setEditDescription(event.target.value)}
                                    />
                                    <button onClick={() => saveTodo(todo._id)}>Save</button>
                                </span>
                            ) : (
                                <span className={Styles.infoContainer}>
                                    <input
                                        type='checkbox'
                                        checked={todo.done}
                                        onChange={() => updateTodo(todo._id)}
                                    />
                                    {todo.title} - {todo.description}
                                </span>
                            )}
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => deleteTodo(todo._id)}
                            >
                                Delete
                            </span>
                            <span
                                style={{ cursor: 'pointer' }}
                                onClick={() => editTodo(todo._id)}
                            >
                                Edit
                            </span>
                        </div>
                    ))
                ) : (
                    <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                )}
            </div>
        </div>
    );
}
