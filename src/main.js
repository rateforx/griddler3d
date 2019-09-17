import Engine from "./Engine";
import * as THREE from 'three';

const engine = new Engine();
engine.start();

window.THREE = THREE;
window.scene = engine.webGLRenderer