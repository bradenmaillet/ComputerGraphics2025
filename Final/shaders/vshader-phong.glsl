#version 300 es
in vec4 aPosition;
in vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec3 vNormal;
out vec3 vPosition;

void main() {
    vNormal = normalize(vec3(uNormalMatrix * vec4(aNormal, 0.0)));
    vPosition = vec3(uModelViewMatrix * aPosition);

    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
}