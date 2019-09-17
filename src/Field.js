import * as THREE from 'three';

export default class Field {

    static STATES = {
        EMPTY    : 'empty',
        BOMB     : 'bomb',
        DISARMED : 'disarmed',
    };

    static FLAGS = {
        EMPTY   : 'empty',
        FLAGGED : 'flagged',
        UNKNOWN : 'unknown',
    };

    /**
     *
     * @param engine {Engine}
     * @param position {Vector3}
     */
    constructor ( engine, position ) {
        this.engine   = engine;
        this.grid     = engine.minefield.grid;
        this.id       = id;
        this.state    = Field.STATES.EMPTY;
        this.flag     = Field.FLAGS.EMPTY;
        this.position = position;

        this.mesh = new THREE.Mesh(
            engine.renderer.geometries.field,
            engine.renderer.materials.defaultActive
        );

        this.mesh.name       = 'Field';
        this.mesh.castShadow = true;
        this.mesh.position.copy( this.position ).multiplyScalar( grid.spacing );
        this.mesh.userData.field = this;
    }

    /**
     *
     * @param state
     */
    setState ( state ) {
        this.state = state;
        switch ( state ) {
            case Field.STATES.EMPTY:
                this.mesh.material = this.engine.renderer.materials.defaultActive;
                break;
            case Field.STATES.BOMB:
                this.mesh.material = this.engine.renderer.materials.defaultActive;
                break;
            case Field.STATES.DISARMED:
                this.mesh.material = this.engine.renderer.materials.disarmedAcitve;
                break;
        }
    }

}