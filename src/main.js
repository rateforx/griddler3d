import Engine from './Engine';
import * as THREE from 'three';

const engine = new Engine();
engine.loadAssets();
$( '#start' ).click( () => {
    engine.start();
    $( '.wrapper' ).fadeOut();
} );

window.THREE = THREE;
window.engine = engine;
window.scene = engine.renderer.scene;
