import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { createSlice, configureStore } from '@reduxjs/toolkit';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { debounce } from 'debounce';
import './App.css';

const slice = createSlice({
    name: 'wanted-runner',
    initialState: {
        runner: null,
        insideText: null,
        outsideText: null,
    },
    reducers: {
        setRunner: (state, action) => {
            state.runner = action.payload?.runner;
        },
        setInsideText: (state, action) => {
            state.insideText = action.payload;
        },
        setOutsideText: (state, action) => {
            state.outsideText = action.payload;
        },
    },
});

const {
    setRunner,
    setInsideText,
    setOutsideText,
} = slice.actions;
const store = configureStore({
    reducer: slice.reducer,
});

const selectRunner = state => state.runner;
const selectInsideText = state => state.insideText;
const selectOutsideText = state => state.outsideText;

async function fetchRunner(runnerId) {
    fetch(`https://2112-api.sirsean.workers.dev/runner/${runnerId}`)
        .then(r => r.json())
        .then(runner => {
            console.log(runner);
            store.dispatch(setRunner({ runner }));
        });
}

function Form() {
    const formSetRunnerId = (e) => {
        store.dispatch(setRunner()); // clear the runner before loading new one
        fetchRunner(e.target.value);
    }
    const formSetInsideText = (e) => {
        store.dispatch(setInsideText(e.target.value));
    }
    const formSetOutsideText = (e) => {
        store.dispatch(setOutsideText(e.target.value));
    }
    return (
        <div className="Form">
            <table>
                <tbody>
                    <tr>
                        <th>Runner ID</th>
                        <td><input type="text" onChange={debounce(formSetRunnerId, 400)} /></td>
                    </tr>
                    <tr>
                        <th>Inside</th>
                        <td>
                            <textarea rows="3" onChange={formSetInsideText} />
                        </td>
                    </tr>
                    <tr>
                        <th>Outside</th>
                        <td>
                            <textarea rows="14" onChange={formSetOutsideText} />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function Sanitized({ value }) {
    if (value) {
        const options = {
            gfm: true,
            breaks: true,
        };
        const sanitized = { __html: sanitizeHtml(marked.parse(value, options)) };
        return (
            <span dangerouslySetInnerHTML={sanitized} />
        );
    }
}

function Poster() {
    const runner = useSelector(selectRunner);
    const insideText = useSelector(selectInsideText);
    const outsideText = useSelector(selectOutsideText);
    if (runner) {
        const talent = runner.attributes.Talent;
        const notoriety = runner.attributes['Notoriety Points'];
        return (
            <div>
                <div className="Poster">
                    <h1>:: Wanted ::</h1>
                    <div className="imgWrapper">
                        <img className="runner" src={runner.image} alt={runner.name} />
                        <span className="runner-id">{runner.id}</span>
                        <span className="talent">T{talent}<br /><span className="notoriety">NP {notoriety}</span></span>
                        {insideText && <span className="inside-text"><Sanitized value={insideText} /></span>}
                    </div>
                    <div className="outside-text"><Sanitized value={outsideText} /></div>
                </div>
                <p className="bottom-copy">screenshot it to share</p>
            </div>
        );
    }
}

function Main() {
    return (
        <div className="Main">
            <div className="row">
                <div className="left">
                    <h1>wanted-runner</h1>
                    <Form />
                </div>
                <div className="right">
                    <Poster />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <Main />
            </div>
        </Provider>
    );
}

export default App;
