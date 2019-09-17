import { Mesh } from "three";

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
    constructor( engine, position ) {
        this.engine   = engine;
        this.state    = Field.STATES.EMPTY;
        this.flag     = Field.FLAGS.EMPTY;
        this.position = position;

        this.mesh = new Mesh(
            engine.webGLRenderer.geometries.field,
            engine.webGLRenderer.materials.defaultActive
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
    setState( state ) {
        this.state = state;
        switch ( state ) {
            case Field.STATES.EMPTY:
                this.mesh.material = this.engine.webGLRenderer.materials.defaultActive;
                break;
            case Field.STATES.BOMB:
                this.mesh.material = this.engine.webGLRenderer.materials.defaultActive;
                break;
            case Field.STATES.DISARMED:
                this.mesh.material = this.engine.webGLRenderer.materials.disarmedActive;
                break;
        }
    }

}