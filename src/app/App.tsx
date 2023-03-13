import './App.css';
import { Component } from 'react';
import { Drawing } from '../api/parseData';

interface AppState {
    drawings: Drawing[];
    numDrawings: number;
    drawingsIndex: number;
    imageData: []
}

class App extends Component {
    constructor(props: any) {
        super(props);
        this.state = {
            drawings: [],
            numDrawings: 10,
            drawingsIndex: 0,
            imageData: []
        };
        this.openDataset = this.openDataset.bind(this);
        this.numPerPageChange = this.numPerPageChange.bind(this);
    }

    getState() {
        return this.state as AppState;
    }

    render() {
        const state = this.getState();
        const images = state.imageData.map((imageData, index) => {
            return <div key={`img-${index}`}><img src={`data:image/png;base64,${imageData}`}></img></div>;
        });
        return(<div className="app-body">
            <h2>Hello world!</h2>
            <div>
                <button type="button" id="btn" onClick={this.openDataset}>Open Dataset</button>
                <label>
                    <span>Drawings/Page</span>
                    <select onChange={this.numPerPageChange} value={state.numDrawings}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </label>
                {state.drawingsIndex > 0 &&
                    <button onClick={() => {
                        console.log("drawingsIndex changed - 1.");
                        const newIndex = state.drawingsIndex - 1;
                        this.setState({ drawingsIndex: newIndex });
                        this.getImages(state.drawings, newIndex, state.numDrawings);
                    }}>Prev</button>}
                {state.drawingsIndex < Math.floor(state.drawings.length / state.numDrawings) &&
                    <button onClick={() => {
                        console.log("drawingsIndex changed + 1.");
                        const newIndex = state.drawingsIndex + 1;
                        this.setState({ drawingsIndex: newIndex });
                        this.getImages(state.drawings, newIndex, state.numDrawings);
                    }}>Next</button>}
            </div>
            <div className="image-container">{images}</div>
        </div>);
    }

    numPerPageChange(event: any) {
        const state = this.getState();
        this.setState({ numDrawings: event.target.value });
        console.log("numPerPAge changed.");
        this.getImages(state.drawings, state.drawingsIndex, event.target.value);
    }

    async openDataset() {
        const dataset = await window.electronAPI.openDataset();
        const state = this.getState();
        this.setState({ drawings: dataset });
        this.getImages(dataset, state.drawingsIndex, state.numDrawings);
    }

    async getImages(drawings: Drawing[], index: number, numImages: number) {
        console.log("Getting image data");
        const state = this.getState();
        const sliceStart = index * numImages;
        const sliceEnd = sliceStart + numImages;
        const drawSplice = drawings.slice(sliceStart, sliceEnd);
        const images = [];
        for(const [i, drawing] of drawSplice.entries()) {
            const relativeIndex = (i % state.numDrawings);
            images.push(await window.electronAPI.outputDrawing(relativeIndex+"", drawing));
        }
        this.setState({
            imageData: images
        });
    }   
}

export default App;