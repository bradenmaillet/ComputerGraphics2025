#version 300 es
precision mediump float;

in vec3 vNormal;
in vec3 vPosition;

uniform vec3 uLightPosition;
uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;

out vec4 fColor;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    vec3 viewDirection = normalize(-vPosition);
    vec3 halfVector = normalize(lightDirection + viewDirection);

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float specular = pow(max(dot(normal, halfVector), 0.0), uShininess);

    if (diffuse == 0.0) specular = 0.0;

    fColor = uAmbientProduct + diffuse * uDiffuseProduct + specular * uSpecularProduct;
}