import { Component, createRef, useRef} from 'react';
import { Drawing } from '../api/parseData';

interface PropTypes {
    drawing: Drawing;
}

class DrawingDisplay extends Component<PropTypes> {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    constructor(props: PropTypes) {
        super(props);
        this.canvasRef = createRef<HTMLCanvasElement>();
    }

    async componentDidMount() {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        // fill with black
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,255,255);

        ctx.strokeStyle = 'black';
        for(const stroke of this.props.drawing.drawing) {
            const x_array = stroke[0];
            const y_array = stroke[1];
            ctx.beginPath();
            ctx.moveTo(x_array[0], y_array[0]);
            for(let i = 1; i < x_array.length; i++) {
                ctx.lineTo(x_array[i], y_array[i]);
            }
            ctx.stroke();
        }
    }

    render() {
        return (
            <canvas ref={this.canvasRef} width="256" height="256"></canvas>
        );
    }
}

export default DrawingDisplay;