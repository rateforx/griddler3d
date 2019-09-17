import * as THREE from 'three';
import Field from './Field';

export default class Minefield {

    /**
     * Creates an empty object structure.
     * References to fields are saved in two array structures, one is a 3-dimentional array while the other is a regular array.
     * @param settings
     * @param fonts
     */
    constructor ( engine ) {
        this.engine     = engine;
        this.size       = settings.size;
        this.spacing    = settings.spacing;
        this.fonts      = fonts;
        this.bombsCount = Math.floor( Math.pow( this.size, 3 ) * settings.bombs );
        this.object3D   = new THREE.Group();

        this.fields = [];
        let id      = 0;
        let size    = settings.size;

        this.grid = [];

        for ( let i = 0; i < size; i++ ) {

            this.grid[ i ] = [];

            for ( let j = 0; j < size; j++ ) {

                this.grid[ i ][ j ] = [];

                for ( let k = 0; k < size; k++ ) {

                    let field = new Field( this.engine, new THREE.Vector3( i, j, k ) );
                    field.id  = id++;

                    this.object3D.add( field.mesh );
                    this.grid[ i ][ j ].push( field );
                    this.fields.push( field );

                }
            }
        }

        let emptyFields = [ ...this.fields ];
        let bombsLeft   = this.bombsCount;
        while ( bombsLeft > 0 ) {
            let i = Math.floor( Math.random() * emptyFields.length );
            emptyFields[ i ].setState( STATES.BOMB );
            emptyFields.splice( i, 1 );
            bombsLeft--;
        }
    }

    /**
     *
     * @param id
     * @return {Object}
     */
    getColumnsByField ( id ) {
        let position = this.fields[ id ].position;
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
        result.x.sort( ( a, b ) => { return a.x - b.x; } );
        result.y.sort( ( a, b ) => { return a.y - b.y; } );
        result.z.sort( ( a, b ) => { return a.z - b.z; } );
        return result;
    }

    /**
     *
     * @param id
     * @return {Object}
     */
    getPlanesByField ( id ) {
        let position = this.fields[ id ].position;
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