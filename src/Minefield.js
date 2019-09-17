import Field from './Field';
import { Group, Vector3 } from "three";

export default class Minefield {

    /**
     * Creates an empty object structure.
     * References to fields are saved in two array structures, one is a 3-dimentional array while the other is a regular array.
     * @param engine {Engine}
     */
    constructor( engine ) {
        this.engine     = engine;
        this.size       = engine.settings.size;
        this.spacing    = engine.settings.spacing;
        this.bombsCount = Math.floor( Math.pow( this.size, 3 ) * this.engine.settings.bombs );
        this.mesh       = new Group();
        this.fields     = [];
        this.grid       = [];

        let id = 0;

        for ( let i = 0; i < size; i++ ) {

            this.grid[ i ] = [];

            for ( let j = 0; j < size; j++ ) {

                this.grid[ i ][ j ] = [];

                for ( let k = 0; k < size; k++ ) {

                    let field = new Field( this.engine, new Vector3( i, j, k ) );
                    field.id  = id++;

                    this.mesh.add( field.mesh );
                    this.grid[ i ][ j ].push( field );
                    this.fields.push( field );

                }
            }
        }

        this.center();

        let emptyFields = [ ...this.fields ];
        let bombsLeft   = this.bombsCount;
        while ( bombsLeft > 0 ) {
            let i = Math.floor( Math.random() * emptyFields.length );
            emptyFields[ i ].setState( Field.STATES.BOMB );
            emptyFields.splice( i, 1 );
            bombsLeft--;
        }

        engine.webGLRenderer.scene.add( this.mesh );
    }

    center() {
        this.mesh.position.subScalar(
            ( this.size - 1 ) * this.engine.settings.spacing / 2
        );
    }

    /**
     *
     * @return {Object}
     * @param field
     */
    getColumnsByField( field ) {
        let position = field.position;
        let result   = {
            x : [],
            y : [],
            z : [],
        };
        for ( let field of this.fields ) {
            if ( field.position.y === position.y && field.position.z === position.z ) {
                result.x.push( field );
            }
            if ( field.position.x === position.x && field.position.z === position.z ) {
                result.y.push( field );
            }
            if ( field.position.x === position.x && field.position.y === position.y ) {
                result.z.push( field );
            }
        }
        result.x.sort( ( a, b ) => {
            return a.x - b.x;
        } );
        result.y.sort( ( a, b ) => {
            return a.y - b.y;
        } );
        result.z.sort( ( a, b ) => {
            return a.z - b.z;
        } );
        return result;
    }

    /**
     *
     * @return {Object}
     * @param field
     */
    getPlanesByField( field ) {
        let position = field.position;
        let result   = {
            x : [],
            y : [],
            z : [],
        };
        for ( let field of this.fields ) {
            if ( field.position.x === position.x ) {
                result.x.push( field );
            }
            if ( field.position.y === position.y ) {
                result.y.push( field );
            }
            if ( field.position.z === position.z ) {
                result.z.push( field );
            }
        }
        return result;
    }
}