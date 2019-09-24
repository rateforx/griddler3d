import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raycaster, Vector2 } from 'three';

export const PLANES = {
    X : 'x',
    Y : 'y',
    Z : 'z',
};

export default class Controls {

    constructor ( engine ) {
        this.engine = engine;

        this.scene       = engine.renderer.scene;
        this.camera      = engine.renderer.camera;
        this.renderer    = engine.renderer.webGLRenderer;
        this.outlinePass = engine.renderer.outlinePass;

        this.currentPlane = PLANES.Y;
        this.currentLayer = 0;

        // controls
        this.orbitControls               = new OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = .05;
        this.orbitControls.enableZoom    = false;

        this.selectedObjects = [];
        this.raycaster       = new Raycaster();
        this.mouse           = new Vector2();

        $( document ).mousewheel( e => {
            if ( e.deltaY > 0 ) {
                this.currentLayer++;
                if ( this.currentLayer === this.engine.minefield.size ) {
                    this.currentLayer = 0;
                }
            }
            if ( e.deltaY < 0 ) {
                this.currentLayer--;
                if ( this.currentLayer === -1 ) {
                    this.currentLayer = this.engine.minefield.size - 1;
                }
            }
            console.log( 'Current layer: ' + this.currentLayer );
        } );

        $( document ).keypress( e => {
            if ( e.code === 'Space' ) {
                this.nextPlane();
                console.log( 'Current plane: ' + this.currentPlane );
            }
        } );

        $( window ).on( 'touchmove, mousemove', event => {
            let x, y;
            if ( event.changedTouches ) {
                x = event.changedTouches[ 0 ].pageX;
                y = event.changedTouches[ 0 ].pageY;
            } else {
                x = event.clientX;
                y = event.clientY;
            }
            this.mouse.x = ( x / window.innerWidth ) * 2 - 1;
            this.mouse.y = -( y / window.innerHeight ) * 2 + 1;
            this.checkIntersection();
        } );
    }

    nextLayer () {
        this.currentLayer = this.currentLayer === this.engine.minefield.size ? 0 : this.currentLayer++;
    }

    previousLayer () {
        this.currentLayer = this.currentLayer === 0 ? this.engine.minefield.size - 1 : this.currentLayer--;
    }

    nextPlane () {
        switch ( this.currentPlane ) {
            case PLANES.X:
                this.currentPlane = PLANES.Y;
                break;
            case PLANES.Y:
                this.currentPlane = PLANES.Z;
                break;
            case PLANES.Z:
                this.currentPlane = PLANES.X;
                break;
        }
    }

    getActiveColumns ( object ) {
        this.engine.minefield.getColumnsByField( object.userData.field );
        this.selectedObjects = [];
        this.selectedObjects.push( object );
    }

    checkIntersection () {
        this.raycaster.setFromCamera( this.mouse, this.camera );
        let intersects = this.raycaster.intersectObjects( [ this.engine.minefield.mesh ], true );

        if ( intersects.length > 0 ) {
            for ( let object of intersects ) {

                if ( object.name === 'Field' && this.isObjectOnCurrentLayer( object ) ) {
                    this.getActiveColumns( object );
                    this.outlinePass.selectedObjects = selectedObjects;
                    break;
                }
            }
        } else {
            // outlinePass.selectedObjects = [];
        }
    }

    isObjectOnCurrentLayer ( object ) {
        let position = object.userData.field.position;
        let layer    = position[ this.currentPlane ];
        return layer === this.currentLayer;
    }

}