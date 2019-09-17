import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Minefield from './Minefield';
import Stats from 'three/examples/jsm/libs/stats.module';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { Controls } from './Controls';

window.THREE = THREE;

let scene;
let renderer;
let camera;
let orbitControls;
let gameControls;
let gui;
let stats;
export let SETTINGS = {
    // scene
    backgroundColor : '#111',
    edgeStrength    : 3,
    edgeGlow        : 0,
    edgeThickness   : 1,
    pulsePeriod     : 0,
    spacing         : 2,
    // game
    size            : 4,
    bombs           : .5,
    restart         : () => {
        resetGame();
        initGame();
    }
};

let composer, fxaaPass, outlinePass;

let lights = [];

function init () {




    // gui
    gui          = new GUI();
    let guiScene = gui.addFolder( 'Scene' );
    let guiGame  = gui.addFolder( 'Game' );

    guiScene.addColor( SETTINGS, 'backgroundColor' ).onChange( value => {
        scene.background = new THREE.Color( value );
    } );
    guiScene.add( SETTINGS, 'spacing', 1, 5 ).onChange( value => {
        for ( let field of grid.fields ) {
            field.mesh.position.copy( field.position ).multiplyScalar( value );
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

    outlinePass                  = new OutlinePass(
        new THREE.Vector2( window.innerWidth, window.innerHeight ),
        scene, camera
    );
    outlinePass.edgeStrength     = 3;
    outlinePass.edgeGlow         = 1;
    outlinePass.edgeThickness    = 3;
    outlinePass.pulsePeriod      = 2;
    outlinePass.visibleEdgeColor = new THREE.Color();
    outlinePass.hiddenEdgeColor  = new THREE.Color();
    composer.addPass( outlinePass );

    fxaaPass = new ShaderPass( FXAAShader );
    fxaaPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    composer.addPass( fxaaPass );

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
    lights.push( new THREE.PointLight() );
    lights[ 0 ].position.set( -100, -100, -100 );
    lights[ 0 ].mapSize    = new THREE.Vector2( 2048, 2048 );
    lights[ 0 ].castShadow = true;
    lights.push( new THREE.PointLight() );
    lights[ 1 ].position.set( 100, 100, 100 );
    lights[ 1 ].mapSize    = new THREE.Vector2( 2048, 2048 );
    lights[ 1 ].castShadow = true;
    scene.add( lights[ 0 ], lights[ 1 ] );
}

function render () {
    requestAnimationFrame( render );
    stats.begin();
    orbitControls.update();
    // renderer.render( scene, camera );
    composer.render();
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
    grid        = new Minefield( SETTINGS, fonts );
    window.grid = grid;

    new THREE.Box3().setFromObject( grid.object3D ).getCenter( grid.object3D.position ).multiplyScalar( -1 );
    scene.add( grid.object3D );
    camera.lookAt( grid.object3D.position );
    orbitControls.update();

    // gameControls = new Controls( grid, camera, outlinePass );
}

$( window ).resize( onResize );

fontLoader.load( 'fonts/saira_stencil_one_regular.json', font => {

    fonts.push( font );

    init();
    requestAnimationFrame( render );
    initGame();

}, () => {}, event => console.log( event ) );