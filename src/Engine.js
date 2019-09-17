import Renderer from './Renderer';
import Minefield from './Minefield';
import Controls from './Controls';

export default class Engine {

    constructor () {

        this.settings = {
            // scene
            backgroundColor : '#111',
            spacing         : 2,
            // game
            size            : 4,
            bombs           : .5,
            restart         : () => {
                resetGame();
                initGame();
            }
        };

        this.renderer = new Renderer( this );
        this.minefield = new Minefield( this );
        this.controls = new Controls( this );

    }

}