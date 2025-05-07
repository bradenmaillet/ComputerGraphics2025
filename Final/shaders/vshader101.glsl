#version 300 es
in vec4 aPosition;
in vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

uniform vec3 uLightPosition;
uniform vec4 uAmbientProduct;
uniform vec4 uDiffuseProduct;
uniform vec4 uSpecularProduct;
uniform float uShininess;

out vec4 vColor;

void main() {
    vec3 normal = normalize(vec3(uNormalMatrix * vec4(aNormal, 0.0)));
    vec3 lightDirection = normalize(uLightPosition - vec3(uModelViewMatrix * aPosition));
    vec3 viewDirection = normalize(-vec3(uModelViewMatrix * aPosition));
    vec3 halfVector = normalize(lightDirection + viewDirection);

    float diffuse = max(dot(normal, lightDirection), 0.0);
    float specular = pow(max(dot(normal, halfVector), 0.0), uShininess);

    if (diffuse == 0.0) specular = 0.0;

    vColor = uAmbientProduct + diffuse * uDiffuseProduct + specular * uSpecularProduct;

    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
}