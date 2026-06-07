(function () {

    const NOISE_FPS = 12;
    const FRAME_INTERVAL = 1000 / NOISE_FPS;

    const canvas = document.getElementById('noise-overlay');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vsSource = `
        attribute vec2 a_pos;
        void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        uniform vec2  u_res;
        uniform float u_seed;

        float rand(vec2 co) {
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            float n = rand(gl_FragCoord.xy / u_res + u_seed);
            gl_FragColor = vec4(n, n, n, 1.0);
        }
    `;

    function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('[noiseOverlay] shader error:', gl.getShaderInfoLog(s));
            return null;
        }
        return s;
    }

    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('[noiseOverlay] link error:', gl.getProgramInfoLog(prog));
        return;
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    gl.useProgram(prog);

    const posLoc  = gl.getAttribLocation(prog, 'a_pos');
    const resLoc  = gl.getUniformLocation(prog, 'u_res');
    const seedLoc = gl.getUniformLocation(prog, 'u_seed');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    let lastTime = 0;
    let seed = 0;

    function render(now) {
        requestAnimationFrame(render);
        if (now - lastTime < FRAME_INTERVAL) return;
        lastTime = now;
        seed += 0.1;

        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform1f(seedLoc, seed);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    requestAnimationFrame(render);

})();
