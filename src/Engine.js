import Renderer from './Renderer';
import Minefield from './Minefield';
import Controls from './Controls';
import { GUI } from 'dat.gui';
import { Color, Sphere } from 'three';

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
                console.log( 'restart' );
                this.renderer.scene.remove( this.minefield.mesh );
                this.start();
            }
        };

        this.renderer = new Renderer( this );

        this.gui      = new GUI();
        this.guiScene = this.gui.addFolder( 'Scene' );
        this.guiGame  = this.gui.addFolder( 'Game' );

        this.guiScene.addColor( this.settings, 'backgroundColor' ).onChange( value => {
            this.renderer.scene.background = new Color( value );
        } );
        this.guiScene.add( this.settings, 'spacing', 1.1, 5 ).onChange( value => {

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

    loadAssets() {
        this.renderer.loaders.fontLoader.load( 'fonts/saira_stencil_one_regular.json', font => {
            this.renderer.fonts.saira = font;
        } );
    }

    start () {
        this.minefield = new Minefield( this );
        this.controls = new Controls( this );
        this.renderer.draw();
        this.renderer.camera.position
            .set( 1, 1, -1 )
            .multiplyScalar( this.settings.size + this.settings.spacing )
        ;
    }

}