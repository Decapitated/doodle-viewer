import PImage from "pureimage";
import fs from 'fs';
import ndjson from 'ndjson';

export interface Drawing {
    key_id:      string,      // 64-bit unsigned integer. A unique identifier across all drawings.
    word:        string,      // Category the player was prompted to draw.
    recognized:  boolean,     // Whether the word was recognized by the game.
    timestamp:   string,      // When the drawing was created.
    countrycode: string,      // A two letter country code (ISO 3166-1 alpha-2) of where the player was located.
    drawing:     number[][][] // A JSON array representing the vector drawing
    /* The format of the drawing array is as following:
        [ 
            [  // First stroke 
                [x0, x1, x2, x3, ...],
                [y0, y1, y2, y3, ...],
                [t0, t1, t2, t3, ...]
            ],
            [  // Second stroke
                [x0, x1, x2, x3, ...],
                [y0, y1, y2, y3, ...],
                [t0, t1, t2, t3, ...]
            ],
            ... // Additional strokes
        ]
    */
}

export function parseSimplifiedDrawings(fileName: string) {
    return new Promise<Drawing[]>((resolve, reject) => {
        var drawings: Drawing[] = [];
        var fileStream = fs.createReadStream(fileName)
        fileStream
        .pipe(ndjson.parse())
        .on('data', function(obj: Drawing) {
            drawings.push(obj)
        })
        .on("error", (e: Error) => {
            reject(e);
        })
        .on("end", function() {
            resolve(drawings);
        });
    });
    
}

export function drawStrokes(identifier: string, d: Drawing) {
    return new Promise((resolve, reject) => {
        const image = PImage.make(256, 256);
        const ctx = image.getContext('2d');
        // fill with black
        ctx.fillStyle = 'white';
        ctx.fillRect(0,0,256,256);

        ctx.strokeStyle = 'black';
        for(const stroke of d.drawing) {
            const x_array = stroke[0];
            const y_array = stroke[1];
            ctx.beginPath();
            ctx.moveTo(x_array[0], y_array[0]);
            for(let i = 1; i < x_array.length; i++) {
                ctx.lineTo(x_array[i], y_array[i]);
            }
            ctx.stroke();
        }

        //write to 'out.png'
        const writeStream = fs.createWriteStream(`./temp/out-${d.key_id}.png`);
        PImage.encodePNGToStream(image, writeStream).then(() => {
            console.log(`wrote out the png file to ${writeStream.path}`);
            var _img = fs.readFileSync(writeStream.path).toString('base64');
            resolve(_img);
        }).catch((e: any)=>{
            console.error("there was an error writing");
            reject(e);
        });
    });
}