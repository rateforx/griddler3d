import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default class Controls {

    static PLANES = {
        X : 'x',
        Y : 'y',
        Z : 'z',
    };

    constructor ( engine ) {
        this.engine = engine;

        this.grid = engine.grid;
        this.scene = engine.renderer.scene;
        this.camera = engine.renderer.camera;
        this.renderer = engine.renderer.renderer;
        this.outlinePass = engine.renderer.outlinePass;

        this.currentPlane = Controls.PLANES.Y;
        this.currentLayer = 0;

        // controls
        this.orbitControls                 = new OrbitControls( this.camera, this.renderer.domElement );
        this.orbitControls.autoRotate      = true;
        this.orbitControls.autoRotateSpeed = 2;
        this.orbitControls.enableDamping   = true;
        this.orbitControls.dampingFactor   = .2;
        this.orbitControls.enableZoom      = false;

        this.selectedObjects = [];
        this.raycaster       = new THREE.Raycaster();
        this.mouse           = new THREE.Vector2();

        $( document ).mousewheel( e => {
            if ( e.deltaY > 0 ) {
                this.nextLayer();
            }
            if ( e.deltaY < 0 ) {
                this.previousLayer();
            }
        } );

        $( document ).keypress( e => {
            if ( e.code === 'Space' ) {
                this.nextPlane();
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
        this.currentLayer = this.currentLayer === this.grid.size ? this.currentLayer++ : 0;
    }

    previousLayer () {
        this.currentLayer = this.currentLayer === 0 ? this.grid.size - 1 : this.currentLayer--;
    }

    nextPlane () {
        switch ( this.currentPlane ) {
            case Controls.PLANES.X:
                this.currentPlane = Controls.PLANES.Y;
                break;
            case Controls.PLANES.Y:
                this.currentPlane = Controls.PLANES.Z;
                break;
            case Controls.PLANES.Z:
                this.currentPlane = Controls.PLANES.X;
                break;
        }
    }

    addSelectedObject ( object ) {
        this.selectedObjects = [];
        this.selectedObjects.push( object );
    }

    checkIntersection () {
        console.log( this );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        let intersects = this.raycaster.intersectObjects( [ this.scene ], true );

        if ( intersects.length > 0 ) {
            for ( let object of intersects ) {

                if ( object.name === 'Field' && this.isObjectOnCurrentLayer( object ) ) {
                    this.addSelectedObject( object );
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