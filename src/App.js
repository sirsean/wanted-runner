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
        display: {
            title: '# :: WANTED ::',
            insideLeft: null,
            insideRight: null,
            outsideText: null,
            showTalent: true,
            showNP: true,
        },
    },
    reducers: {
        setRunner: (state, action) => {
            state.runner = action.payload?.runner;
        },
        updateDisplay: (state, action) => {
            state.display = Object.assign({}, state.display, action.payload);
        },
    },
});

const {
    setRunner,
    updateDisplay,
} = slice.actions;
const store = configureStore({
    reducer: slice.reducer,
});

const selectRunner = state => state.runner;
const selectDisplay = state => state.display;

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
    const formSetTitle = (e) => {
        store.dispatch(updateDisplay({ title: e.target.value }));
    }
    const formSetInsideLeft = (e) => {
        store.dispatch(updateDisplay({ insideLeft: e.target.value }));
    }
    const formSetInsideRight = (e) => {
        store.dispatch(updateDisplay({ insideRight: e.target.value }));
    }
    const formSetOutsideText = (e) => {
        store.dispatch(updateDisplay({ outsideText: e.target.value }));
    }
    const formSetShowTalent = (e) => {
        store.dispatch(updateDisplay({ showTalent: e.target.checked }));
    }
    const formSetShowNP = (e) => {
        store.dispatch(updateDisplay({ showNP: e.target.checked }));
    }
    const display = useSelector(selectDisplay);
    return (
        <div className="Form">
            <table>
                <tbody>
                    <tr>
                        <th>Runner ID</th>
                        <td><input type="text" onChange={debounce(formSetRunnerId, 400)} /></td>
                    </tr>
                    <tr>
                        <th>Title</th>
                        <td>
                            <textarea rows="3" onChange={formSetTitle} defaultValue={display.title} />
                        </td>
                    </tr>
                    <tr>
                        <th>Inside Left</th>
                        <td>
                            <textarea rows="3" onChange={formSetInsideLeft} />
                        </td>
                    </tr>
                    <tr>
                        <th>Inside Right</th>
                        <td>
                            <textarea rows="3" onChange={formSetInsideRight} />
                        </td>
                    </tr>
                    <tr>
                        <th>Outside</th>
                        <td>
                            <textarea rows="14" onChange={formSetOutsideText} />
                        </td>
                    </tr>
                    <tr>
                        <th>Show Talent</th>
                        <td>
                            <input type="checkbox" checked={display.showTalent} onChange={formSetShowTalent} />
                        </td>
                    </tr>
                    <tr>
                        <th>Show NP</th>
                        <td>
                            <input type="checkbox" checked={display.showNP} onChange={formSetShowNP} />
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
    const display = useSelector(selectDisplay);
    if (runner) {
        const talent = runner.attributes.Talent;
        const notoriety = runner.attributes['Notoriety Points'];
        return (
            <div>
                <div className="Poster">
                    <div className="title"><Sanitized value={display.title} /></div>
                    <div className="imgWrapper">
                        <img className="runner" src={runner.image} alt={runner.name} />
                        <span className="runner-id">{runner.id}</span>
                        <span className="talent">
                            {display.showTalent && <span>T{talent}</span>}
                            {display.showTalent && display.showNP && <br />}
                            {display.showNP && <span className="notoriety">NP {notoriety}</span>}
                        </span>
                        {display.insideLeft && <span className="inside-text inside-left"><Sanitized value={display.insideLeft} /></span>}
                        {display.insideRight && <span className="inside-text inside-right"><Sanitized value={display.insideRight} /></span>}
                    </div>
                    <div className="outside-text"><Sanitized value={display.outsideText} /></div>
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
