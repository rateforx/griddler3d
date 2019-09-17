import { BoxBufferGeometry, Color, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export default class Renderer {

    constructor ( engine ) {
        this.engine = engine;

        // scene
        this.scene            = new Scene();
        this.scene.background = new Color( engine.setings.backgroundColor );
        window.scene          = scene;

        // camera
        this.camera = new PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        this.camera.position.set( 0, 10, -10 );

        // renderer
        this.renderer = new WebGLRenderer( { antialias : true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio( window.devicePixelRatio );

        $( '#scene' ).append( renderer.domElement );

        // materials

        this.geometries = {
            field : new BoxBufferGeometry(),
        };

        this.materials = {
            defaultActive    : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .75,
            } ),
            defaultInactive  : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .25,
            } ),
            flaggedActive    : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .75,
                color       : 'red',
            } ),
            flaggedInactive  : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .25,
                color       : 'red',
            } ),
            unknownActive    : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .75,
                color       : 'blue',
            } ),
            unknownInactive  : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .25,
                color       : 'blue',
            } ),
            disarmedAcitve   : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .75,
                color       : 'black',
            } ),
            disarmedInactive : new MeshStandardMaterial( {
                transparent : true,
                opacity     : .75,
                color       : 'black',
            } ),
        };

    }

}