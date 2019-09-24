import { Mesh } from 'three';

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

export default class Field {

    /**
     *
     * @param engine {Engine}
     * @param position {Vector3}
     */
    constructor ( engine, position ) {
        this.engine   = engine;
        this.state    = STATES.EMPTY;
        this.flag     = FLAGS.EMPTY;
        this.position = position;

        this.mesh = new Mesh(
            engine.renderer.geometries.field,
            engine.renderer.materials.defaultActive
        );

        this.mesh.name       = 'Field';
        this.mesh.castShadow = true;
        this.mesh.position.copy( this.position ).multiplyScalar( engine.settings.spacing );
        this.mesh.userData.field = this;
    }

    /**
     *
     * @param state
     */
    setState ( state ) {
        this.state = state;
        switch ( state ) {
            case STATES.EMPTY:
                this.mesh.material = this.engine.renderer.materials.defaultActive;
                break;
            case STATES.BOMB:
                this.mesh.material = this.engine.renderer.materials.defaultActive;
                break;
            case STATES.DISARMED:
                this.mesh.material = this.engine.renderer.materials.disarmedActive;
                break;
        }
    }

}