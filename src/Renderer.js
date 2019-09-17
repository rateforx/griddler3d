import {
    BoxBufferGeometry,
    Color,
    EffectComposer,
    FontLoader,
    FXAAShader,
    Group,
    MeshStandardMaterial,
    OutlinePass,
    PerspectiveCamera,
    PointLight,
    RenderPass,
    Scene,
    ShaderPass,
    Stats,
    Vector2,
    WebGLRenderer
} from 'three';

export default class Renderer {

    async constructor( engine ) {
        this.engine = engine;

        // scene
        this.scene            = new Scene();
        this.scene.background = new Color( engine.settings.backgroundColor );
        window.scene          = scene;

        // camera
        this.camera = new PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1, 1000
        );
        this.camera.position.set( 0, 10, -10 );

        // webGLRenderer
        this.webGLRenderer = new WebGLRenderer( { antialias : true } );
        this.webGLRenderer.setSize( window.innerWidth, window.innerHeight );
        this.webGLRenderer.shadowMap.enabled = true;
        this.webGLRenderer.setPixelRatio( window.devicePixelRatio );

        this.composer = new EffectComposer( this.webGLRenderer );

        this.renderPass = new RenderPass( this.scene, this.camera );
        this.composer.addPass( this.renderPass );

        this.outlinePass                  = new OutlinePass(
            new Vector2( window.innerWidth, window.innerHeight ), scene, camera
        );
        this.outlinePass.edgeStrength     = 3;
        this.outlinePass.edgeGlow         = 1;
        this.outlinePass.edgeThickness    = 3;
        this.outlinePass.pulsePeriod      = 2;
        this.outlinePass.visibleEdgeColor = new Color();
        this.outlinePass.hiddenEdgeColor  = new Color();
        this.composer.addPass( this.outlinePass );

        this.fxaaPass = ShaderPass( FXAAShader );
        this.fxaaPass.uniforms[ 'resolution' ].value.set(
            1 / window.innerWidth, 1 / window.innerHeight
        );
        this.composer.addPass( this.fxaaPass );

        this.lights = new Group();
        this.lights.add(
            new PointLight(),
            new PointLight(),
        );
        this.lights.children[ 0 ].position.set( -100, -100, -100 );
        this.lights.children[ 1 ].position.set( 100, 100, 100 );
        this.lights.children[ 0 ].mapSize    = new Vector2( 2048, 2048 );
        this.lights.children[ 1 ].castShadow = true;
        this.lights.children[ 0 ].mapSize    = new Vector2( 2048, 2048 );
        this.lights.children[ 1 ].castShadow = true;

        this.stats = new Stats();

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
            disarmedActive   : new MeshStandardMaterial( {
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

        this.loaders = {
            fontLoader : new FontLoader(),
        };

        this.fonts = {
            saira : await this.load( this.loaders.fontLoader,
                'fonts/saira_stencil_one_regular.json'
            ),
        };

        $( '#scene' ).append( this.webGLRenderer.domElement );
        $( 'body' ).append( this.stats.dom );
        $( window ).onresize( this.onResize );
    }

    load( loader, url ) {
        return new Promise( resolve => {
            loader.load( url, resolve );
        } );
    }

    draw() {
        requestAnimationFrame( draw );
        this.stats.begin();
        this.engine.controls.orbitControls.update();
        this.composer.render();
        // this.webGLRenderer.render( scene, camera );
        this.stats.end();
    }

    onResize() {
        let width  = window.innerWidth;
        let height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.fxaaPass.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
        this.webGLRenderer.setSize( width, height );
        this.composer.setSize( width, height );

        this.draw();
    }

}