import Renderer from './Renderer';
import Minefield from './Minefield';
import Controls from './Controls';
import { GUI } from "dat.gui";
import { Color } from "three";

export default class Engine {

    constructor() {

        this.settings = {
            // scene
            backgroundColor : '#111',
            spacing         : 2,
            // game
            size            : 4,
            bombs           : .5,
            restart         : this.start
        };

        this.renderer = new Renderer( this );
        this.controls = new Controls( this );

        this.gui      = new GUI();
        this.guiScene = gui.addFolder( 'Scene' );
        this.guiGame  = gui.addFolder( 'Game' );

        this.guiScene.addColor( this.settings, 'backgroundColor' ).onChange( value => {
            this.renderer.webGLRenderer.scene.background = new Color( value );
        } );
        this.guiScene.add( this.settings, 'spacing', 1, 5 ).onChange( value => {

            for ( let field of this.minefield.fields ) {
                field.mesh.position.copy( field.position ).multiplyScalar( value );
            }

        } );
        this.guiScene.open();

        this.guiGame.add( this.settings, 'size' ).min( 2 ).max( 10 ).step( 1 );
        this.guiGame.add( this.settings, 'bombs' ).min( .1 ).max( .9 ).step( .01 );
        this.guiGame.add( this.settings, 'restart' );
        this.guiGame.open();

        this.gui.open();

    }

    start() {
        this.minefield = new Minefield( this );
    }

}