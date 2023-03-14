import './App.css';
import { Component, createRef, Fragment } from 'react';
import DrawingDisplay from './DrawingDisplay';
import { Drawing } from '../api/parseData';
import { Button, FormControl, InputLabel, MenuItem, Select, CssBaseline } from '@mui/material';

interface AppState {
    datasetPath: string;
    drawings: Drawing[];
    numDrawings: number;
    drawingsIndex: number;
}

class App extends Component<any, AppState> {
    viewContainerRef: React.RefObject<HTMLDivElement>;
    constructor(props: any) {
        super(props);
        this.viewContainerRef = createRef<HTMLDivElement>();
        this.state = {
            datasetPath: null,
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
            <div key={drawing.key_id}><DrawingDisplay drawing={drawing}></DrawingDisplay></div>
        );
        const fileName = this.state.datasetPath?.split('\\').at(-1);
        return(<Fragment>
            <CssBaseline />
            <h1 className="title" ref={this.viewContainerRef}>Doodle Viewer!</h1>
            <div className="action-bar">
                <Button variant="contained" onClick={this.openDataset}>{fileName ?? 'Open Dataset'}</Button>
                <FormControl>
                    <InputLabel id="demo-simple-select-label"># Per Page</InputLabel>
                    <Select labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.numDrawings}
                            label="# Per Page"
                            onChange={this.numPerPageChange}>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <h3>{this.state.drawings[0]?.word}</h3>
            <div className="image-container" key={drawingSlice[0] && drawingSlice[0].key_id || 0}>{drawings}</div>
            {this.state.drawings.length > 0 &&
                <div className="page-controls">
                    <Button variant="contained" onClick={() => this.viewIndexChange(this.state.drawingsIndex - 1)} disabled={this.state.drawingsIndex <= 0}>Prev</Button>
                    <Button variant="contained" onClick={() => this.viewIndexChange(this.state.drawingsIndex + 1)} disabled={this.state.drawingsIndex >= Math.floor(this.state.drawings.length / this.state.numDrawings)}>Next</Button>
                </div>
            }
        </Fragment>);
    }

    numPerPageChange(event: any) {
        this.scrollToTop();
        this.setState({ drawingsIndex: 0, numDrawings: parseInt(event.target.value) });
    }

    viewIndexChange(newVal: number) {
        this.scrollToTop();
        this.setState({ drawingsIndex: newVal });
    }

    scrollToTop() {
        this.viewContainerRef.current.scrollIntoView();
    }

    async openDataset() {
        const dataset = await window.electronAPI.openDataset();
        this.setState({
            drawings: dataset.drawings,
            datasetPath: dataset.datasetPath,
            drawingsIndex: 0
        });
    }
}

export default App;