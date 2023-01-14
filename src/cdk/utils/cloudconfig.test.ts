import { defaultCloudConfig } from "./cloudconfig";

describe("defaultCloudConfig", () => {
  test("succeeds", () => {
    const sut = defaultCloudConfig({
      name: "",
      image: "",
      serverType: "",
      dockerImage: "docker.io/library/httpd:latest",
    });
    expect(sut).toBe(`#cloud-config
packages:
  - ufw
  - docker
  - docker-compose
package_update: true
package_upgrade: true
runcmd:
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 80
  - ufw allow 443
  - ufw allow ssh
  - sed -i "$ a DEFAULT_FORWARD_POLICY=\\"ACCEPT\\"" /etc/default/ufw
  - ufw enable
  - ufw reload
  - mkdir app && cd app
  - echo "dmVyc2lvbjogIjIiCgpzZXJ2aWNlczoKICB3ZWI6CiAgICBpbWFnZTogZG9ja2VyLmlvL2xpYnJhcnkvaHR0cGQ6bGF0ZXN0CiAgICByZXN0YXJ0OiBhbHdheXMKICAgIGV4cG9zZToKICAgICAgLSB1bmRlZmluZWQKICAgIGVudmlyb25tZW50OgogICAgICAtIFZJUlRVQUxfSE9TVD11bmRlZmluZWQKICAgICAgLSBWSVJUVUFMX1BPUlQ9dW5kZWZpbmVkCiAgICAgIC0gTEVUU0VOQ1JZUFRfSE9TVD11bmRlZmluZWQKICAgICAgLSBMRVRTRU5DUllQVF9FTUFJTD11bmRlZmluZWQKCiAgbmdpbngtcHJveHk6CiAgICBpbWFnZTogbmdpbnhwcm94eS9uZ2lueC1wcm94eTpsYXRlc3QKICAgIHJlc3RhcnQ6IGFsd2F5cwogICAgZGVwZW5kc19vbjoKICAgICAgLSB3ZWIKICAgIHBvcnRzOgogICAgICAtIDgwOjgwCiAgICAgIC0gNDQzOjQ0MwogICAgdm9sdW1lczoKICAgICAgLSBjZXJ0czovZXRjL25naW54L2NlcnRzCiAgICAgIC0gdmhvc3Q6L2V0Yy9uZ2lueC92aG9zdC5kCiAgICAgIC0gaHRtbDovdXNyL3NoYXJlL25naW54L2h0bWwKICAgICAgLSAvdmFyL3J1bi9kb2NrZXIuc29jazovdG1wL2RvY2tlci5zb2NrOnJvCiAgICBlbnZpcm9ubWVudDoKICAgICAgLSBERUZBVUxUX0hPU1Q9dW5kZWZpbmVkCgogIG5naW54LXByb3h5LWFjbWU6CiAgICBpbWFnZTogbmdpbnhwcm94eS9hY21lLWNvbXBhbmlvbgogICAgcmVzdGFydDogYWx3YXlzCiAgICBkZXBlbmRzX29uOgogICAgICAtIG5naW54LXByb3h5CiAgICB2b2x1bWVzX2Zyb206CiAgICAgIC0gbmdpbngtcHJveHkKICAgIHZvbHVtZXM6CiAgICAgIC0gY2VydHM6L2V0Yy9uZ2lueC9jZXJ0czpydwogICAgICAtIGFjbWU6L2V0Yy9hY21lLnNoCiAgICAgIC0gL3Zhci9ydW4vZG9ja2VyLnNvY2s6L3Zhci9ydW4vZG9ja2VyLnNvY2s6cm8KCnZvbHVtZXM6CiAgdmhvc3Q6CiAgaHRtbDoKICBjZXJ0czoKICBhY21lOgoK" | base64 -d > docker-compose.yml
  - docker-compose up -d
`);
  });
});
