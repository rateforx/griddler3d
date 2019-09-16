import * as THREE from 'three';
import { PointLight, Vector2 } from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Grid from './Grid';
import Stats from 'three/examples/jsm/libs/stats.module';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';

window.THREE = THREE;

let scene;
let renderer;
let camera;
let controls;
let gui;
let stats;
export let SETTINGS = {
    // scene
    backgroundColor : '#111',
    edgeStrength    : 3,
    edgeGlow        : 0,
    edgeThickness   : 1,
    pulsePeriod     : 0,
    spacing         : 1.5,
    // game
    size            : 4,
    bombs           : .5,
    restart         : () => {
        resetGame();
        initGame();
    }
};

let selectedObjects = [];
let raycaster       = new THREE.Raycaster();
let mouse           = new THREE.Vector2();

let composer, fxaaPass, outlinePass;

let fontLoader   = new THREE.FontLoader();
export let fonts = [];

let lights = [];

function init () {
    // scene
    scene            = new THREE.Scene();
    scene.background = new THREE.Color( SETTINGS.backgroundColor );
    window.scene     = scene;

    // camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 10, -10 );

    // renderer
    renderer = new THREE.WebGLRenderer( { antialias : true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio( window.devicePixelRatio );
    $( '#scene' ).append( renderer.domElement );

    // controls
    controls                 = new OrbitControls( camera, renderer.domElement );
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 2;
    controls.enableDamping   = true;
    controls.dampingFactor   = .2;

    // gui
    gui          = new GUI();
    let guiScene = gui.addFolder( 'Scene' );
    let guiGame  = gui.addFolder( 'Game' );

    guiScene.addColor( SETTINGS, 'backgroundColor' ).onChange( value => {
        scene.background = new THREE.Color( value );
    } );
    guiScene.add( SETTINGS, 'edgeStrength', 0.01, 10 ).onChange( value => {
        outlinePass.edgeStrength = Number( value );
    } );
    guiScene.add( SETTINGS, 'edgeGlow', 0.0, 1 ).onChange( value => {
        outlinePass.edgeGlow = Number( value );
    } );
    guiScene.add( SETTINGS, 'edgeThickness', 1, 4 ).onChange( value => {
        outlinePass.edgeThickness = Number( value );
    } );
    guiScene.add( SETTINGS, 'pulsePeriod', 0.0, 5 ).onChange( value => {
        outlinePass.pulsePeriod = Number( value );
    } );
    guiScene.add( SETTINGS, 'spacing', 1, 5 ).onChange( value => {
        for ( let field of grid.fields ) {
            field.boxMesh.position.copy( field.position ).multiplyScalar( value );
            new THREE.Box3().setFromObject( grid.object3D ).getCenter( grid.object3D.position ).multiplyScalar( -1 );
            camera.lookAt( grid.object3D.position );
        }
    } );
    guiScene.open();

    guiGame.add( SETTINGS, 'size' ).min( 2 ).max( 10 ).step( 1 );
    guiGame.add( SETTINGS, 'bombs' ).min( .1 ).max( .9 ).step( .01 );
    guiGame.add( SETTINGS, 'restart' );
    guiGame.open();

    gui.open();

    // stats
    stats = new Stats();
    $( 'body' ).append( stats.dom );

    // postprocessing

    composer = new EffectComposer( renderer );

    let renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    outlinePass = new OutlinePass(
        new THREE.Vector2( window.innerWidth, window.innerHeight ),
        scene, camera
    );
    composer.addPass( outlinePass );

    fxaaPass = new ShaderPass( FXAAShader );
    fxaaPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    composer.addPass( fxaaPass );

    window.addEventListener( 'mousemove', onTouchMove );
    window.addEventListener( 'touchmove', onTouchMove );

    function onTouchMove ( event ) {
        let x, y;
        if ( event.changedTouches ) {
            x = event.changedTouches[ 0 ].pageX;
            y = event.changedTouches[ 0 ].pageY;
        } else {
            x = event.clientX;
            y = event.clientY;
        }
        mouse.x = ( x / window.innerWidth ) * 2 - 1;
        mouse.y = -( y / window.innerHeight ) * 2 + 1;
        checkIntersection();
    }

    function addSelectedObject ( object ) {
        selectedObjects = [];
        selectedObjects.push( object );
    }

    function checkIntersection () {
        raycaster.setFromCamera( mouse, camera );
        let intersects = raycaster.intersectObjects( [ scene ], true );
        if ( intersects.length > 0 ) {
            let selectedObject = intersects[ 0 ].object;
            if ( selectedObject.name === 'Field' ) {
                addSelectedObject( selectedObject );
                outlinePass.selectedObjects = selectedObjects;
            }
        } else {
            // outlinePass.selectedObjects = [];
        }
    }

    // circle
    /*let circle = new THREE.Mesh(
        new THREE.CircleBufferGeometry( 5, 64 ),
        new THREE.MeshStandardMaterial( {
            side : THREE.DoubleSide,
        } )
    );

    circle.receiveShadow = true;
    circle.position.setY( -5 );
    circle.rotation.x = Math.PI / 2;
    scene.add( circle );*/

    // lights
    lights.push( new PointLight() );
    lights[ 0 ].position.set( -100, -100, -100 );
    lights[ 0 ].mapSize    = new Vector2( 2048, 2048 );
    lights[ 0 ].castShadow = true;
    lights.push( new PointLight() );
    lights[ 1 ].position.set( 100, 100, 100 );
    lights[ 1 ].mapSize    = new Vector2( 2048, 2048 );
    lights[ 1 ].castShadow = true;
    scene.add( lights[ 0 ], lights[ 1 ] );
}

function render () {
    requestAnimationFrame( render );
    stats.begin();
    controls.update();
    renderer.render( scene, camera );
    // composer.render();
    stats.end();
}

function onResize () {
    let width  = window.innerWidth;
    let height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    fxaaPass.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );
    renderer.setSize( width, height );
    composer.setSize( width, height );

    render();
}

let grid;

function resetGame () {
    scene.remove( grid.object3D );
}

function initGame () {
    grid        = new Grid( SETTINGS, fonts );
    window.grid = grid;

    new THREE.Box3().setFromObject( grid.object3D ).getCenter( grid.object3D.position ).multiplyScalar( -1 );
    scene.add( grid.object3D );
    camera.lookAt( grid.object3D.position );
    controls.update();
}

$( window ).resize( onResize );

// fontLoader.load( 'fonts/saira_stencil_one_regular.json', font => {
fontLoader.load( 'fonts/helvetiker_regular.typeface.json', font => {

    fonts.push( font );

    init();
    requestAnimationFrame( render );
    initGame();

}, event => console.log( event ) );