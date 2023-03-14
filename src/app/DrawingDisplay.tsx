import { Card, CardContent, CardMedia, Typography, Zoom } from '@mui/material';
import CardHeader from '@mui/material/CardHeader';
import Tooltip from '@mui/material/Tooltip';
import { Component, createRef, useRef} from 'react';
import { Drawing } from '../api/parseData';

interface PropTypes {
    drawing: Drawing;
}

interface StateTypes {
    imageData: string;
}

class DrawingDisplay extends Component<PropTypes, StateTypes> {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    imageRef: React.RefObject<HTMLImageElement>;
    constructor(props: PropTypes) {
        super(props);
        this.canvasRef = createRef<HTMLCanvasElement>();
        this.state = {
            imageData: ''
        };
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
        this.setState({ imageData: canvas.toDataURL('image/png') });
    }

    render() {
        return (
            <Card>
                <CardMedia sx={{ height: 256, width: 256}} image={this.state.imageData}>
                    <canvas ref={this.canvasRef} width="256" height="256" hidden={true}></canvas>
                </CardMedia>
                <CardContent>
                    <Tooltip TransitionComponent={Zoom} title="Recognized?" placement="top">
                        <Typography gutterBottom variant="h5" component="div">{String(this.props.drawing.recognized)}</Typography>   
                    </Tooltip>
                    <Typography variant="body2" color="text.secondary">
                        {this.props.drawing.countrycode}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {this.props.drawing.timestamp}
                    </Typography>
                </CardContent>
            </Card>
        );
    }
}

export default DrawingDisplay;