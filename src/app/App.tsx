import './App.css';
import { Component } from 'react';
import DrawingDisplay from './DrawingDisplay';
import { Drawing } from '../api/parseData';

interface AppState {
    drawings: Drawing[];
    numDrawings: number;
    drawingsIndex: number;
}

class App extends Component<any, AppState> {
    constructor(props: any) {
        super(props);
        this.state = {
            drawings: [],
            numDrawings: 10,
            drawingsIndex: 0
        } as AppState;
        this.openDataset = this.openDataset.bind(this);
        this.numPerPageChange = this.numPerPageChange.bind(this);
    }

    render() {
        const sliceStart = this.state.drawingsIndex * this.state.numDrawings;
        const sliceEnd = sliceStart + this.state.numDrawings;
        const drawingSlice = this.state.drawings.slice(sliceStart, sliceEnd);
        const drawings = drawingSlice.map((drawing) =>
            <div><DrawingDisplay drawing={drawing}></DrawingDisplay></div>
        );
        return(<div className="app-body">
            <h2>Hello world!</h2>
            <div>
                <button type="button" id="btn" onClick={this.openDataset}>Open Dataset</button>
                <label>
                    <span>Drawings/Page</span>
                    <select onChange={this.numPerPageChange} value={this.state.numDrawings}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </label>
                {this.state.drawingsIndex > 0 &&
                    <button onClick={() => this.viewIndexChange(this.state.drawingsIndex - 1)}>Prev</button>}
                {this.state.drawingsIndex < Math.floor(this.state.drawings.length / this.state.numDrawings) &&
                    <button onClick={() => this.viewIndexChange(this.state.drawingsIndex + 1)}>Next</button>}
            </div>
            <div className="image-container" key={drawingSlice[0] && drawingSlice[0].key_id || 0}>{drawings}</div>
        </div>);
    }

    numPerPageChange(event: any) {
        this.setState({ numDrawings: parseInt(event.target.value) });
    }

    viewIndexChange(newVal: number) {
        this.setState({ drawingsIndex: newVal });
    }

    async openDataset() {
        const dataset = await window.electronAPI.openDataset();
        this.setState({ drawings: dataset });
    }
}

export default App;