import * as THREE from 'three';

export const STATES = {
    EMPTY    : 'empty',
    BOMB     : 'bomb',
    DISARMED : 'disarmed',
};

export const FLAGS = {
    EMPTY   : 'empty',
    FLAGGED : 'flagged',
    UNKNOWN : 'unknown',
};

export class Field {

    /**
     *
     * @param id {Number}
     * @param position {Vector3}
     * @param state {STATES}
     */
    constructor ( grid, id, position ) {
        this.grid     = grid;
        this.id       = id;
        this.state    = STATES.EMPTY;
        this.flag     = FLAGS.EMPTY;
        this.position = position;

        let geometry = new THREE.BoxBufferGeometry();
        let material = new THREE.MeshStandardMaterial( {
            opacity     : .5,
            transparent : true,
        } );

        this.boxMesh = new THREE.Mesh( geometry, material );

        this.boxMesh.name       = 'Field';
        this.boxMesh.castShadow = true;
        this.boxMesh.position.copy( this.position ).multiplyScalar( grid.spacing );
        this.boxMesh.userData.field = this;

        let idMesh = new THREE.Mesh(
            new THREE.TextBufferGeometry( this.id, {
                font           : grid.fonts[ 0 ],
                curveSegments  : 64,
                bevelEnabled   : true,
                bevelThickness : 1.5,
                bevelSize      : .5,
                bevelSegments  : 8,
            } ),
            material
        );
        idMesh.name = 'ID';
        this.boxMesh.add( idMesh );

    }

    setState( state ) {
        this.state = state;
        switch ( state ) {
            case STATES.EMPTY:
                this.boxMesh.material.color.set( 'white' );
                break;
            case STATES.BOMB:
                this.boxMesh.material.color.set( 'red' );
                break;
            case STATES.DISARMED:
                this.boxMesh.material.color.set( 'green' );
                break;
        }
    }

}