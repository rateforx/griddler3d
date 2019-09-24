import {
    BoxBufferGeometry,
    Color,
    Fog,
    FontLoader,
    Group,
    LoadingManager,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Scene,
    Vector2,
    WebGLRenderer,
} from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { SubdivisionModifier } from 'three/examples/jsm/modifiers/SubdivisionModifier';

export default class Renderer {

    constructor ( engine ) {
        this.engine = engine;

        // scene
        this.scene            = new Scene();
        this.scene.background = new Color( engine.settings.backgroundColor );
        this.scene.fog        = new Fog( 0x111111, 20, 1000 );
        window.scene          = scene;

        // camera
        this.camera = new PerspectiveCamera(
            60,
            innerWidth / innerHeight,
            0.1, 1000,
        );
        this.camera.position
            .set( 1, 1, -1 )
            .multiplyScalar( ( engine.settings.size + engine.settings.spacing ) / 2 * Math.sqrt( 2 ) )
        ;

        // renderer
        this.webGLRenderer = new WebGLRenderer( { antialias : true } );
        this.webGLRenderer.setSize( innerWidth, innerHeight );
        this.webGLRenderer.shadowMap.enabled = true;
        this.webGLRenderer.setPixelRatio( devicePixelRatio );
        this.webGLRenderer.setViewport( 0, 0, innerWidth, innerHeight );

        this.composer = new EffectComposer( this.webGLRenderer );
        this.composer.setSize( innerWidth, innerHeight );
        this.composer.setPixelRatio( devicePixelRatio );

        this.renderPass = new RenderPass( this.scene, this.camera );
        this.composer.addPass( this.renderPass );

        this.outlinePass = new OutlinePass(
            new Vector2( innerWidth, innerHeight ), this.scene, this.camera,
        );

        this.outlinePass.edgeStrength     = 3;
        this.outlinePass.edgeGlow         = 1;
        this.outlinePass.edgeThickness    = 3;
        this.outlinePass.pulsePeriod      = 2;
        this.outlinePass.visibleEdgeColor = new Color();
        this.outlinePass.hiddenEdgeColor  = new Color();
        this.composer.addPass( this.outlinePass );

        this.fxaaPass = new ShaderPass( FXAAShader );
        this.fxaaPass.uniforms[ 'resolution' ].value.set( 1 / innerWidth, 1 / innerHeight );
        this.composer.addPass( this.fxaaPass );

        this.initScene();

        this.stats = new Stats();

        this.subdivisionModifier = new SubdivisionModifier( 1 );

        this.geometries = {
            field : this.subdivisionModifier.modify( new BoxBufferGeometry(
                1, 1, 1,
                16, 16, 16,
            ) ),
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

        this.loadingManager = new LoadingManager( Renderer.onLoad, Renderer.onLoadProgress, Renderer.onLoadError );

        this.loaders = {
            fontLoader : new FontLoader( this.loadingManager ),
        };

        this.fonts = {};

        $( '#scene' ).append( this.webGLRenderer.domElement );
        $( 'body' ).append( this.stats.dom );
        $( window ).resize( () => {
            this.camera.aspect = innerWidth / innerHeight;
            this.camera.updateProjectionMatrix();
            this.fxaaPass.uniforms[ 'resolution' ].value.set( 1 / innerWidth, 1 / innerHeight );
            this.webGLRenderer.setSize( innerWidth, innerHeight );
            this.composer.setSize( innerWidth, innerHeight );
        } );
    }

    static onLoad () {
        $( '#loading' ).hide();
        $( '#start' ).show();
    }

    static onLoadProgress ( url, itemsLoaded, itemsTotal ) {
        $( '#loading' ).text( ( itemsLoaded / itemsTotal * 100 ).toPrecision( 1 ) + '%' );
    }

    static onLoadError ( url ) {
        console.log( `There was an error loading ${ url }.` );
    }

    draw () {
        requestAnimationFrame( this.draw.bind( this ) );
        this.stats.begin();
        this.engine.controls.orbitControls.update();
        // this.webGLRenderer.render( this.scene, this.camera );
        this.composer.render();
        this.stats.end();
    }

    initScene () {
        this.lights = new Group();
        this.lights.add(
            new PointLight(),
            new PointLight(),
        );
        this.lights.children[ 0 ].position.set( -100, 100, -100 );
        this.lights.children[ 1 ].position.set( 100, 100, 100 );
        this.lights.children[ 0 ].mapSize    = new Vector2( 2048, 2048 );
        this.lights.children[ 1 ].castShadow = true;
        this.lights.children[ 0 ].mapSize    = new Vector2( 2048, 2048 );
        this.lights.children[ 1 ].castShadow = true;

        this.ground = new Group();
        this.ground.add(
            new Reflector( new PlaneBufferGeometry(), {
                clipBias      : 1,
                textureWidth  : innerWidth * devicePixelRatio,
                textureHeight : innerHeight * devicePixelRatio,
                recursion     : 1,
            } ),
            new Mesh( new PlaneBufferGeometry(), new MeshStandardMaterial( {
                transparent : true,
                opacity     : .25,
                color       : 'white',
                roughness   : .6,
                metalness   : 1,
            } ) ),
        );
        this.ground.children[ 1 ].position.z = .5;
        this.ground.rotateX( -Math.PI / 2 );
        this.ground.position.y = -10;
        this.ground.scale.setScalar( 1000 );

        this.scene.add( this.lights, this.ground );
    }
}